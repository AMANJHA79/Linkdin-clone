const Notification = require('../models/Notification-model');



const getUserNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .select('type relatedUser relatedPost read createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        next({
            statusCode: 500,
            message: 'Failed to fetch notifications',
        });
    }
};

const markNotificationAsRead = async (req, res, next) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findByIdAndUpdate(
            { _id: notificationId, recipient: req.user._id },
            { $set: { read: true } },
            { new: true }
        );

        if (!notification) {
            return next({
                statusCode: 404,
                message: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            notification,
        });
    } catch (error) {
        next({
            statusCode: 500,
            message: 'Failed to mark notification as read',
        });
    }
};

const deleteNotification = async (req, res, next) => {
    try{
        const notificationId = req.params.id;
        const notification = await Notification.findByIdAndDelete({
            _id: notificationId,
            recipient: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    }
    catch(error){
        next(error);
    }
}


















module.exports = {getUserNotifications, markNotificationAsRead, deleteNotification};