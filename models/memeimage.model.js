const mongoose=require('mongoose');
const category = require('./category.model');

const Schema=mongoose.Schema;
//creting schema  & model for databot user

const memeImageSchema=new Schema({
   memeimgUrl:String,
   categoryId:{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}
});

module.exports=mongoose.model('memeimage',memeImageSchema);