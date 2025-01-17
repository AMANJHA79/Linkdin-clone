const Post = require('../models/post-model');
const Notification = require('../models/Notification-model');
const cloudinary = require('../config/cloudinary-config');
const { sendCommentNotificationEmail } = require('../emails/email-handlers');

// Function to get posts from the feed
const getFeedPosts = async (req, res, next) => {
    try {
        // Fetch posts authored by users in the current user's connections
        const post = await Post.find({ author: { $in: req.user.connections } })
            .populate('author', 'name username profilePicture headline') // Populate author details
            .populate('comments.user', 'name profilePicture ') // Populate comment user details
            .sort({ createdAt: -1 }); // Sort posts by creation date in descending order

        res.status(200).json(post); // Send the fetched posts as a response
    } catch (error) {
        next(error); // Pass error to the error handler
    }
}

// Function to create a new post
const createPost = async (req, res, next) => {
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
        next(error); // Pass error to the error handler
    }
}

// Function to delete a post
const deletePost = async (req, res, next) => {
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
        next(error); // Pass error to the error handler
    }
}

// Function to get a post by ID
const getPostById = async (req, res, next) => {
    try{
        const postId = req.params.id;
        const post = await Post.findById(postId)
        .populate('author', 'name username profilePicture headline')
        .populate('comments.user', 'name profilePicture username headline')
        .sort({createdAt: -1})

        res.status(200).json(post);

    }
    catch(error){
        next(error); // Pass error to the error handler
    }
}

// Function to create a comment on a post
const createComment = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;

        // Ensure the post exists before adding a comment
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' }); // Handle post not found
        }

        // Add the comment to the post
        post.comments.push({ user: req.user._id, content });
        await post.save(); // Save the updated post

        // Populate author and comments user details
        const updatedPost = await Post.findById(postId)
            .populate('author', 'name username profilePicture headline email')
            .populate('comments.user', 'name username profilePicture headline email');


        // Create a notification for the post author
        if(post.author.toString() !== req.user._id.toString()){
            const newNotification = new Notification({
                recipient: post.author,
                sender: req.user._id,
                type: 'comment',
                relatedPost: postId,
                relatedComment: postId
            })

            await newNotification.save();
            //send email to the post author
            try {
                const postUrl = `${process.env.FRONTEND_URL}/post/${postId}`;
                await sendCommentNotificationEmail(post.author.email, req.author.name, post.user.name, postUrl, content);
                
            } catch (error) {
                console.error('Error in sendEmailToPostAuthor controller:', error);
                
            }
        }

        res.status(200).json({ success: true, message: 'Comment created successfully', post: updatedPost });

    } catch (error) {
        next(error); // Pass error to the error handler
    }
}

module.exports = { getFeedPosts, createPost, deletePost, getPostById, createComment }; // Export the controller functions
