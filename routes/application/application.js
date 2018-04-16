var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var path = require('path');
var Application = mongoose.model('Application');
var ApplicationSubmitted = mongoose.model('ApplicationSubmitted');;
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
    var applicationForm = req.body;
    try{
        Application.findOne({question_EN:applicationForm.question_EN},function(err,ques){
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
                },200);
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
        Application.findByIdAndRemove({_id:req.params.id},function(err,ques){
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

router.put('/edit_question',function(req,res){
    var applicationForm = req.body;
    try{
        Application.findOne({_id:applicationForm.ques_id},function(err,ques){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(!ques){
                return res.send({
                    state:"failure",
                    message:"question not found"
                },200);
            }
            if(ques){
                ques.question_EN = applicationForm.question_EN;
                ques.question_type = applicationForm.question_type;
                ques.options = applicationForm.options;
                ques.isRequire=applicationForm.isRequire,
                ques.save(function(err,ques){
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
                            data:ques
                        },200);
                    }
                })
            }
        })
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});
var cpUpload = upload.fields([{ name: 'file_upload', maxCount: 50 }, { name: 'imgFields', maxCount: 20 }])
router.put('/submit_application',cpUpload,function(req,res){
    var application_form = JSON.parse(req.body.data);
    try{
        ApplicationSubmitted.findOne({franchisee_Id:application_form.franchisee_Id},function(err,application){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(application){
                return res.send({
                    state:"failure",
                    message:"application already submitted."
                },200);
            }
            if(!application){
                var application_stats = new ApplicationSubmitted();
                if(req.files){
                    for(var i=0;i<req.files.file_upload.length;i++){
                        for(var j=0;j<application_form.application_list.length;j++){
                            if(application_form.application_list[j].question_type === 'File Upload'){
                                application_form.application_list[j].answer = req.files.file_upload[i].location;
                            }
                        }
                    }
                }
                application_stats.franchisee_Id = application_form.franchisee_Id;
                application_stats.application_status = 'Submitted';
                application_stats.answers = application_form.application_list;
                application_stats.save(function(err, application_stats){
                    if(err){
                        return res.send({
                            state:"err",
                            message:"Something went wrong.We are looking into it."
                        },500);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:"application submitted."
                        },200);
                    }
                })
            }

        })
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
})


module.exports = router;