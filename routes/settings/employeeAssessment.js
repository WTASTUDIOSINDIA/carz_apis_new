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
var CreateEmployee = mongoose.model('CreateEmployee')
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
                        console.log('64', employeeAssessmentForm);
                        for (var j = 0; j < employeeAssessmentForm.length; j++) {
                            if (employeeAssessmentForm[j].question_type = 'Multiple Choice') {
                                employeeAssessmentForm[j].employee_assessment_file_attachment_file_url = req.files.file_upload[i].location;
                                employeeAssessmentForm[j].employee_assessment_file_attachment_file_name = req.files.file_upload[i].originalname;
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
                question.employee_answers = employeeAssessmentForm.employee_list;
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
    console.log('190', employeeAssessmentEditForm);
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
            console.log('215', employeeAssessmentEditForm.question_EN);
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
                            message: "Employee Assessment Completed"
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

//To create employee fileds
router.post('/create_employee_details', function (req, res) {
    try {
        CreateEmployee.findOne({ _id: employeeDetails.franchisee_id }, function (err, createEmployeeDetails) {
            if (err) {
                res.send({
                    state: 'failure',
                    message: 'Something went wrong',
                }, 500)
            }
            if (createEmployeeDetails) {
                res.send({
                    state: "failure",
                    message: "This Employee already exists."
                }, 400);
            }
            else {
                createEmployeeDetails = new CreateEmployee();
                createEmployeeDetails.employee_name = req.body.employee_name;
                createEmployeeDetails.employee_occupation = req.body.employee_occupation;
                createEmployeeDetails.employee_email = req.body.employee_email;
                createEmployeeDetails.employee_city = req.body.employee_city;
                createEmployeeDetails.employee_state = req.body.employee_state;
                createEmployeeDetails.employee_address = req.body.employee_address;
                createEmployeeDetails.employee_mobile_number = req.body.employee_mobile_number;
                createEmployeeDetails.employee_age = req.body.employee_age;
                createEmployeeDetails.employee_company_of_experience = req.body.employee_company_of_experience;
                createEmployeeDetails.employee_experience_in = req.body.employee_experience_in;
                createEmployeeDetails.employee_vertical = req.body.employee_vertical;
                createEmployeeDetails.employee_days_experience = req.body.employee_days_experience;
                createEmployeeDetails.save(function (err, createEmployeeDetails) {
                    if (err) {
                        res.send({
                            state: 'failure',
                            message: 'Something went wrong, we are looking into it.'
                        }, 500)
                    }
                    else {
                        res.send({
                            state: 'success',
                            message: 'Employee created successfully'
                        }, 200)
                    }
                })
            }
        })
    }
    catch (err) {
        res.send({
            state: 'err',
            message: err
        })
    }
})

//To get create employee details
router.get('/get_all_employee', function (req, res) {
    try {
        CreateEmployee.find({}, function (err, createEmployeeDetails) {
            if (err) {
                return res.send({
                    state: 'error',
                    message: err
                }, 500);
            }
            if (!createEmployeeDetails) {
                res.send({
                    state: 'failure',
                    message: 'Employees not found.',
                    createEmployeeDetails: []
                }, 400)
            }
            else {
                res.send({
                    state: 'success',
                    data: createEmployeeDetails
                }, 200)
            }
        })
    }
    catch (err) {
        res.send({
            state: 'err',
            message: err
        })
    }
})

// To get employee details by id
router.get('/get_employee_details/:id', function (req,res){
    try {
        CreateEmployee.findById({_id:req.body.employee_id}, function (err,createEmployeeDetails){
            if(err){
                return res.send({
                    state:'error',
                    message:err
                },500);
            }
            if(!createEmployeeDetails){
                return res.send({
                    state:'failure',
                    createEmployeeDetails:[]
                },400)
            }
            else{
                return res.send({
                    state:'success',
                    daat:createEmployeeDetails
                },200)
            }
        })
    }
    catch (err){
        return res.send({
            state:'err',
            message:err
        })
    }
})

//To edit employee details
router.put('/update_employee_details', function (req, res){
    try{
        CreateEmployee.findOne({_id:req.body.employee_id}, function (err,createEmployeeDetails){
            if(err){
                return res.send({
                    state:'err',
                    message:'Something went wrong'
                },500)
            }
            if(createEmployeeDetails){
                createEmployeeDetails.employee_name = req.body.employee_name;
                createEmployeeDetails.employee_occupation = req.body.employee_occupation;
                createEmployeeDetails.employee_email = req.body.employee_email;
                createEmployeeDetails.employee_city = req.body.employee_city;
                createEmployeeDetails.employee_state = req.body.employee_state;
                createEmployeeDetails.employee_address = req.body.employee_address;
                createEmployeeDetails.employee_mobile_number = req.body.employee_mobile_number;
                createEmployeeDetails.employee_age = req.body.employee_age;
                createEmployeeDetails.employee_company_of_experience = req.body.employee_company_of_experience;
                createEmployeeDetails.employee_experience_in = req.body.employee_experience_in;
                createEmployeeDetails.employee_vertical = req.body.employee_vertical;
                createEmployeeDetails.employee_days_experience = req.body.employee_days_experience;
                createEmployeeDetails.franchisee_id = req.body.frachisee_id;              
                createEmployeeDetails.save(function(err,createEmployeeDetails){
                    if(err){
                        res.send({
                            state:'err',
                            message:'Something went wrong'
                        },500)
                    }
                    else{
                        res.send({
                            state:'success',
                            message:'Employee updated'
                        },200)
                    }
                })
            }
            if(!createEmployeeDetails){
                res.send({
                    state:"failure",
                    message:"Failed to update."
                },400);
            }
        })
    }
    catch(err){
        res.send({
            state:'err',
            message:'err'
        })
    }
})

module.exports = router;