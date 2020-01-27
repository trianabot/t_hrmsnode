const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let userRegistrationSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    nameSee: {
        type: String,
    },
    emailId : {
        type: String,
        required: true,
        unique: true
    },
    isProfileImage:{
        type:Boolean,
        default:false,
        required:false
    },
    gender: {
        type: String,
        required: true
    },
    genderSee: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    citySee: {
        type: String,
    },
   
    ProfileImage:{
        type:String,
    },

    countrySee: {
        type: String
    },
    ipAddress:{
        type: String
    },
    macAddress:{
        type: String
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    isActive:{
        type: Boolean,
        required: false
    }, 
    role:{
        type: String,
        required: true
    },
    isBlocked:{
        type: Boolean,
        required: false
    },  
    isPremium:{
        type: Boolean,
        required: false
    }, 
    isDeleted:{
        type: Boolean,
        required: false,
        default: false
    },  
    sysCreatedBy: {
        type: String,
        required: false
    },
    sysUpdatedBy: {
        type: String,
        required: false
    },
    sysCreatedDate: {
        type: Number,
        required: false
    },
    sysUpdatedDate: {
        type: Number,
        required: false
    },
    socketid:{
        type: String,
        required: false
    }
});

userRegistrationSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User',userRegistrationSchema);