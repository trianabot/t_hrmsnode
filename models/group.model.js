const mongoose=require('mongoose');

const Schema = mongoose.Schema;

const groupSchema = new Schema({
    groupId:String,
    groupOwnerId: String,
    groupOwnerName :String,
    groupName:String,
    groupMembers:[
        {
        memberUserName:String,
        membersUserId:String
        }
    
     ],
      createdOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
})

module.exports=mongoose.model('group',groupSchema);