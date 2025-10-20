const mysql = require('mysql2/promise');

// Crear un pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos exitosa.');
    connection.release(); // Devuelve la conexión al pool
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
}

// Exportamos el pool para usarlo en otras partes de la app
// y llamamos a la función de testeo

testConnection();

module.exports = pool;
