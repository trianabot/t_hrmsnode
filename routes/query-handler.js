const chatModel = require('../models/chat.model');
const userModel = require('../models/userregister.model');
'use strict';
class QueryHandler{

    constructor(){
		this.Mongodb = require("../config/config");
	}

getMessages({userId, toUserId}){
    const data = {
            '$or' : [
                { '$and': [
                    {
                        'touserid': userId
                    },{
                        'userId': toUserId
                    }
                ]
            },{
                '$and': [ 
                    {
                        'touserid': toUserId
                    }, {
                        'userId': userId
                    }
                ]
            },
        ]
    };	    
    // return new Promise( async (resolve, reject) => {
    //     try {
    //         // const [DB, ObjectID] = await this.Mongodb.db.onConnect();
    //         // DB.collection('messages').find(data).sort({'timestamp':1}).toArray( (err, result) => {
    //         //     DB.close();
    //         //     if( err ){
    //         //         reject(err);
    //         //     }
    //         //     resolve(result);
    //         // });
    //         chatModel.find({ Uid: req.body.userid }, (err, data) => {
    //             if (!err) {
    //                 res.status(200).send({ result: data });
    //             }
    //         })
    //     } catch (error) {
    //         reject(error)
    //     }
    // });
   const chatdata = chatModel.find({data}, function(err, data){
        if(!err) {
            return data
        }
    });
    console.log(chatdata);
    return chatdata;
}

addsocketid({userId,socketId}){
    // console.log(userId+" , "+ socketId);
    // userModel.findByIdAndUpdate({userId: userId})
            
    const userdata = userModel.update({userId: userId},{$set: {socketid:socketId}}, function (err, data) {
        // console.log(data);
        return data;
    });
    return userdata;
        
    };

    getUserInfo(chatUser) {
        const record = userModel.find({ userId: chatUser }, function (err, doc) {
            if (!err) {
                return doc;
            }
        });
        return record;
    };
    getcurrentUserInfo(currentUser) {
        const record = userModel.find({ userId: currentUser }, function (err, doc) {
            if (!err) {
                return doc;
            }
        });
        return record;
    }

insertMessages(messagePacket){
    // console.log(messagePacket);
    return new Promise( async (resolve, reject) => {
        try {
            let chatmodel = chatModel({
                userid: messagePacket.currentUser,
                touserid: messagePacket.chatUser,
                message: messagePacket.message,
                username: messagePacket.currentUserName
            })
            chatmodel.save();
            return chatModel;
        } catch (error) {
            log.error('Route failed with error', e);
            // res.status(500).send(e);
        }
    });
}

}
module.exports = new QueryHandler();