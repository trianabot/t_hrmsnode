const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const triveniSchema = new Schema({
    username: String,
    birthday:{type: Date,
        default: Date.now}
});

module.exports=mongoose.model('birth',triveniSchema);