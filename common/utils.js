var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

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

module.exports =  {
    send_mail
  };