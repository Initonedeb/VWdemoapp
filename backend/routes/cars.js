const express = require('express');
const router = express.Router();
const db = require('../db.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const QR_CODE_DIR = path.join(__dirname, '..', 'uploads', 'qrcodes');

// Configuración de Multer para guardar archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// GET /api/cars - Obtener todos los vehículos con sus fotos
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT c.*, GROUP_CONCAT(cp.photo_url SEPARATOR '|||') as fotos, c.qr_code_path
      FROM cars c
      LEFT JOIN car_photos cp ON c.id = cp.car_id
      GROUP BY c.id
      ORDER BY c.id DESC
    `;
    const [cars] = await db.query(sql);

    const processedCars = cars.map(car => ({
        ...car,
        fotos: car.fotos ? car.fotos.split('|||').map(foto => {
            if (foto.startsWith('data:')) {
                return foto; // It's an old data URL, return as is.
            }
            // It's a new filename, construct the path.
            return `/uploads/${foto}`;
        }) : [],
        qr_code_url: car.qr_code_path ? car.qr_code_path : null
    }));

    res.json(processedCars);
  } catch (error) {
    console.error('Error al obtener los vehículos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/cars - Crear un nuevo vehículo
router.post('/', upload.array('fotos', 4), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      marca, modelo, version, ano, kilometraje, estado, patente, 
      chasis, motor, garantia, sector, categoria, sucursal
    } = req.body;

    const carSql = `INSERT INTO cars (marca, modelo, version, ano, kilometraje, estado, patente, chasis, motor, garantia, sector, categoria, sucursal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [carResult] = await connection.query(carSql, [
      marca, modelo, version, ano, kilometraje, estado, patente, 
      chasis, motor, garantia, sector, categoria, sucursal
    ]);
    const newCarId = carResult.insertId;
    console.log('Nuevo Car ID:', newCarId);

    // Generar QR Code
    const qrCodeFileName = `car_QR_${newCarId}.png`;
    const qrCodeFilePath = path.join(QR_CODE_DIR, qrCodeFileName);
    const qrCodeData = String(newCarId); // El contenido del QR será el ID del coche
    console.log('QR Code File Path:', qrCodeFilePath);

    await QRCode.toFile(qrCodeFilePath, qrCodeData, {
        errorCorrectionLevel: 'H',
        width: 250,
        margin: 1
    });

    // Actualizar la base de datos con la ruta del QR
    const qrCodeDbPath = `/uploads/qrcodes/${qrCodeFileName}`;
    console.log('QR Code DB Path to save:', qrCodeDbPath);
    await connection.query('UPDATE cars SET qr_code_path = ? WHERE id = ?', [qrCodeDbPath, newCarId]);

    if (req.files && req.files.length > 0) {
      const photoSql = 'INSERT INTO car_photos (car_id, photo_url) VALUES ?';
      const photoValues = req.files.map(file => [newCarId, file.filename]);
      await connection.query(photoSql, [photoValues]);
    }

    await connection.commit();
    
    const newCar = {
        id: newCarId,
        ...req.body,
        fotos: req.files ? req.files.map(f => `/uploads/${f.filename}`) : [],
        qr_code_url: qrCodeDbPath // Asegurarse de que la URL del QR se incluya en la respuesta
    }
    console.log('New Car object sent in response:', newCar);

    res.status(201).json(newCar);

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear el vehículo:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe un vehículo con esa patente o chasis.' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// PUT /api/cars/:id - Actualizar un vehículo
router.put('/:id', upload.array('fotos', 4), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const {
            marca, modelo, version, ano, kilometraje, estado, patente, 
            chasis, motor, garantia, sector, categoria, sucursal
        } = req.body;

        // 1. Actualizar los datos en la tabla `cars`
        const carSql = `UPDATE cars SET marca = ?, modelo = ?, version = ?, ano = ?, kilometraje = ?, estado = ?, patente = ?, chasis = ?, motor = ?, garantia = ?, sector = ?, categoria = ?, sucursal = ? WHERE id = ?`;
        await connection.query(carSql, [
            marca, modelo, version, ano, kilometraje, estado, patente, 
            chasis, motor, garantia, sector, categoria, sucursal, id
        ]);

        // 2. Obtener y borrar las fotos antiguas del sistema de archivos
        const [oldPhotos] = await connection.query('SELECT photo_url FROM car_photos WHERE car_id = ?', [id]);
        oldPhotos.forEach(photo => {
            const photoPath = path.join(__dirname, '..', 'uploads', photo.photo_url);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        });

        // 3. Borrar las fotos antiguas de la base de datos
        await connection.query('DELETE FROM car_photos WHERE car_id = ?', [id]);

        // 4. Insertar las fotos nuevas
        if (req.files && req.files.length > 0) {
            const photoSql = 'INSERT INTO car_photos (car_id, photo_url) VALUES ?';
            const photoValues = req.files.map(file => [id, file.filename]);
            await connection.query(photoSql, [photoValues]);
        }

        await connection.commit();
        
        const updatedCar = {
            id: parseInt(id),
            ...req.body,
            fotos: req.files ? req.files.map(f => `/uploads/${f.filename}`) : []
        }

        res.status(200).json(updatedCar);

    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar el vehículo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe otro vehículo con esa patente o chasis.' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});


// DELETE /api/cars/:id - Eliminar un vehículo
router.delete('/:id', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;

        // 1. Obtener y borrar las fotos del sistema de archivos
        const [photos] = await connection.query('SELECT photo_url FROM car_photos WHERE car_id = ?', [id]);
        photos.forEach(photo => {
            const photoPath = path.join(__dirname, '..', 'uploads', photo.photo_url);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        });
        
        // 2. Borrar las fotos de la base de datos (opcional, ya que se borrarán en cascada)
        await connection.query('DELETE FROM car_photos WHERE car_id = ?', [id]);

        // 3. Borrar el vehículo
        const [result] = await connection.query('DELETE FROM cars WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        await connection.commit();
        res.status(200).json({ message: 'Vehículo eliminado correctamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar el vehículo:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ message: 'No se puede eliminar un vehículo que tiene préstamos asociados.' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

module.exports = router;