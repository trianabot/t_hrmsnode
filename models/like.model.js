const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const likeSchema=new Schema({
   likeId: String,
   MemeId:String,
   likedById: String,
   liked: Boolean
});
module.exports=mongoose.model('liketable',likeSchema);

