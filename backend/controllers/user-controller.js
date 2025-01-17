const client = require('../config/redisClient'); // Import the Redis client
const User = require('../models/user-model');
const cloudinary = require('../config/cloudinary-config');

const getSuggestionsConnections = async (req, res, next) => {
    try{

        const currentUser = await User.findById(req.user._id).select('connections');


        //find the users who are not in the current user's connections array
        const suggestedUsers = await User.find({
            _id: {
                $ne: req.user._id,
                $nin: currentUser.connections
            }
        }).select('name username profilePicture headline').limit(5);

        res.status(200).json({
            success: true,
            data: suggestedUsers
        })







    }
    catch(error){
        next(error);
    }
}

const getPublicProfile = async (req, res, next) => {
    try{
        const user = await User.findOne({
            username: req.params.username
        }).select('-password');

        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        res.status(200).json({
            success: true,
            data: user
        })

    }
    catch(error){
        next(error);
    }
}

const updateProfile = async (req, res, next) => {
    const userId = req.user._id;

    try {
        // Assume you have logic to update the user profile here...
        const updatedData = req.body; // Get updated data from request
        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        // Invalidate the cache for user connections
        client.del(`user_connections:${userId}`);

        res.status(200).json({
            success: true,
            data: user // Return the updated user object
        });
    } catch (error) {
        next(error); // Handle error
    }
};

// Get user connections with caching
const getUserConnections = async (req, res, next) => {
    const userId = req.user._id;

    // Check if the data is in the cache
    client.get(`user_connections:${userId}`, async (err, cachedConnections) => {
        if (err) {
            return next(err); // Handle Redis error
        }

        if (cachedConnections) {
            // If cached data exists, return it
            return res.json(JSON.parse(cachedConnections)); // Parse the cached JSON string
        }

        try {
            // Fetch from the database if not cached
            const user = await User.findById(userId).populate('connections', 'name username profilePicture headline connections');
            // Cache the connections with an expiration time (e.g., 10 minutes)
            client.setex(`user_connections:${userId}`, 600, JSON.stringify(user.connections));
            res.json(user.connections);
        } catch (error) {
            next(error); // Handle database error
        }
    });
};

module.exports = {getSuggestionsConnections,getPublicProfile,updateProfile,getUserConnections}