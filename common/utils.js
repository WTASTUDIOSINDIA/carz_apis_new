var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
});

var s0 = new aws.S3({})
var upload = multer({
    storage: multerS3({
        s3: s0,
        bucket: 'celebappfiles',
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


const send_mail = (data) => {
var mailOptions={
    to: data.franchisee_email,
    subject: 'notify',
    from: "carz@gmail.com",
    headers: {
        "X-Laziness-level": 1000,
        "charset" : 'UTF-8'
    },

    html: 'File rejected.'
}
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    secure: false, // use SSL
    port: 25, // port for secure SMTP
    auth: {
        user: 'carzdev@gmail.com',
        pass: 'Carz@123'
    }
});
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
    var mailOptions={
        to: data.user_mail,
        subject: 'Franchisee registered successfully',
        from: "carz@gmail.com",
        headers: {
            "X-Laziness-level": 1000,
            "charset" : 'UTF-8'
        },
    
        html: 'Franchisor registration mail'
    }
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        secure: false, // use SSL
        port: 25, // port for secure SMTP
        auth: {
            user: 'carzdev@gmail.com',
            pass: 'Carz@123'
        }
    });
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
    upload
  };