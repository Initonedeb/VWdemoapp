const express = require('express');
const router = express.Router();
const db = require('../db.js');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// GET /api/prestaciones - Obtener todos los préstamos
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.id, p.loanDate, p.returnDate, p.status, p.gestionadoPor, p.autorizadoPor, p.ficha_firmada_path, p.combustible_salida, p.combustible_regreso, p.km_salida, p.km_regreso, p.observaciones_devolucion, p.rueda_auxilio,
        JSON_OBJECT(
          'id', c.id, 'marca', c.marca, 'modelo', c.modelo, 'version', c.version, 'ano', c.ano, 'patente', c.patente, 'chasis', c.chasis, 'motor', c.motor, 'estado', c.estado, 'garantia', c.garantia, 'sector', c.sector, 'categoria', c.categoria
        ) as car,
        JSON_OBJECT(
          'id', cl.id, 'nombreCompleto', cl.nombreCompleto, 'dni', cl.dni, 'direccion', cl.direccion, 'celular', cl.celular, 'email', cl.email, 'cuil', cl.cuil, 'estadoCivil', cl.estadoCivil, 'fechaNacimiento', cl.fechaNacimiento, 'carnetManejo', cl.carnetManejo, 'fotoCarnetFrente', cl.fotoCarnetFrente, 'fotoCarnetDorso', cl.fotoCarnetDorso
        ) as client,
        (SELECT GROUP_CONCAT(pf.photo_url) FROM prestacion_fotos pf WHERE pf.prestacion_id = p.id) as fotosDevolucion
      FROM prestaciones p
      JOIN cars c ON p.car_id = c.id
      JOIN clients cl ON p.client_id = cl.id
      ORDER BY p.status ASC, p.loanDate DESC
    `;
    const [prestaciones] = await db.query(sql);

    const processedPrestaciones = prestaciones.map(p => ({
      ...p,
      car: JSON.parse(p.car),
      client: JSON.parse(p.client),
      fotosDevolucion: p.fotosDevolucion ? p.fotosDevolucion.split(',') : []
    }));

    res.json(processedPrestaciones);
  } catch (error) {
    console.error('Error al obtener los préstamos:', error);
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        message: 'La base de datos no está actualizada.',
        details: `Una o más columnas (ej: combustible_salida, km_salida) faltan en la tabla 'prestaciones'. Por favor, ejecute los scripts SQL para actualizar la tabla.`
      });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/prestaciones - Crear un nuevo préstamo
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      carId, clientId, loanDate, gestionadoPor, autorizadoPor, combustible_salida, km_salida
    } = req.body;

    const prestacionSql = `INSERT INTO prestaciones (car_id, client_id, loanDate, gestionadoPor, autorizadoPor, status, combustible_salida, km_salida) VALUES (?, ?, ?, ?, ?, 'Activa', ?, ?)`;
    const [prestacionResult] = await connection.query(prestacionSql, [
      carId, clientId, loanDate, gestionadoPor, autorizadoPor, combustible_salida, km_salida
    ]);
    const newPrestacionId = prestacionResult.insertId;

    const updateCarSql = `UPDATE cars SET estado = 'Prestado' WHERE id = ?`;
    await connection.query(updateCarSql, [carId]);

    await connection.commit();

    const [newPrestacionRows] = await db.query(
      `SELECT 
        p.id, p.loanDate, p.returnDate, p.status, p.gestionadoPor, p.autorizadoPor, p.ficha_firmada_path, p.combustible_salida, p.combustible_regreso, p.km_salida, p.km_regreso, p.observaciones_devolucion, p.rueda_auxilio,
        JSON_OBJECT(
          'id', c.id, 'marca', c.marca, 'modelo', c.modelo, 'version', c.version, 'ano', c.ano, 'patente', c.patente, 'chasis', c.chasis, 'motor', c.motor, 'estado', c.estado, 'garantia', c.garantia, 'sector', c.sector, 'categoria', c.categoria
        ) as car,
        JSON_OBJECT(
          'id', cl.id, 'nombreCompleto', cl.nombreCompleto, 'dni', cl.dni, 'direccion', cl.direccion, 'celular', cl.celular, 'email', cl.email, 'cuil', cl.cuil, 'estadoCivil', cl.estadoCivil, 'fechaNacimiento', cl.fechaNacimiento, 'carnetManejo', cl.carnetManejo, 'fotoCarnetFrente', cl.fotoCarnetFrente, 'fotoCarnetDorso', cl.fotoCarnetDorso
        ) as client
      FROM prestaciones p
      JOIN cars c ON p.car_id = c.id
      JOIN clients cl ON p.client_id = cl.id
      WHERE p.id = ?`,
      [newPrestacionId]
    );

    const newPrestacion = {
      ...newPrestacionRows[0],
      car: JSON.parse(newPrestacionRows[0].car),
      client: JSON.parse(newPrestacionRows[0].client)
    };

    res.status(201).json(newPrestacion);

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear el préstamo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// POST /api/prestaciones/:id/photos - Subir fotos de devolución
router.post('/:id/photos', upload.array('fotosDevolucion', 2), async (req, res) => {
  const { id } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No se subieron archivos.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const photoSql = 'INSERT INTO prestacion_fotos (prestacion_id, photo_url) VALUES ?';
    const photoValues = files.map(file => [id, file.path]);
    await connection.query(photoSql, [photoValues]);

    await connection.commit();

    res.status(200).json({ message: 'Fotos de devolución subidas correctamente.' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al subir las fotos de devolución:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// PUT /api/prestaciones/:id/finish - Finalizar un préstamo
router.put('/:id/finish', upload.single('fichaFirmada'), async (req, res) => {
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { combustible_regreso, km_regreso, observaciones_devolucion, rueda_auxilio } = req.body;
    const file = req.file;

    const [prestacionRows] = await connection.query('SELECT car_id FROM prestaciones WHERE id = ?', [id]);
    if (prestacionRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Préstamo no encontrado.' });
    }
    const carId = prestacionRows[0].car_id;

    const params = [];
    let sql = 'UPDATE prestaciones SET ';

    const newStatus = file ? 'Firmada y Finalizada' : 'Finalizada';
    sql += 'status = ?, ';
    params.push(newStatus);

    sql += 'returnDate = ?, ';
    params.push(new Date().toISOString().split('T')[0]);

    if (combustible_regreso) {
        sql += 'combustible_regreso = ?, ';
        params.push(combustible_regreso);
    }

    if (km_regreso) {
        sql += 'km_regreso = ?, ';
        params.push(km_regreso);
    }

    if (observaciones_devolucion) {
        sql += 'observaciones_devolucion = ?, ';
        params.push(observaciones_devolucion);
    }

    if (rueda_auxilio) {
        sql += 'rueda_auxilio = ?, ';
        params.push(rueda_auxilio === 'true' ? 1 : 0);
    }

    if (file) {
        sql += 'ficha_firmada_path = ?, ';
        params.push(file.path);
    }

    sql = sql.slice(0, -2); // Remove trailing comma and space
    sql += ' WHERE id = ?';
    params.push(id);

    await connection.query(sql, params);

    // Update car status and kilometraje
    let updateCarSql = `UPDATE cars SET estado = 'Disponible'`;
    const updateCarParams = [];

    if (km_regreso) {
        updateCarSql += ', kilometraje = ?';
        updateCarParams.push(km_regreso);
    }

    updateCarSql += ' WHERE id = ?';
    updateCarParams.push(carId);

    await connection.query(updateCarSql, updateCarParams);

    await connection.commit();

    const [updatedPrestacionRows] = await db.query(
      `SELECT 
        p.id, p.loanDate, p.returnDate, p.status, p.gestionadoPor, p.autorizadoPor, p.ficha_firmada_path, p.combustible_salida, p.combustible_regreso, p.km_salida, p.km_regreso, p.observaciones_devolucion, p.rueda_auxilio,
        JSON_OBJECT(
          'id', c.id, 'marca', c.marca, 'modelo', c.modelo, 'version', c.version, 'ano', c.ano, 'patente', c.patente, 'chasis', c.chasis, 'motor', c.motor, 'estado', c.estado, 'garantia', c.garantia, 'sector', c.sector, 'categoria', c.categoria
        ) as car,
        JSON_OBJECT(
          'id', cl.id, 'nombreCompleto', cl.nombreCompleto, 'dni', cl.dni, 'direccion', cl.direccion, 'celular', cl.celular, 'email', cl.email, 'cuil', cl.cuil, 'estadoCivil', cl.estadoCivil, 'fechaNacimiento', cl.fechaNacimiento, 'carnetManejo', cl.carnetManejo, 'fotoCarnetFrente', cl.fotoCarnetFrente, 'fotoCarnetDorso', cl.fotoCarnetDorso
        ) as client,
        (SELECT GROUP_CONCAT(pf.photo_url) FROM prestacion_fotos pf WHERE pf.prestacion_id = p.id) as fotosDevolucion
      FROM prestaciones p
      JOIN cars c ON p.car_id = c.id
      JOIN clients cl ON p.client_id = cl.id
      WHERE p.id = ?`,
      [id]
    );

    const updatedPrestacion = {
      ...updatedPrestacionRows[0],
      status: newStatus,
      car: JSON.parse(updatedPrestacionRows[0].car),
      client: JSON.parse(updatedPrestacionRows[0].client),
      fotosDevolucion: updatedPrestacionRows[0].fotosDevolucion ? updatedPrestacionRows[0].fotosDevolucion.split(',') : []
    };

    res.status(200).json(updatedPrestacion);

  } catch (error) {
    await connection.rollback();
    console.error('Error al finalizar el préstamo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// DELETE /api/prestaciones/:id - Eliminar un préstamo
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [prestacionRows] = await connection.query('SELECT car_id, status FROM prestaciones WHERE id = ?', [id]);
    if (prestacionRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Préstamo no encontrado.' });
    }
    const { car_id, status } = prestacionRows[0];

    await connection.query('DELETE FROM prestaciones WHERE id = ?', [id]);

    if (status === 'Activa') {
      await connection.query(`UPDATE cars SET estado = 'Disponible' WHERE id = ?`, [car_id]);
    }

    await connection.commit();

    res.status(200).json({ message: 'Préstamo eliminado correctamente' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar el préstamo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

module.exports = router;
