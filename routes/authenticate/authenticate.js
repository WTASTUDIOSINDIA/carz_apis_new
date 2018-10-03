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
var authService = require('./authenticate-service');
var utils = require('../../common/utils');
const objectId = mongoose.Types.ObjectId;
var bCrypt = require('bcrypt-nodejs');
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

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
    /*
    router.post('/franchisor-login', passport.authenticate('franchisor-login', {
        failureRedirect: '/authenticate/failure-franchisor',
        successRedirect: '/authenticate/success-franchisor',
        failureFlash: true
    }));
    */
   
router.post('/franchisor-login', function (req,res){

    let data = req.body;
   // data.user_pass = createHash(data.user_pass);
    let query = {};
    query.user_mail = data.user_mail;
    authService.findFranchisor(query)
    .then((response) => {
        console.log(response);
        if(response){
            if(bCrypt.compareSync(data.user_pass,response.user_pass)){
                response.user_pass = undefined;
                res.send({
                    state: 'success',
                    user: response,
                    status:200
                });
            }else{
                throw{
                    reason : "passworsMmatch"
                }
            }
        }else{
        return authService.findUser(query);
        }
    })
    .then((response) => {
        if(response){
            if(bCrypt.compareSync(data.user_pass,response.user_pass)){
                response.user_pass = undefined;
                res.send({
                    state: 'success',
                    user: response,
                    status:200
                });
            }else{
                throw{
                    reason : "passworsMmatch"
                }
            }
        }else{
            return authService.findSuperAdmin(query);
        }
    })
    .then((response) => {
        if(response){
            if(bCrypt.compareSync(data.user_pass,response.user_pass)){
                response.user_pass = undefined;
                res.send({
                    state: 'success',
                    user: response,
                    status:200
                });
            }else{
                throw{
                    reason : "passworsMmatch"
                }
            }
        }else{
        throw{
            reason : "userNotExist"
        }
        }
    })
    .catch((error) => {
        if(error.reason == "userNotExist"){ 
            res.status(203).json({ error: "2", message: "User not Exists"});
        }else if(error.reason == "passworsMmatch"){
            res.status(203).json({ error: "2", message: "Password is not correct"});
        }else{
        res.status(500).json({ error: "2", message: "Internal server error"});
        }
    });

});
  
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


  router.post('/forgotpassword', function (req,res){

    let data = req.body;
    var otp = utils.generateOTP();
    if(data.user_mail) {

        authService.findSuperAdmin({user_mail: data.user_mail}, '')
      .then((response) => {
        if(response){
          console.log(response.user_role);
          utils.sendMobileOTP(otp,response.mobile_number);   
          utils.sendMailOTP(otp,response.user_mail);
          response.verification = {
              otp : otp
          }
          response.save()
        //   response.user_pass = undefined;
         // response.verification = undefined;
         let resp_data ={};
         resp_data.user_mail = response.user_mail;
         resp_data._id = response._id;
         resp_data.user_role = response.user_role;
          res.status(200).json({ error: "0", message: "OTP has been sent to your mail and mobile number", data: resp_data});
         
        }else { 
        return authService.findFranchisor({user_mail: data.user_mail}, '')
          //return authService.create(data);
        }
      })
      .then((response) => {
        if(response){
            console.log(response.user_role);
          utils.sendMobileOTP(otp,response.phone_number);   
          utils.sendMailOTP(otp,response.user_mail);
          response.verification = {
            otp : otp
          }
          response.save()
          let resp_data ={};
          resp_data.user_mail = response.user_mail;
          resp_data._id = response._id;
          resp_data.user_role = response.user_role;
          res.status(200).json({ error: "0", message: "OTP has been sent to your mail and mobile number", data: resp_data});
        }else { 
        return authService.findFranchisee({franchisee_email: data.user_mail}, '')
          //return authService.create(data);
        }
      })
      .then((response) => {
        if(response){
          
          utils.sendMobileOTP(otp,response.franchisee_mobile_number);   
          utils.sendMailOTP(otp,response.franchisee_email);
          response.pass_verification = {
            otp : otp
          }
          response.save()
          let resp_data ={};
          resp_data.franchisee_email = response.franchisee_email;
          resp_data._id = response._id;
          resp_data.user_role = response.user_role;
          res.status(200).json({ error: "0", message: "OTP has been sent to your mail and mobile number", data: resp_data});
        }else { 
        return authService.findUser({user_mail: data.user_mail}, '')
        }
      })

      .then((response) => {
        if(response){
            console.log(response.user_role);
          utils.sendMobileOTP(otp,response.user_phone_number);   
          utils.sendMailOTP(otp,response.user_mail);
          response.verification = {
            otp : otp
          }
          response.save()
          let resp_data ={};
          resp_data.user_mail = response.user_mail;
          resp_data._id = response._id;
          resp_data.user_role = response.user_role;
          res.status(200).json({ error: "0", message: "OTP has been sent to your mail and mobile number", data: resp_data});
        }else {
          throw {
            reason: "notExists"
          }
        }
      })
     
      .catch((err) => {
      if(err.reason == "notExists")
        res.status(203).json({error:'3',message:"User not Exists with the given email"});
       else
        res.status(500).json({error:'4',message:"Internal Sever Error"});
      });
    } else {
      res.status(203).json({error:'2',message:"Please enter email address."});
    }
  
  })

  router.post('/resendotp', function (req,res){

    let data = req.body;
    if(data.user_mail) {

        authService.findSuperAdmin({user_mail: data.user_mail}, '')
      .then((response) => {
        if(response){
          console.log(response.user_role);
          utils.sendMobileOTP(response.verification.otp,response.mobile_number);   
          utils.sendMailOTP(response.verification.otp,response.user_mail);
          
          response.user_pass = undefined;
          response.verification = undefined;
          res.status(200).json({ error: "0", message: "OTP has been resent to your mail and mobile number", data: response});
         
        }else { 
        return authService.findFranchisor({user_mail: data.user_mail}, '')
          //return authService.create(data);
        }
      })
      .then((response) => {
        if(response){
            console.log(response.user_role);
          utils.sendMobileOTP(response.verification.otp,response.phone_number);   
          utils.sendMailOTP(response.verification.otp,response.user_mail);
          
          response.user_pass = undefined;
          response.verification = undefined;
          res.status(200).json({ error: "0", message: "OTP has been resent to your mail and mobile number", data: response});
        }else { 
        return authService.findFranchisee({franchisee_email: data.user_mail}, '')
          //return authService.create(data);
        }
      })
      .then((response) => {
        if(response){
            console.log(response.user_role);
          utils.sendMobileOTP(response.verification.otp,response.franchisee_mobile_number);   
          utils.sendMailOTP(response.verification.otp,response.franchisee_email);
          
          response.franchisee_pass = undefined;
          response.pass_verification = undefined;
          res.status(200).json({ error: "0", message: "OTP has been resent to your mail and mobile number", data: response});
        }else { 
        return authService.findUser({user_mail: data.user_mail}, '')
        }
      })

      .then((response) => {
        if(response){
            console.log(response.user_role);
          utils.sendMobileOTP(response.verification.otp,response.user_phone_number);   
          utils.sendMailOTP(response.verification.otp,response.user_mail);
          
          response.user_pass = undefined;
          response.verification = undefined;
          res.status(200).json({ error: "0", message: "OTP has been resent to your mail and mobile number", data: response});
        }else {
          throw {
            reason: "notExists"
          }
        }
      })
     
      .catch((err) => {
      if(err.reason == "notExists")
        res.status(203).json({error:'3',message:"User not Exists with the given email"});
       else
        res.status(500).json({error:'4',message:"Internal Sever Error"});
      });
    } else {
      res.status(203).json({error:'2',message:"Please enter email address."});
    }
  })


  router.post('/verifyotp_and_resetpass', function (req,res){

    let data = req.body;
    if(data.user_role && data.user_pass && data.id && data.otp) {

        if(data.user_role == "super_admin"){

            authService.findSuperAdmin({_id:objectId(data.id)}, '')
            .then((response) => {
                if(response) {
                    if(response.verification && response.verification.otp && response.verification.otp == data.otp){
                      response.user_pass = createHash(data.user_pass);
                      response.verification = undefined;
                      console.log(response);
                      return response.save();
                    } else {
                      throw {
                        reason : "OTPMisMatch"
                      }
                    }
                  } else {
                    throw {
                      reason : "NotFound"
                    }
                  }
            })
            .then((response) => {
                response.user_pass = undefined;
                res.status(200).json({ error: "0", message: "Your OTP Verfication and reset password is successful",data:response});
              })
              .catch((err) => {
                if(err.reason == "OTPMisMatch")
                  res.status(203).json({error:'1',message:"Your OTP doesn't match"});
                else if(err.reason == "NotFound")
                  res.status(203).json({error:'2',message:"Details not found with the given username"});
                else
                  res.status(500).json({error:'3',message:"Internal Sever Error"});
              });

        }else if(data.user_role == "franchisor"){

            authService.findFranchisor({_id:objectId(data.id)}, '')
            .then((response) => {
                if(response) {
                    if(response.verification && response.verification.otp && response.verification.otp == data.otp){
                      response.user_pass = createHash(data.user_pass);
                      response.verification = undefined;
                      return response.save();
                    } else {
                      throw {
                        reason : "OTPMisMatch"
                      }
                    }
                  } else {
                    throw {
                      reason : "NotFound"
                    }
                  }
            })
            .then((response) => {
                response.user_pass = undefined;
                res.status(200).json({ error: "0", message: "Your OTP Verfication and reset password is successful",data:response});
              })
              .catch((err) => {
                if(err.reason == "OTPMisMatch")
                  res.status(203).json({error:'1',message:"Your OTP doesn't match"});
                else if(err.reason == "NotFound")
                  res.status(203).json({error:'2',message:"Details not found with the given username"});
                else
                  res.status(500).json({error:'3',message:"Internal Sever Error"});
              });

        }else if(data.user_role == "franchisee"){

            authService.findFranchisee({_id:objectId(data.id)}, '')
            .then((response) => {
                if(response) {
                    if(response.pass_verification && response.pass_verification.otp && response.pass_verification.otp == data.otp){
                      response.franchisee_pass = createHash(data.user_pass);
                      response.pass_verification = undefined;
                      return response.save();
                    } else {
                      throw {
                        reason : "OTPMisMatch"
                      }
                    }
                  } else {
                    throw {
                      reason : "NotFound"
                    }
                  }
            })
            .then((response) => {
                response.user_pass = undefined;
                res.status(200).json({ error: "0", message: "Your OTP Verfication and reset password is successful",data:response});
              })
              .catch((err) => {
                if(err.reason == "OTPMisMatch")
                  res.status(203).json({error:'1',message:"Your OTP doesn't match"});
                else if(err.reason == "NotFound")
                  res.status(203).json({error:'2',message:"Details not found with the given username"});
                else
                  res.status(500).json({error:'3',message:"Internal Sever Error"});
              });

        }else if(data.user_role == "user"){
           
            authService.findUser({_id:objectId(data.id)}, '')
            .then((response) => {
               
                if(response) {
                    if(response.verification && response.verification.otp && response.verification.otp == data.otp){
                      response.user_pass = createHash(data.user_pass);
                      response.verification = undefined;
                      return response.save();
                    } else {
                      throw {
                        reason : "OTPMisMatch"
                      }
                    }
                  } else {
                    throw {
                      reason : "NotFound"
                    }
                  }
            })
            .then((response) => {
                response.user_pass = undefined;
                res.status(200).json({ error: "0", message: "Your OTP Verfication is successful",data:response});
              })
              .catch((err) => {
                if(err.reason == "OTPMisMatch")
                  res.status(203).json({error:'1',message:"Your OTP doesn't match"});
                else if(err.reason == "NotFound")
                  res.status(203).json({error:'2',message:"Details not found with the given username"});
                else
                  res.status(500).json({error:'3',message:"Internal Sever Error"});
              });

        }else{
            res.status(203).json({error:'2',message:"User role is not existed"});
        }

    } else {
      res.status(203).json({error:'2',message:"Missing required parameters(user_role,user_pass,id)"});
    }
  })



  router.post('/save_profile', function (req,res){

    let data = req.body;
    var otp = utils.generateOTP();
    console.log(data);
    if(data.user_role && data.user_name && data.id) {

        if(data.user_role == "super_admin"){

            authService.findSuperAdmin({_id:objectId(data.id)}, '')
            .then((response) => {
                if(response) {
                    if(data.user_pass){
                        utils.sendMobileOTP(otp,response.mobile_number);   
                        utils.sendMailOTP(otp,response.user_mail);
                        response.verification = {
                            otp : otp
                        }
                        return response.save()
                      
                       //res.status(200).json({ error: "0", message: "Seems you want to change your password. OTP has been sent. Please verify!", data: resp_data});
                    }
                    else{
                        response.user_name = data.user_name;
                        return response.save();
                        //res.status(200).json({ error: "0", message: "Succefully updated", data: resp_data});
                    }
                } else {
                    throw {
                      reason : "NotFound"
                    }
                  }
            })
            .then((response) => {
                
                response.user_pass = undefined;
                if(response.verification.otp == otp){
                    response.verification = undefined;
                    res.status(200).json({ error: "2", message: "Seems you want to change your password. OTP has been sent. Please verify!", data: response});
                }else{
                    response.verification = undefined;
                   res.status(200).json({ error: "0", message: "Succesfully updated",data:response});
                }
              })
            
              .catch((err) => {
                if(err.reason == "NotFound")
                  res.status(404).json({error:'2',message:"Details not found with the given username"});
                else
                  res.status(500).json({error:'3',message:"Internal Sever Error"});
              });

        }else if(data.user_role == "franchisor"){

            authService.findFranchisor({_id:objectId(data.id)}, '')
            .then((response) => {
                if(response) {
                    if(data.user_pass){
                        utils.sendMobileOTP(otp,response.mobile_number);   
                        utils.sendMailOTP(otp,response.user_mail);
                        response.verification = {
                            otp : otp
                        }
                        return response.save()
                      
                       //res.status(200).json({ error: "0", message: "Seems you want to change your password. OTP has been sent. Please verify!", data: resp_data});
                    }
                    else{
                        response.user_name = data.user_name;
                        return response.save();
                        //res.status(200).json({ error: "0", message: "Succefully updated", data: resp_data});
                    }
                } else {
                    throw {
                      reason : "NotFound"
                    }
                  }
            })
            .then((response) => {
                response.user_pass = undefined;
                if(response.verification.otp == otp){
                    response.verification = undefined;
                    res.status(200).json({ error: "2", message: "Seems you want to change your password. OTP has been sent. Please verify!", data: response});
                }else{
                    response.verification = undefined;
                   res.status(200).json({ error: "0", message: "Succesfully updated",data:response});
                }
              })
            
              .catch((err) => {
                if(err.reason == "NotFound")
                  res.status(404).json({error:'2',message:"Details not found with the given username"});
                else
                  res.status(500).json({error:'3',message:"Internal Sever Error"});
              });

        }else if(data.user_role == "franchisee"){

            authService.findFranchisee({_id:objectId(data.id)}, '')
            .then((response) => {
                if(response) {
                    if(data.user_pass){
                        utils.sendMobileOTP(otp,response.franchisee_mobile_number);   
                        utils.sendMailOTP(otp,response.franchisee_email);
                        response.pass_verification = {
                            otp : otp
                        }
                        return response.save()
                      
                       //res.status(200).json({ error: "0", message: "Seems you want to change your password. OTP has been sent. Please verify!", data: resp_data});
                    }
                    else{
                        response.franchisee_name = data.franchisee_name;
                        return response.save();
                        //res.status(200).json({ error: "0", message: "Succefully updated", data: resp_data});
                    }
                } else {
                    throw {
                      reason : "NotFound"
                    }
                  }
            })
            .then((response) => {
                response.franchisee_pass = undefined;
                if(response.pass_verification.otp == otp){
                    response.pass_verification = undefined;
                    res.status(200).json({ error: "2", message: "Seems you want to change your password. OTP has been sent. Please verify!", data: response});
                }else{
                    response.pass_verification = undefined;
                   res.status(200).json({ error: "0", message: "Succesfully updated",data:response});
                }
              })
            
              .catch((err) => {
                if(err.reason == "NotFound")
                  res.status(404).json({error:'2',message:"Details not found with the given username"});
                else
                  res.status(500).json({error:'3',message:"Internal Sever Error"});
              });
           

        }else if(data.user_role == "user"){
           
            authService.findUser({_id:objectId(data.id)}, '')
            .then((response) => {
                if(response) {
                    if(data.user_pass){
                        utils.sendMobileOTP(otp,response.mobile_number);   
                        utils.sendMailOTP(otp,response.user_mail);
                        response.verification = {
                            otp : otp
                        }
                        return response.save()
                      
                       //res.status(200).json({ error: "0", message: "Seems you want to change your password. OTP has been sent. Please verify!", data: resp_data});
                    }
                    else{
                        response.user_name = data.user_name;
                        return response.save();
                        //res.status(200).json({ error: "0", message: "Succefully updated", data: resp_data});
                    }
                } else {
                    throw {
                      reason : "NotFound"
                    }
                  }
            })
            .then((response) => {
                response.user_pass = undefined;
                if(response.verification.otp == otp){
                    response.verification = undefined;
                    res.status(200).json({ error: "2", message: "Seems you want to change your password. OTP has been sent. Please verify!", data: response});
                }else{
                    response.verification = undefined;
                   res.status(200).json({ error: "0", message: "Succesfully updated",data:response});
                }
              })
            
              .catch((err) => {
                if(err.reason == "NotFound")
                  res.status(404).json({error:'2',message:"Details not found with the given username"});
                else
                  res.status(500).json({error:'3',message:"Internal Sever Error"});
              });

        }else{
            res.status(203).json({error:'2',message:"User role is not existed"});
        }

    } else {
      res.status(203).json({error:'2',message:"Missing required parameters(user_role,user_pass,id)"});
    }
  })

    return router;
}


//8143117996