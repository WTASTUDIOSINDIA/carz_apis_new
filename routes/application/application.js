var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var path = require('path');
var Application = mongoose.model('Application');
var _ = require('lodash');
var nodemailer = require('nodemailer');
var Reasons = mongoose.model('Reasons');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var bCrypt = require('bcrypt-nodejs');
aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
});
//carzwtaff
var s0 = new aws.S3({})
var upload = multer({
    storage:multerS3({
        s3:s0,
        bucket:'celebappfiles',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
          cb(null, Date.now().toString() + '.' + file.originalname)
        }
    })
});


// application form
router.post('/application_form',function(req,res){
    var applicationForm = req.body
    console.log("applicationForm",applicationForm);
    try{
        Application.findOne({franchisee_id:applicationForm.franchisee_id,question_EN:applicationForm.question_EN},function(err,ques){
            console.log('application')
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(ques){
                return res.send({
                    state:"failure",
                    message:"Application created already"
                },200);
            }
            else{
                var application = new Application();
                application.question_EN = applicationForm.question_EN;
                application.question_type = applicationForm.question_type;
                application.options = applicationForm.options;
                application.franchisee_Id=applicationForm.franchisee_id,
                application.isRequire=applicationForm.isRequire,
                application.save(function(err,application){
                    if(err){
                        return res.send({
                            state:"error",
                            message:err
                        },500);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:"Application created",
                            data:application
                        },200);
                    }
                })
            }
        });
    }
    catch(err){
		return res.send({
			state:"error",
			message:err
		},500);
	}
});
// get questions by franchisee id
router.get('/get_questions_list/:franchisee_id',function(req,res){
    try{
        Application.find({franchisee_Id:req.params.franchisee_id},function(err,questions){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(questions.length == 0){
                return res.send({
                    state:'failure',
                    message:"Questions not created"
                },400);
            }
            if(questions.length>0){
                return res.send({
                    state:'success',
                    questions_list:questions
                },200);
            }
        })
    }
    catch(err){
        return res.send({
            state:"error",
            message:err
        },500);
    }
})

//get all questions
router.get('/getAll',function(req,res){
    try{
        Application.find({},function(err,ques){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(ques.length == 0){
                return res.send({
                    state:'failure',
                    message:"Questions not created"
                },400);
            }
            if(ques.length>0){
                return res.send({
                    state:'success',
                    questions_list:ques
                },200);
            }
        })
    }
    catch(err){
        return res.send({
            state:"error",
            message:err
        },500);
    }
})
//delete question by question id
router.delete('/delete/question/:id',function(req,res){
    try{
        console.log("dsfsdfsd",req.params.id);
        Application.findByIdAndRemove({_id:req.params.id},function(err,ques){
            console.log("ques",ques);
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
          
            else{
                return res.send({
                    state:"success",
                    message:"Removed successfully"
                },200);
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});


module.exports = router;