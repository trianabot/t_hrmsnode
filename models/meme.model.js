const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//report Schema
const reportSchema = new Schema({
    UserId: String,
    Username: String,
    MemeId: String,
    ReportStatus: {
        type: Number,
        default: 0,
    },
    reasonToReportMeme: String
});

//creting schema  & model for databot user
const commentsSchema = new Schema({
    CommentId: String,
    Comment: String,
    MemeId: String,
    UserId: String,
    Username: String,
    CommentedOn: {
        type: Date,
        default: Date.now
    },
    gender: {
        type: String,
        required: false,
    },
    UpdatedOn: {
        type: Date,
        default: Date.now
    },
    // commentsCount:Number,
});

const likeSchema = new Schema({
    MemeId: String,
    likedById: String,
    IsLike: Boolean,
    UserName: String

});
const memeSchema = new Schema({
    MemeId: String,
    Meme: String,
    OwnerId: String,
    OwnerName: String,
    groupId: String,
    postText: String,
    User: String,
    Title: String,
    IsShares: Boolean,
    IsLike: Boolean,
    Category: String,
    type: String,
    CreatedOn: {
        type: Date,
        default: Date.now
    },
    gender: {
        type: String,
        required: false,
    },
    UpdatedOn: {
        type: Date,
        default: Date.now
    },
    commentsCount: {
        type: Number,
        default: 0,
        required: false
    },
    likeCount: {
        type: Number,
        default: 0,
        required: false
    },
    shareCount: {
        type: Number,
        default: 0,
        required: false
    },
    isadminBlock: {
        type: Boolean,
        default: false
    },
    ispaidpost: {
        type: Boolean,
        default: false
    },
    reportedCount: {
        type: Number,
        default: 0,
        required: false
    },
    likedUserArrays: [{
        likedById: String,
        IsLike: Boolean
    }],
    comments: [commentsSchema],
    likes: { type: Number, default: 0 },
    likedBy: { type: Array },
    dislikes: { type: Number, default: 0 },
    dislikedBy: { type: Array },
    blockedBy: { type: Array },
    unblockedBy: { type: Array },
    reportedBy: [reportSchema]
});



module.exports = mongoose.model('meme', memeSchema);

