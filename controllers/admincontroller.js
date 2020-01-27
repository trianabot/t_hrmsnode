const AdminLoginModel =  require('../models/adminlogin.model');
const memeModel= require('../models/meme.model');
const config = require('../config/config');


//Register
exports.adminRegister= (req,res,next)=> {
    AdminLoginModel.findOne({ userName: req.body.userName }, (err, user) => {
        if (user) return res.status(400).send({ message: 'The username you have entered is already associated with another account.' });
        try {
    let adminregister = new AdminLoginModel(
        {
            userName: req.body.userName,
            password: req.body.password,
            sysCreatedDate: new Date().getTime(),
            sysUpdatedDate: new Date().getTime()
        }
    )
    adminregister.save((err, userdata) => {
        if (!err) {
            // save to logininfo collection
            saveToLoginInfo(req, userdata);
        } else if (userdata == "" || userdata == []) {
            res.send({ message: "Admin not registered please check the data" });
        } else {
            return next(err);
            // res.send({message:err});
        }
    });
    } catch (e) {
        log.error('Route failed with error', e);
        res.status(500).send(e);
    }
});

    function saveToLoginInfo(request, user) {
        var adminlogininfo = new AdminLoginModel(
            {
                userName: user.userName,
                password: user.password,
                sysCreatedDate: new Date().getTime(),
                sysUpdatedDate: new Date().getTime()
            }
        );

        adminlogininfo.save((err, userinfodata) => {
            if (!err) {
                // Create a confirmation email token for this user
               res.send({message: 'Success'});
            } else if (userinfodata == "" || userinfodata == []) {
                res.send({ message: "User not registered please check the data" });
            } else {
                return next(err);
                // res.send({message:err});
            }
        });
    }

}

/**User login route */

exports.adminlogin = (req, res) => {
    var userName = req.body.userName;
    var password = req.body.password;

    AdminLoginModel.findOne({userName: userName, password:password}, function(err, user) {
        if(err) {
            console.log(err);
            return res.status(500).send();
        }
        if(!user) { 
            return res.status(404).send({msg:"Wrong Details"});
        }
        return res.status(200).send({msg:"success",user:user});
    });
}

exports.getAdmin =(req,res,) =>{
    AdminLoginModel.find(function (err, data) {
        if(err){
            console.log(err);
            return res.send(500, 'Something Went wrong with Retrieving data');
        }
        else {
            res.status(200).send(data);
        }
    });
}

exports.blockMemes = (req, res) =>{
    memeModel.find({'reportedBy': {'$elemMatch':  {"$exists":1},}  })
    .then(blockMeme =>{
    res.status(200).send({
     msg: "Found the Memes",
     blockedmeme: blockMeme
      });
      });
 }

    //Blocked meme by admin 

exports.blockreportMeme = (req, res) => {

    // Check if id was passed provided in request body
    if (!req.body.MemeId) {
        res.json({ success: false, message: 'No meme id was provided.' }); // Return error message
    } else {
        // Search the database with id
        memeModel.findOne({ MemeId: req.body.MemeId }, (err, blog) => {
            // Check if error was encountered
            if (err) {
                res.json({ success: false, message: 'Invalid meme id' }); // Return error message
            } else {
                // Check if id matched the id of a blog post in the database
                if (!blog) {
                    res.json({ success: false, message: 'That meme was not found.' }); // Return error message
                } else {
                    // Get data from user that is signed in

                    // Check if id of user in session was found in the database

                    // Check if the user who liked the post has already liked the blog post before
                    memeModel.update({
                        MemeId: req.body.MemeId,
                    },
                        {
                            $set:
                            {
                                "isadminBlock": true
                            }
                        }, function (err, data) {
                            if (err) {
                                console.log(err);
                            }
                            //console.log(data);
                            if (!err) {
                                res.status(200).send({ result: data, message: "Meme Blocked by admin" })
                            }
                        });

                }

            }
        });
    }
}

exports.unblockreportMeme = (req, res) => {

    // Check if id was passed provided in request body
    if (!req.body.MemeId) {
        res.json({ success: false, message: 'No meme id was provided.' }); // Return error message
    } else {
        // Search the database with id
        memeModel.findOne({ MemeId: req.body.MemeId }, (err, blog) => {
            // Check if error was encountered
            if (err) {
                res.json({ success: false, message: 'Invalid meme id' }); // Return error message
            } else {
                // Check if id matched the id of a blog post in the database
                if (!blog) {
                    res.json({ success: false, message: 'That meme was not found.' }); // Return error message
                } else {
                    memeModel.update({
                        MemeId: req.body.MemeId,
                    },
                        {
                            $set:
                            {
                                "isadminBlock": false
                            }
                        }, function (err, data) {
                            if (err) {
                                console.log(err);
                            }
                            //console.log(data);
                            if (!err) {
                                res.status(200).send({ result: data, message: "Meme Unlocked by admin" })
                            }
                        });

                }

            }
        });
    }
}
