var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');;
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var csv = require('csv')
var path = require('path');
// var EmployeeAssessment = mongoose.model('EmployeeAssessment');
// var EmployeeAssessmentSubmitted = mongoose.model('EmployeeAssessmentSubmitted');
var FranchiseeAssessment = mongoose.model('FranchiseeAssessment');
var FranchiseeAssessmentSubmitted = mongoose.model('FranchiseeAssessmentSubmitted');
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

router.post('/create_franchisee_assessment', function (req, res) {
    var franchiseeAssessmentForm = req.body;
    try {
        FranchiseeAssessment.findOne({ question_EN: franchiseeAssessmentForm.question_EN }, function (err, question) {
            if (err) {
                return res.send({
                    state: 'error',
                    message: err
                }, 500);
            }
            if (question) {
                return res.send({
                    state: 'failure',
                    message: "Question is already created"
                }, 400);
            }
            else {
                var franchiseeAssessment = new FranchiseeAssessment();
                franchiseeAssessment.question_EN = franchiseeAssessmentForm.question_EN;
                franchiseeAssessment.question_type = franchiseeAssessmentForm.question_type;
                franchiseeAssessment.options = franchiseeAssessmentForm.options;
                franchiseeAssessment.isRequire = franchiseeAssessmentForm.isRequire;
                franchiseeAssessment.save(function (err, franchiseeeAssessment) {
                    if (err) {
                        return res.send({
                            state: 'error',
                            message: err
                        }, 500);
                    }
                    else {
                        return res.send({
                            state: 'success',
                            message: 'Question created'
                        }, 200)
                    }
                })
            }
        });
    }
    catch (err) {
        return res.send({
            state: 'error',
            message: err
        }, 500);
    }
})


router.get('/get_all_franchisee_assessment_questions', function (req, res) {
    try {
        FranchiseeAssessment.find({}, function (err, question) {
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

//To get all question
// function get_all_franchisee_assessment_questions(req, res) {
//     FranchiseeAssessment.find({}, function (err, question) {
//         if (err) {
//             return res.send({
//                 state: 'error',
//                 message: err
//             }, 500);
//             if (question.length == 0) {
//                 return res.send({
//                     state: 'failure',
//                     message: 'No question created'
//                 }, 400);
//             }
//             if (question.length > 0) {
//                 for (var i = 0; i < question.length; i++) {
//                     question[i].order = i;
//                 }
//                 return res.send({
//                     state: 'success',
//                     data: question
//                 }, 200);
//             }
//         }
//     })
// }
// router.get('/get_all_franchisee_assessment_questions', function (req, res) {
//     try {
//         get_all_franchisee_assessment_questions(req, res);
//     } catch (err) {
//         return res.send({
//             state: "error",
//             message: err
//         }, 500);
//     }
// })

//To delete question by question id
router.delete('/delete_franchisee_assessent_question/:id', function (req, res) {
    try {
        FranchiseeAssessment.findByIdAndRemove({ _id: req.params.id }, function (err, question) {
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

router.put('/edit_franchisee_assessment_question', function (req, res) {
    var franchiseeAssessmentForm = req.body;
    try {
        FranchiseeAssessment.findOne({ _id: franchiseeAssessmentForm.question_id }, function (err, question) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong.We are looking into it.'
                }, 500);
            }
            if (!question) {
                return res.send({
                    state: 'failure',
                    message: 'No question found'
                }, 400)
            }
            if (question) {
                question.question_EN = franchiseeAssessmentForm.question_EN;
                question.question_type = franchiseeAssessmentForm.question_type;
                question.options = franchiseeAssessmentForm.options;
                question.isRequire = franchiseeAssessmentForm.isRequire;
                question.save(function (err, question0) {
                    if (err) {
                        return res.send({
                            state: 'error',
                            message: err
                        }, 500);
                    }
                    else {
                        return res.send({
                            state: 'success',
                            message: 'Question updated',
                            data: question
                        }, 200);
                    }
                })
            }
        })
    }
    catch (err) {
        res.send({
            state: 'error',
            message: err
        }, 500);
    }
});

var cpUpload = upload.fields([{
    name: 'file_upload',
    maxCount: 50
}, {
    name: 'imgFields',
    maxCount: 20
}])

router.put('/submit_franchisee_assessment', cpUpload, function (req, res) {
    var submitFranchiseeAssessment = JSON.parse(req.body.data);
    try {
        FranchiseeAssessmentSubmitted.findOne({ franchisee_id: submitFranchiseeAssessment.franchisee_id }, function (err, franchiseeAssessment) {
            if (err) {
                return res.send({
                    state: 'err',
                    message: 'Something went wrong. We are looking into it.'
                }, 500);
            }
            if (franchiseeAssessment) {
                if (req.files.file_upload) {
                    for (var i = 0; i < req.files.file_upload.length; i++) {
                        for (var j = 0; j < submitFranchiseeAssessment.franchiseeAssessment_list.length; j++) {
                            if (submitFranchiseeAssessment.franchiseeAssessment_list[j].question_type === 'File Upload' && submitFranchiseeAssessment.franchiseeAssessment_list[j].answer.length == undefined) {
                                submitFranchiseeAssessment.franchiseeAssessment_list[j].answer = req.files.file_upload[i].location;
                                submitFranchiseeAssessment.franchiseeAssessment_list[j].file_name = req.files.file_upload[i].originalname;
                                i++;
                            }
                        }
                    }
                }

                franchiseeAssessment.franchisee_id = submitFranchiseeAssessment.franchisee_id;
                franchiseeAssessment.franchisee_assessment_status = 'Submitted';
                franchiseeAssessment.answers = submitFranchiseeAssessment.franchiseeAssessment_list;
                franchiseeAssessment.save(function (err, franchiseeAssessment) {
                    if (err) {
                        return res.send({
                            state: 'err',
                            message: 'Something went wrong. We are looking into it'
                        }, 500);
                    }
                    else {
                        return res.send({
                            state: 'success',
                            message: 'Franchisee Assessment submitted.'
                        }, 200);
                    }
                })
            }
            if (!franchiseeAssessment) {
                var franchiseeAssessment_status = new ApplicationSubmitted();

                if (req.files.file_upload) {
                    console.log(req.files);
                    for (var i = 0; i < req.files.file_upload.length; i++) {
                        for (var j = 0; j < submitFranchiseeAssessment.application_list.length; j++) {
                            if (submitFranchiseeAssessment.application_list[j].question_type === 'File Upload') {
                                submitFranchiseeAssessment.application_list[j].answer = req.files.file_upload[i].location;
                                submitFranchiseeAssessment.application_list[j].file_name = req.files.file_upload[i].originalname;
                            }
                        }
                    }
                }
                franchiseeAssessment_status.franchisee_id = submitFranchiseeAssessment.franchisee_id;
                franchiseeAssessment_status.franchisee_assessment_status = 'Submitted';
                franchiseeAssessment_status.answers = submitFranchiseeAssessment.application_list;
                franchiseeAssessment_status.save(function (err, franchiseeAssessment_status) {
                    if (err) {
                        return res.send({
                            state: "err",
                            message: "Something went wrong.We are looking into it."
                        }, 500);
                    } else {
                        return res.send({
                            state: "success",
                            message: "Franchisee assessment submitted."
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

module.exports = router;