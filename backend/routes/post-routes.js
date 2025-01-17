const express = require('express');
const router = express.Router();
const {getFeedPosts, createPost, likePost, commentPost, deletePost, getPostById} = require('../controllers/post-controller');
const protectedRoute = require('../middleware/auth-middleware');


router.get('/',protectedRoute ,getFeedPosts)
router.post('/create',protectedRoute ,createPost)
router.post('/delete/:id',protectedRoute ,deletePost)
router.get('/:id',protectedRoute ,getPostById)















module.exports = router;