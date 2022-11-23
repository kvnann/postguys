var express = require('express')
var router = express.Router()

const fs = require('fs');
const multer = require("multer");
const upload = multer({ dest: "./uploads/" });

var jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const _data = require("../lib/data");
const config = require("../lib/config");
const helpers = require("../lib/helpers");
const auth = require("../middleware/auth");
var post = require("./post");

const cors = require("cors");
var whitelist = ['https://postguys-demo.herokuapp.com', 'http://localhost:3000']
const corsOptions ={
    origin: function (origin, callback) {
          callback(null, true);
      },
    credentials:true,
    optionSuccessStatus:200
}

router.use((req,res,next)=>{
    next();
});


router.use('/post',post);


const baseUrl = config.baseUrl;

router.use(cors(corsOptions));
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.static('./uploads'));

router.post('/login',cors(), (req,res)=>{
    let { username, password } = req.body;
    username = typeof(username) == 'string' && username.trim().length > 0? username : false;
    password = typeof(password) == 'string' && password.trim().length >= 8? password : false;
    if(username && password){
        _data.read('users',username,(err,userdata)=>{
            if(!err){
                if(helpers.hash(password) === userdata.password){
                    let token = jwt.sign(
                        { user_id: userdata._id, username },
                        config.tokenkey,
                        {
                          expiresIn: "2h",
                        }
                    );
                    userdata.token = token
                    _data.update("users",userdata.username,userdata,(err,newuserdata)=>{
                        if(!err){
                            res.status(200).send({user:newuserdata});
                        }
                        else{
                            res.status(403).send({
                                error: "Sorry, we can't sign you in :("
                             });
                        }
                    });
                }   
                else{
                    res.status(403).send({
                        error: 'Wrong password or username'
                     });
                }
            }
            else{
                res.status(500).send({
                    error: 'Some error occured, please try again :('
                 });
            }
        });
    }
    else{
        res.status(400).send({
            error: 'Wrong use of password or username'
        });
    }
});

 router.post("/upload_files", upload.single("image"), (req,res)=>{
    try{
        let filetype = req.file.mimetype.split('/')[1];
        const date = new Date();
        let newfilename =  'user_'+req.body.username + '_' + date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + '_' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds() +'.'+ filetype
        fs.rename('./uploads/'+req.file.filename,'./uploads/'+newfilename,(err)=>{
            if(err){
                res.status(500).send({
                    error:"Couldn't uplead image :("
                 });
            }
            else{
                res.status(200).send({
                    imagename:newfilename
                 });
            }
        });
    }
    catch(e){
        res.status(400).send({
            "Error":"Couldn't upload image :("
         });
    }
});

router.post('/register',cors(),(req,res)=>{
    let { username, password } = req.body;
    const date = new Date();
    const imagename = req.body.imagename ? req.body.imagename : 'default.png';
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    username = typeof(username) == 'string' && username.trim().length > 0? username : false;
    password = typeof(password) == 'string' && password.trim().length >= 8? password : false;
    if(username && password){
        _data.create('users',{
            _id:Math.floor(Math.random()*1000000000+1),
            fileName:username,
            username:username,
            password:helpers.hash(password),
            ppimage:baseUrl + '/uploads/'+imagename,
            joinDate:`${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`,
            joinDateFull:date,
            likeCount:0,
            shareCount:0,
            posts:[],
            postCount:0,
            liked:[],
            notifications:[],
            feed:[],
            followers:[],
            follow:[],
            requests:[]
        },(err,userdata)=>{
            if(err){
                res.status(500).send({
                    error: "Couldn't register you, account with this username may exist :("
                 });
            }
            else{
                res.status(200).send({
                    message: 'User Created!'
                });
            }
        });
    }
    else{
        res.status(400).send({
            error: 'Wrong use of username or password. Please make valid ones!'
        });
    }
}); 

router.post('/edit_user',auth,(req,res)=>{
    let username = req.body.username;
    let userId = req.user.user_id
    let date = new Date();
    let imagename = req.body.imagename ? req.body.imagename : false;
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    username = typeof(username) == 'string' && username.trim().length > 0? username : false;
    if(username  && userId){
        _data.readIdWithPass('users',userId,(err,userData)=>{
            if(!err && userData){
                var oldUserData = JSON.parse(JSON.stringify(userData));
                userData.edited = {
                    data:new Date(),
                    oldUsername:oldUserData.username,
                    oldUsername:oldUserData.ppimage
                };
                userData.fileName = username;
                userData.username = username;
                userData.ppimage = imagename? imagename : userData.ppimage;
                _data.updateId('users',userId,userData,(err)=>{
                    if(err){
                        res.status(500).send({
                            error: "Couldn't edit user :("
                         });
                    }
                    else{
                        delete userData.password
                        userData.posts.forEach(userPostId => {
                            _data.readId('posts',userPostId,(err,postData)=>{
                                if(!err && postData){
                                    postData.user = userData;
                                    _data.updateId('posts',userPostId,postData,(err)=>{
                                        if(err){
                                            console.log(`Couldn't update one post to edit, skipping it. ${userPostId}`);
                                        }
                                        else{
                                            res.status(200).send({
                                                message: 'User Edited!'
                                            });
                                        }
                                    });
                                }
                                else{
                                    console.log(`Couldn't read one post to edit, skipping it. ${userPostId}`);
                                }
                            });
                        });
                    }
                });
            }
            else{
                res.status(500).send({
                    error:"Couldn't find user, please try again later"
                });
            }
        });
    }
    else{
        res.status(400).send({
            error: 'Wrong use of username or password. Please make valid ones!'
        });
    }
}); 

router.post('/getuser',auth,(req,res)=>{
    const username = req.user.username
    const user_id = req.user.user_id
    _data.readId('users',user_id,(err,userData)=>{
        if(!err){
            res.status(200).send({
                user: userData
             });
        }
        else{
            res.status(403).send({
                error: "Couldn't verify you :("
             });
        }
    });
});

router.post('/getuserid',auth,(req,res)=>{
    const user_id = req.body.userId
    _data.readId('users',user_id,(err,userData)=>{
        if(!err){
            res.status(200).send({
                user: userData
             });
        }
        else{
            res.status(403).send({
                error: "Couldn't verify you :("
             });
        }
    });
});

router.post('/logout',auth,(req,res)=>{
    const user = req.body.user;
    if(user.username){
        _data.readIdWithPass('users',user._id,(err,userData)=>{
            if(!err){
                
                if(userData.token) delete userData.token;
                _data.updateId('users',userData._id,userData,(err,response)=>{
                    if(!err){
                        res.status(200).send({message:"Logged out successfully!"});
                    }
                    else{
                        res.status(500).send({error:"An error occured, please try again :("});
                    }
                });
            }
            else{
                res.status(500).send({error:"An error occured, please try again :("});
            }
        });
    }
    else{
        res.status(404).send({error:'No user found, please try again :('});
    }
});



router.post('/search_users',(req,res)=>{
    const keyword = req.body.keyword;
    if(keyword && keyword.length>0){
        _data.search('users',keyword,(err,searchResults)=>{
            if(!err && searchResults){
                if(searchResults.length > 5){
                    searchResults.splice(5,searchResults.length-5)
                }
                searchResults.forEach(searchResult => {
                    searchResult.password = typeof(searchResult.password) == 'string' ? searchResult.password : false;
                    if(searchResult.password){
                        delete searchResult.password;
                    }
                });
                console.log(searchResults)
                res.status(200).send(searchResults);
            }
            else{
                res.status(404).send("No user found :(");
            }
        });
    }
});



router.post("/follow",auth,(req,res)=>{
    let user1 = req.body.user1;
    let user2 = req.body.user2;
    let state = req.body.state;

    if(user1 && user2){
        _data.readIdWithPass('users',user1,(err,user1Data)=>{
            if(!err && user1Data){
                if(user1Data.follow.indexOf(user2)>-1){
                    state = false
                }
                if(state){
                    if(!user1Data.follow.indexOf(user2)>-1){
                        user1Data.follow.push(user2);
                    }
                }
                else{
                    if(user1Data.follow.indexOf(user2)>-1){
                        user1Data.follow.splice(user1Data.follow.indexOf(user2),1);
                    }
                }

                _data.updateId('users',user1,user1Data,(err)=>{
                    if(!err){
                        _data.readIdWithPass('users',user2,(err,user2Data)=>{
                            if(!err){
                                if(state){
                                    if(!user2Data.followers.indexOf(user1)>-1){
                                        user2Data.followers.push(user1);
                                        let user1DataWithoutPass = JSON.parse(JSON.stringify(user1Data));
                                        delete user1DataWithoutPass.password;
                                        let notification = {
                                            _id:`${Math.floor(Math.random()*1000000000+1)}`,
                                            type:'follow',
                                            followedBy:user1DataWithoutPass,
                                            read:false
                                        }
                                        user2Data.notifications.splice(0,0,notification);
                                        console.log(user2Data)
                                    }
                                }
                                else{
                                    if(user2Data.followers.indexOf(user1)>-1){
                                        user2Data.followers.splice(user2Data.followers.indexOf(user1),1);
                                    }
                                }
                                _data.updateId('users',user2,user2Data,(err)=>{
                                    if(!err){
                                        res.status(200).send({
                                            message:"Successfull Follow/Unfollow"
                                        });
                                    }
                                    else{
                                        res.status(500).send({
                                            error:"Couldn't update user2"
                                        });
                                    }
                                })
                            }
                            else{
                                res.status(500).send({
                                    error:"Coultn't read user2 :("
                                });
                            }
                        });
                    }
                    else{
                        res.status(500).send({
                            error:"Coultn't update user1 :("
                        });
                    }
                })
            }
            else{
                res.status(500).send({
                    error:"Coultn't find user1 :("
                });
            }
        });
    }
    else{
        res.status(400);
    }

});




router.post('/auth',auth,(req,res)=>{
    res.status(200).send(req.user);
});



module.exports = router;