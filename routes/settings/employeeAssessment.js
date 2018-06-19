var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');;
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var csv = require('csv')
var path = require('path');
var EmployeeAssessment = mongoose.model('EmployeeAssessment');
var EmployeeAssessmentSubmitted = mongoose.model('EmployeeAssessmentSubmitted');
var _ = require('lodash');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var bCrypt = require('bcrypt-nodejs');
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
var fileupload = upload.fields([{
    name: 'file_upload',
    maxCount: 50
  }, {
    name: 'imgFields',
    maxCount: 20
  }])

  // To create employee assessment
//   router.post('/create_employee_assessment_question',fileupload, function (req, res) {
//     var employeeAssessmentForm = JSON.parse(req.body.employeeAssessment);
//     try {
//         EmployeeAssessment.findOne({ question_EN: employeeAssessmentForm.question_EN }, function (err, question) {
//             if (err) {
//                 return res.send({
//                     state: 'error',
//                     message: err
//                 }, 500);
//             }
//             if (question) {
//                 return res.send({
//                     state: 'failure',
//                     message: "Question already exists"
//                 }, 400);
//             }
//             else {
//                 var employeeAssessment = new EmployeeAssessment();
//                 employeeAssessment.question_EN = employeeAssessmentForm.question_EN;
//                 employeeAssessment.question_type = employeeAssessmentForm.question_type;
//                 employeeAssessment.options = employeeAssessmentForm.options;
//                 // employeeAssessment.franchisee_id = employeeAssessmentForm.franchisee_id;
//                 if (req.file){
//                     console.log(req.file);
//                     employeeAssessment.employee_assessment_file_attachment_file_url = req.file.location;
//                     employeeAssessment.employee_assessment_file_attachment_file_name = req.file.key;
//                     employeeAssessment.employee_assessment_file_attachment_file_type = req.file.contentType;
//                 }
//                 employeeAssessment.save(function (err, employeeAssessment) {
//                     if (err) {
//                         return res.send({
//                             state: 'error',
//                             message: err
//                         }, 500);
//                     }
//                     else {
//                         return res.send({
//                             state: 'success',
//                             message: 'Question created'
//                         }, 200)
//                     }
//                 })
//             }
//         });
//     }
//     catch (err) {
//         return res.send({
//             state: 'error',
//             message: err
//         }, 500);
//     }
// })


router.post('/create_employee_assessment_question', fileupload, function (req, res) {
    var employeeAssessmentForm = JSON.parse(req.body.employeeAssessment);
    try {
        EmployeeAssessment.findOne({ franchisee_id: employeeAssessmentForm.franchisee_id }, function (err, employeeAssessment) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong. We are looking into it.'
                }, 500);
            }
            if (employeeAssessment) {
                return res.send({
                    state: 'failure',
                    message: "Question already exists"
                }, 400);
            }
           else {
                if (req.files.file_upload) {
                    console.log(req.files);
                    for (var i = 0; i < req.files.file_upload.length; i++) {
                        for (var j = 0; j < employeeAssessmentForm.employee_list.length; j++) {
                            if (employeeAssessmentForm.employee_list[j].question_type === 'Multiple Choose') {
                                employeeAssessmentForm.employee_list[j].employee_assessment_file_attachment_file_url = req.files.file_upload[i].location;
                                employeeAssessmentForm.employee_list[j].employee_assessment_file_attachment_file_name = req.files.file_upload[i].originalname;
                            }
                        }
                    }
                }
                employeeAssessment.question_EN = employeeAssessmentForm.question_EN;
                employeeAssessment.question_type = employeeAssessmentForm.question_type;
                employeeAssessment.options = employeeAssessmentForm.options;
                employeeAssessment.correct_answer = employeeAssessmentForm.correct_answer;
                employeeAssessment.franchisee_id = employeeAssessmentForm.franchisee_id;
                employeeAssessment.save(function (err, employeeAssessment) {
                    console.log('131',employeeAssessment);
                    if (err) {
                        return res.send({
                            state: "err",
                            message: "Something went wrong.We are looking into it."
                        }, 500);
                    } else {
                        return res.send({
                            state: "success",
                            message: "Employee assessment question created"
                        }, 200);
                    }
                })
            }

        })
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
})

// To get all employee asessment question
router.get('/get_all_employee_assessment_question', function (req, res) {
    try {
        EmployeeAssessment.find({}, function (err, question) {
            if (err) {
                return res.send(500, err);
            }
            if (!question) {
                res.send({
                    message: "Questions not found",
                    state: "failure",
                    data: []
                }, 201);
            } else {
                res.send({
                    state: "success",
                    data: question
                }, 200);
            }
        })
    } catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
});

router.put('/update_employee_assessment_question', fileupload, function(req, res){
    var employeeAssessmentEditForm = JSON.parse(req.body.question);
    console.log(employeeAssessmentEditForm);
    try{
      EmployeeAssessment.findById({_id: employeeAssessmentEditForm.question_id},function(err,question){
    if(err){
      return res.send({
        state:"err",
        message:"Something went wrong.We are looking into it."
      },500);
    }
    if (question){
        employeeAssessment.question_EN = employeeAssessmentEditForm.question_EN;
        employeeAssessment.question_type = employeeAssessmentEditForm.question_type;
        employeeAssessment.options = employeeAssessmentEditForm.options;
        employeeAssessment.correct_answer - employeeAssessmentEditForm.correct_answer;
      if (req.file) {
        console.log(req.file);
        employeeAssessment.employee_assessment_file_attachment_file_url = req.file.location;
        employeeAssessment.employee_assessment_file_attachment_file_name = req.file.key;
        employeeAssessment.employee_assessment_file_attachment_file_type = req.file.contentType;
      }
      employeeAssessment.save(function(err, employeeAssessment){
        if(err){
          res.send({
             state:"err",
             message:"Something went wrong."
         },500);
        }
     else{
         res.send({
             state:"success",
             message:"Question Updated."
         },200);
     }
      });
    }
    if(!question){
      res.send({
          state:"failure",
          message:"Failed to update"
      },400);
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

//To delete question by question id
router.delete('/delete_employee_assessent_question/:id', function (req, res) {
    try {
        EmployeeAssessment.findByIdAndRemove({ _id: req.params.id }, function (err, question) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong. We are looking into it'
                }, 500);
            }
            else {
                return res.send({
                    state: 'success',
                    message: 'Question removed'
                }, 200);
            }
        });
    }
    catch (err) {
        res.send({
            state: 'error',
            message: err
        }, 500);
    }
});

//To get answers
router.put('/employee_assessment_answer',function(req,res){
    try{
        EmployeeAssessmentSubmitted.findOne({franchisee_id:req.body.franchisee_id},function(err,answer){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(answer){
                return res.send({
                    state:"failure",
                    message:"This person has already attempt this test."
                },200);
            }
            else{
                var answer = new EmployeeAssessmentSubmitted();
                var right_answer = 0;
                var answer_array = req.body.employee_assessment_list;
                for(var i=0;i<answer_array.length;i++){
                    if(answer_array[i].correct_answer == answer_array[i].selected_option){
                        right_answer = right_answer + 1;
                    }
                }
                answer.employee_assessment_list = req.body.employee_assessment_list;
                answer.franchisee_id = req.body.franchisee_id;
                answer.employee_answers = right_answer;
                answer.total_questions = req.body.total_questions;
                answer.employee_assessment_status = 'Completed';
                answer.save(function(err,answer){
                     if(err){
                        return res.send({
                            state:"error",
                            message:err
                        },500);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:"Test Completed"
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

module.exports = router;