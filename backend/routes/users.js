const express = require('express');
const router = express.Router();
const db = require('../db.js');
const bcrypt = require('bcryptjs');

// GET /api/users - Obtener todos los usuarios (sin el password_hash)
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, role FROM users ORDER BY username ASC');
    res.json(users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/users - Crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { username, password_dont_display, role } = req.body;

    if (!username || !password_dont_display || !role) {
      return res.status(400).json({ message: 'Nombre de usuario, contraseña y rol son obligatorios.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password_dont_display, salt);

    const sql = `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`;
    const [result] = await db.query(sql, [username, passwordHash, role]);

    const newUser = { id: result.insertId, username, role };
    res.status(201).json(newUser);

  } catch (error) {
    console.error('Error al crear el usuario:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese nombre de usuario.' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/users/:id - Actualizar un usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password_dont_display, role, current_password } = req.body;

    if (!username || !role) {
      return res.status(400).json({ message: 'Nombre de usuario y rol son obligatorios.' });
    }

    // Obtener el usuario actual de la base de datos
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Lógica de seguridad para sofiaadmin
    if (user.username === 'sofiaadmin' && password_dont_display) {
      // Si se intenta cambiar la contraseña de sofiaadmin, se requiere la contraseña actual
      if (!current_password) {
        return res.status(403).json({ message: 'Para cambiar la contraseña de sofiaadmin, debe proporcionar la contraseña actual.' });
      }

      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(403).json({ message: 'La contraseña actual es incorrecta.' });
      }
    }


    let passwordHash = null;
    if (password_dont_display) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password_dont_display, salt);
    }

    let sql = `UPDATE users SET username = ?, role = ?`;
    const params = [username, role];

    if (passwordHash) {
      sql += `, password_hash = ?`;
      params.push(passwordHash);
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    const [result] = await db.query(sql, params);

    if (result.affectedRows === 0) {
      // Esto no debería ocurrir si ya verificamos que el usuario existe
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const updatedUser = { id: parseInt(id), username, role };
    res.status(200).json(updatedUser);

  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe otro usuario con ese nombre de usuario.' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/users/:id - Eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Seguridad: No permitir eliminar al usuario con ID 1 (admin principal)
    if (parseInt(id) === 1) {
      return res.status(403).json({ message: 'No se puede eliminar al usuario administrador principal.' });
    }

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ message: 'Usuario eliminado correctamente.' });

  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
