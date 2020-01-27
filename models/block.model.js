const mongoose=require('mongoose');

const Schema=mongoose.Schema;

//creting schema  & model for databot user

const blockSchema=new Schema({
   MemeId:String,
   blockById: String,
   IsBlock:Boolean,
   UserName:String
});

module.exports=mongoose.model('block',blockSchema);