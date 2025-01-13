const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default: ''
    },
    bannerImg:{
        type:String,
        default: ''
    },
    headline:{

        type:String,
        default: 'Linkdin User'
    },
    about:{
        type:String,
        default: ''
    },
    skills:[String],
    experience:[
        {
            title: String,
            company: String,
            startDate: String,
            endDate: String,
            duration: String,
            description: String
        }
    ],
    educations:[
        {
            school: String,
            fieldOfStudy: String,
            startDate: Number,
            endDate: Number
        }
    ],
    connections:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);