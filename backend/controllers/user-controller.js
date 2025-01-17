const User = require('../models/user-model');
const cloudinary = require('../config/cloudinary-config');

const getSuggestionsConnections = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getPublicProfile = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const updateProfile = async (req, res) => {
    try{
        const allowedFields = [
            "name",
            "headline",
            "about",
            "location",
            "profilePicture",
            "bannerImg",
            "skills",
            "experience"
        ];

        const updateddata = {};

        for(const field of allowedFields){
            if(req.body[field]){
                updateddata[field] = req.body[field];
            }
        }



        //todo check foe the profile picture and banner img

        if(req.body.profilePicture){
            const result= await cloudinary.uploader.upload(req.body.profilePicture);
            updateddata.profilePicture = result.secure_url;
        }

        if(req.body.bannerImg){
            const result= await cloudinary.uploader.upload(req.body.bannerImg);
            updateddata.bannerImg = result.secure_url;
        }

        const user = await User.findByIdAndUpdate(req.user._id,updateddata,{new:true}).select('-password');

        res.status(200).json({
            success: true,
            data: user
        })


    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message

        })
    }

}

module.exports = {getSuggestionsConnections,getPublicProfile,updateProfile}