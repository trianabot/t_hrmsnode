const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const followersSchema=new Schema({
     userId:String,
     userName:String,
     followerId:String,
     followeruserName:String,
     gender:{ 
      type:String,
      required:false,
    },
   });
 
module.exports=mongoose.model('followers',followersSchema);