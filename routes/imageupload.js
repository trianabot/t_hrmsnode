const express = require('express');
const router = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const UserRegisterModel =  require('../models/userregister.model');
const config = require('../config/config');
const mkdirp = require('mkdirp');

const storage = multer.diskStorage({
    destination: function(req, file, callback){
        const dir = path.join(__dirname, "../../SAC_Media/mediafiles/")

        mkdirp(dir, err => callback(err, dir))
    },
    filename : function(req, file, callback){
        const fileName = req.params.imageName;
        const custFileName = fileName+'.jpg';
        callback(null, custFileName);
    }
});

const fileFilter = (req, file, callback)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
        callback(null, true);
    }else{
        callback(new Error('please upload PNG/JPEG type files'), false);
    }
};

const upload = multer({
    storage : storage,
    limits : {
        fieldSize : 1024*1024*5
    },
    fileFilter : fileFilter
});

router.post('/:imageName', upload.single('profileImg'), (req, resp, next)=>{
    const fileName = req.params.imageName;
    const custFileName = fileName+'.jpg';
    const myHost = req.hostname;
    const portName = config.port;
    const profileImage = 'http://'+myHost+':'+portName+'/mediafiles/'+custFileName;
    UserRegisterModel.update({userId:fileName}, {$set:{isProfileImage:true}}, function(error, data){
        if(error)throw error
    });

    console.log(profileImage);
    resp.status(200).json({
        profileImage : profileImage
    });
});

module.exports = router;