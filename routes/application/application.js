
var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer = require('multer');
var path = require('path');
var Application = mongoose.model('Application');
var ThirdPartyFiles = mongoose.model('ThirdPartyFiles');
var Stages = mongoose.model('Stages');
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
 ApplicationSubmitted.findOne({franchisee_Id:req.params.franchisee_id},function(err,questions){
 if(err){
 return res.send({
 state:"error",
 message:err
 },500);
 }else if(questions && questions.application_status == 'Submitted'){
 return res.send({
 state:'success',
 // message:"Questions not created",
 questions_list:questions
 },200);
 }else{
 get_all_questions(req,res);
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

function get_all_questions(req,res){
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

//get all questions
router.get('/getAll',function(req,res){
 try{
 get_all_questions(req,res);
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
 // return res.send({
 // state:"failure",
 // message:"application already submitted."
 // },200);
 console.log('req.files',req.files);
 if(req.files.file_upload){
 console.log('req.files',req.files);
 for(var i=0;i<req.files.file_upload.length;i++){
 for(var j=0;j<application_form.application_list.length;j++){
 if(application_form.application_list[j].question_type === 'File Upload'){
 application_form.application_list[j].answer = req.files.file_upload[i].location;
 application_form.application_list[j].file_name = req.files.file_upload[i].originalname;
 }
 }
 }
 }
 application.franchisee_Id = application_form.franchisee_Id;
 application.application_status = 'Submitted';
 application.answers = application_form.application_list;
 application.save(function(err, application){
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
 if(!application){
 var application_stats = new ApplicationSubmitted();
 if(req.files){
 for(var i=0;i<req.files.file_upload.length;i++){
 for(var j=0;j<application_form.application_list.length;j++){
 if(application_form.application_list[j].question_type === 'File Upload'){
 application_form.application_list[j].answer = req.files.file_upload[i].location;
 application_form.application_list[j].file_name = req.files.file_upload[i].originalname;
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
var docupload = upload.fields([{ name: 'file_upload', maxCount: 50 }, { name: 'imgFields', maxCount: 20 }])
router.post('/background_verification',docupload,function(req,res){
 var file_details = JSON.parse(req.body.file_details);
 var files=[];
 ThirdPartyFiles.find({},function(err,kyc){
 if(err){
 return res.send(err);
 }
 else{
 var file = [];
 var getNumber = 0;
 var length = req.files.file_upload.length;
 file=req.files.file_upload;
 for(var i=0;i<file.length;i++){
 var document = new ThirdPartyFiles();
 document.link = file[i].location;
 document.key = file[i].key;
 document.doc_name = file[i].originalname;
 document.file_type = "doc";
 if(file[i].mimetype == "application/pdf"){
 document.file_type = "pdf";
 }
 if(file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i].mimetype == "image/jpeg"){
 document.file_type = "image";
 }
 document.date_uploaded = Date.now();
 document.franchisee_id = file_details.franchisee_id;
 files.push(document);
 }
 for(var i=0;i<files.length;i++){
 getNumber = getNumber + 1;
 files[i].save(function(err,files){
 if(err){
 return res.send(err);
 }
 else{
 if(parseInt(length) == parseInt(getNumber)){
 res.send({
 state:200,
 status:'success',
 message:"file uploaded successfully !"
 });
 }
 }
 })
 }
 }
 });
});

router.get('/get_third_party_files/:id',function(req,res){
 ThirdPartyFiles.find({franchisee_id : req.params.id},function(err,file){
 if(err){
 return res.send(err);
 }
 if(file.length == 0){
 return res.send({
 state:200,
 status:'failure',
 message:"file not found !"
 });
 }
 if(file.length > 0){
 return res.send({
 state:200,
 status:'success',
 files:file
 });
 }
 })
})


//Edit third party file name
router.put('/edit_bg_file_name', function(req, res, next){

    var fileEditForm = req.body;
    console.log(fileEditForm);
    try{
        ThirdPartyFiles.findById({'_id': fileEditForm._id}, function(err, file){
        if(err){
          return res.send({
                status:500,
                state:"err",
                message:"Something went wrong.We are looking into it."
            });
        }

        if(file){
          file.doc_name = fileEditForm.doc_name;
          file.save(function(err, file){
            if(err){
              res.send({
                 status:500,
                 state:"err",
                 message:"Something went wrong."
             });
          }
          else{
              res.send({
                  status:200,
                  state:"success",
                  message:"File Updated."
              });
          }
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

router.delete('/delete_discussion_payment_file/:franchisee_id', function(req, res, next){

  try{
      Stages.find({'franchisee_id': req.params.franchisee_id}, function(err, file){
      if(err){
        return res.send({
              status:500,
              state:"err",
              message:"Something went wrong.We are looking into it."
          });
      }

      if(file){

        file[0].stage_discussion.payment_file_name = '';
        file[0].stage_discussion.payment_file = '';
        file[0].save(function(err, file){
          if(err){
            res.send({
               status:500,
               state:"err",
               message:"Something went wrong."
           });
        }
        else{
            res.send({
                status:200,
                state:"success",
                message:"Payment file deleted successfully!"
            });
        }
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
})
router.delete('/delete_discussion_nda_file/:franchisee_id', function(req, res, next){

  try{
      Stages.find({'franchisee_id': req.params.franchisee_id}, function(err, file){
      if(err){
        return res.send({
              status:500,
              state:"err",
              message:"Something went wrong.We are looking into it."
          });
      }

      if(file){

        file[0].stage_discussion.nda_file_name = '';
        file[0].stage_discussion.nda_file = '';
        file[0].save(function(err, file){
          if(err){
            res.send({
               status:500,
               state:"err",
               message:"Something went wrong."
           });
        }
        else{
            res.send({
                status:200,
                state:"success",
                message:"NDA file deleted successfully!"
            });
        }
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
})
  //Edit discussion payment file name
router.put('/edit_discussion_payment_file_name', function(req, res, next){

    var fileEditForm = req.body;
    // console.log(fileEditForm);
    try{
        Stages.find({'franchisee_id': fileEditForm.franchisee_id}, function(err, file){
        if(err){
          return res.send({
                status:500,
                state:"err",
                message:"Something went wrong.We are looking into it."
            });
        }

        if(file){

          file[0].stage_discussion.payment_file_name = fileEditForm.payment_file_name;
          file[0].save(function(err, file){
            if(err){
              res.send({
                 status:500,
                 state:"err",
                 message:"Something went wrong."
             });
          }
          else{
              res.send({
                  status:200,
                  state:"success",
                  message:"Payment file updated successfully!"
              });
          }
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

  //Edit discussion file name
router.put('/edit_nda_file_name', function(req, res, next){

    var fileEditForm = req.body;
    // console.log(fileEditForm);
    try{
        Stages.find({'franchisee_id': fileEditForm.franchisee_id}, function(err, file){
        if(err){
          return res.send({
                status:500,
                state:"err",
                message:"Something went wrong.We are looking into it."
            });
        }

        if(file){

          file[0].stage_discussion.nda_file_name = fileEditForm.nda_file_name;
          file[0].save(function(err, file){
            if(err){
              res.send({
                 status:500,
                 state:"err",
                 message:"Something went wrong."
             });
          }
          else{
              res.send({
                  status:200,
                  state:"success",
                  message:"NDA file edited successfully!"
              });
          }
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

  //  edit agreement file
  router.put('/edit_agreement_payment_file_name', function(req, res, next){

    var fileEditForm = req.body;
    console.log(fileEditForm);
    try{
        Stages.find({'franchisee_id': fileEditForm.franchisee_id}, function(err, file){
        if(err){
          return res.send({
                status:500,
                state:"err",
                message:"Something went wrong.We are looking into it."
            });
        }

        if(file){
          file[0].stage_agreenent.agreement_file_name = fileEditForm.agreement_file_name;
          file[0].save(function(err, file){
            if(err){
              res.send({
                 status:500,
                 state:"err",
                 message:"Something went wrong."
             });
          }
          else{
              res.send({
                  status:200,
                  state:"success",
                  message:"4 Lac payment updated successfully!"
              });
          }
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

  //  edit agreement file
  router.put('/edit_final_agreement_file_name', function(req, res, next){

    var fileEditForm = req.body;
    console.log(fileEditForm);
    try{
        Stages.find({'franchisee_id': fileEditForm.franchisee_id}, function(err, file){
        if(err){
          return res.send({
                status:500,
                state:"err",
                message:"Something went wrong.We are looking into it."
            });
        }

        if(file){
          file[0].stage_agreenent.final_agreement_file_name = fileEditForm.final_agreement_file_name;
          file[0].save(function(err, file){
            if(err){
              res.send({
                 status:500,
                 state:"err",
                 message:"Something went wrong."
             });
          }
          else{
              res.send({
                  status:200,
                  state:"success",
                  message:"Final Agreement file updated successfully"
              });
          }
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

module.exports = router;
