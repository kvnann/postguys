var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');


const _data = require("../lib/data");
const config = require("../lib/config");
const helpers = require("../lib/helpers");
const auth = require("../middleware/auth");

const cors = require("cors");
const e = require('express');
const Api = require('twilio/lib/rest/Api');
var whitelist = ['https://main.d2vq9ezjhsp9ls.amplifyapp.com', 'http://localhost:3000']
const corsOptions ={
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            if (whitelist.indexOf(origin) !== -1) {
              callback(null, true)
            } else {
              callback(new Error('Not allowed by CORS'))
            }
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
    credentials:true,
    optionSuccessStatus:200
}

router.use(cors(corsOptions));

const funcs = {}

funcs.feedUpdate = (users,postId,callback) =>{
    if(users && users.length>0 && postId){
        users.forEach(user => {
            _data.readIdWithPass('users',user,(err,userData)=>{
                if(!err && userData){
                    userData.feed.splice(0,0,postId);
                    _data.updateId('users',user,userData,(err)=>{
                        if(err){
                            console.log({"Error":"Couldn't update user, skipping it."});
                        }else{
                            callback(false);
                        }
                    });
                }   
                else{
                    console.log({"Error":"Couldn't find user, skipping it."});
                }
            });
        });
    }
    else{
        callback(false);
    }
}

router.post('/create',auth, (req,res)=>{
    let postId = Math.floor(Math.random()*1000000000+1);
    let userId = typeof(req.user.user_id) == 'number' && req.user.user_id > 0 ? req.user.user_id: false;
    let postText = typeof(req.body.postText) == 'string' && req.body.postText.trim().length > 0 ? req.body.postText.trim() : false;
    let fullPublishDate = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let publishDateString = `${fullPublishDate.getDate()} ${months[fullPublishDate.getMonth()]}, ${fullPublishDate.getFullYear()}`
    
    if(userId && postText){
        _data.readIdWithPass('users',userId,(err,user)=>{
            if(!err){
                let userBlocked = typeof(user.block) == 'boolean' ? user.block : false;
                if(!userBlocked){
                    let postname = `post_${user.username}_${postId}`; 
                    _data.create('posts',{
                        _id:postId,
                        fileName:postname,
                        user:user,
                        text:postText,
                        publishDateString:publishDateString,
                        fullPublishDate:fullPublishDate,
                        likes:[],
                        shares:[]
                    },(err)=>{
                        if(!err){
                            user.posts.push(postId);
                            user.postCount = user.posts.length;
                            user.feed.splice(0,0,postId);
                            funcs.feedUpdate(user.followers,postId,(err)=>{
                                if(err) console.log(err);
                                console.log(user)
                                _data.updateId('users',userId,user,(err)=>{
                                    if(!err){ 
                                        res.status(200).send({
                                            message:"Post Uploaded Successfully!"
                                        });
                                    }
                                    else{
                                        res.status(500).send({
                                            error:err
                                        });
                                    }
                                });
                            });
                        }
                        else{
                            res.status(500).send({
                                error:"Couldn't create post, please try again later :("
                            });
                        }
                    });
                }
                else{
                    res.status(403).send({
                        error:"Your account is blocked!"
                    });
                }
            }
            else{
                res.status(400).send({
                    error:"Couldn't find a user with this ID, please try again" 
                });
            }
        });
    }
    else{
        res.status(400).send({
            error:"Please make a valid post text"
        });
    }

});

router.post('/update', auth, (req,res)=>{
    let postId = typeof(req.body.postId) == 'number' && req.body.postId > 0 ? req.body.postId: false;
    let postText = typeof(req.body.postText) == 'string' && req.body.postText.trim().length > 0 ? req.body.postText : false;
    if(postId){
        _data.readId('posts',postId,(err,postData)=>{
            if(!err){
                let userId = typeof(postData.user._id) == 'number' && postData.user._id > 0 ? postData.user._id: false;
                _data.readId('users',userId,(err,userData)=>{
                    if(!err){
                        if(userData.posts.indexOf(postId)>-1){
                            let userBlocked = typeof(userData.block) == 'boolean' ? userData.block : false;
                            if(!userBlocked){
                                let postname = postData.fileName; 
                                _data.updateId('posts', postId ,{
                                    _id:postId,
                                    fileName:postname,
                                    user:userData,
                                    text:postText,
                                    publishDateString:postData.publishDateString,
                                    fullPublishDate:postData.fullPublishDate,
                                    likes:postData.likes,
                                    updated:new Date()
                                },(err)=>{
                                    if(!err){
                                        res.status(200).send({
                                            message:"Post Updated Successfully!"
                                        });
                                    }
                                    else{
                                        res.status(500).send({
                                            error:"Couldn't create post, please try again later :("
                                        });
                                    }
                                });
                            }
                            else{
                                res.status(403).send({
                                    error:"Your account is blocked!"
                                });
                            }
                        }
                        else{
                            res.status(500).send({
                                error:"Couldn't find post among user's posts :("
                            });
                        }
                    }
                    else{
                        res.status(500).send({
                            error:"Couldn't find user :("
                        });
                    }
                });
            }
            else{
                res.status(400).send({
                    error:"Couldn't find post :("
                });
            }
        });
    }
    else{
        res.status(400).send({
            error:"Invalid post!"
        });
    }
});


router.post('/delete',  (req,res)=>{
    let postId = typeof(req.body.postId) == 'number' && req.body.postId > 0 ? req.body.postId: false;
    if(postId){
        _data.readId('posts',postId,(err,postData)=>{
            if(!err){
                var userId = postData.user._id;
                _data.readIdWithPass('users',userId,(err,userData)=>{
                    if(!err){
                        if(userData.posts.indexOf(postId)>-1){
                            _data.deleteId('posts',postId,(err)=>{
                                if(!err){
                                    userData.posts.splice(userData.posts.indexOf(postId),1);
                                    userData.postCount = userData.posts.length;
                                    _data.updateId('users',userId,userData,(err)=>{
                                        if(!err){
                                            postData.likes.forEach(likeduser => {
                                                _data.readIdWithPass('users',likeduser,(err,likeduserData)=>{
                                                    if(!err && likeduserData){
                                                        let postIndexOf = likeduserData.liked.indexOf(postId);
                                                        likeduserData.liked.splice(postIndexOf,1);
                                                        _data.update('users',likeduser,likeduserData,(err)=>{
                                                            if(err){
                                                                console.log("Coultn't update user, skipping it.");
                                                            }
                                                        });
                                                    }
                                                    else{
                                                        console.log("Couldn't update user, skipping it :(");
                                                    }
                                                })
                                            });
                                            res.status(200).send({
                                                message:"Post Deleted Successfully!"
                                            });
                                        }
                                        else{
                                            res.status(500).send({
                                                error:err
                                            });
                                        }
                                    });
                                }
                                else{
                                    res.status(500).send({
                                        error:"Couldn't delete post :("
                                    });  
                                }
                            });
                        }
                        else{
                            res.status(500).send({
                                error:"Couldn't find post among user's posts :("
                            });
                        }
                    }
                    else{
                        res.status(500).send({
                            error:"Couldn't find user :("
                        });
                    }
                });
            }
            else{
                res.status(400).send({
                    error:"Couldn't find post :("
                });
            }
        });
    }
    else{
        res.status(400).send({
            error:"Invalid post!"
        });
    }
});

router.post('/get_posts' , auth, (req,res)=>{
    var keys = req.body.keys;
    _data.listById('posts',keys,(err,data)=>{
        if(!err){
            res.status(200).send(data);
        }
        else{
            res.status(500).send({
                error:"Couldn't load this post :("
            });
        }
    })

});


router.post('/like',auth,(req,res)=>{
    const likedBy = req.body.likedBy;
    const owner = req.body.owner;
    const postId = req.body.postId;

    if(likedBy && owner && postId){

        _data.readId('posts',postId,(err,postData)=>{
            if(!err && postData){
                if(postData.likes.indexOf(likedBy)>-1){
                    res.status(300).send({
                        message:"Ne qeder like eliyessen aq"
                    });
                }
                else{
                    postData.likes.push(likedBy);
                    _data.readIdWithPass("users",likedBy,(err,likedByData)=>{
                        if(!err && likedByData){
                            likedByData.liked.push(postData._id);
                            _data.updateId("users",likedBy,likedByData,(err)=>{
                                if(!err){
                                    _data.readIdWithPass("users",owner,(err,ownerData)=>{
                                        if(!err && ownerData){
                                            const notification = {
                                                _id:`${Math.floor(Math.random()*1000000000+1)}`,
                                                type:'like',
                                                postId:postId,
                                                likedBy:likedByData,
                                                owner:{
                                                    username:ownerData.username,
                                                    _id:ownerData._id,
                                                    ppimage:ownerData.ppimage
                                                },
                                                read:false
                                            }
                                            ownerData.likeCount += 1;
                                            ownerData.notifications.splice(0,0,notification);
                                            _data.updateId("users",owner,ownerData,(err)=>{
                                                if(!err){
                                                    _data.updateId('posts',postData._id,postData,(err)=>{
                                                        if(!err){
                                                            res.status(200).send({
                                                                message:"Post liked :D"
                                                            });
                                                        }
                                                        else{
                                                            res.status(500).send({
                                                                error:"Couldn't update post :("
                                                            });
                                                        }
                                                    });
                    
                                                }
                                                else{
                                                    res.status(500).send({
                                                        error:"Couldn't update owner of the post :("
                                                    });
                                                }
                                            });
                
                                        }
                                        else{
                                            res.status(500).send({
                                                error:"Coultn't find owner of post to update"
                                            });
                                        }
                                    });


                                }
                                else{
                                    res.status(500).send({
                                        error:"Couldn't update you, r u hacker ???"
                                    });
                                }
                            });

                        }
                        else{
                            res.status(500).send({
                                error:"Coultn't find you to update, are you a fking hacker???"
                            });
                        }
                    });

                }
            }
            else{
                res.status(500).send({
                    error:"Couldn't find post :("
                });
            }
        });
    }
    else{
        res.status(400).send({
            error:"Missed required fields :("
        });
    }

});

router.post('/unlike',auth,(req,res)=>{
    const unlikedBy = req.body.unlikedBy;
    const owner = req.body.owner;
    const postId = req.body.postId;

    if(unlikedBy && owner && postId){
        _data.readId('posts',postId,(err,postData)=>{
            if(!err && postData){
                if(postData.likes.indexOf(unlikedBy)>-1){
                    let indexOfUnlikedby = postData.likes.indexOf(unlikedBy)
                    postData.likes.splice(indexOfUnlikedby,1);
                    _data.readIdWithPass("users",owner,(err,ownerData)=>{
                        if(!err && ownerData){
                            ownerData.likeCount -= 1;
                            _data.updateId("users",owner,ownerData,(err)=>{
                                if(!err){
                                    _data.readIdWithPass("users",unlikedBy,(err,unlikedByData)=>{
                                        if(!err && unlikedByData){
                                            let likedPostIndex = unlikedByData.liked.indexOf(postData._id);
                                            unlikedByData.liked.splice(likedPostIndex,1);
                                            _data.updateId("users",unlikedBy,unlikedByData,(err)=>{
                                                if(!err){
                                                    _data.updateId('posts',postData._id,postData,(err)=>{
                                                        if(!err){
                                                            res.status(200).send({
                                                                message:"Post unliked :("
                                                            });
                                                        }
                                                        else{
                                                            res.status(500).send({
                                                                error:"Couldn't update post :("
                                                            });
                                                        }
                                                    })

                                                }
                                                else{
                                                    res.status(500).send({
                                                        error:"Couldn't update you, r u hacker ???"
                                                    });
                                                }
                                            }); 

                                        }
                                        else{
                                            res.status(500).send({
                                                error:"Coultn't find you to update, are you a fking hacker???"
                                            });
                                        }
                                    });

                                }
                                else{
                                    res.status(500).send({
                                        error:"Couldn't update owner of the post :("
                                    });
                                }
                            });

                        }
                        else{
                            res.status(500).send({
                                error:"Coultn't find owner of post to update"
                            });
                        }
                    });
                }
                else{
                    res.status(300).send({
                        message:"Ne qeder like eliyessen aq"
                    });
                }
            }
            else{
                res.status(500).send({
                    error:"Couldn't find post :("
                });
            }
        });
    }
    else{
        res.status(400).send({
            error:"Missed required fields :("
        });
    }

});

router.post("/send",auth,(req,res)=>{
    const from = req.body.from;
    const to = req.body.to;
    const postId = req.body.postId;

    if(from && to && postId){
        _data.readId('posts',postId,(err,postData)=>{
        if(!err && postData){

            _data.readIdWithPass("users",to,(err,toUser)=>{
                if(!err && toUser){
                    _data.readId('users',from,(err,fromData)=>{
                        if(!err && fromData){
                            _data.readIdWithPass("users",postData.user._id,(err,ownerData)=>{
                                if(!err && ownerData){
                                    if(!postData.shares.indexOf(from)>-1){
                                        ownerData.shareCount += 1;
                                        postData.shares.push(from);
                                    }
                                    _data.updateId('users',postData.user._id,ownerData,(err)=>{
                                        if(!err){
                                            const notification = {
                                                _id:`${Math.floor(Math.random()*1000000+1)}n${Math.floor(Math.random()*1000000+1)}`,
                                                type:'post',
                                                postId:postId,
                                                from:fromData,
                                                owner:postData.user,
                                                read:false
                                            }
                                            toUser.notifications.slice(0,0,notification);
                                            _data.updateId('users',to,toUser,(err)=>{
                                                if(!err){
                                                    res.status(200).send(
                                                        {message:"Post sent successfully!"}
                                                    );
                                                }
                                                else{
                                                    res.status(500).send({
                                                        error:"Error occured while sending post to the user :( Please try again later"
                                                    });
                                                }
                                            });
                                        }
                                        else{
                                            res.status(500).send({
                                                error:"Error occured while sending post to the user :( Please try again later"
                                            });
                                        }
                                    });
                                }
                                else{
                                    res.status(500).send({
                                        error:"Coultn't find owner of the post :("
                                    });
                                }
                            });
                        }
                        else{
                            res.status(500).send({
                                error:"Error occured while sending post to the user (couldn't find u) :( Please try again later"
                            }); 
                        }
                    })

                }
                else{
                    res.status(500).send({
                        message:"Couldn't find user to send :("
                    });
                }
            });
        }
        else{
            res.status(500).send({"Error":"Post not found :("});
        }
        });
    }
    else{
        res.status(400).send({
            error:"Missed required fields :("
        });
    }
});





module.exports = router;