const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const followingSchema=new Schema({
     Uid:String,
     loggedinUsername:String,
     Following:String,
     followingUsername:String,
     ProfileImage:{
       type:String,
      required:false,
  },
  isProfileImage:{
    type:String,
    default:false,
    required:false,
 },
 gender:{ 
   type:String,
   required:false,
 }
   });
 
module.exports=mongoose.model('following',followingSchema);