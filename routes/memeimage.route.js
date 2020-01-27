const express = require('express');
var router = express.Router();
const path = require('path');
const uniqid = require('uniqid');
const bodyParser = require('body-parser');
const multer = require('multer');
const memeimgModel = require('../models/memeimage.model');
const memeModel = require('../models/meme.model');
const config = require('../config/config');
const mkdirp = require('mkdirp');

const storage = multer.diskStorage({
    destination: function(req, file, callback){
        const dir = './adminmedia/'

        mkdirp(dir, err => callback(err, dir))
    },
    filename : function(req, file, callback){
        const fileName = req.params.fileName;
        const ext = path.extname(file.originalname);
        const custFileName = fileName+ext;
        console.log(custFileName);
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

router.post('/:fileName', upload.single('memeImgFile'), (req, resp, next)=>{
    if(!req.body){
        return res.status(400).send("Bad request");
    }
    const myHost = req.hostname;
    const portNumber = config.port;
    const port = process.env.port || portNumber;
    const fileName = req.params.fileName;
    const ext = path.extname(req.file.originalname);
    const memeName = fileName+ext;
    const memeImgUri = '/adminmedia/'+memeName;
    let uniqId=uniqid();
    let model =new memeimgModel({
    categoryId:req.body.categoryId,
    memeimgUrl:memeImgUri
    });
    model.save()
    .then(doc=>{
        if(!doc || doc.length === 0){
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

//Read Memes Images start
router.get('/memeImages', (req, res)=>{
    memeimgModel.
    find({}).
    populate('categoryId').
    exec(function (err, memesimgdata) {
      if (err) return handleError(err);
      //console.log('The stories are an array: ', stories);
      res.status(200).send({result:memesimgdata});
    });
});
//Read Memes Images ends


//find by Category Id start
router.get('/:categoryId', (req, res, next) => {
    const id = req.params.categoryId;
    memeimgModel.find({'categoryId' : {_id: id}})
            .exec()
            .then(doc => {
                if(doc){
                    res.status(200).json(doc);
                }else {
                    res.status(404).json({message: "NO valid entry Id"});
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({error:err});
            });
});

//find by Category Id start

module.exports = router;
module.exports = router;