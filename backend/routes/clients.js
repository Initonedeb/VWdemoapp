const express = require('express');
const router = express.Router();
const db = require('../db.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // La carpeta donde se guardarán las imágenes (corregido)
  },
  filename: function (req, file, cb) {
    // Generar un nombre de archivo único
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Función auxiliar para eliminar archivos
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error al eliminar archivo:', filePath, err);
      else console.log('Archivo eliminado:', filePath);
    });
  }
};

// GET /api/clients - Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clients ORDER BY nombreCompleto ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los clientes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/clients - Crear un nuevo cliente con subida de archivos
router.post('/', upload.fields([{ name: 'fotoCarnetFrente', maxCount: 1 }, { name: 'fotoCarnetDorso', maxCount: 1 }]), async (req, res) => {
  try {
    const { 
      nombreCompleto, fechaNacimiento, dni, carnetManejo, 
      direccion, celular, email, cuil, estadoCivil 
    } = req.body;

    // Rutas de los archivos subidos
    const fotoCarnetFrentePath = req.files && req.files['fotoCarnetFrente'] ? req.files['fotoCarnetFrente'][0].path : null;
    const fotoCarnetDorsoPath = req.files && req.files['fotoCarnetDorso'] ? req.files['fotoCarnetDorso'][0].path : null;

    if (!nombreCompleto || !dni) {
      // Si falta información obligatoria, eliminar los archivos subidos
      deleteFile(fotoCarnetFrentePath);
      deleteFile(fotoCarnetDorsoPath);
      return res.status(400).json({ message: 'Nombre completo y DNI son obligatorios.' });
    }

    const sql = `INSERT INTO clients (nombreCompleto, fechaNacimiento, dni, carnetManejo, direccion, celular, email, cuil, estadoCivil, fotoCarnetFrente, fotoCarnetDorso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const [result] = await db.query(sql, [
      nombreCompleto, fechaNacimiento, dni, carnetManejo, 
      direccion, celular, email, cuil, estadoCivil, 
      fotoCarnetFrentePath, fotoCarnetDorsoPath
    ]);

    const insertId = result.insertId;
    res.status(201).json({ id: insertId, ...req.body, fotoCarnetFrente: fotoCarnetFrentePath, fotoCarnetDorso: fotoCarnetDorsoPath });

  } catch (error) {
    // En caso de error, eliminar cualquier archivo que se haya subido
    if (req.files && req.files['fotoCarnetFrente']) deleteFile(req.files['fotoCarnetFrente'][0].path);
    if (req.files && req.files['fotoCarnetDorso']) deleteFile(req.files['fotoCarnetDorso'][0].path);
    console.error('Error al crear el cliente:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe un cliente con ese DNI, CUIL o Email.' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/clients/:id - Actualizar un cliente con subida de archivos
router.put('/:id', upload.fields([{ name: 'fotoCarnetFrente', maxCount: 1 }, { name: 'fotoCarnetDorso', maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombreCompleto, fechaNacimiento, dni, carnetManejo, 
      direccion, celular, email, cuil, estadoCivil 
    } = req.body;

    // Obtener las rutas de los archivos subidos (si los hay)
    const newFotoCarnetFrentePath = req.files && req.files['fotoCarnetFrente'] ? req.files['fotoCarnetFrente'][0].path : null;
    const newFotoCarnetDorsoPath = req.files && req.files['fotoCarnetDorso'] ? req.files['fotoCarnetDorso'][0].path : null;

    // Obtener las rutas de las fotos actuales del cliente en la DB
    const [currentClientRows] = await db.query('SELECT fotoCarnetFrente, fotoCarnetDorso FROM clients WHERE id = ?', [id]);
    const currentClient = currentClientRows[0];

    let fotoCarnetFrenteToSave = currentClient.fotoCarnetFrente;
    let fotoCarnetDorsoToSave = currentClient.fotoCarnetDorso;

    // Si se subió una nueva foto frontal, usarla y eliminar la antigua
    if (newFotoCarnetFrentePath) {
      deleteFile(currentClient.fotoCarnetFrente);
      fotoCarnetFrenteToSave = newFotoCarnetFrentePath;
    } else if (req.body.fotoCarnetFrente === 'null') { // Si el frontend envía 'null' explícitamente, significa que se eliminó la foto
      deleteFile(currentClient.fotoCarnetFrente);
      fotoCarnetFrenteToSave = null;
    }

    // Si se subió una nueva foto dorsal, usarla y eliminar la antigua
    if (newFotoCarnetDorsoPath) {
      deleteFile(currentClient.fotoCarnetDorso);
      fotoCarnetDorsoToSave = newFotoCarnetDorsoPath;
    } else if (req.body.fotoCarnetDorso === 'null') { // Si el frontend envía 'null' explícitamente
      deleteFile(currentClient.fotoCarnetDorso);
      fotoCarnetDorsoToSave = null;
    }

    if (!nombreCompleto || !dni) {
      // Si falta información obligatoria, eliminar los archivos subidos
      deleteFile(newFotoCarnetFrentePath);
      deleteFile(newFotoCarnetDorsoPath);
      return res.status(400).json({ message: 'Nombre completo y DNI son obligatorios.' });
    }

    const sql = `UPDATE clients SET 
      nombreCompleto = ?, fechaNacimiento = ?, dni = ?, carnetManejo = ?, 
      direccion = ?, celular = ?, email = ?, cuil = ?, estadoCivil = ?, 
      fotoCarnetFrente = ?, fotoCarnetDorso = ?
      WHERE id = ?`;

    const [result] = await db.query(sql, [
      nombreCompleto, fechaNacimiento, dni, carnetManejo, 
      direccion, celular, email, cuil, estadoCivil, 
      fotoCarnetFrenteToSave, fotoCarnetDorsoToSave, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json({ 
      id: parseInt(id), 
      ...req.body, 
      fotoCarnetFrente: fotoCarnetFrenteToSave, 
      fotoCarnetDorso: fotoCarnetDorsoToSave 
    });

  } catch (error) {
    // En caso de error, eliminar cualquier archivo que se haya subido
    if (req.files && req.files['fotoCarnetFrente']) deleteFile(req.files['fotoCarnetFrente'][0].path);
    if (req.files && req.files['fotoCarnetDorso']) deleteFile(req.files['fotoCarnetDorso'][0].path);
    console.error('Error al actualizar el cliente:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe otro cliente con ese DNI, CUIL o Email.' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/clients/:id - Eliminar un cliente y sus archivos
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener las rutas de las fotos antes de eliminar el cliente
    const [clientRows] = await db.query('SELECT fotoCarnetFrente, fotoCarnetDorso FROM clients WHERE id = ?', [id]);
    const clientToDelete = clientRows[0];

    const [result] = await db.query('DELETE FROM clients WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Eliminar los archivos del sistema de archivos
    if (clientToDelete) {
      deleteFile(clientToDelete.fotoCarnetFrente);
      deleteFile(clientToDelete.fotoCarnetDorso);
    }

    res.status(200).json({ message: 'Cliente eliminado correctamente' });

  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'No se puede eliminar un cliente que tiene préstamos asociados.' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
