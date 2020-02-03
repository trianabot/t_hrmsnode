const UserRegisterModel = require('../models/userregister.model');
const TokenGenModel = require('../models/tokengen.model');
const randomstring = require('randomstring');
const nodemailer = require("nodemailer");
const uuid = require('uuid4');
const smtpTransport = require('nodemailer-smtp-transport');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const uniqid = require('uniqid');
const likeModel = require('../models/like.model');
const memeModel = require('../models/meme.model');
const hbs = require('nodemailer-express-handlebars');
const SimpleCrypto = require("simple-crypto-js").default;
const _secretKey = "some-unique-key";
const simpleCrypto = new SimpleCrypto(_secretKey);
const path = require('path');

/**Create the token */
function createToken(user) {
  return jwt.sign({ id: user.userId, email: user.emailId }, config.jwtSecret, {
    expiresIn: '2h' // 86400 expires in 24 hours
  });
}

exports.testuser = (req, res) => {
  res.send('this is test user data');
}

/**Register User */
exports.registeruser = (req, res) => {

  require('getmac').getMac(function (err, macAddress) {
    if (err) throw err;
    console.log(macAddress, "macAddress")


    // Make sure this account doesn't already exist
    UserRegisterModel.findOne({ emailId: req.body.emailId }, (err, user) => {
      // Make sure user doesn't already exist
      if (user) return res.status(400).send({ message: 'The email address you have entered is already associated with another account.' });
      // Create and save the admin
      var id = uuid();

      var epassword = simpleCrypto.encrypt(req.body.password);
      // var epassword = req.body.password;
      console.log("epassword",epassword);

      try {
        let userregister = new UserRegisterModel(
          {
            userId: id,
            userName: req.body.userName,
            name: req.body.name,
            emailId: req.body.emailId,
            password: epassword,
            gender: req.body.gender,
            city: req.body.city,
            role: req.body.role,
            sysCreatedBy: id,
            sysUpdatedBy: id,
            isActive: false,
            isBlocked: false,
            macAddress: macAddress,
            ipAddress: req.body.ipAddress,
            sysCreatedDate: new Date().getTime(),
            sysUpdatedDate: new Date().getTime()

          })
        console.log("userregister", userregister)
        userregister.save((err, userdata) => {
          if (!err) {
            generateConfirmationEmail(req, res, userdata);
          } else {
            // return next(err);
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
};



/**Generate confirmation email */
function generateConfirmationEmail(req, res, user) {
  var token = new TokenGenModel({ userId: user.userId, token: randomstring.generate() });
  // Save the verification token
  token.save(function (err) {
    if (err) { return res.status(500).send({ msg: err.message }); }

    // Send the email
    var transporter = nodemailer.createTransport(smtpTransport({ service: 'Gmail', auth: { user: "stomachcrew@gmail.com", pass: "ache@123" }, tls: { rejectUnauthorized: false } }));
    var options = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: path.join(__dirname, '../views/email/'),
        defaultLayout: 'template',
        partialsDir: path.join(__dirname, '../views/partials/'),
      },
      viewPath: path.join(__dirname, '../views/email/'),
      extName: '.hbs'
    };
    transporter.use('compile', hbs(options));

    var confirmationUrl = 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + token.token + '.\n'

    var mailOptions = {
      from: 'stomachcrew@gmail.com',
      to: user.emailId,
      subject: 'Account Verification Token',
      template: 'email_body',
      context: {
        variable1: confirmationUrl,
        host: req.headers.host,
        token: token.token,
        port: config.port,
        url: 'http://' + config.redirectUrl + '/#/confirmation/' + token.token
      },
      // html:`<h1>Welcome</h1><p>That was easy!</p>`,
    };


    transporter.sendMail(mailOptions, function (err) {
      if (err) { return res.status(500).send({ msg: err.message }); }
      res.status(200).send({ message: 'Registration Successful . A verification email has been sent to ' + user.emailId + '.' });
    });
  });
}

/**Confirmation of email */
exports.confirmationPost = (req, res) => {
  TokenGenModel.findOne({ token: req.params.token }, function (err, token) {
    if (!token) return res.status(400).send({ type: 'not-verified', message: 'We were unable to find a valid token. Your token my have expired.' });

    // If we found a token, find a matching user
    UserRegisterModel.findOne({ userId: token.userId }, function (err, user) {
      if (!user) return res.status(400).send({ message: 'We were unable to find a user for this token.' });
      if (user.isVerified) return res.status(400).send({ type: 'already-verified', message: 'This user has already been verified.' });

      // Verify and save the user
      user.isVerified = true;
      user.save(function (err) {
        if (err) { return res.status(500).send({ msg: err.message }); }
        let body = {
          success: true, message: "The account has been verified. Please log in."
        }
        res.status(200).send(body);
      });
    });
  });
};

/**User login route */

exports.loginuser = (req, res) => {
  console.log("login from hrms req.body",req.body);
  UserRegisterModel.findOneAndUpdate({ emailId: req.body.emailId }, {
    $set: { isActive: req.body.isActive }
  }, { new: true }, (error, userDoc) => {
    if (error) throw error;
    console.log("userDocuserDoc", userDoc);
    if (!userDoc) {
      return res.status(401).send({ success: false, message: 'Authentication failed. Wrong credentials' });
    }
    if (userDoc.isBlocked == true) {
      return res.status(401).send({ success: false, message: 'Your account is bloked. Please contact: ' + 'stomachcrew@gmail.com' });
    }
    if (userDoc.isDeleted == true) {
      return res.status(401).send({ success: false, message: 'Your account is deleted. Please contact: ' + 'stomachcrew@gmail.com' });
    }
    var dpassword = simpleCrypto.decrypt(userDoc.password);
    let isvalidPasswordWithoutHashed = req.body.password; // Its only for Old user

    if ((dpassword == req.body.password) || (isvalidPasswordWithoutHashed == userDoc.password)) {
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

}



exports.getUserbyId = (req, res, ) => {
  const userId = req.params.userId;
  UserRegisterModel.findOne({ companyId: userId}, function (err, data) {
    if (err) {
      console.log(err);
      return res.send(500, 'Something Went wrong with Retrieving data');
    }
    else {
      res.status(200).send(data);
    }
  });
};

exports.getAdminUsers = (req, res, ) => {
  UserRegisterModel.find({ isVerified: true, isAdmin: true }, function (err, data) {
    if (err) {
      console.log(err);
      return res.send(500, 'Something Went wrong with Retrieving data');
    }
    else {
      res.status(200).send(data);
    }
  });
};


exports.findLatestUsers = (req, res) => {
  UserRegisterModel.find({ isProfileImage: true }, function (error, result) {
    if (error) {
      res.status(500).send({
        message: "error while getting the users..!",
        error: error
      });
    } else {
      res.status(200).send({
        message: "data found...",
        data: result
      });
    }
  }).sort({ sysCreatedBy: -1 }).limit(4);
};

// get all like count
exports.getAllLikesCount = (req, res) => {
  likeModel.count().then((count) => {
    res.status(200).send({ Data: count });
  });
};

//get all users count
exports.getUserCount = (req, res, ) => {
  UserRegisterModel.count().then((count) => {
    res.status(200).send({ Data: count });
  });
};


/**
 * Post the likes
 */

exports.likePost = (req, res) => {
  // Check if id was passed provided in request body
  if (!req.body.memeId) {
    res.json({ success: false, message: 'No id was provided.' }); // Return error message
  } else {
    // Search the database with id
    memeModel.findOne({ MemeId: req.body.memeId }, (err, blog) => {
      // Check if error was encountered
      if (err) {
        res.json({ success: false, message: 'Invalid blog id' }); // Return error message
      } else {
        // Check if id matched the id of a blog post in the database
        if (!blog) {
          res.json({ success: false, message: 'That blog was not found.' }); // Return error message
        } else {
          // Get data from user that is signed in
          UserRegisterModel.findOne({ userId: req.body.userId }, (err, user) => {
            // Check if error was found
            if (err) {
              res.json({ success: false, message: 'Something went wrong.' }); // Return error message
            } else {
              // Check if id of user in session was found in the database
              if (!user) {
                res.json({ success: false, message: 'Could not authenticate user.' }); // Return error message
              } else {
                // Check if user who liked post is the same user that originally created the blog post
                //   if (user.userId === blog.OwnerId) {
                //     res.json({ success: false, messagse: 'Cannot like your own post.' }); // Return error message
                //   } else {
                // Check if the user who liked the post has already liked the blog post before
                if (blog.likedBy.includes(user.userId)) {
                  res.json({ success: false, message: 'You already liked this post.' }); // Return error message
                } else {
                  // Check if user who liked post has previously disliked a post
                  if (blog.dislikedBy.includes(user.userId)) {
                    blog.dislikes--; // Reduce the total number of dislikes
                    const arrayIndex = blog.dislikedBy.indexOf(user.userId); // Get the index of the userid in the array for removal
                    blog.dislikedBy.splice(arrayIndex, 1); // Remove user from array
                    blog.likes++; // Increment likes
                    blog.likedBy.push(user.userId); // Add userid to the array of likedBy array
                    // Save blog post data
                    blog.save((err) => {
                      // Check if error was found
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                        res.json({ success: true, message: 'Blog liked!' }); // Return success message
                      }
                    });
                  } else {
                    blog.likes++; // Incriment likes
                    blog.likedBy.push(user.userId); // Add liker's userid into array of likedBy
                    // Save blog post
                    blog.save((err) => {
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                        res.json({ success: true, message: 'Blog liked!' }); // Return success message
                      }
                    });
                  }
                }
                //   }
              }
            }
          });
        }
      }
    });
  }
}


// Dislike the post

exports.dislikePost = (req, res) => {
  // Check if id was provided inside the request body
  if (!req.body.memeId) {
    res.json({ success: false, message: 'No id was provided.' }); // Return error message
  } else {
    // Search database for blog post using the id
    memeModel.findOne({ MemeId: req.body.memeId }, (err, blog) => {
      // Check if error was found
      if (err) {
        res.json({ success: false, message: 'Invalid blog id' }); // Return error message
      } else {
        // Check if blog post with the id was found in the database
        if (!blog) {
          res.json({ success: false, message: 'That blog was not found.' }); // Return error message
        } else {
          // Get data of user who is logged in
          UserRegisterModel.findOne({ userId: req.body.userId }, (err, user) => {
            // Check if error was found
            if (err) {
              res.json({ success: false, message: 'Something went wrong.' }); // Return error message
            } else {
              // Check if user was found in the database
              if (!user) {
                res.json({ success: false, message: 'Could not authenticate user.' }); // Return error message
              } else {
                // Check if user who disliekd post is the same person who originated the blog post
                //   if (user.username === blog.createdBy) {
                //     res.json({ success: false, messagse: 'Cannot dislike your own post.' }); // Return error message
                //   } else {
                // Check if user who disliked post has already disliked it before
                if (blog.dislikedBy.includes(user.userId)) {
                  res.json({ success: false, message: 'You already disliked this post.' }); // Return error message
                } else {
                  // Check if user has previous disliked this post
                  if (blog.likedBy.includes(user.userId)) {
                    blog.likes--; // Decrease likes by one
                    const arrayIndex = blog.likedBy.indexOf(user.userId); // Check where userId is inside of the array
                    blog.likedBy.splice(arrayIndex, 1); // Remove userId from index
                    blog.dislikes++; // Increase dislikeds by one
                    blog.dislikedBy.push(user.userId); // Add userId to list of dislikers
                    // Save blog data
                    blog.save((err) => {
                      // Check if error was found
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                        res.json({ success: true, message: 'Blog disliked!' }); // Return success message
                      }
                    });
                  } else {
                    blog.dislikes++; // Increase likes by one
                    blog.dislikedBy.push(user.userId); // Add userId to list of likers
                    // Save blog data
                    blog.save((err) => {
                      // Check if error was found
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                        res.json({ success: true, message: 'Blog disliked!' }); // Return success message
                      }
                    });
                  }
                }
                //   }
              }
            }
          });
        }
      }
    });
  }
}

//To get all likes count

exports.getTotalLikesCount = (req, res) => {
  memeModel.aggregate(
    [
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likes" }
        }
      }
    ]
  ).exec(function (error, result) {
    if (error) return next(err)
      ;
    res.send(result)
  });
}



// Update a note identified by the noteId in the request
exports.updatename = (req, res) => {
  // Validate Request
  if (!req.body.name) {
    return res.status(400).send({
      message: "Name can not be empty"
    });
  }

  // Find note and update it with the request body
  UserRegisterModel.findOneAndUpdate({ userId: req.body.userId }, {
    $set: { name: req.body.name }
  }, { new: true })
    .then(data => {
      if (!data) {
        return res.status(404).send({
          message: "Name not found with id " + req.body.userId
        });
      }
      res.status(200).send({
        msg: "Updated",
        data: data
      });
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "Name not found with id " + req.body.userId
        });
      }
      return res.status(500).send({
        message: "Error updating name with id " + req.body.userId
      });
    });
};


//Update of the username

exports.updateuserName = (req, res) => {
  // res.send("test");
  // Validate Request
  if (!req.body.userName) {
    return res.status(400).send({
      message: "User Name can not be empty"
    });
  }

  // Find note and update it with the request body
  UserRegisterModel.findOneAndUpdate({ userId: req.body.userId }, {
    $set: { userName: req.body.userName }
  }, { new: true })
    .then(data => {
      if (!data) {
        return res.status(404).send({
          message: "Username not found with id " + req.body.userId
        });
      }
      res.status(200).send({
        msg: "Updated",
        data: data
      });
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "Username not found with id " + req.body.userId
        });
      }
      return res.status(500).send({
        message: "Error updating Username with id " + req.body.userId
      });
    });
};


// Find a single user with a userid
exports.findUser = (req, res) => {
  UserRegisterModel.find({ userId: req.body.userId })
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + req.body.userId
        });
      }
      res.status(200).send({
        msg: "Found the User",
        user: user
      });
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "User not found with id " + req.body.userId
        });
      }
      return res.status(500).send({
        message: "Error retrieving note with id " + req.body.userId
      });
    });
};



//get user memes by id
exports.getuserMemes = (req, res) => {
  memeModel.find({ OwnerId: req.body.Uid, isadminBlock: false }).sort({ CreatedOn: -1 })
    .then(meme => {
      if (!meme) {
        return res.status(404).send({
          message: "Memes not found with id " + req.body.Uid
        });
      }
      res.status(200).send({
        msg: "Found the Memes",
        meme: meme
      });
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "Memes not found with id " + req.body.Uid
        });
      }
      return res.status(500).send({
        message: "Error retrieving memes with id " + req.body.Uid
      });
    });
};


//Block by user 

exports.blockMeme = (req, res) => {
  // Check if id was passed provided in request body
  if (!req.body.memeId) {
    res.json({ success: false, message: 'No meme id was provided.' }); // Return error message
  } else {
    // Search the database with id
    memeModel.findOne({ MemeId: req.body.memeId }, (err, blog) => {
      // Check if error was encountered
      if (err) {
        res.json({ success: false, message: 'Invalid blog id' }); // Return error message
      } else {
        // Check if id matched the id of a blog post in the database
        if (!blog) {
          res.json({ success: false, message: 'That blog was not found.' }); // Return error message
        } else {
          // Get data from user that is signed in
          UserRegisterModel.findOne({ userId: req.body.userId }, (err, user) => {
            // Check if error was found
            if (err) {
              res.json({ success: false, message: 'Something went wrong.' }); // Return error message
            } else {
              // Check if id of user in session was found in the database
              if (!user) {
                res.json({ success: false, message: 'Could not authenticate user.' }); // Return error message
              } else {
                // Check if the user who liked the post has already liked the blog post before
                if (blog.blockedBy.includes(user.userId)) {
                  res.json({ success: false, message: 'You already blocked this meme.' }); // Return error message
                } else {
                  // Check if user who liked post has previously disliked a post
                  blog.blockedBy.push(user.userId); // Add userid to the array of blockedBy array
                  // Save blog post data
                  blog.save((err) => {
                    // Check if error was found
                    if (err) {
                      res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                    } else {
                      res.json({ success: true, message: 'Meme Blocked!' }); // Return success message
                    }
                  });
                }

              }
            }
          });
        }
      }
    });
  }
};

//Unblock by user 
exports.unblockMeme = (req, res) => {
  // Check if id was passed provided in request body
  if (!req.body.MemeId) {
    res.json({ success: false, message: 'No meme id was provided.' }); // Return error message
  } else {
    // Search the database with id
    memeModel.findOne({ MemeId: req.body.MemeId }, (err, blog) => {
      // Check if error was encountered
      if (err) {
        res.json({ success: false, message: 'Invalid blog id' }); // Return error message
      } else {
        // Check if id matched the id of a blog post in the database
        if (!blog) {
          res.json({ success: false, message: 'That blog was not found.' }); // Return error message
        } else {
          // Get data from user that is signed in
          UserRegisterModel.findOne({ userId: req.body.userId }, (err, user) => {
            // Check if error was found
            if (err) {
              res.json({ success: false, message: 'Something went wrong.' }); // Return error message
            } else {
              // Check if id of user in session was found in the database
              if (!user) {
                res.json({ success: false, message: 'Could not authenticate user.' }); // Return error message
              } else {


                const arrayIndex = blog.blockedBy.indexOf(user.userId); // Check where userId is inside of the array
                blog.blockedBy.splice(arrayIndex, 1); // Remove userId from index

                // Save blog data
                blog.save((err) => {
                  // Check if error was found
                  if (err) {
                    res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                  } else {
                    res.json({ success: true, message: 'Meme unblock!' }); // Return success message
                  }
                });

              }
            }
          });
        }
      }
    });
  }
};

//User Block meme lists

exports.userblockMeme = (req, res) => {
  memeModel.find({ blockedBy: req.body.userId })
    .then(blockedmeme => {
      if (!blockedmeme) {
        return res.status(404).send({
          message: "Memes not found with id " + req.body.userId
        });
      }
      res.status(200).send({
        msg: "Found the Memes",
        blockedmeme: blockedmeme
      });
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "Memes not found with id " + req.body.userId
        });
      }
      return res.status(500).send({
        message: "Error retrieving memes with id " + req.body.userId
      });
    });
}

//Report meme by user
exports.reportMeme = (req, res) => {
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
          UserRegisterModel.findOne({ userId: req.body.userId }, (err, user) => {
            // Check if error was found 
            if (err) {
              res.json({ success: false, message: 'Something went wrong.' }); // Return error message
            } else {
              // Check if id of user in session was found in the database
              if (!user) {
                res.json({ success: false, message: 'Could not authenticate user.' }); // Return error message
              } else {
                // Check if the user who liked the post has already liked the blog post before

                let model = {
                  reasonToReportMeme: req.body.reasonToReportMeme,
                  MemeId: req.body.MemeId,
                  UserId: req.body.userId,
                  Username: req.body.Username,
                  isadminBlock: false
                };
                memeModel.updateOne({ MemeId: req.body.MemeId }, { "$push": { reportedBy: { "$each": [model] } }, $inc: { reportedCount: +1 } }, function (err, data) {
                  //console.log(data);
                  if (!err) {
                    res.status(200).send({ result: data, message: "update report" })
                  }
                });
              }
            }
          });
        }
      }
    });
  }
};

//Report meme by user
exports.unreportMeme = (req, res) => {
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
          UserRegisterModel.findOne({ userId: req.body.userId }, (err, user) => {
            // Check if error was found 
            if (err) {
              res.json({ success: false, message: 'Something went wrong.' }); // Return error message
            } else {
              // Check if id of user in session was found in the database
              if (!user) {
                res.json({ success: false, message: 'Could not authenticate user.' }); // Return error message
              } else {
                // Check if the user who liked the post has already liked the blog post before
                memeModel.update({ MemeId: req.body.MemeId }, { "$pull": { reportedBy: { UserId: req.body.userId } }, $inc: { reportedCount: -1 } }, { multi: true }, function (err, data) {

                  if (!err) {
                    res.status(200).send({ result: data, message: "Unreport meme" })
                  }
                  if (err) {
                    console.log(err);
                  }
                });
              }
            }
          });
        }
      }
    });
  }
};


exports.getRecentlyRegisteredUserCount = (req, res) => {

  const weekAgo = new Date().getDate() - 7;
  const weekAgoDate = new Date();
  weekAgoDate.setDate(weekAgo);

  console.log('week ago date: '+weekAgoDate.getTime(), new Date(weekAgoDate.getTime()));

  UserRegisterModel.count({ sysCreatedDate: { $gt: weekAgoDate.getTime() }, }, function (error, count) {
    if (error) {
      res.status(500).send({
        message: "error while getting the users..!",
        error: error
      });
    } else {
      res.status(200).send({
        message: "data found...",
        data: count
      });
    }
  });
};

exports.getActiveLoginUserCount = (req, res) => {

  UserRegisterModel.count({ isActive: true }, function (error, count) {
    if (error) {
      res.status(500).send({
        message: "error while getting the users..!",
        error: error
      });
    } else {
      res.status(200).send({
        message: "data found...",
        data: count
      });
    }
  });
};