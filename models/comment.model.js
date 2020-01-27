const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const commentsSchema=new Schema({
    CommentId:String,
    Comment: String,
    MemeId:String,
    UserId:String,
    Username:String,
    CommentedOn: {
        type: Date,
        default: Date.now
    },
    UpdatedOn: {
        type: Date,
        default: Date.now
    },
    gender:{ 
        type:String,
        required:false,
      },
    // commentsCount:Number,
  });
 
module.exports=mongoose.model('comments',commentsSchema);