const express = require('express');
const router = express.Router();
const db = require('../db.js');
const bcrypt = require('bcryptjs');

// POST /api/auth/login - Autenticar usuario
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Buscar el usuario por nombre de usuario
    const [users] = await db.query('SELECT id, username, password_hash, role FROM users WHERE username = ?', [username]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 2. Comparar la contraseña proporcionada con el hash almacenado
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Autenticación exitosa: devolver información del usuario (sin el hash de la contraseña)
    res.status(200).json({ id: user.id, username: user.username, role: user.role });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
