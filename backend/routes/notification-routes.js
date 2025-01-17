const express = require('express');
const router = express.Router();
const {getUserNotifications, markNotificationAsRead, deleteNotification} = require('../controllers/notification-controller');
const protectedRoute = require('../middleware/auth-middleware');

router.get('/',protectedRoute, getUserNotifications);
router.put('/:id/read',protectedRoute, markNotificationAsRead);
router.delete('/:id',protectedRoute, deleteNotification);

module.exports = router;


