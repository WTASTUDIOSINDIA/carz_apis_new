var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');;
var multer = require('multer');
var path = require('path');
var fs = require('fs');
const objectId = mongoose.Types.ObjectId;
var csv = require('csv');
var path = require('path');
var EmployeeAssessment = mongoose.model('EmployeeAssessment');
var CarModels = mongoose.model('CarModels');
var nodemailer = require('nodemailer');
var EmployeeAssessmentSubmitted = mongoose.model('EmployeeAssessmentSubmitted');
var EmployeeDetails = mongoose.model('EmployeeDetails');
var EmployeeAssessmentType = mongoose.model('EmployeeAssessmentType');
var EmployeeAssessmentTypeOfFranchisee = mongoose.model('EmployeeAssessmentTypeOfFranchisee');
var Versions = mongoose.model('Versions');
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
        bucket: 'carzdev',
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
        EmployeeAssessmentType.findOne({ assessment_type_name: {$regex: new RegExp(req.body.assessment_type_name, 'i')}, franchisor_id: req.body.franchisor_id }, function (err, assessment) {
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
                assessment.description = req.body.description;
                assessment.franchisor_id = req.body.franchisor_id;
                assessment.pass_percentage = req.body.pass_percentage;
                assessment.assessment_duration = req.body.assessment_duration;
                assessment.version_id = req.body.version_id;
                assessment.createdAt = Date.now();
                assessment.model_id = req.body.model_id;
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
                            message: "Assessment Type created successfully",
                            data:assessment
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

//To update assessment type
router.put('/update_assessment_type', function (req, res) {
    try {
        EmployeeAssessmentType.findOne({ assessment_type_name: {$regex: new RegExp(req.body.assessment_type_name,'i')} }, function (err, assessment) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong'
                }, 500)
            }
            if (assessment) {
                res.send({
                    state: "failure",
                    message: "Name already exists!"
                }, 400);
            }
            if (!assessment) {
                let data ={};
                data.assessment_type_name = req.body.assessment_type_name;
                data.description = req.body.description;
                data.franchisor_id = req.body.franchisor_id;
                data.pass_percentage = req.body.pass_percentage;
                data.assessment_duration = req.body.assessment_duration;
                EmployeeAssessmentType.findByIdAndUpdate(req.body._id, data, {new:true}, function (err, assessment) {
                    if (err) {
                        res.send({
                            state: 'error',
                            message: 'Something went wrong'
                        }, 500)
                    }
                    else {
                        res.send({
                            state: 'success',
                            message: 'Assessment type updated'
                        }, 200)
                    }
                })
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
// TO get assessment type settings
router.get('/get_assessments_type_name/:model_id', function (req, res) {
    try {
        EmployeeAssessmentType.find({ model_id: req.params.model_id }, function (err, assessments) {
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

router.get('/get_assessments_type_name', function (req, res) {
    try {
        EmployeeAssessmentType.find({ }, function (err, assessments) {
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
                getEmployeeAssessmentTypes(req.body.employee_id, res);
            }
            else {
                console.log('166', req.body);
                // Versions.findOne({franchisor_id: req.body.franchisor_id, 
                //     version_type: 'e_assessments', 
                //     default: true}, function(err, version){
                        EmployeeAssessmentType.find({model_id: req.body.model_id}, function(err, assessments){
                            if (err) {
                                res.send({
                                    state: "failure",
                                    message: err
                                }, 500);
                            }
                            console.log('166', err);
                            console.log(assessments, '284');
                            for (var i = 0; i < assessments.length; i++) {
                                employeeType = new EmployeeAssessmentTypeOfFranchisee();
                                employeeType.assessment_type_id = assessments[i]._id;
                                employeeType.assessment_type_name = assessments[i].assessment_type_name;
                                employeeType.employee_id = req.body.employee_id;
                                employeeType.createdAt = assessments[i].createdAt;
                                employeeType.pass_percentage = assessments[i].pass_percentage;
                                employeeType.save(function (err, employeeType) {
                                    if (err) {
                                        res.send({
                                            state: "failure",
                                            message: "Something went wrong."
                                        }, 500);
                                    }
                                    else {
                                        // saveEmployeeAssessmentType(req.params.employee_id, res);
                                        EmployeeAssessmentTypeOfFranchisee.find({ employee_id: req.body.employee_id }, function (err, employeeType) {
                                            if (err) {
                                                res.send({
                                                    state: "failure",
                                                    data: err
                                                }, 201);
                                            }
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
                        })
                   // })

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

function getEmployeeAssessmentTypes(employee_id, res) {
    //EmployeeAssessmentTypeOfFranchisee.find({ employee_id: employee_id } , null, {sort: {date: 1}}, function (err, employeeType) {
        EmployeeAssessmentTypeOfFranchisee.find({ employee_id: employee_id}).sort({createdAt: 1}).exec(function (err, employeeType) {
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
        getEmployeeAssessmentTypes(req.params.employee_id, res);
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
        EmployeeAssessment.findOne({ question_EN: employeeAssessmentForm.question_EN, _id: employeeAssessmentForm.franchisee_id, question_EN:employeeAssessmentForm.question_EN }, function (err, question) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong. We are looking into it.'
                }, 500);
            }
            if (question) {
                return res.send({
                    state: 'failure',
                    message: "Question already exists"
                }, 400);
            }
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
                employeeAssessment.correct_answer = employeeAssessmentForm.correct_answer;
                employeeAssessment.assessment_type_id = employeeAssessmentForm.assessment_type_id;
                // question.franchisee_id = employeeAssessmentForm.franchisee_id;
                employeeAssessment.question_duration = employeeAssessmentForm.question_duration,
                employeeAssessment.question_percentage = employeeAssessmentForm.question_percentage
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
            question.correct_answer = employeeAssessmentEditForm.correct_answer;
            question.question_duration = employeeAssessmentEditForm.question_duration;
            question.question_percentage = employeeAssessmentEditForm.question_percentage;
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
// TO delete all questions
//To delete question by question id
router.delete('/delete_employee_assessent_question', function (req, res) {
    try {
        EmployeeAssessment.remove({ }, function (err, question) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong. We are looking into it'
                }, 500);
            }
            else {
                return res.send({
                    state: 'success',
                    message: 'Questions removed'
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
        EmployeeAssessmentSubmitted.findOne({ employee_id: req.body.employee_id, question_id: req.body.question_id }, function (err, answer) {
            if (err) {
                return res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            // var answered_questions_list = [];
            // var question_data = {
            //     "question_id": req.body.question_id,
            //     "employee_answer": req.body.employee_answer,
            //     "question_type": req.body.question_type,
            //     "correct_answer": req.body.correct_answer,
            //     "employee_id":req.body.employee_id,
            //     "assessment_type_id": req.body.assessment_type_id
            // };
            if (answer) {
                //answer.employee_assessment_list.push(question_data);
                answer.correct_answer = req.body.correct_answer;
                answer.employee_answer = req.body.employee_answer;
                if(req.body.correct_answer === req.body.employee_answer){
                    answer.is_answer_correct = true;
                }
                answer.employee_id = req.body.employee_id;
                answer.franchisee_id = req.body.franchisee_id;
                answer.question_id = req.body.question_id;
                answer.assessment_type_id = req.body.assessment_type_id;
                //answer.employee_assessment_status = req.body.employee_assessment_status;
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
                //answered_questions_list.push(question_data);
                var answer = new EmployeeAssessmentSubmitted();
                //answer.employee_assessment_list = answered_questions_list;
                 //answer.employee_assessment_list.push(question_data);
                 if(req.body.correct_answer === req.body.employee_answer){
                    answer.is_answer_correct = true;
                }
                 answer.correct_answer = req.body.correct_answer;
                 answer.employee_answer = req.body.employee_answer;
                 answer.employee_id = req.body.employee_id;
                 answer.franchisee_id = req.body.franchisee_id;
                 answer.question_id = req.body.question_id;
                 answer.assessment_type_id = req.body.assessment_type_id;
                 //answer.employee_assessment_status = req.body.employee_assessment_status;
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
router.put('/submit_employee_assessmnent', function (req,res){
    // try{
        EmployeeAssessmentSubmitted.findOne({question_id: req.body.question_id, employee_id: req.body.employee_id}, function (err ,answer){
            if(err){
                return res.send({
                    state:"error",
                    message: err,
                },500)
            }
            if (answer) {
                //answer.employee_assessment_list.push(question_data);
                answer.correct_answer = req.body.correct_answer;
                answer.employee_answer = req.body.employee_answer;
                if(req.body.correct_answer === req.body.employee_answer){
                    answer.is_answer_correct = true;
                }
                answer.employee_id = req.body.employee_id;
                answer.franchisee_id = req.body.franchisee_id;
                answer.question_id = req.body.question_id;
                answer.assessment_type_id = req.body.assessment_type_id;
                if(answer.correct_answer === req.body.employee_answer){
                    answer.incorrect_answer = false;
                }                
                //answer.employee_assessment_status = req.body.employee_assessment_status;
                answer.total_questions = req.body.total_questions;
                answer.save(function (err, answer) {
                    if (err) {
                        return res.send({
                            state: "error",
                            message: err
                        }, 500);
                    }
                    else {
                        EmployeeAssessmentTypeOfFranchisee.findOne({employee_id:req.body.employee_id, assessment_type_id : req.body.assessment_type_id}, function(err, assessment_type){
                            console.log('assessment_type_111', assessment_type)
                            assessment_type.assessment_status = true;
                            var answered_correct_questions_count = 0;
                            var total_questions_count_local = 0;                            
                            EmployeeAssessmentSubmitted.count({employee_id:req.body.employee_id, assessment_type_id : req.body.assessment_type_id, is_answer_correct: true}, function (err, saved_questions_count_server) {
                                answered_correct_questions_count = saved_questions_count_server;
                                console.log('answered_correct_questions_count', answered_correct_questions_count);
                                EmployeeAssessment.count({assessment_type_id : req.body.assessment_type_id}, function (err, total_questions_count_server) {
                                    total_questions_count_local = total_questions_count_server;
                                    console.log('total_questions_count_local', total_questions_count_local);
                                    var employee_percentage = 0;
                            if(answered_correct_questions_count == 0){
                                employee_percentage = 0;
                                console.log('all are incorrect answeres');
                            }
                            else {
                                employee_percentage = answered_correct_questions_count * 100 / total_questions_count_local;
                                console.log('no all are incorrect answeres');
                            }
                            
                            console.log(employee_percentage, 'assessment_type.employee_percentage');
                            if(employee_percentage >= assessment_type.pass_percentage){
                                assessment_type.assessment_qualified = true;
                            }
                            else {
                                assessment_type.assessment_qualified = false;
                                EmployeeDetails.findById({ _id: req.body.employee_id}, (err, data) => {
                                    if(err){
                                        console.log(err), 'data802'; 
                                        // return res.send({
                                        //     state:'err',
                                        //     message:'error'
                                        // },500)
                                    }
                                    if (data) {
                                       console.log(data), 'data803'; 
                                       mailSend(data.employee_email);
                                    }
                                })
                                function mailSend(reciever_mail) {

                                    var mailOptions = {
                                        to: reciever_mail,
                                        subject: 'Carz Employee Assessment Videos',
                                        from: "carzdev@gmail.com",
                                        headers: {
                                            "X-Laziness-level": 1000,
                                            "charset": 'UTF-8'
                                        },
    
                                        html: "<p>Your not qualified for employee assessment. Please click the below link to watch the videos and retake the test.</p><div><a href=https://www.youtube.com/watch?v=qHm9MG9xw1o> </a> </div><div><p>Best,</p><p>Carz.</p></div> "
                                    }
                                    var transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        secure: false, // use SSL
                                        port: 25, // port for secure SMTP
                                        auth: {
                                            user: 'carzdev@gmail.com',
                                            pass: 'Carz@123'
                                        }
                                    });
                                    transporter.sendMail(mailOptions, function (error, response) {
                                        if (error) {
                                            // return res.send(error);
                                            console.log(error);
                                        }
                                        else {
                                            // return res.send(response);
                                            console.log(response);
                                        }
                                    });
                                }
                            }
                            assessment_type.total_questions_count = total_questions_count_local;
                            assessment_type.answered_questions_count = answered_correct_questions_count;
                            assessment_type.employee_percentage = employee_percentage;
                            assessment_type.save(function(err, assessment_type){
                                if(err){
                                    console.log('Swamy111_err',err);
                                }                                
                                else {
                                    
                                    //based on all assessment types making employee as evaluated
                                    EmployeeAssessmentTypeOfFranchisee.find({employee_id: assessment_type.employee_id}, function(err, assessments){
                                       var evaluated_assessments_list = [];
                                        for(var j = 0; j<assessments.length; j++){
                                            (function (j) {
                                            if(assessments[j].assessment_qualified == true){
                                            //  console.log(data[j], 'yes this guy is qualified');
                                                evaluated_assessments_list.push((assessments[j]));
                                            }
                                        })(j);
                                        }
                                        if(evaluated_assessments_list.length == assessments.length){
                                            //A.findOneAndUpdate(conditions, update)
                                            EmployeeDetails.findOneAndUpdate({ _id: assessment_type.employee_id},  { $set: { evaluated_employee: true } }, function (err, employeeDetails) {
                                                console.log(employeeDetails, 'employeeDetails_swamy1');
                                            })
                                        }
                                    })
                                    return res.send({
                                    state: "success",
                                    message: "Question saved successfully!",
                                    data: assessment_type
                                }, 200);
                                }
                                
                            });
                                })
                            })                                                        
                        });
                        
                    }
                })
                // return res.send({
                //     state: "failure",
                //     message: "This person has already attempt this test."
                // }, 200);
            }
            else {
                //answered_questions_list.push(question_data);
                var answer = new EmployeeAssessmentSubmitted();
                //answer.employee_assessment_list = answered_questions_list;
                 //answer.employee_assessment_list.push(question_data);
                 answer.correct_answer = req.body.correct_answer;
                 answer.employee_answer = req.body.employee_answer;
                 if(req.body.correct_answer === req.body.employee_answer){
                    answer.is_answer_correct = true;
                }
                 answer.employee_id = req.body.employee_id;
                 answer.franchisee_id = req.body.franchisee_id;
                 answer.question_id = req.body.question_id;
                 answer.assessment_type_id = req.body.assessment_type_id;
                 //answer.employee_assessment_status = req.body.employee_assessment_status;
                 answer.total_questions = req.body.total_questions;
                answer.save(function (err, answer) {
                    if (err) {
                        return res.send({
                            state: "error",
                            message: err
                        }, 500);
                    }
                    else {
                        EmployeeAssessmentTypeOfFranchisee.findOne({employee_id:req.body.employee_id, assessment_type_id : req.body.assessment_type_id}, function(err, assessment_type){
                            console.log('assessment_type_222', assessment_type)
                            assessment_type.assessment_status = true;
                            var answered_correct_questions_count = 0;
                            var total_questions_count_local = 0;                            
                            EmployeeAssessmentSubmitted.count({employee_id:req.body.employee_id, assessment_type_id : req.body.assessment_type_id, is_answer_correct: true}, function (err, saved_questions_count_server) {
                                answered_correct_questions_count = saved_questions_count_server;
                                console.log('answered_correct_questions_count', answered_correct_questions_count);
                                EmployeeAssessment.count({assessment_type_id : req.body.assessment_type_id}, function (err, total_questions_count_server) {
                                    total_questions_count_local = total_questions_count_server;
                                    console.log('total_questions_count_local', total_questions_count_local);
                                    var employee_percentage = 0;
                            if(answered_correct_questions_count == 0){
                                employee_percentage = 0;
                            }
                            else {
                                employee_percentage = answered_correct_questions_count * 100 / total_questions_count_local;
                            }
                            
                            console.log(employee_percentage, 'assessment_type.employee_percentage');
                            if(employee_percentage >= assessment_type.pass_percentage){
                                assessment_type.assessment_qualified = true;
                            }
                            else {
                                assessment_type.assessment_qualified = false;
                            }
                            assessment_type.employee_percentage = employee_percentage;
                            assessment_type.total_questions_count = total_questions_count_local;
                            assessment_type.answered_questions_count = answered_correct_questions_count;
                            assessment_type.save(function(err, assessment_type){
                                console.log('Swamy222',assessment_type);
                                //based on all assessment types making employee as evaluated
                                    EmployeeAssessmentTypeOfFranchisee.find({employee_id: assessment_type.employee_id}, function(err, assessments){
                                       var evaluated_assessments_list = [];
                                        for(var j = 0; j<assessments.length; j++){
                                            (function (j) {
                                            if(assessments[j].assessment_qualified == true){
                                            //  console.log(data[j], 'yes this guy is qualified');
                                                evaluated_assessments_list.push((assessments[j]));
                                            }
                                        })(j);
                                        }
                                        if(evaluated_assessments_list.length == assessments.length){
                                            //A.findOneAndUpdate(conditions, update)
                                            EmployeeDetails.findOneAndUpdate({ _id: assessment_type.employee_id},  { $set: { evaluated_employee: true } }, function (err, employeeDetails) {
                                                console.log(employeeDetails, 'employeeDetails_swamy2');
                                            })
                                        }
                                    })
                                return res.send({
                                    state: "success",
                                    message: "Question saved successfully!", 
                                    data: assessment_type
                                }, 200);
                            });
                                })
                            })
                           
                            
                        });                        
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
        EmployeeAssessmentSubmitted.find({ employee_id: req.params.employee_id }, function (err, list) {
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
            employeeDetails.model_id = req.body.model_id;
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
                    CarModels.findOne({_id:req.body.model_id},function(err, models){
                        console.log(models, "1105");
                        if(err){
                            console.log(err, "1107");
                        }
                        if(models){
                            employeeDetails.model_name =  models.model_name;
                        employeeDetails.save(function (err, employeeDetails){
                          console.log(employeeDetails, "1108");
                        })
                        }
                        
                      })
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
//To create employee fileds
router.post('/create_model', function (req, res) {
    // try {
    CarModels.findOne({ model_name: {$regex: new RegExp(req.body.model_name, 'i')} , version_id: req.body.version_id}, function (err, model) {
        if (err) {
            res.send({
                state: 'failure',
                message: 'Something went wrong',
            }, 500)
        }
        if (model) {
            res.send({
                state: "failure",
                message: "This Model already exists."
            }, 400);
        }
        else {
            model = new CarModels();
            model.model_name = req.body.model_name;
            model.version_id = req.body.version_id;
            model.franchisor_id = req.body.franchisor_id;
           
            model.save(function (err, model) {
                if (err) {
                    res.send({
                        state: 'failure',
                        message: 'Something went wrong, we are looking into it.'
                    }, 500)
                }
                else {
                    res.send({
                        state: 'success',
                        message: 'Model created successfully',
                        data: model
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

//To get models by version id
router.get('/get_models_by_version_id/:franchisor_id/:version_id', function (req, res) {
    try {
        CarModels.find({franchisor_id: req.params.franchisor_id, version_id: req.params.version_id}, function (err, carmodels) {
            if (err) {
                return res.send({
                    state: 'error',
                    message: err
                }, 500);
            }
            if (!carmodels) {
                res.send({
                    state: 'failure',
                    message: 'Employees not found.',
                    data: []
                }, 400)
            }
            else {
                res.send({
                    state: 'success',
                    data: carmodels
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

//To get models by default version id
router.get('/get_models_by_default_version/:franchisor_id', function (req, res) {
    try {
        Versions.findOne({franchisor_id: req.params.franchisor_id, 
            version_type: 'e_assessments', 
            default: true}, function(err, version){
        CarModels.find({franchisor_id: req.params.franchisor_id, version_id: version._id}, function (err, carmodels) {
            if (err) {
                return res.send({
                    state: 'error',
                    message: err
                }, 500);
            }
            if (!carmodels) {
                res.send({
                    state: 'failure',
                    message: 'Employees not found.',
                    data: []
                }, 400)
            }
            else {
                res.send({
                    state: 'success',
                    data: carmodels
                }, 200)
            }
        })
    })
    }
    catch (err) {
        res.send({
            state: 'err',
            message: err
        })
    }
})


//To edit model details
router.put('/update_model_details', function (req, res) {
    try {
        CarModels.findOne({ model_name: {$regex: new RegExp(req.body.model_name, 'i')} }, function (err, model) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong'
                }, 500)
            }
            if (model) {
                res.send({
                    state: "failure",
                    message: "Name already exists!"
                }, 400);
            }
            if (!model) {
                let data= {};
                data.model_name = req.body.model_name;
               
                CarModels.findByIdAndUpdate(req.body._id, data, {new:true},function (err, model) {
                    if (err) {
                        res.send({
                            state: 'error',
                            message: 'Something went wrong'
                        }, 500)
                    }
                    else {
                        res.send({
                            state: 'success',
                            message: 'Model updated'
                        }, 200)
                    }
                })
            }
         
        })
    }
    catch (err) {
        res.send({
            state: 'err',
            message: 'err'
        })
    }
});


// To delete employee details
router.delete('/delete_model_by_id/:id', function (req, res) {
    try {
        CarModels.findByIdAndRemove({ _id: req.params.id }, function (err, model) {
            if (err) {
                return res.sendStatus({
                    state: err,
                    message: 'Something went wrong, we are looking into it.'
                }, 500);
            }
            if (!model) {
                res.send({
                    state: err,
                    message: 'Model not found.'
                }, 201);
            }
            else {
                res.send({
                    state: 'success',
                    message: 'Model deleted'
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
                var evaluated_assessments_list = [];
                for(var i = 0; i<employeeDetails.length; i++){
                    EmployeeAssessmentTypeOfFranchisee.findOne({employee_id: employeeDetails[i]._id}, function(err, data){
                        if(data){
                            //assessment_qualified
                            for(var j = 0; j<data.length; j++){
                                if(data[j].assessment_qualified == true){
                                    evaluated_assessments_list.push((data[j]));
                                }
                            }
                            console.log(data.length, '1363 total assessments counts of employee');
                            console.log(evaluated_assessments_list.length, '1363 qualified assessments counts of employee');
                            if(data.length == evaluated_assessments_list.length){
                                employeeDetails[i].evaluated_employee = true;
                            }
                        }

                    })
                }
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

// to get employees by franchisee id 
router.get('/get_employees_by_franchisee_id/:franchisee_id',  function(req, res){
    try{
        var employees_list = [];
        EmployeeDetails.find({franchisee_id: req.params.franchisee_id},  function(err,employeeDetails){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(employeeDetails.length == 0){
                return res.send({
                    state:"failure",
                    message:"No employees"
                },400);
            }
            if(employeeDetails.length > 0){               
                       res.send({
                           state: 'success',
                           data: employeeDetails
                       }, 200)                
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

//To edit employee details 
router.put('/update_employee_details', function (req, res) { 
    try {
        EmployeeDetails.findById({ _id: req.body._id, franchisee_id:req.body.franchisee_id }, function (err, employeeDetails) {
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
                employeeDetails.model_id = req.body.model_id;
                employeeDetails.employee_company_of_experience = req.body.employee_company_of_experience;
                employeeDetails.employee_experience_in = req.body.employee_experience_in;
                employeeDetails.employee_vertical = req.body.employee_vertical;
                employeeDetails.employee_days_experience = req.body.employee_days_experience;
                employeeDetails.franchisee_id = req.body.franchisee_id;
                employeeDetails.save(function (err, employeeDetails) {
                    if (err) {
                        res.send({
                            state: 'error',
                            message: 'Something went wrong'
                        }, 500)
                    }
                    else {
                        CarModels.findOne({_id:req.body.model_id},function(err, models){
                            console.log(models, "1427");
                            if(err){
                                console.log(err, "1429");
                            }
                            if(models){
                                employeeDetails.model_name =  models.model_name;
                            employeeDetails.save(function (err, employeeDetails){
                              console.log(employeeDetails, "1434");
                            })
                            }
                            
                          })
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
// To delete all employees details
router.delete('/delete_all_employees', function (req, res) {
    try {
        EmployeeDetails.remove({}, function (err, employeeDetails) {
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
                    message: 'Employees deleted'
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


//get franchisee specific questions

router.get('/get_all_and_employee_specific_questions/:assessment_id/:employee_id', function(req, res){
    try{
      //  EmployeeAssessmentTypeOfFranchisee.findById({_id: req.params.assessment_id}, function(err, assessment){

         //Saved employees   EmployeeAssessmentSubmitted
         var e_a_id = req.params.assessment_id;
    var e_id = objectId(req.params.employee_id);
    console.log(e_a_id, e_id);

         get_merged_questions(e_a_id, e_id)
         .then((response) => {
             res.send({
                 data: response 
             })
         })
            
      //  })
    }
    catch(err){
        return res.send({
            state: 'err',
            message: err
        })
    }
})

function get_merged_questions(e_a_id, e_id){
    var e_a_id_object_id = objectId(e_a_id);
    console.log(e_a_id_object_id);
    //EmployeeAssessmentTypeOfFranchisee.findById({assessment_type_id: req.params.assessment_id}, function(err, assessment){
        return EmployeeAssessmentTypeOfFranchisee.aggregate([
                {
                    $match: {
                        $and: [
                            {assessment_type_id: e_a_id_object_id},
                            {employee_id: e_id}
                        ]
                    }
        
                },
                {
                    $lookup: {
                        from: EmployeeAssessment.collection.name,
                        let: { assessment_type_id: e_a_id_object_id},
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {$expr: {$eq: ["$assessment_type_id", e_a_id_object_id]}}
                                    ]
                                }
                            },
                            {
                                $lookup: {
                                    from: EmployeeAssessmentSubmitted.collection.name,
                                    let: { question_id: "$_id"},
                                    pipeline: [
                                        {
                                            $match: {
                                                $and: [
                                                {$expr: {$eq: ["$question_id", "$$question_id"]}},   
                                                {$expr: {$eq: ["$employee_id", e_id]}}
                                                ]
                                            }
                                        }
                                    ],
                                    as: 'employee_answered_data'
                                }
                            }
                        ],

                        as: 'questions_list'

                    }
                }
            ]).exec();
    //});
    // return EmployeeAssessment.aggregate([
    //     {
    //         $match: {
    //             $and: [
    //                 {_id: assessment._id}
    //             ]
    //         }

    //     }
    // ])
        }

    router.get('/retake_exam/:employee_id/:assessment_id', function (req, res) {
        try {
            // { $set: { <field1>: <value1>, ... } }
            EmployeeAssessmentSubmitted.updateMany({ employee_id: req.params.employee_id, assessment_type_id: req.params.assessment_id },{ $set: { employee_answer: '' }}, function (err, employeeQuestions) {
                if (err) {
                    return res.send({
                        state: err,
                        message: 'Something went wrong, we are looking into it.'
                    }, 500);
                }
                if (!employeeQuestions) {
                    res.send({
                        state: 'failure',
                        message: 'No questions found.'
                    }, 201);
                }
                else {
                    res.send({
                        state: 'success',
                        message: 'Success',
                        data: employeeQuestions
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
