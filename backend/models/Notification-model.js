const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type:{
        type: String,
        enum: ['like', 'comment', 'follow', 'connectionAccepted'],
        required: true
    },
    relatedUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    relatedPost:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    read:{
        type: Boolean,
        default: false
    }
}, {timestamps: true})


module.exports = mongoose.model('Notification', notificationSchema);