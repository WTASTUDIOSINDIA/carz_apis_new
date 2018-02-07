var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var crypto = require('crypto');
var bCrypt = require('bcrypt-nodejs');
var multer  = require('multer')
var upload = multer({ dest: 'public/uploads/' });
var fs = require('fs');
var path = require('path');
var User = mongoose.model('User');

router.post('/login',function(req,res){
    console.log("req.body",req.body.user_mail);
    try{
        User.findOne({user_mail:req.body.user_mail},function(err,user){
            if(err){
                return res.send(500, err);
            }
            console.log("user",user);
            if(!user){
                res.send({
                    "status":"201",
                    "message":"User not found",
                    "state":"failure"
                });
            }
            else{
                res.send({
                    "status":"200",
                    "user":user,
                    "state":"success"
                });
            }
        })
    }
    catch(err){
		return res.send({
			state:"error",
			message:err
		});
	}
});

router.get('/get_all',function(req,res){
    User.find({},function(err,user){
        console.log("user",user);
        if(user.length>0){
            res.send({
                user:user,
                message:"found"
            })
        }
        else{
            res.send({
                user:[],
                message:"not found"
            })
        }
    })
})

var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

module.exports = router;