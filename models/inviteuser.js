const mongoose=require('mongoose');

const Schema = mongoose.Schema;

const inviteUserSchema = new Schema({
    invitUserEmailId:String,
    invitationMessage:String,
    
      invitedOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
})

module.exports=mongoose.model('inviteuser',inviteUserSchema);