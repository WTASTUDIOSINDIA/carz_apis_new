var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var path = require('path');
var Franchisor = mongoose.model('Franchisor');
var Franchisee = mongoose.model('Franchisee');
var ForgotPassword = mongoose.model('ForgotPassword');
var bCrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var otpGenerator = require("otp-generator");

module.exports = function(passport){
    //sends successful login state back to angular
    router.get('/success-franchisor', function(req, res){
        res.send({
            state: 'success',
            user: req.user ? req.user : null,
            status:200
        });
        console.log(req.user);
    });

    //sends failure login state back to angular
    router.get('/failure-franchisor', function(req, res){

        res.send({
            state: 'failure',
            user: null,
            status:200,
            message: req.flash('error')
        });
    });
    //sends successful login state back to angular


    router.post('/verify', function(req, res){
        console.log(req.body);
        Franchisee.findById(req.body.id,function(err,franchisee){
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
                    message:"User not found."
                });
            }
            if(franchisee){

                if(franchisee.verification  && franchisee.verification.otp && franchisee.verification.otp == req.body.otp){
                    //verified
                    franchisee.verified = true;
                    franchisee.verification.status = true;
                    franchisee.verification.verifiedDate = Date.now();
                    franchisee.save();
                    res.send({
                        state: 'success',
                        user: franchisee,
                        status:200
                    });
                }else{
                    res.send({
                        status:501,
                        state:"failure",
                        message:"OTP doesn't matched."
                    });
                }

            }
        })
    });

    router.get('/success-franchisee', function(req, res){

    if(req.user.verified == false){
        //console.log(req.user)
        var otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
        var mailOptions={
            to: req.user.franchisee_email,
            subject: 'OTP',
            from: "carzdev@gmail.com",
            headers: {
                "X-Laziness-level": 1000,
                "charset" : 'UTF-8'
            },

            html: "<p>Your one time password is <b>"+otp+"</b>. Please use this to verify your account.</p><div><p>Best,</p><p>Carz.</p></div>"
        }
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false, // use SSL
            port: 25, // port for secure SMTP
            auth: {
                user: 'carzdev@gmail.com',
                pass: 'Carz@123'
            }
        });
        transporter.sendMail(mailOptions, function(error, response){
            if(error){
                return res.send(error);
            }
            else{
                return res.send(response);
            }
        });

        req.user.verification = {
              otp: otp,
              status: false
          }

          req.user.save();
          let data = {};
          data.franchisee_email = req.user.franchisee_email;
          data.id = req.user._id;
          res.send({
            state: 'otp',
            user: data,
            status:200
        });

    }else{
        res.send({
            state: 'success',
            user: req.user ? req.user : null,
            status:200
        });
    }
        /*r*/
    });

    //sends failure login state back to angular
    router.get('/failure-franchisee', function(req, res){

        res.send({
            state: 'failure',
            user: null,
            status:201,
            message: req.flash('error')
        });
    });

    //sends successful login state back to angular
    router.get('/success-admin', function(req, res){

        res.send({
            state: 'success',
            user: req.user ? req.user : null,
            status:200
        });
    });

    //sends failure login state back to angular
    router.get('/failure-admin', function(req, res){

        res.send({
            state: 'failure',
            user: null,
            status:201,
            message: req.flash('error')
        });
    });

    //franchisor log in
    router.post('/franchisor-login', passport.authenticate('franchisor-login', {
        failureRedirect: '/authenticate/failure-franchisor',
        successRedirect: '/authenticate/success-franchisor',
        failureFlash: true
    }));

    //admin log in
    router.post('/franchisee-login', passport.authenticate('franchisee-login', {
        failureRedirect: '/authenticate/failure-franchisee',
        successRedirect: '/authenticate/success-franchisee',
        failureFlash: true
    }));

    //franchisee log in
    router.post('/admin-login', passport.authenticate('admin-login', {
        failureRedirect: '/authenticate/failure-admin',
        successRedirect: '/authenticate/success-admin',
        failureFlash: true
    }));
    //sign up
    router.post('/franchisor-register', passport.authenticate('franchisor-register', {
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
            Franchisor.findOne({user_mail:req.body.user_mail},function(err,franchisor){
                if(err){
                    res.send({
                        status:500,
                        state:"error",
                        message:"Something went wrong.We are looking into it."
                    });
                }
                if(!franchisor){
                    res.send({
                        status:201,
                        state:"failure",
                        message:"Email Id is incorrect."
                    });
                }
                //Franchisee is there
                if(franchisor){
                    //Send mail
                    var fp = new ForgotPassword();
                    var getCode=getGroupPasscode();
                    fp.unique_code = Date.now().toString()+''+getCode;
                    fp.user_mail = franchisor.user_mail;
                    fp.save(function(err,mail){
                        var fromName = "CARZ";
                        var mailOptions={
                            to: franchisor.user_mail,
                            subject: 'Forgot Password Link',
                            from: "ikshitnodemailer@gmail.com",
                            headers: {
                                "X-Laziness-level": 1000,
                                "charset" : 'UTF-8'
                            },
                            html: '<p style="color:#0079c1;">Hello'+' '+franchisor.user_name+'</p></br>'
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
                Franchisee.findOne({franchisee_email:req.body.franchisee_email},function(err,franchisee){
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
                            message:"User not found."
                        });
                    }
                    if(franchisee){
                        franchisee.franchisee_pass=createHash(req.body.franchisee_pass);
                        franchisee.save(function(err,franchisee){
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
      //      }
      //  })
    })

    return router;
}
