const express = require('express');
var router = express.Router();
const path = require('path');
const uniqid = require('uniqid');
const bodyParser = require('body-parser');
const multer = require('multer');
const memeModel=require('../models/meme.model');
const validateToken = require('../config/auth-token');
const config = require('../config/config');
const mkdirp = require('mkdirp');
 

const storage = multer.diskStorage({
    destination: function(req, file, callback){
        const dir = path.join(__dirname, "../../SAC_Media/mediafiles/")
        mkdirp(dir, err => callback(err, dir))
    },
    filename : function(req, file, callback){
        const fileName = req.params.fileName;
        const ext = path.extname(file.originalname);
        const custFileName = fileName+ext;
        callback(null, custFileName);
    }
});

const fileFilter = (req, file, callback)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'video/mp4'){
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



router.post('/savemymeme/:fileName',validateToken,upload.single('memefile'), (req, resp, next)=>{
   
    if(!req.body){
        return res.status(400).send("Bad request");
    }
    const myHost = req.hostname;
    const portNumber = config.port;
    const port = process.env.port || portNumber;
    // const fileName = req.body.OwnerId+"_"+req.body.Title;
    const fileName = req.params.fileName;
    const ext = path.extname(req.file.originalname);
    const memeName = fileName+ext;
    let uniqId=uniqid();
    let model =new memeModel({
        postText:req.body.postText,
        IsLike:req.body.IsLike,
        IsShares:req.body.IsShares,
        OwnerName:req.body.OwnerName,
        OwnerId:req.body.OwnerId,
        MemeId:uniqId,
        groupId:req.body.groupId,
        Meme:memeName,
        ispaidpost:req.body.ispaidpost,
        Title:req.body.Title,
        selectCat:req.body.selectCat,
        Category:req.body.dropDownCategory,
        type : req.body.type,
        gender:req.body.gender
    //    likeCount:req.body.likeCount
       // shareCount:req.body.shareCount,
      //  commentsCount:req.body.commentsCount,
    });
    model.save()
    .then(doc=>{
        if(!doc || doc.length === 0){
            // console.log(moment(doc.CreatedOn).endOf('day').fromNow())
            return resp.status(500).send({
                message : 'meme added 500',
                data:doc
            });
        }
        resp.status(200).send({
            message : 'Meme uploaded successfully..!',
            data : doc
        });
    }).cathc(error=>{
        resp.status(500).send({
            message : 'Error while adding the meme',
            error : error
        });
    });
});

    // To upload vedio 
router.post('/savevedio/:fileName',validateToken,upload.single('memefile'), (req, resp)=>{
   
    if(!req.body){
        return res.status(400).send("Bad request");
    }
    const myHost = req.hostname;
    const portNumber = config.port;
    const port = process.env.port || portNumber;
    // const fileName = req.body.OwnerId+"_"+req.body.Title;
    const fileName = req.params.fileName;
    const ext = path.extname(req.file.originalname);
    const memeName = fileName+ext;
    let uniqId=uniqid();
    let model =new memeModel({
        IsLike:req.body.IsLike,
        postText:req.body.postText,
        IsShares:req.body.IsShares,
        OwnerName:req.body.OwnerName,
        OwnerId:req.body.OwnerId,
        MemeId:uniqId,
        Meme:memeName,
        ispaidpost:req.body.ispaidpost,
        Title:req.body.Title,
        selectCat:req.body.selectCat,
        Category:req.body.dropDownCategory,
        type : req.body.type,
        gender:req.body.gender,
        groupId:req.body.groupId,
    //    likeCount:req.body.likeCount
       // shareCount:req.body.shareCount,
      //  commentsCount:req.body.commentsCount,
    });
    model.save()
    .then(doc=>{
        if(!doc || doc.length === 0){
            // console.log(moment(doc.CreatedOn).endOf('day').fromNow())
            return resp.status(500).send({
                message : 'meme added 500',
                data:doc
            });
        }
        resp.status(200).send({
            message : 'Meme vedio successfully..!',
            data : doc
        });
    }).cathc(error=>{
        resp.status(500).send({
            message : 'Error while adding the meme',
            error : error
        });
    });
});

// module.exports = router;or while adding the meme',
//             error : error
//         });
//     });
// });

module.exports = router;