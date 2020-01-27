const express = require('express');
var router = express.Router();
const path = require('path');
const uniqid = require('uniqid');
const bodyParser = require('body-parser');
const multer = require('multer');

const memeimgModel = require('../models/memeimage.model');
const memeModel = require('../models/meme.model');

//block meme by admin
router.post('/memeBlock', (req, res) =>{
    const id = req.body.id;
    memeModel.findByIdAndUpdate({_id:id}, {$set: {isadminBlocked:false}}, function (err, data) {
    if(!err){
        res.status(200).send({msg:'Meme UnBlocked'});
    }
    if(err){
        res.status(400).send({msg:'Error in UnBlocked meme'});
    }
});
});
//unblock meme

//block meme by admin
router.post('/memeunBlock', (req, res) =>{
    const id = req.body.id;
    memeModel.findByIdAndUpdate({_id:id}, {$set: {isadminBlocked:true}}, function (err, data) {
    if(!err){
        res.status(200).send({msg:'Meme Blocked'});
    }
});
});

module.exports=router;