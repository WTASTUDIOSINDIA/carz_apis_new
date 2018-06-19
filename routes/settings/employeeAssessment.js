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


router.post('/create_employee_assessment_question', fileupload, function (req, res) {
    var employeeAssessmentForm = JSON.parse(req.body.employeeAssessment);
    console.log(employeeAssessmentForm);
    try {
        EmployeeAssessment.findOne({ _id: employeeAssessmentForm.franchisee_id }, function (err, question) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong. We are looking into it.'
                }, 500);
            }
            // if (question) {
            //     return res.send({
            //         state: 'failure',
            //         message: "Question already exists"
            //     }, 400);
            // }
            else {
                if (req.files.file_upload) {
                    console.log(req.files.file_upload);
                    for (var i = 0; i < req.files.file_upload.length; i++) {
                        for (var j = 0; j < employeeAssessmentForm.employee_list.length; j++) {
                            if (employeeAssessmentForm.employee_list[j].question_type === 'Multiple Choice') {
                                employeeAssessmentForm.employee_list[j].employee_assessment_file_attachment_file_url = req.files.file_upload[i].location;
                                employeeAssessmentForm.employee_list[j].employee_assessment_file_attachment_file_name = req.files.file_upload[i].originalname;
                            }
                        }
                    }
                }
                console.log('126', employeeAssessmentForm.question_EN);
                console.log('127', question);
                var question = new EmployeeAssessment();
                question.question_EN = employeeAssessmentForm.question_EN;
                question.question_type = employeeAssessmentForm.question_type;
                question.options = employeeAssessmentForm.options;
                question.correct_answer = employeeAssessmentForm.correct_answer;
                question.franchisee_id = employeeAssessmentForm.franchisee_id;
                question.save(function (err, question) {
                    console.log('131', question);
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

router.put('/update_employee_assessment_question', fileupload, function (req, res) {
    var employeeAssessmentEditForm = JSON.parse(req.body.employeeAssessment);
    console.log('190',employeeAssessmentEditForm);
    // try {
        EmployeeAssessment.findOne({ _id: employeeAssessmentEditForm.question_id }, function (err, question) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (!question) {
                res.send({
                    state: "failure",
                    message: "Failed to update"
                }, 400);
            }
            else {
                if (req.files.file_upload) {
                    for (var i = 0; i < req.files.file_upload.length; i++) {
                        for (var j = 0; j < employeeAssessmentEditForm.employee_list.length; j++) {
                            if (employeeAssessmentEditForm.employee_list[j].question_type === 'Multiple Choose') {
                                employeeAssessmentEditForm.employee_list[j].employee_assessment_file_attachment_file_url = req.files.file_upload[i].location;
                                employeeAssessmentEditForm.employee_list[j].employee_assessment_file_attachment_file_name = req.files.file_upload[i].originalname;
                            }
                        }
                    }
                }
                    console.log('215', employeeAssessmentEditForm.question);
                    question.question_EN = employeeAssessmentEditForm.question_EN;
                    question.question_type = employeeAssessmentEditForm.question_type;
                    question.options = employeeAssessmentEditForm.options;
                    question.correct_answer = employeeAssessmentEditForm.correct_answer;
                    question.save(function (err, question) {
                        if (err) {
                            res.send({
                                state: "err",
                                message: "Something went wrong."
                            }, 500);
                        }
                        else {
                            res.send({
                                state: "success",
                                message: "Question Updated."
                            }, 200);
                        }
                    });
                
            }

        })
    // }
    // catch (err) {
    //     return res.send({
    //         state: "error",
    //         message: err
    //     });
    // }
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
router.put('/employee_assessment_answer', function (req, res) {
    try {
        EmployeeAssessmentSubmitted.findOne({ franchisee_id: req.body.franchisee_id }, function (err, answer) {
            if (err) {
                return res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            if (answer) {
                return res.send({
                    state: "failure",
                    message: "This person has already attempt this test."
                }, 200);
            }
            else {
                var answer = new EmployeeAssessmentSubmitted();
                var right_answer = 0;
                var answer_array = req.body.employee_assessment_list;
                for (var i = 0; i < answer_array.length; i++) {
                    if (answer_array[i].correct_answer == answer_array[i].selected_option) {
                        right_answer = right_answer + 1;
                    }
                }
                answer.employee_assessment_list = req.body.employee_assessment_list;
                answer.franchisee_id = req.body.franchisee_id;
                answer.employee_answers = right_answer;
                answer.total_questions = req.body.total_questions;
                answer.employee_assessment_status = 'Completed';
                answer.save(function (err, answer) {
                    if (err) {
                        return res.send({
                            state: "error",
                            message: err
                        }, 500);
                    }
                    else {
                        return res.send({
                            state: "success",
                            message: "Test Completed"
                        }, 200);
                    }
                })
            }
        });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
});

module.exports = router;