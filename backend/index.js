require('dotenv').config();
require('./db.js'); // Carga y ejecuta la conexión a la DB
const express = require('express');
const cors = require('cors');
const path = require('path'); // Añadir el módulo path

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use((req, res, next) => {
  console.log(`[LOGGER] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentar el límite para aceptar imágenes en base64
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡El backend está funcionando!');
});

// Rutas de la API
const clientRoutes = require('./routes/clients');
const carRoutes = require('./routes/cars');
const prestacionRoutes = require('./routes/prestaciones');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const scanSessionRoutes = require('./routes/scan-sessions');

app.use('/api/clients', clientRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/prestaciones', prestacionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scan-sessions', scanSessionRoutes);

// Store for scan sessions in memory
app.locals.scanSessions = {};

// Cleanup old scan sessions every minute
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const sessionId in app.locals.scanSessions) {
        if (now - app.locals.scanSessions[sessionId].timestamp > SESSION_TIMEOUT) {
            console.log(`Deleting expired scan session: ${sessionId}`);
            delete app.locals.scanSessions[sessionId];
        }
    }
}, 60000);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).send('Ocurrió un error en el servidor');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
