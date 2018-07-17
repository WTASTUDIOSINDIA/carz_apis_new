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
var EmployeeDetails = mongoose.model('EmployeeDetails');
var EmployeeAssessmentType = mongoose.model('EmployeeAssessmentType');
var EmployeeAssessmentTypeOfFranchisee = mongoose.model('EmployeeAssessmentTypeOfFranchisee');
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

// To create assessment types
router.post('/create_assessemnt_type', function (req, res) {
    try {
        EmployeeAssessmentType.findOne({ assessment_type_name: req.body.assessment_type_name, franchisor_id: req.body.franchisor_id }, function (err, assessment) {
            if (err) {
                res.send({
                    state: "failure",
                    message: "Something went wrong."
                }, 500);
            }
            if (assessment) {
                res.send({
                    state: "failure",
                    message: "This assessment name already exists."
                }, 200);
            }
            else {
                console.log(assessment);
                assessment = new EmployeeAssessmentType();
                assessment.assessment_type_name = req.body.assessment_type_name;
                assessment.franchisor_id = req.body.franchisor_id;
                assessment.save(function (err, assessment) {
                    console.log('assessment65', assessment);
                    if (err) {
                        res.send({
                            state: "failure",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Assessment Type created successfully"
                        }, 200);
                    }
                });
            }
        });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
})

// TO get assessment type
router.get('/get_assessments_type_name/:franchisor_id', function (req, res) {
    try {
        EmployeeAssessmentType.find({ franchisor_id: req.params.franchisor_id }, function (err, assessments) {
            if (err) {
                return res.send(500, err);
            }
            if (!assessments) {
                res.send({
                    message: "Assessments type not found",
                    state: "failure",
                }, 201);
            }
            else {
                res.send({
                    state: "success",
                    data: assessments
                }, 200);
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
});
// To delete all assessment type names
router.delete('/delete_assessment_type_names', function (req, res) {
    try {
        EmployeeAssessmentType.remove({}, function (err, assessments) {
            if (err) {
                return res.send(500, err);
            }
            if (!assessments) {
                res.send({
                    message: "Assessments are not found",
                    state: "failure",
                }, 201);
            }
            else {
                res.send({
                    state: "success",
                    message: 'Assessments type removed'
                }, 200);
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
});
//To delete assessment type name by assessment id
router.delete('/delete_assessment_type_name_by_id/:id', function (req, res) {
    try {
        EmployeeAssessmentType.findByIdAndRemove({ _id: req.params.id }, function (err, assessment) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong. We are looking into it'
                }, 500);
            }
            else {
                return res.send({
                    state: 'success',
                    message: 'Assessment type name removed'
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
//To save employee assessment type
router.post('/save_employee_assessment_type', function (req, res) {
    try {
        EmployeeAssessmentTypeOfFranchisee.findOne({ 'employee_id': req.body.employee_id }, function (err, employeeType) {
            if (err) {
                res.send({
                    state: "failure",
                    message: "Something went wrong."
                }, 500);
            }
            if (employeeType) {
                saveEmployeeAssessmentType(req.params.employee_id, res);
            }
            else {
                console.log('166', req.body.data);
                for (var i = 0; i < req.body.data.length; i++) {
                    employeeType = new EmployeeAssessmentTypeOfFranchisee();
                    employeeType.assessment_type_id = req.body.data[i]._id;
                    console.log('166', req.body.data[i]._id);
                    employeeType.assessment_type_name = req.body.data[i].assessment_type_name;
                    console.log('168', req.body.data[i].assessment_type_name);
                    employeeType.employee_id = req.body.employee_id;
                    employeeType.save(function (err, employeeType) {
                        console.log('169', employeeType);
                        if (err) {
                            res.send({
                                state: "failure",
                                message: "Something went wrong."
                            }, 500);
                        }
                        else {
                            // saveEmployeeAssessmentType(req.params.employee_id, res);
                            EmployeeAssessmentTypeOfFranchisee.find({ employee_id: req.body.employee_id }, function (err, employeeType) {
                                if (!employeeType) {
                                    res.send({
                                        state: "failure",
                                        employeeType: []
                                    }, 201);
                                }
                                else {
                                    res.send({
                                        state: "success",
                                        data: employeeType
                                    }, 200);
                                    console.log('data', employeeType);
                                }
                            })
                        }
                    });
                }


            }
        });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
})

function saveEmployeeAssessmentType(employee_id, res) {
    EmployeeAssessmentTypeOfFranchisee.find({ employee_id: employee_id }, function (err, employeeType) {
        if (!employeeType) {
            res.send({
                state: "failure",
                employeeType: []
            }, 201);
        }
        else {
            res.send({
                state: "success",
                data: employeeType
            }, 200);
            console.log('data', employeeType);
        }
    })
}

//To get  employee assessment type
router.get('/get_save_employee_assessment_type/:employee_id', function (req, res) {
    try {
        saveEmployeeAssessmentType(req.params.employee_id, res);
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
});
//To delete saved assessment type
router.delete('/delete_employee_assessment_type', function (req, res) {
    try {
        EmployeeAssessmentTypeOfFranchisee.remove({}, function (err, employeeType) {
            if (err) {
                return res.send(500, err);
            }
            if (!employeeType) {
                res.send({
                    message: "Saved Assessments not found",
                    state: "failure",
                }, 201);
            }
            else {
                res.send({
                    state: "success",
                    message: ' Saved Assessments type removed'
                }, 200);
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
});




//To create employee assessment questions
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
                        console.log('64', employeeAssessment);
                        for (var j = 0; j < employeeAssessment.length; j++) {
                            if (employeeAssessment[j].question_type = 'Multiple Choice') {
                                employeeAssessment[j].employee_assessment_file_attachment_file_url = req.files.file_upload[i].location;
                                employeeAssessment[j].employee_assessment_file_attachment_file_name = req.files.file_upload[i].originalname;
                            }
                        }
                    }
                }
                console.log('126', employeeAssessmentForm.question_EN);
                console.log('127', question);
                var employeeAssessment = new EmployeeAssessment();
                employeeAssessment.question_EN = employeeAssessmentForm.question_EN;
                employeeAssessment.question_type = employeeAssessmentForm.question_type;
                employeeAssessment.options = employeeAssessmentForm.options;
                employeeAssessment.assessment_type_id = employeeAssessmentForm.assessment_type_id;
                // question.franchisee_id = employeeAssessmentForm.franchisee_id;
                employeeAssessment.employee_answer = employeeAssessmentForm.employee_answer;
                employeeAssessment.save(function (err, employeeAssessment) {
                    console.log('131', employeeAssessment);
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


//to get assessment type questions by type id
router.get('/get_assessment_questions/:assessment_type_id', function (req, res) {
    try {
        EmployeeAssessment.find({ assessment_type_id: req.params.assessment_type_id }, function (err, question) {
            if (err) {
                return res.send(500, err);
            }
            if (question.length == 0) {
                res.send({
                    message: "Questions not found",
                    state: "failure",
                    data: []
                }, 201);
            }
            else {
                res.send({
                    state: "success",
                    data: question
                }, 200);
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
});
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
            question.assessment_type = employeeAssessmentEditForm.assessment_type;
            question.franchisee_id = employeeAssessmentEditForm.franchisee_id;
            question.options = employeeAssessmentEditForm.options;
            question.employee_answer = employeeAssessmentEditForm.employee_answer;
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

//To send answers
router.put('/employee_assessment_answer', function (req, res) {
    try {
        EmployeeAssessmentSubmitted.findOne({ employee_id: req.body.employee_id }, function (err, answer) {
            if (err) {
                return res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            var answered_questions_list = [];
            var question_data = {
                "question_id": req.body.question_id,
                "employee_answer": req.body.employee_answer,
                "question_type": req.body.question_type,
                "correct_answer": req.body.correct_answer,
                "employee_id":req.body.employee_id,
                "assessment_type_id": req.body.assessment_type_id
            };
            if (answer) {
                answer.employee_assessment_list.push(question_data);
                answer.employee_answer = req.body.employee_answer;
                answer.employee_id = req.body.employee_id;
                answer.franchisee_id = req.body.franchisee_id;
                answer.assessment_type_id = req.body.assessment_type_id;
                answer.employee_assessment_status = req.body.employee_assessment_status;
                answer.total_questions = req.body.total_questions;
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
                            message: "Question saved successfully!"
                        }, 200);
                    }
                })
                // return res.send({
                //     state: "failure",
                //     message: "This person has already attempt this test."
                // }, 200);
            }
            else {
                answered_questions_list.push(question_data);
                var answer = new EmployeeAssessmentSubmitted();
                answer.employee_assessment_list = answered_questions_list;
                answer.employee_id = req.body.employee_id
                answer.franchisee_id = req.body.franchisee_id;
                answer.assessment_type_id = req.body.assessment_type_id;
                answer.employee_assessment_status = req.body.employee_assessment_status;
                answer.total_questions = req.body.total_questions;
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
                            message: "Question 01 saved successfully",
                            data: answer
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

//To submit employee assessment question list
router.put('/submit_employee_assessmnent/:employee_id', function (req,res){
    // try{
        EmployeeAssessmentSubmitted.findOne({employee_id: req.params.employee_id}, function (err ,answer){
            if(err){
                return res.send({
                    state:"error",
                    message: err,
                },500)
            }
            if(!answer){
                return res.send({
                    state:"failure",
                    message:"No answers found",
                },400);
            }
            else{
                var question_data = {
                    "question_id": req.body.question_id,
                    "employee_answer": req.body.employee_answer,
                    "question_type": req.body.question_type,
                    "correct_answer": req.body.correct_answer,
                    "employee_id":req.body.employee_id,
                    "assessment_type_id": req.body.assessment_type_id

                };
                console.log('614', question_data);
                console.log('615', answer.employee_assessment_list);
                console.log('616', answer);
                for(var i=0; i<answer.employee_assessment_list; i++){
                    if(answer.employee_assessment_list[i].question_id === question_data.question_id){
                        answer.employee_assessment_list[i] = question_data;
                    }
                    else {
                        answer.employee_assessment_list.push(question_data);
                    }
                }
                answer.employee_assessment_list.push(question_data);
                answer.employee_id = req.body.employee_id;
                answer.franchisee_id = req.body.franchisee_id;
                answer.assessment_type_id = req.body.assessment_type_id;
                answer.employee_assessment_status = req.body.employee_assessment_status;
                answer.assessment_type.id= req.body.assessment_type.id;
                answer.assessment_type.status = true;
                answer.total_questions = req.body.total_questions;
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
                            message: "Question saved successfully",
                            data: answer
                        }, 200);
                    }
                })
            }
        })
    // }
})
//To get reports
router.get('/get_emp_assessment_report/:employee_id', function (req, res) {
    try {
        EmployeeAssessmentSubmitted.findOne({ employee_id: req.params.employee_id }, function (err, report) {
            if (err) {
                return res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            if (!report) {
                return res.send({
                    state: "success",
                    message: "Employee has not attempt the test yet.",
                    data: []
                }, 200);
            }
            if (report) {
                EmployeeAssessmentType.find({}, function (err, list) {
                    var graph_array = [];
                    const obj = {
                        "employee_id": report.employee_id,
                        "correct_answer": report.correct_answer,
                        "total_questions": report.total_questions
                    };
                    for (var i = 0; i < list.length; i++) {
                        var question = {
                            ques_head_val: list[i].question_type_name,
                            correct_opt: 0,
                            total_ques_by_type: 0
                        };
                        for (var j = 0; j < report.employee_assessment_list.length; j++) {
                            if ((question.ques_head_val == report.employee_assessment_list[j].question_type)) {
                                question.total_ques_by_type = question.total_ques_by_type + 1;
                                if ((report.employee_assessment_list[j].selected_option == report.employee_assessment_list[j].correct_answer)) {
                                    question.correct_opt = question.correct_opt + 1;
                                }
                            }
                        }
                        graph_array.push(question);
                    }
                    return res.send({
                        state: "success",
                        message: "Result is out",
                        data: report,
                        graph_data: graph_array
                    }, 200);
                })
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
});
//To get reports
router.get('/get_emp_assessment_submitted_list/:employee_id', function (req, res) {
    try {
        EmployeeAssessmentSubmitted.findOne({ employee_id: req.params.employee_id }, function (err, list) {
            if (err) {
                return res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            if (!list) {
                return res.send({
                    state: "success",
                    message: "Employee has not attempt the test yet.",
                    data: []
                }, 200);
            }
            if (list) {
                return res.send({
                    state: "success",
                    message: "Result is out",
                    data: list
                }, 200);
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
});

router.delete('/delete_employee_assessment_submitted_list/:employee_id', function (req, res) {
    try {
        EmployeeAssessmentSubmitted.remove({ 'employee_id': req.params.employee_id }, function (err, list) {
            if (err) {
                return res.sendStatus({
                    state: err,
                    message: 'Something went wrong, we are looking into it.'
                }, 500);
            }
            if (!list) {
                res.send({
                    state: err,
                    message: 'Employee list not found.'
                }, 201);
            }
            else {
                res.send({
                    state: 'success',
                    message: 'Employee list deleted'
                }, 200);
            }
        })
    }
    catch (err) {
        return res.send({
            state: 'err',
            message: err
        })
    }
})

//To create employee fileds
router.post('/create_employee_details', function (req, res) {
    // try {
    EmployeeDetails.findOne({ _id: req.body.franchisee_id }, function (err, employeeDetails) {
        if (err) {
            res.send({
                state: 'failure',
                message: 'Something went wrong',
            }, 500)
        }
        if (employeeDetails) {
            res.send({
                state: "failure",
                message: "This Employee already exists."
            }, 400);
        }
        else {
            employeeDetails = new EmployeeDetails();
            employeeDetails.employee_name = req.body.employee_name;
            employeeDetails.employee_occupation = req.body.employee_occupation;
            employeeDetails.employee_email = req.body.employee_email;
            employeeDetails.employee_city = req.body.employee_city;
            employeeDetails.employee_state = req.body.employee_state;
            employeeDetails.employee_address = req.body.employee_address;
            employeeDetails.employee_mobile_number = req.body.employee_mobile_number;
            employeeDetails.employee_age = req.body.employee_age;
            employeeDetails.employee_company_of_experience = req.body.employee_company_of_experience;
            employeeDetails.employee_experience_in = req.body.employee_experience_in;
            employeeDetails.employee_vertical = req.body.employee_vertical;
            employeeDetails.employee_days_experience = req.body.employee_days_experience;
            employeeDetails.franchisee_id = req.body.franchisee_id;
            employeeDetails.save(function (err, employeeDetails) {
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
    // }
    // catch (err) {
    //     res.send({
    //         state: 'err',
    //         message: err
    //     },500)
    // }
})

//To get create employee details
router.get('/get_all_employees', function (req, res) {
    try {
        EmployeeDetails.find({}, function (err, employeeDetails) {
            if (err) {
                return res.send({
                    state: 'error',
                    message: err
                }, 500);
            }
            if (!employeeDetails) {
                res.send({
                    state: 'failure',
                    message: 'Employees not found.',
                    employeeDetails: []
                }, 400)
            }
            else {
                res.send({
                    state: 'success',
                    data: employeeDetails
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
router.get('/get_employee_details/:id', function (req, res) {
    try {
        EmployeeDetails.findById({ _id: req.params.id }, function (err, employeeDetails) {
            if (err) {
                return res.send(500, err);
            }
            if (!employeeDetails) {
                res.send({
                    state: "failure",
                    employeeDetails: []
                }, 400);
            }
            else {
                res.send({
                    state: "success",
                    data: employeeDetails
                }, 200);
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
});

// To get employee details by franchisee_id
router.get('/get_employee_details/:franchisee_id', function (req, res) {
    try {
        EmployeeDetails.findById({ 'franchisee_id': req.params.franchisee_id }, function (err, employeeDetails) {
            if (err) {
                return res.send(500, err);
            }
            if (!employeeDetails) {
                res.send({
                    state: "failure",
                    employeeDetails: []
                }, 400);
            }
            else {
                res.send({
                    state: "success",
                    data: employeeDetails
                }, 200);
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
});

//To edit employee details
router.put('/update_employee_details', function (req, res) {
    try {
        EmployeeDetails.findById({ _id: req.body._id }, function (err, employeeDetails) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong'
                }, 500)
            }
            if (employeeDetails) {
                employeeDetails.employee_name = req.body.employee_name;
                employeeDetails.employee_occupation = req.body.employee_occupation;
                employeeDetails.employee_email = req.body.employee_email;
                employeeDetails.employee_city = req.body.employee_city;
                employeeDetails.employee_state = req.body.employee_state;
                employeeDetails.employee_address = req.body.employee_address;
                employeeDetails.employee_mobile_number = req.body.employee_mobile_number;
                employeeDetails.employee_age = req.body.employee_age;
                employeeDetails.employee_company_of_experience = req.body.employee_company_of_experience;
                employeeDetails.employee_experience_in = req.body.employee_experience_in;
                employeeDetails.employee_vertical = req.body.employee_vertical;
                employeeDetails.employee_days_experience = req.body.employee_days_experience;
                employeeDetails.franchisee_id = req.body.frachisee_id;
                employeeDetails.save(function (err, employeeDetails) {
                    if (err) {
                        res.send({
                            state: 'error',
                            message: 'Something went wrong'
                        }, 500)
                    }
                    else {
                        res.send({
                            state: 'success',
                            message: 'Employee updated'
                        }, 200)
                    }
                })
            }
            if (!employeeDetails) {
                res.send({
                    state: "failure",
                    message: "Failed to update."
                }, 400);
            }
        })
    }
    catch (err) {
        res.send({
            state: 'err',
            message: 'err'
        })
    }
})

// To delete employee details
router.delete('/delete_employee_details/:id', function (req, res) {
    try {
        EmployeeDetails.findByIdAndRemove({ _id: req.params.id }, function (err, employeeDetails) {
            if (err) {
                return res.sendStatus({
                    state: err,
                    message: 'Something went wrong, we are looking into it.'
                }, 500);
            }
            if (!employeeDetails) {
                res.send({
                    state: err,
                    message: 'Employee not found.'
                }, 201);
            }
            else {
                res.send({
                    state: 'success',
                    message: 'Employee deleted'
                }, 200);
            }
        })
    }
    catch (err) {
        return res.send({
            state: 'err',
            message: err
        })
    }
})

module.exports = router;
