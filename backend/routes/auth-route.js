const express = require('express');
const protectedRoute = require('../middleware/auth-middleware');

const { signup, login, logout, getCurrentUser } = require('../controllers/auth-controller');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.get('/me', protectedRoute, getCurrentUser);


module.exports = router;