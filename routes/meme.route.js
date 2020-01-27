var express = require('express');
var userModel = require('../models/userregister.model');
const uniqid = require('uniqid');
const memeModel = require('../models/meme.model');
const commentModel = require('../models/comment.model');
const followingModel = require('../models/followiing.model');
const followerModel = require('../models/followers.model');
const validateToken = require('../config/auth-token');

const likeModel = require('../models/like.model');

var router = express.Router();
const _ = require('underscore')._;
var concatList=[];
const  concatList1=[];


//get all posted meme
router.get('/getMemes', (req, res) => {
    memeModel.find({isadminBlock:false}, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get all memes" });
        }
    }).sort({ CreatedOn: -1 });
});

//get all posted meme
router.post('/saveMeme', (req, res) => {
    let uniqId = uniqid();
    var userInfo;
    if (!req.body) {
        return res.status(400).send("Request body is misssing");
    }
    userModel.find({ userId: req.body.OwnerId }, function (err, userinfo) {
        if (err) {
            console.log(err, "err");
        } else {
            userInfo = userinfo[0];
            let model = memeModel({
                IsLike: req.body.IsLike,
                IsShares: req.body.IsShares,
                OwnerName: req.body.OwnerName,
                OwnerId: req.body.OwnerId,
                MemeId: uniqId,
                Meme: req.body.MemeData,
                Title: req.body.Title,
                selectCat: req.body.selectCat,
                Category: req.body.dropDownCategory,
                postTypes: req.body.postTypes
            });
            model.save().then(doc => {
                if (!doc || doc.length === 0) {
                    return res.status(500).send({ result: doc, message: "meme added 500" });
                }
                res.status(200).send({ result: doc, message: "meme posted successfully" });
            }).catch(error => {
                res.status(500).send({ error: error, message: "error while adding meme" });
            })
        }
    })

});


router.post('/savelike', validateToken, (req, res) => {
    if (!req.body) {
        return res.status(400).send("Request body is misssing");
    }
    let model = likeModel({
        MemeId: req.body.MemeId,
        IsLike: req.body.IsLike,
        UserName: req.body.UserName,
        likedById: req.body.likedById,

    });

    memeModel.updateOne({ MemeId: req.body.MemeId }, { $push: { Likes: model } }, function (err, data) {
        if (!err) {
            this.updatelikeCount(true, req.body.MemeId);
            res.status(200).send({ result: data, message: "update like" })
        }
    })

});


router.post('/saveunlike', validateToken, (req, res) => {
    if (!req.body) {
        return res.status(400).send("Request body is misssing");
    }

    memeModel.updateOne({ MemeId: req.body.MemeId,isadminBlock:false }, { $pull: { Likes: { likedById: req.body.likedById } } }, function (err, data) {
        if (!err) {
            this.updatelikeCount(false, req.body.MemeId);;
            res.status(200).send({ result: data, message: "update unlike" })
        }
    })
});


router.post('/comment', validateToken, (req, res) => {
    let uIdkk = uniqid();
    let model = commentModel({
        Comment: req.body.Comment,
        MemeId: req.body.MemeId,
        UserId: req.body.UserId,
        Username: req.body.Username,
        CommentId: uIdkk,
        gender: req.body.gender
    });

    memeModel.updateOne({ MemeId: req.body.MemeId ,isadminBlock:false}, { "$push": { comments: { "$each": [model], "$position": 0 } } }, function (err, data) {
        if (!err) {
            res.status(200).send({ result: data, message: "update comment" })
        }
    })
});

router.post('/following', validateToken, (req, res) => {
    try {
        let model = followingModel({
            Uid: req.body.loggedinuser,
            loggedinUsername: req.body.loggedinusername,
            Following: req.body.followingid,
            followingUsername: req.body.followingUsername,
            gender: req.body.followingGender,
            isProfileImage: req.body.followingProfile,

        })
        model.save((err, userdata) => {
            if (!err) {
                saveFollowers(userdata);
            }
        });

    }
    catch (e) {
        log.error('Route failed with error', e);
        res.status(500).send(e);
    }
    function saveFollowers(user) {
        let followermodel = followerModel({
            userId: user.Following,
            userName: user.followingUsername,
            followerId: user.Uid,
            followeruserName: user.loggedinUsername,
            gender: req.body.loggedInUsergender,
        })
        followermodel.save().then(() => {
            res.status(200).send({ following: user, message: "you following" })
        });
    }

});

router.post('/getfollowingById', validateToken, (req, res) => {
    followingModel.find({ Uid: req.body.userid }, (err, data) => {
        if (!err) {
            res.status(200).send({ result: data });
        }
    })
});

router.get('/latestMemes', validateToken, (req, res) => {
    memeModel.find({ type: "meme",isadminBlock:false }, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get all memes" });
        }
    }).sort({ CreatedOn: -1 }).limit(6);
});

router.get('/latestMemesHomes', (req, res) => {
    memeModel.find({isadminBlock:false}, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get all memes" });
        }
    }).sort({ CreatedOn: -1 }).limit(8);
});

router.post('/getALLFollowing', validateToken, (req, res) => {
    followingModel.find({ Uid: req.body.Uid }, (err, data) => {
        if (!err) {
            if (data == null || data == [] || data == "") {
                memeModel.find({
                    $and: [
                        {
                            $and: [
                                { blockedBy: { $ne: req.body.Uid } },
                                { OwnerId: req.body.Uid }
                            ]
                        }, {
                            "isadminBlock": { $eq: false },"ispaidpost": { $eq: false } 
                        }
                    ]
                }).sort({ CreatedOn: -1 }).then(mdata => {
                    res.status(200).send({ Following: mdata });
                })
            } else {
                memeModel.find({
                    $and: [{ blockedBy: { $ne: req.body.Uid } }, { "isadminBlock": { $eq: false },"ispaidpost": { $eq: false } }]
                }).sort({ CreatedOn: -1 }).then(mdata => {
                    let result = mdata.filter(o1 => data.some(o2 => o2.Following === o1.OwnerId || o1.OwnerId === req.body.Uid));
                    res.status(200).send({ Following: result });
                })
            }
        }
    })
});

router.get('/getnewmeme', validateToken, (req, res) => {
    memeModel.find({isadminBlock:false}, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get all memes" });
        }
    }).sort({ CreatedOn: -1 });
});

router.post('/getFollpwersCount', validateToken, (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "request body not exits" });
    }

    followerModel.find({ userId: req.body.userId }).then(data => {
        res.status(200).send({ Follower: data, message: "get all followers success" });
    }).catch(err => {
        res.status(400).send({ Error: err, message: "Error while getting all followers" });
    });
});

router.post('/deleteMeme', validateToken, (req, res) => {
    console.log(req.body.memeId);
    memeModel.deleteOne({ MemeId: req.body.memeId,isadminBlock:false }, function (err, results) {
        if (err) throw err;
        res.status(200).send({ message: "1 Meme deleted" });
    });
});

//get all posted meme count
router.get('/getMemesCount', (req, res) => {
    memeModel.count().then((count) => {
        res.status(200).send({ Data: count });
    });
});

//Get latest meme for user
router.post('/userLatestMeme', validateToken, (req, res) => {
    memeModel.find({ type: req.body.type, OwnerId: req.body.OwnerId ,isadminBlock:false}, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get latest user memes" });
        }
    }).sort({ CreatedOn: -1 }).limit(6);
});

//Get user photos
router.post('/userPhotos', validateToken, (req, res) => {
    memeModel.find({ type: req.body.type, OwnerId: req.body.OwnerId,isadminBlock:false }, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get user photos" });
        }
    }).sort({ CreatedOn: -1 });
});

//To make user unfollow
router.post('/unFollow', validateToken, (req, res) => {
    followingModel.deleteOne({ "_id": req.body._id }, (error, result) => {
        if (!error) {
            followerModel.deleteOne({ userId: req.body.Following, followerId: req.body.Uid }, (error, result) => {
                if (!error) {
                    res.status(200).send({ message: "you unfollowed user" })
                }
            })
        }
    })
});

//getMemeDetails
router.post('/getMemedetail', (req, res) => {
    memeModel.find({ MemeId: req.body.id,isadminBlock:false }, (err, data) => {
        if (!err) {
            res.status(200).send({ result: data })
        }
    });
});

//Group related posts
router.post('/getMemesByGroupId', (req, res) => {
    memeModel.find({ groupId: req.body.groupId ,isadminBlock:false}, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get all posts in group" });
        }
    }).sort({ CreatedOn: -1 });
});


//Get latest Photo of User
router.post('/userLatestPhoto', validateToken, (req, res) => {
    memeModel.find({ type: req.body.type, OwnerId: req.body.OwnerId,isadminBlock:false }, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get latest user memes" });
        }
    }).sort({ CreatedOn: -1 }).limit(6);
});

//To get members 
router.post('/getMembers',validateToken, (req, res) => {
    let data1 = [];
    let mdata1 = [];
    followerModel.find({ userId: req.body.Uid,isadminBlock:false }, (err, mdata) => {
        if (!err) {
            followingModel.find({ Uid: req.body.Uid,isadminBlock:false }).then(data => {
                for (index in mdata) {
                    mdata1.push({
                        "memebername": mdata[index]["followeruserName"], "memeberid": mdata[index]["followerId"],
                        "memebergender": mdata[index]["gender"], "memeberprofile": mdata[index]["isProfileImage"]
                    })
                }

                var index1;
                for (index1 in data) {
                    data1.push({
                        "memebername": data[index1]["followingUsername"], "memeberid": data[index1]["Following"],
                        "memebergender": data[index1]["gender"], "memeberprofile": data[index1]["isProfileImage"]
                    })
                }
                concatList = data1.concat(mdata1)
                let concatList1 = _.uniq(concatList, 'memeberid');
                res.status(200).send({ Data: concatList1, message: "removed duplicate" });
            });
        }
    });
});

//Followers list of followers
router.post('/getfollowingByIdFrnd', validateToken, (req, res) => {
    followingModel.find({ Uid: req.body.userid}, (err, data) => {
        if (!err) {
            res.status(200).send({ result: data });
        }
    })
});

//Follower friends list for his followers
router.post('/getFollpwersCountfrs', validateToken, (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "request body not exits" });
    }

    followerModel.find({ userId: req.body.userId}).then(data => {
        res.status(200).send({ Follower: data, message: "get all followers success" });
    }).catch(err => {
        res.status(400).send({ Error: err, message: "Error while getting all followers" });
    });
});

router.post('/getuserMemefrnds',validateToken, (req,res)=>{
    memeModel.find({OwnerId: req.body.Uid}, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get all memes of follwers" });
        }
    }).sort({ CreatedOn: -1 });
});


//Get user photos
router.post('/userPhotosbyFollow', validateToken, (req, res) => {
    memeModel.find({ type: req.body.type, OwnerId: req.body.followersId,isadminBlock:false }, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get user photos" });
        }
    }).sort({ CreatedOn: -1 });
});

router.post('/latestMemesfrnd', validateToken, (req, res) => {
    memeModel.find({OwnerId: req.body.followersId, type: "meme",isadminBlock:false }, function (err, result) {
        if (err) {
            res.status(400).send({
                error: err, message: "error while getting memes"
            });
        }
        if (result) {
            res.status(200).send({ Data: result, message: "get all memes" });
        }
    }).sort({ CreatedOn: -1 }).limit(6);
});



//get all news ffed
router.get('/getnewsfeed', (req, res) => {
  
   memeModel.find({isadminBlock:false,ispaidpost:false}, function (err, result) {
       if (err) {
           res.status(400).send({
               error: err, message: "error while getting memes"
           });
       }
       if (result) {
           res.status(200).send({ Data: result, message: "get all memes" });
       }
   }).sort({ CreatedOn: -1 });
});

//get all news ffed
router.get('/getnewsfeedpaid', (req, res) => {
  
   memeModel.find({isadminBlock:false,ispaidpost:true}, function (err, result) {
       if (err) {
           res.status(400).send({
               error: err, message: "error while getting memes"
           });
       }
       if (result) {
           res.status(200).send({ Data: result, message: "get all memes" });
       }
   }).sort({ CreatedOn: -1 });
});


//To block post 
router.post('/isblockPost', function (req, res) {
   
    memeModel.findOneAndUpdate({ MemeId: req.body.MemeId }, { $set: { isadminBlock: req.body.isadminBlock } }, { new: true }, (error, memeDta) => {
      if (error) throw error;
      return res.status(200).send({ userDoc: memeDta, message: 'Post blocked successfully' });
    });
  });

  
//To block post 
router.post('/isunblockPost', function (req, res) {
   
    memeModel.findOneAndUpdate({ MemeId: req.body.MemeId }, { $set: { isadminBlock: req.body.isadminBlock } }, { new: true }, (error, memeDta) => {
      if (error) throw error;
      return res.status(200).send({ userDoc: memeDta, message: 'Post unblocked successfully' });
    });
  });
  
module.exports = router;
