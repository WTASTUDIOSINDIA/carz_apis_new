var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
// import AWS from "aws-sdk";
aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
});
var common = require('../common')
var config = common.config();
var bucketName = 'celebappfiles';

// AWS.config.loadFromPath('./config/s3_credentials.json');

// const BucketName = config.default.awsS3.bucketName;
const s3Bucket = new aws.S3({ params: { Bucket: bucketName} });   

const uploadToS3 = (fileName, fileExt, fileData, isCampaign, callback) => {
    let data = new Buffer(fileData.replace("data:image\/" + fileExt + ";base64,", ""), "base64")
    var uploadabledata = {
        //ACL: isCampaign ? 'public': 'private',
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


const getPreSignedURL = (awsFileKey) => {
    let s3 = new aws.S3();
    let params = {
        Bucket: bucketName,
        Key: awsFileKey
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
    mailOptions.subject = 'File has been rejected';
    mailOptions.html= 'File rejected.';


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

module.exports =  {
    send_mail,
    send_franchisor_registartion_mail,
    upload,
    uploadToS3,
    getPreSignedURL,
    send_franchisor_change_mail_to_old,
    send_franchisor_change_mail_to_new
  };