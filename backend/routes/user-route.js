const express = require('express');
const {getSuggestionsConnections,getPublicProfile,updateProfile} = require('../controllers/user-controller');
const protectedRoute = require('../middleware/auth-middleware');

const router = express.Router();



router.get('/suggestions', protectedRoute, getSuggestionsConnections)
router.get('/:username',getPublicProfile)
router.put('/profile',protectedRoute,updateProfile)









module.exports = router;