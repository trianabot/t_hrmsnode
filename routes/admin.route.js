const express = require('express');
const router = express.Router();
const passport = require('passport');
const admin_controller = require('../controllers/admincontroller');
const AdminLoginModel =  require('../models/adminlogin.model');
const LikeModel = require('../models/like.model');
const memeModel=require('../models/meme.model');
const CategoryModel= require('../models/category.model');
const userRegisterModel = require('../models/userregister.model');

router.post('/register', admin_controller.adminRegister);
router.post('/login', admin_controller.adminlogin);
router.post('/blockMemes', admin_controller.blockMemes);
router.post('/blockreportMeme', admin_controller.blockreportMeme);
router.post('/unblockreportMeme', admin_controller.unblockreportMeme);

router.get('/admindetail',(req, res, next)=> {
    AdminLoginModel.
  find({}).
  exec(function (err, stories) {
    if (err) return handleError(err);
    res.status(200).send({msg:stories});
  });
});

//get all posted meme
router.get('/getMemes',function(req,res){
    let model=memeModel
    memeModel.find({},function(err,result){
    if(err){
    res.status(400).send({
    error:err,message:"error while getting memes"
    });
    }
    if(result){
    res.status(200).send({Data:result,message:"get all memes"});
    }
    }).sort({CreatedOn:-1}); 
    });
    

    router.get('/likes',function(req,res){
        let model=LikeModel
        LikeModel.find({},function(err,result){
        if(err){
        res.status(400).send({
        error:err,message:"error while getting memes"
        });
        }
        if(result){
        res.status(200).send({Data:result});
        }
        }).sort({CreatedOn:-1}); 
        });

  /**Delete the user */
  router.post('/deleteuser', function(req,res,next){
    console.log(req.body);
    userRegisterModel.findOneAndUpdate({ emailId: req.body.emailId }, { $set: { isDeleted: req.body.isDeleted } }, (error, userDoc) => {
      if (error) throw error;
      return res.status(200).send({ userDoc: userDoc, message: 'User deleted successfully' });
    });
  });

  /**Delete the meme */

  router.delete('/deletememe/:memeid', (req, res) => {
      console.log(req.params.memeid);
      memeModel.deleteMany({ MemeId : req.params.memeid },(error,result) => {
        if (error) throw error;
        return res.status(200).send({ deleted: result, message: 'Meme deleted successfully' });
      });
  });

module.exports = router;