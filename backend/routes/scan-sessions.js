const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// POST /api/scan-sessions - Creates a new scan session
router.post('/', (req, res) => {
    const sessionId = uuidv4();
    // Store the session in the app-wide session object
    // We initialize it with no vehicleId
    req.app.locals.scanSessions[sessionId] = { vehicleId: null, timestamp: Date.now() };
    console.log(`Created scan session: ${sessionId}`);
    res.status(201).json({ sessionId });
});

// GET /api/scan-sessions/:id - Checks the status of a scan session
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const session = req.app.locals.scanSessions[id];

    if (!session) {
        return res.status(404).json({ message: 'Session not found' });
    }

    // If a vehicleId has been scanned, return it
    if (session.vehicleId) {
        console.log(`Session ${id} has vehicleId: ${session.vehicleId}`);
        res.status(200).json({ vehicleId: session.vehicleId });
        // Clean up the session after it has been retrieved
        delete req.app.locals.scanSessions[id];
    } else {
        // If no vehicleId is present yet, tell the client to continue polling
        res.status(202).json({ message: 'Pending scan' });
    }
});

// POST /api/scan-sessions/:id - Updates a scan session with the scanned vehicle ID
router.post('/:id', (req, res) => {
    const { id } = req.params;
    const { vehicleId } = req.body;

    if (!req.app.locals.scanSessions[id]) {
        return res.status(404).json({ message: 'Session not found or expired' });
    }

    if (!vehicleId) {
        return res.status(400).json({ message: 'vehicleId is required' });
    }

    // Store the vehicleId in the session
    req.app.locals.scanSessions[id].vehicleId = vehicleId;
    console.log(`Session ${id} updated with vehicleId: ${vehicleId}`);

    res.status(200).json({ message: 'Scan successful. Please return to your PC.' });
});

module.exports = router;
