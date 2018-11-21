var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
var jwt = require('jsonwebtoken');
// import AWS from "aws-sdk";
aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
});
var common = require('../common')
var config = common.config();
//var env = require('../../carz_api/env.json');

var bucketName = 'carzdev';
var otpGenerator = require('otp-generator');
var msg91 = require("msg91")("228925AIFyHVr65b5edfae", "WTASTUDIOS", "4" ); 
var bucketName = 'carzdev';

const awsFileUrl = () => {
    let url = "https://s3.ap-south-1.amazonaws.com/"+bucketName+"/";
    return url;
}

// AWS.config.loadFromPath('./config/s3_credentials.json');

// const BucketName = config.default.awsS3.bucketName;
const s3Bucket = new aws.S3({ params: { Bucket: bucketName} });   

const uploadToS3 = (fileName, fileExt, fileData, isCampaign, callback) => {
    let data = new Buffer(fileData.replace("data:image\/" + fileExt + ";base64,", ""), "base64")
    var uploadabledata = {
        //ACL: isCampaign ? 'public': 'private',
        ACL : 'public-read',
        Key: fileName + '.' + fileExt,
        Body: data,
        ContentType: 'image/' + fileExt
    };
    s3Bucket.putObject(uploadabledata, function(err, response) {
        if (err) {
            console.log('Error in uploading', err);
        } else {
            console.log("uploaded: ", fileName+"."+fileExt);
            if(isCampaign)
                callback(response);

        }
    });
};

const generateJwtToken = (data, requestFrom) => {

    let secretCode = config.jwt.normal.secret;
    let expiresIn = config.jwt.normal.expiresIn;
    if(requestFrom == 'website')
      expiresIn = '1000d';
  
    return jwt.sign({ data }, secretCode, { expiresIn: expiresIn });
  
  };
  
  const decodeJwtToken = (jwtToken) => {
    let secretCode = config.jwt.normal.secret;
  
    return new Promise((resolve, reject) => {
        jwt.verify(jwtToken, secretCode, (error, decodedData) => {
            if (!error) resolve(decodedData);
            else reject({ status: 'unauthorised', message: 'jwt expired' });
        });
    });
  };



const getPreSignedURL = (awsFileKey) => {
    let s3 = new aws.S3();
    let params = {
        Bucket: bucketName,
        Key: awsFileKey,
        // timeOut: new Date(new Date().getTime() + 1000 * 60 * 15)
    };
    try {
        let url = s3.getSignedUrl('getObject', params);
        return url;
    } catch (err) {
        return "";
    }
  }


var s0 = new aws.S3({})
var upload = multer({
    storage: multerS3({
        s3: s0,
        bucket: bucketName,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '.' + file.originalname)
        }
    })
});

const mailOptions={
    
    from: "carz@gmail.com",
    headers: {
        "X-Laziness-level": 1000,
        "charset" : 'UTF-8'
    }
}

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    secure: false, // use SSL
    port: 25, // port for secure SMTP
    auth: {
        user: 'carzdev@gmail.com',
        pass: 'Carz@123'
    }
});

const send_mail = (data) => {

    mailOptions.to = data.user_mail;
    if(data.subject){
    mailOptions.subject = data.subject;
}
else{
    mailOptions.subject = 'File has been rejected';
}
if(data.html){
    mailOptions.html= data.html;
}
else{
    mailOptions.html= 'File rejected.';
}


transporter.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }
    else{
        console.log(response);
    }
});
}


const send_franchisor_registartion_mail = (data) => {

    mailOptions.to = data.user_mail;
    mailOptions.subject = 'Franchisee registered successfully';
    mailOptions.html = 'Franchisor registration mail. Please find the link '+config.website_url+'/pages/auth/reset-password/'+data._id+".";
  
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }
        else{
            console.log(response);
        }
    });
    }

const send_franchisor_change_mail_to_old = (mail) => {

    mailOptions.to = mail;
    mailOptions.subject = 'Franchisee has been updated';
    mailOptions.html = 'Your this Mail is upadted with new mail';
  
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }
        else{
            console.log(response);
        }
    });
    }    

const send_franchisor_change_mail_to_new = (data) => {
   
    mailOptions.to = data.user_mail;
    mailOptions.subject = 'Franchisee Updated';
    mailOptions.html = 'Your old Franchisor Email is updated with this email. Please confirm your account and login '+config.website_url+'/pages/auth/mail-confirm/'+data._id+'.';
  
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }
        else{
            console.log(response);
        }
    });
}    

const sendMobileOTP = (otp, mobile) => {
   console.log(otp);
   console.log(mobile);
    msg91.send(mobile, ""+otp+" is your One Time Password . Please enter OTP .", function(err, response){
    console.log(err);
    });

};    

const sendMailOTP = (otp, mail) => {
    mailOptions.to = mail;
    mailOptions.subject = 'OTP - Carz';
    mailOptions.html = otp+' is your One Time Password . Please enter OTP.';
  
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }
        else{
            console.log(response);
        }
    });
};   


const authenticated = (req, res, next) => {
    const token = req.headers['x-access-code'];
    console.log(token);
    if (token) {
        decodeJwtToken(token)
            .then(decoded => {
                req.decoded = decoded.data;
                next();
            })
            .catch((error) => {
              res.status(401).json({ success: false, error:"2", message: "Your Login Token Expired. Please Login." });
            });
    } else {
        res.status(401).json({ success: false, error:"1", message: "You are not authorised." });
    }
};

const generateOTP = () => {
    return otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
  }  

module.exports =  {
    generateJwtToken,
    decodeJwtToken,
    send_mail,
    send_franchisor_registartion_mail,
    upload,
    uploadToS3,
    getPreSignedURL,
    send_franchisor_change_mail_to_old,
    send_franchisor_change_mail_to_new,
    sendMobileOTP,
    sendMailOTP,
    generateOTP,
    awsFileUrl,
    authenticated
  };