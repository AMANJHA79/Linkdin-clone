const express = require('express');
const router = express.Router();
const {sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnection, getConnectionsRequests, getUserConnections, getConnectionStatus} = require('../controllers/connection-controller');
const protectedRoute = require('../middleware/auth-middleware');

// Route to send a connection request to a user
router.post('/request/:userId', protectedRoute, sendConnectionRequest);

// Route to accept a connection request
router.put('/accept/:requestId', protectedRoute, acceptConnectionRequest);

// Route to reject a connection request
router.put('/reject/:requestId', protectedRoute, rejectConnectionRequest);

// Route to get all connection requests for the authenticated user
router.get('/requests', protectedRoute, getConnectionsRequests);

// Route to get all connections for the authenticated user
router.get('/', protectedRoute, getUserConnections);

// Route to remove a connection with a user
router.delete('/remove/:userId', protectedRoute, removeConnection);

// Route to get the connection status of a user
router.get('/status/:userId', protectedRoute, getConnectionStatus);

module.exports = router;

