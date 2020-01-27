const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const supportSchema=new Schema({
    emailId: String,
    userName:String,
    subject: String,
    QueryData: {type:Array},
    replyData:{type:Array}
});
module.exports=mongoose.model('usersupport',supportSchema);

