const Post = require('../models/post-model');
const Notification = require('../models/Notification-model');
const cloudinary = require('../config/cloudinary-config');

// Function to get posts from the feed
const getFeedPosts = async (req, res) => {
    try {
        // Fetch posts authored by users in the current user's connections
        const post = await Post.find({ author: { $in: req.user.connections } })
            .populate('author', 'name username profilePicture headline') // Populate author details
            .populate('comments.user', 'name profilePicture ') // Populate comment user details
            .sort({ createdAt: -1 }); // Sort posts by creation date in descending order

        res.status(200).json(post); // Send the fetched posts as a response
    } catch (error) {
        console.error('Error fetching getFeedPosts controller:', error);
        res.status(500).json({
            success: false,
            message: error.message // Send error message in response
        });
    }
}

// Function to create a new post
const createPost = async (req, res) => {
    try {
        const { content, image } = req.body; // Destructure content and image from request body

        let newPost;
        if (image) {
            // If an image is provided, upload it to Cloudinary
            const result = await cloudinary.uploader.upload(image, { folder: 'posts' });
            newPost = new Post({
                content,
                image: result.secure_url, // Store the secure URL of the uploaded image
                author: req.user._id // Set the author to the current user's ID
            });
        } else {
            // If no image is provided, create a post without an image
            newPost = new Post({
                content,
                author: req.user._id // Set the author to the current user's ID
            });
        }

        await newPost.save(); // Save the new post to the database
        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: newPost // Send the created post as a response
        });
    } catch (error) {
        console.error('Error in createPost controller:', error);
        res.status(500).json({
            success: false,
            message: error.message // Send error message in response
        });
    }
}

// Function to delete a post
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id; // Get the post ID from request parameters
        const userId = req.user._id; // Get the current user's ID

        const post = await Post.findById(postId); // Find the post by ID
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' }); // Handle post not found
        }

        // Check if the current user is the author of the post
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' }); // Handle unauthorized access
        }

        // If the post has an image, delete it from Cloudinary
        if (post.image) {
            await cloudinary.uploader.destroy(post.image.split('/').pop().split('.')[0]);
        }

        await Post.findByIdAndDelete(postId); // Delete the post from the database

        res.status(200).json({ success: true, message: 'Post deleted successfully' }); // Send success response
    } catch (error) {
        console.error('Error in deletePost controller:', error);
        res.status(500).json({
            success: false,
            message: error.message // Send error message in response
        });
    }
}

module.exports = { getFeedPosts, createPost, deletePost }; // Export the controller functions
