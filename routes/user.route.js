const express = require('express');
const router = express.Router();
const passport = require('passport');
const validateToken = require('../config/auth-token');
const UserRegisterModel = require('../models/userregister.model');
const inviteUserModel = require('../models/inviteuser.js');
const user_controller = require('../controllers/usercontroller');
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
const config = require('../config/config');
const hbs = require('nodemailer-express-handlebars');
const SimpleCrypto = require("simple-crypto-js").default;
const _secretKey = "some-unique-key";
const simpleCrypto = new SimpleCrypto(_secretKey);
var emailIdd=[];
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const chatHandler = require('./chathandler');
const queryHandler = require('./query-handler');
const chatModel = require('../models/chat.model');
const supportSchema=require('../models/usersupport.model');
const roleModel=require('../models/userrole.model');
const path=require('path');

const birthdayModel = require('../models/customer.model');
const onbordingform=require('../models/onboardingform.model');

router.get('/test', user_controller.testuser);

router.post('/registeruser', user_controller.registeruser);



router.get('/confirmation/:token', user_controller.confirmationPost);

router.post('/login', user_controller.loginuser);

router.get('/getUser', user_controller.getUserbyId);

router.get('/getAdminUsers', user_controller.getAdminUsers);

router.get('/latestRegister', user_controller.findLatestUsers);

router.get('/getAllLikesCount', user_controller.getAllLikesCount);

router.get('/getUserCount', user_controller.getUserCount);

router.put('/likePost', validateToken, user_controller.likePost);

router.put('/dislikePost', validateToken, user_controller.dislikePost);

router.get('/totalLikes', user_controller.getTotalLikesCount);

router.post('/getuserdetail', user_controller.findUser);

router.post('/updateName', user_controller.updatename);

router.post('/updateuserName', user_controller.updateuserName);

router.post('/getuserMeme', validateToken, user_controller.getuserMemes);

router.put('/blockMeme', user_controller.blockMeme);

router.post('/userblockMeme', user_controller.userblockMeme);

router.post('/unblockMeme', user_controller.unblockMeme);

router.post('/reportMeme', user_controller.reportMeme);

router.post('/unreportMeme', user_controller.unreportMeme);

router.get('/getRecentlyRegisteredUserCount', user_controller.getRecentlyRegisteredUserCount);

router.get('/getActiveLoginUserCount', user_controller.getActiveLoginUserCount);


// router.post('/getMessages', chatHandler.getMessagesRouteHandler);
function createToken(user) {
  return jwt.sign({ id: user.userId, email: user.emailId }, config.jwtSecret, {
    expiresIn: '2h' // 86400 expires in 24 hours
  });
}
//To change password(25/07/2019:monika)
router.post('/changepassword', function (req, res) {
  console.log("req.body", req.body);
  UserRegisterModel.findOne({ emailId: req.body.emailId }, (error, userDoc) => {
    if (error) throw error;
    var dpassword = simpleCrypto.decrypt(userDoc.password);
    let isvalidPasswordWithoutHashed = req.body.oldpassword; // Its only for Old user
    if ((dpassword == req.body.oldpassword) || (isvalidPasswordWithoutHashed == userDoc.password)) {
      UserRegisterModel.findOneAndUpdate({ emailId: req.body.emailId }, {
        $set: { password: req.body.newpassword }
      }, { new: true }).then(cpwd => {
        return res.status(200).send({ success: false, message: 'Password changed successfully' });
      }).catch(err => {
        return res.status(400).send({ error:err,message: 'Error while changing password' });
      })
    } else {
      return res.status(401).send({ success: false, message: 'Error while changing password ' });
    }
  });
})


//To forgot password(25/07/2019:monika)
router.post('/forgotpassword', function (req, res) {
  UserRegisterModel.findOne({ emailId: req.body.emailId }, (error, userDoc) => {
    if (error) throw error;
    // Send the email

    var transporter = nodemailer.createTransport(smtpTransport({ service: 'Gmail', auth: { user: "stomachcrew@gmail.com", pass: "ache@123" }, tls: { rejectUnauthorized: false } }));
    var options = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: path.join(__dirname, '../views/email/'),
        defaultLayout: 'template',
        partialsDir: path.join(__dirname,'../views/partials/')
      },
      viewPath: path.join(__dirname, '../views/email/'),
      extName: '.hbs'
    };

    transporter.use('compile', hbs(options));

    // var confirmationUrl = 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + token.token + '.\n'

    var mailOptions = {
      from: 'stomachcrew@gmail.com',
      to: req.body.emailId,
      subject: 'Account Verification Token',
      template: 'forgotpwd_body',
      context: {
        host: req.headers.host,
        port: config.port,
        emailId:req.body.emailId,
        url: 'http://' + config.redirectUrl +  '/#/forgotpassword/' + req.body.emailId
      }
      // html:`<h1>Welcome</h1><p>That was easy!</p>`,
    };
    // console.log("options",mailOptions);

    transporter.sendMail(mailOptions, function (err) {
      if (err) { return res.status(500).send({ msg: err.message }); }
      res.status(200).send({ message: 'A password reset link has been sent to your registered email address.' + req.body.emailId + '.' });
    });
  });
})

//To update password(26/07/2019:monika)
router.post('/updatepassword', function (req, res) {
  // console.log("req.body",req.body);
  UserRegisterModel.findOne({ emailId: req.body.emailId }, (error, userDoc) => {
    if (error) throw error;
    var epassword = simpleCrypto.encrypt(req.body.password);

    UserRegisterModel.findOneAndUpdate({ emailId: req.body.emailId }, {
      $set: { password: epassword }
    }, { new: true }).then(fpwd => {
      return res.status(200).send({ message: 'Forgot password updated successfully' });
    }).catch(err => {
      return res.status(400).send({ message: 'Error while updating forgot  password' });
    })

  });
})

//To update password(26/07/2019:monika)
router.post('/logout', function (req, res) {
  // console.log("req.body",req.body);
  UserRegisterModel.findOneAndUpdate({ emailId: req.body.emailId }, { $set: { isActive: req.body.isActive } }, { new: true }, (error, userDoc) => {
    if (error) throw error;
    return res.status(200).send({ userDoc: userDoc, message: 'logout successfully' });
  });
});


//To invite user(01/08/2019:monika)
router.post('/inviteuser', function (req, res) {

  emailIdd=req.body;
  var transporter = nodemailer.createTransport(smtpTransport({ service: 'Gmail', auth: { user: "stomachcrew@gmail.com", pass: "ache@123" }, tls: { rejectUnauthorized: false } }));
  var options = {
    viewEngine: {
      extname: '.hbs',
      layoutsDir:path.join(__dirname, '../views/email/'),
      defaultLayout: 'template',
      partialsDir: path.join(__dirname,'../views/partials/')
    },
    viewPath: path.join(__dirname, '../views/email/'),
    extName: '.hbs'
  };

  transporter.use('compile', hbs(options));
  var mailOptions = {
    from: 'stomachcrew@gmail.com',
    to: emailIdd,
    subject: 'Invitation To Join SAC',
    text:req.body.invitationMessage,
    template: 'invite_body',
    context: {
      host: req.headers.host,
      port: config.port,
      url: 'http://' + config.redirectUrl + '/#/'
    },
   
  };
 

  transporter.sendMail(mailOptions, function (err) {
    if (err) {
       return res.status(500).send({ msg: err,message:"Error while sending Invitation" }); 
  }
    res.status(200).send({ success: false, message: 'Invitation send Successful.'  });
  });
});

router.post('/getMessages', function(req, res) {
    let userId = req.body.userId;
    let toUserId = req.body.toUserId;
        // console.log(userId, toUserId);
        // console.log('inside try');
        // const messagesResponse =  queryHandler.getMessages({
        //     userid:userId,
        //     touserid: toUserId
        // });
        // // console.log(messagesResponse);
        // response.status(200).send({
        //     error : false,
        //     messages : messagesResponse
        // });
        chatModel.find({$or:[{ userid: req.body.userId, touserid: req.body.toUserId },{ userid: req.body.toUserId, touserid: req.body.userId }]}, function (err, data) {
          // console.log(data);
          return  res.status(200).send( {result: data} );
      })

});//To make user as admin
router.post('/makeadmin', function (req, res) {
  // console.log("req.body",req.body);
  UserRegisterModel.findOneAndUpdate({ emailId: req.body.emailId }, { $set: { isAdmin: true } }, { new: true }, (error, userDoc) => {
    if (error) throw error;
    return res.status(200).send({ userDoc: userDoc, message: 'Admin success' });
  });
});

//To make user as admin
router.post('/makeuser', function (req, res) {
  // console.log("req.body",req.body);
  UserRegisterModel.findOneAndUpdate({ emailId: req.body.emailId }, { $set: { isAdmin: false } }, { new: true }, (error, userDoc) => {
    if (error) throw error;
    return res.status(200).send({ userDoc: userDoc, message: 'User success success' });
  });
});

//To block user 
router.post('/userblock', function (req, res) {
  UserRegisterModel.update({ emailId: req.body.emailId }, { $set: { isBlocked: req.body.isBlocked } }, { new: true }, (error, userDoc) => {
    if (error) throw error;
    // Send the email
   
    var transporter = nodemailer.createTransport(smtpTransport({ service: 'Gmail', auth: { user: "stomachcrew@gmail.com", pass: "ache@123" }, tls: { rejectUnauthorized: false } }));
    var options = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: path.join(__dirname,'../views/email/') ,
        defaultLayout: 'template',
        partialsDir:  path.join(__dirname,'../views/partials/')
      },
      viewPath: path.join(__dirname,'../views/email/'),
      extName: '.hbs'
    };

    transporter.use('compile', hbs(options));

    // var confirmationUrl = 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + token.token + '.\n'

    var mailOptions = {
      from: 'stomachcrew@gmail.com',
      to: req.body.emailId,
      subject: 'SAC account deactivated',
      template: 'blockuser_body',
      context: {
        host: req.headers.host,
        port: config.port,
        emailId:req.body.emailId,
       // url: 'http://' + config.redirectUrl + '/#/forgotpassword/' + req.body.emailId
      }
      // html:`<h1>Welcome</h1><p>That was easy!</p>`,
    };
    adminArray=['darshanalasravanthi@gmail.com','monikachhatre2210@gmail.com','prab0200@gmail.com'];
    var mailOptions11 = {
      from: 'stomachcrew@gmail.com',
      to: adminArray,
      subject: 'SAC Admin Update',
      template: 'blockinfotoadmin_body',
      context: {
        host: req.headers.host,
        port: config.port,
        emailId:req.body.emailId,
        userName:req.body.userName
      }
    
    };

    transporter.sendMail(mailOptions, function (err) {
      if (err) { return res.status(500).send({ message: err,message:"error while blocking user" }); }
      transporter.sendMail(mailOptions11, function (err) {
        if (err) { return res.status(500).send({message: err,message:"error while blocking user" }); }
     
        res.status(200).send({ message: 'user blocked successfully.' + req.body.emailId + '.' });
      });
    });
  });
});


//To block user 
router.post('/userunblock', function (req, res) {
  UserRegisterModel.update({ emailId: req.body.emailId }, { $set: { isBlocked: req.body.isBlocked } }, { new: true }, (error, userDoc) => {
    if (error) throw error;
    // Send the email
   
    var transporter = nodemailer.createTransport(smtpTransport({ service: 'Gmail', auth: { user: "stomachcrew@gmail.com", pass: "ache@123" }, tls: { rejectUnauthorized: false } }));
    var options = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: path.join(__dirname,'../views/email/'),
        defaultLayout: 'template',
        partialsDir: path.join(__dirname,'../views/partials/')
      },
      viewPath:path.join(__dirname,'../views/email/'),
      extName: '.hbs'
    };

    transporter.use('compile', hbs(options));

    // var confirmationUrl = 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + token.token + '.\n'

    var mailOptions = {
      from: 'stomachcrew@gmail.com',
      to: req.body.emailId,
      subject: 'SAC Account Reactivated',
      template: 'unblock_body',
      context: {
        host: req.headers.host,
        port: config.port,
        emailId:req.body.emailId,
        userName:req.body.userName,
      url: 'http://' + config.redirectUrl +  '/#/login' 
      }
      // html:`<h1>Welcome</h1><p>That was easy!</p>`,
    };
    adminArray=['darshanalasravanthi@gmail.com','monikachhatre2210@gmail.com','prab0200@gmail.com'];
    var mailOptions11 = {
      from: 'stomachcrew@gmail.com',
      to: adminArray,
      subject: 'SAC Admin Update',
      template: 'unblockinfotoadmin_body',
      context: {
        host: req.headers.host,
        port: config.port,
        emailId:req.body.emailId,
    
      }
    
    };

    transporter.sendMail(mailOptions, function (err) {
      if (err) { return res.status(500).send({ message: err,message:"error while unblocking user" }); }
      transporter.sendMail(mailOptions11, function (err) {
        if (err) { return res.status(500).send({message: err,message:"error while unblocking user" }); }
     
        res.status(200).send({ message: 'user unblocked successfully.' + req.body.emailId + '.' });
      });
    });
  });
});

//To invite user(01/08/2019:monika)
router.post('/savequery',function (req, res) {

  if (!req.body) {
    return res.status(400).send("Request body is misssing");
}
let model = supportSchema({
  emailId: req.body.emailId,
  QueryData: req.body.QueryData,
    userName: req.body.userName,
    subject: req.body.subject
});


model.save().then(data=>{
res.status(200).send({Data:data,message:"Request send successfully"});
}).catch(err=>{
  res.status(404).send({error:err,message:"Request not send "});
})
 
});


//To get user query(monika)
router.get('/userquery',function (req, res) {
  supportSchema.find({}).then(data=>{
res.status(200).send({Data:data,message:"Request query from user"});
}).catch(err=>{
  res.status(404).send({error:err,message:"Error to get user query"});
})
});

//Reply to user query 
router.post('/sendmailtouser', function (req, res) {
   

  let model = supportSchema({
    emailId: req.body.emailId,
    replyData: req.body.QueryData,
      userName: req.body.userName,
      subject: req.body.subject
  });
 
supportSchema.updateOne({ emailId: req.body.emailId,subject: req.body.subject}, { $push: { replyData: req.body.QueryData } },function(err,data){
  if(!err){
   
  }else{
  
  }
});
  emailIdd=req.body;
  var transporter = nodemailer.createTransport(smtpTransport({ service: 'Gmail', auth: { user: "stomachcrew@gmail.com", pass: "ache@123" }, tls: { rejectUnauthorized: false } }));
  var options = {
    viewEngine: {
      extname: '.hbs',
      layoutsDir: path.join(__dirname,'../views/email/'),
      defaultLayout: 'template',
      partialsDir:path.join(__dirname,'../views/partials/')
    },
    viewPath: path.join(__dirname,'../views/email/'),
    extName: '.hbs'
  };

  transporter.use('compile', hbs(options));
  var mailOptions = {
    from: 'stomachcrew@gmail.com',
    to: req.body.emailId,
    subject: req.body.subject,
    userName:req.body.userName,
    text:req.body.QueryData,
    template: 'replytouserquery_body',
    context: {
      userName:req.body.userName,
      text:req.body.QueryData,
      host: req.headers.host,
      port: config.port,
      url: 'http://' + config.redirectUrl + '/#/'
    },
   
  };
 

  transporter.sendMail(mailOptions, function (err) {
    if (err) {
       return res.status(500).send({ msg: err,message:"Error while replying to user query" }); 
  }
    res.status(200).send({ success: false, message: 'Successfully responded to user query'  });
  });
});

//To get user query
router.post('/getreportedquery',function (req, res) {
  supportSchema.find({emailId:req.body.emailId}).then(data=>{
res.status(200).send({Data:data,message:"get reported query"});
}).catch(err=>{
  res.status(404).send({error:err,message:"Error to get reported query"});
})
});

//Reply to user query 
router.post('/sendmailtoadmin', function (req, res) {
 
supportSchema.updateOne({ emailId: req.body.emailId,subject: req.body.subject}, { $push: { QueryData: req.body.QueryData } },function(err,data){
  if(!err){
   res.status(200).send({message:"Query save  succefully"});
  }else{
    res.status(400).send({message:"Query save  unsuccefully"});
  }
});
});


router.post('/adminlogin',function(req,res){
  console.log("req.body admin",req.body);
  UserRegisterModel.findOneAndUpdate({ emailId: req.body.emailId ,isAdmin: true},{
    $set: { isActive: true}
  }, { new: true }, (error, userDoc) => {
    if (error) throw error;
    console.log("userDocuserDoc",userDoc);
    if (!userDoc) {
      return res.status(401).send({ success: false, message: 'Authentication failed. Wrong credentials for admin' });
    }
    if (userDoc.isBlocked==true) {
      return res.status(401).send({ success: false, message: 'Your account is bloked. Please contact: '+'stomachcrew@gmail.com' });
    }
    if (userDoc.isDeleted==true) {
      return res.status(401).send({ success: false, message: 'Your account is deleted. Please contact: '+'stomachcrew@gmail.com' });
    }
      var dpassword=simpleCrypto.decrypt(userDoc.password);
      let isvalidPasswordWithoutHashed = req.body.password; // Its only for Old user

      if ((dpassword == req.body.password) || (isvalidPasswordWithoutHashed==userDoc.password)) {
        if (!userDoc.isVerified) {
          return res.status(401).send({ message: 'Please verify your email to login' });
        }
        return res.status(200).json({
          success: true,
          token: createToken(userDoc),
          userData: userDoc
        });
     
      } else {
        return res.status(401).send({ success: false, message: 'Authentication failed. Wrong credentials' });
      }
    });
});

router.post('/sendbirthdaywishes',(req,res)=>{
  console.log("sendbirthdaywishes");
  let model=birthdayModel({
    username: req.body.username,
    birthday:req.body.birthday,
  });
  model.save().then(data=>{
    console.log("saved data",data);
    res.status(200).send({message:"saved succeffulyy",data:data})
  });
})


// service for adding role  (24-01-2020)
router.post('/addrole',(req,res)=>{
  let uniqId = uniqid();
  let model=roleModel({
    roleId: uniqId,
    role: req.body.role
  });
  model.save().then(data=>{
    res.status(200).send({message:"user role added  successfully",data:data})
  }).catch(err=>{
    res.status(400).send({message:"error while adding user",err:err})
  });
})
// service for adding role  (24-01-2020)


// service for getting user  role  (24-01-2020)
router.get('/getuserrole',(req,res)=>{
  roleModel.find().then(data=>{
    res.status(200).send({message:"user role got successfully",data:data})
  }).catch(err=>{
    res.status(400).send({message:"error while getting user role",err:err})
  });
})
// service for getting user role  (24-01-2020)


//service for onbording form(30-01-2020)
router.post('/onbording',(req,res)=>{
  
  let uniqId = uniqid();

     // Make sure this account doesn't already exist
     onbordingform.findOne({ emailId: req.body.emailId }, (err, user) => {
      // Make sure user doesn't already exist
      if (user) return res.status(400).send({ message: 'The email address you have entered is already associated with our organisation.' });
     

      try {
        let model=onbordingform({
          companyId: req.body.companyId,
           empName: req.body.empName,
           dateofbirth: Date.parse(req.body.dateofbirth),
           address1: req.body.address1,
           address2: req.body.address2,
           city: req.body.city,
           emailId: req.body.emailId,
           phone: req.body.phone,
           mobile: req.body.mobile,
           emergency: req.body.emergency,
           panNumber: req.body.panNumber,
           aadhaarNo:req.body.aadhaarNo,
           joinDate: Date.parse(req.body.joinDate),
           bankAccount:req.body.bankAccount,
           ess: req.body.ess,
           confirmation: req.body.confirmation,
           pfUan:req.body.pfUan,
           pfNumber: req.body.pfNumber,
           pfEnroleDate: req.body.pfEnroleDate,
           epfNumber:req.body.epfNumber,
           esiNumber:req.body.esiNumber,
           ctc:req.body.ctc,
           fbp:req.body.fbp,
           variablePay:req.body.variablePay,
           total:req.body.total,
           differenceAmount:req.body.differenceAmount,
           productType:req.body.productType,
           taxStatus:req.body.taxStatus,
           state: req.body.state,
           gender:req.body.gender,
           jobType: req.body.jobType,
           paymentMode: req.body.paymentMode,
           location: req.body.location,
           department: req.body.department,
           Designation: req.body.Designation,
           Relationship: req.body.Relationship,
         });
        model.save((err, userdata) => {
          if (!err) {
           res.status(200).send({message:"emp added successfully",data:userdata})
          } else {
            console.log("data not saved ..!",err);
            res.status(500).send({ message: err });
          }
        });
      } catch (e) {
        console.log("Catch block:" + e);
        log.error('Route failed with error', e);
        res.status(500).send(e);
      }
    });
})

//service for onbording form(30-01-2020)
module.exports = router;
