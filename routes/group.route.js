var express = require('express');
const uniqid = require('uniqid');
var router = express.Router();
const validateToken = require('../config/auth-token');
const groupModel = require('../models/group.model')

//Create Groups
    router.post('/savegroup',(req,res) =>{
        let gid=uniqid();
        if(!req.body){
            return res.status(400).send("Request body is missing");
        }
        //Create modal
        let group = new groupModel({
            groupOwnerId : req.body.groupOwnerId,
            groupOwnerName : req.body.groupOwnerName,
            groupName: req.body.groupName,
            groupMembers: req.body.groupMembers,
            groupId:gid
        });
    
            //save group in database
        group.save().then(data => {
            console.log('data',data);
            res.status(200).send({Data:data});
        
        })

    })

    //Get group 
    router.get('/getGroup',validateToken,(req,res)=>{
        groupModel.find().sort({createdOn:-1}).then(result=>{
            res.status(200).send({result:result,message:"group data"});
        }).catch(err=>{
            res.status(500).send({err:err,message:"error while getting groups"})
        })
    })
    
     //Get group details by grouId
     router.post('/getGroupDetails',validateToken,(req,res)=>{
        groupModel.find({groupId:req.body.groupId}).then(result=>{
            res.status(200).send({result:result,message:"group details"});
        }).catch(err=>{
            res.status(500).send({err:err,message:"error while getting group details"})
        })
    })

    //Get user joined groups
    router.post('/getUserJoined',validateToken,(req,res)=>{
        groupModel.find({'groupMembers.membersUserId':req.body.membersUserId}).sort({createdOn:-1}).then(result=>{
            res.status(200).send({result:result,message:"user joined group data"});
        }).catch(err=>{
            res.status(500).send({err:err,message:"error while getting groups"})
        })
    })

     //Get user can join groups
     router.post('/getUserNotJoin',validateToken,(req,res)=>{
        groupModel.find({'groupMembers.membersUserId': {$nin: [req.body.membersUserId]}}).sort({createdOn:-1}).then(result=>{
            res.status(200).send({result:result,message:"user can join group data"});
        }).catch(err=>{
            res.status(500).send({err:err,message:"error while getting groups"})
        })
    })

    //To leave groups
    router.post('/leaveGroup',validateToken,(req,res)=>{
        groupModel.update({ groupId:req.body.groupId }, { "$pull": { "groupMembers": { "membersUserId": req.body.membersUserId } }}, { safe: true, multi:true }, function(err, obj) {
          if(!err){
            res.status(200).send({result:obj,message:"user leave group"});
          }
        });
    })

     //To join groups
     router.post('/joinGroup',validateToken,(req,res)=>{
        groupModel.findOneAndUpdate({ groupId:req.body.groupId }, { "$push": { "groupMembers": { "membersUserId": req.body.membersUserId,"memberUserName":req.body.memberUserName } }}, function(err, obj) {
          if(!err){
            res.status(200).send({result:obj,message:"user join group"});
          }
        });
    })

     module.exports = router;
