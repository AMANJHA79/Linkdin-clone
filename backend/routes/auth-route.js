const express = require('express');
const protectedRoute = require('../middleware/auth-middleware');
const { signup, login, logout, getCurrentUser } = require('../controllers/auth-controller');
const rateLimit = require('../middleware/rate-limit');

const router = express.Router();

const limiterOptions = {
    windowMs: 15 * 60 * 1000,
    max: 5
};

router.post('/signup', rateLimit(limiterOptions), signup);
router.post('/login', rateLimit(limiterOptions), login);
router.post('/logout', logout);
router.get('/me', protectedRoute, getCurrentUser);

module.exports = router;