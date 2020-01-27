const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const chatMessageSchema = new Schema({
    userid: String,
    touserid: String,
    message: String,
    username: String
});

module.exports=mongoose.model('messages',chatMessageSchema);