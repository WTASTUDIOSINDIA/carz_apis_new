var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var path = require('path');
var Auth = mongoose.model('Auth');
var ForgotPassword = mongoose.model('ForgotPassword');
var bCrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

module.exports = function(passport){
    //sends successful login state back to angular
    router.get('/success', function(req, res){
        res.send({
            state: 'success', 
            user: req.user ? req.user : null,
            status:200
        });
    });

    //sends failure login state back to angular
    router.get('/failure', function(req, res){
        res.send({
            state: 'failure', 
            user: null,
            status:201,
            message: req.flash('error')
        });
    });

    //log in
    router.post('/login', passport.authenticate('login', {
        failureRedirect: '/authenticate/failure',
        successRedirect: '/authenticate/success',
        failureFlash: true
    }));
    //sign up
    router.post('/register', passport.authenticate('register', {
        successRedirect: '/authenticate/success',
        failureRedirect: '/authenticate/failure',
        failureFlash: true
    }));
    //To encrypt password
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
    //To validate Password
    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    };
    //To generate unique code
    function getGroupPasscode () {
        var len = 6;
        var passcode = crypto.randomBytes(Math.ceil(len/2))
            .toString('hex') 
            .slice(0,len);  
        return passcode;
    }
    //Forgot Password
    router.post('/forgot_password',function(req,res){
        try{
            Auth.findOne({user_mail:req.body.user_mail},function(err,franchisee){
                if(err){
                    res.send({
                        status:500,
                        state:"error",
                        message:"Something went wrong.We are looking into it."
                    });
                }
                if(!franchisee){
                    res.send({
                        status:201,
                        state:"failure",
                        message:"Email Id is incorrect."
                    });
                }
                //Franchisee is there
                if(franchisee){
                    //Send mail
                    var fp = new ForgotPassword();
                    var getCode=getGroupPasscode();
                    fp.unique_code = Date.now().toString()+''+getCode;
                    fp.franchisee_mail = franchisee.user_mail;
                    fp.save(function(err,mail){
                        var fromName = "CARZ";
                        var mailOptions={
                            to: franchisee.user_mail,
                            subject: 'Forgot Password Link',
                            from: "ikshitnodemailer@gmail.com",
                            headers: {
                                "X-Laziness-level": 1000,
                                "charset" : 'UTF-8'
                            },
                            html: '<p style="color:#0079c1;">Hello'+' '+franchisee.user_name+'</p></br>'
                            +'<p>Click on the link below to reset your password</p></br>'
                            +'<a href="http://localhost:3000/reset_password/'+fp.unique_code+'">Click here to activate your account</a>'
                            //html: '<a href="https://howdydev.herokuapp.com/resetpassword/'+pwdchangerequest.passcode+'">Click here to change your password</a>'
                        }
                        var transporter = nodemailer.createTransport({
                            service: 'Gmail',
                            secure: false, // use SSL
                            port: 25, // port for secure SMTP
                            auth: {
                                user: 'ikshitnodemailer@gmail.com', 
                                pass: 'ikshit1007007' 
                            }
                        });
                        transporter.sendMail(mailOptions, function(error, response){
                            if(error){
                                return res.send(error);
                            }
                            else{
                                return res.send({
                                    state:"success",
                                    message:"Email send successfully"
                                });
                            }
                        });
                    });
                }
            })
        }
        catch(err){
            res.send({
                state:"error",
                message:err
            });
        }
    })
    //Reset Password
    router.post('/reset_password',function(req,res){
        ForgotPassword.findOne({unique_code:req.body.unique_code},function(err,match){
            if(err){
                res.send({
                    status:500,
                    state:"error",
                    message:"Something went wrong.We are looking into it."
                });
            }
            if(!match){
                res.send({
                    status:201,
                    state:"failure",
                    message:"Code didn't match."
                });
            }
            if(match){
                Auth.findOne({user_mail:match.franchisee_mail},function(err,auth){
                    if(err){
                        res.send({
                            status:500,
                            state:"error",
                            message:"Something went wrong.We are looking into it."
                        });
                    }
                    if(!auth){
                        res.send({
                            status:201,
                            state:"failure",
                            message:"User not found."
                        });
                    }
                    if(auth){
                        auth.user_pass=createHash(req.body.user_pass);
                        auth.save(function(err,auth){
                            if(err){
                                res.send({
                                    status:500,
                                    state:"error",
                                    message:"Something went wrong.We are looking into it."
                                });
                            }
                            else{
                                res.send({
                                    status:200,
                                    state:"success",
                                    message:"Password updated successfully."
                                });
                            }
                        })
                    }
                })
            }
        })
    })
    return router;
}
