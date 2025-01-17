const Notification = require('../models/Notification-model');



const getUserNotifications = async (req, res) => {
    try{
        const notifications = await Notification.find({recipient: req.user._id}).sort({createdAt: -1}).populate('relatedUser','name username profilePicture').populate('relatedPost','content image');
        res.status(200).json({
            success: true,
            notifications
        });

    }
    catch(error){
        console.error('Error in getUserNotifications controller:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

}

const markNotificationAsRead = async (req, res) => {
    try{
        const notificationId = req.params.id;
        try{
            const notification = await Notification.findByIdAndUpdate({
                _id: notificationId,
                recipient: req.user._id
            },{
                $set: {read: true}
            },{
                new: true
            });

            res.status(200).json({
                success: true,
                notification
            });
        }
        catch(error){
            console.error('Error in markNotificationAsRead controller:', error);
            res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

    }
    catch(error){
        console.error('Error in markNotificationAsRead controller:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const deleteNotification = async (req, res) => {
    try{
        const notificationId = req.params.id;
        await Notification.findByIdAndDelete({
            _id: notificationId,
            recipient: req.user._id
        });
        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    }
    catch(error){
        console.error('Error in deleteNotification controller:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


















module.exports = {getUserNotifications, markNotificationAsRead, deleteNotification};