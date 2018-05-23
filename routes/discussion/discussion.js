var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
// var DiscussionQuestion = mongoose.model('DiscussionQuestion');
var DiscussionQuestion = mongoose.model('DiscussionQuestion');
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

router.post('/create_discussion_question', upload.single('discussion_question_img'), function (req, res) {
    var discussinQuestionForm = JSON.parse(req.body.discussionquestion);
    console.log(req.body.discussinquestion)
    try {
        DiscussionQuestion.find({}, function (err, discussionquestion) {
            console.log(discussionquestion);
            if (err) {
                res.send({
                    state: "failure",
                    message: "Something went wrong."
                }, 500);
            }
            // if (discussionquestion) {
            //     res.send({
            //         state: "failure",
            //         message: "This question already exists."
            //     }, 400);
            // }
            else {
                discussionquestion = new DiscussionQuestion();
                discussionquestion.discussion_question = discussinQuestionForm.discussion_question;
                discussionquestion.created_by = discussinQuestionForm.created_by;
                discussionquestion.created_at = discussinQuestionForm.created_at;
                discussionquestion.franchisee_id = discussinQuestionForm.franchisee_id;
                discussionquestion.franchisee_name = discussinQuestionForm.franchisee_name
                if (req.file) {
                    console.log(req.file);
                    var discussion_question_img = {};
                    discussionquestion.franchisor_question_file_attachment_file_url = req.file.location;
                    discussionquestion.franchisor_question_file_attachment_file_name = req.file.key;
                    discussionquestion.franchisor_question_file_attachment_file_type = req.file.contentType;
                }
                discussionquestion.save(function (err, discussionquestion) {
                    if (err) {
                        res.send({
                            state: "failure",
                            message: "Something went wrong, We are looking into it."
                        }, 500);
                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Question created successfully"
                        }, 200);
                    }
                });
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
})

//Get question by question id
router.get('/get_discussion_question/:question_id', function (req, res) {
    try {
        DiscussionQuestion.findOne({ _id: req.params.question_id }, function (err, discussionquestion) {
            if (err) {
                return res.send({
                    state: "err",
                    message: error
                }, 500);
            }
            else {
                res.send({
                    state: "success",
                    data: discussionquestion
                }, 200);
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        })
    }
})

//Get all questions
router.get('/get_all_discussion_questions', function (req, res) {
    try {
        DiscussionQuestion.find({}, function (err, discussionquestion) {
            if (err) {
                return res.send({
                    state: "err",
                    message: error
                }, 500);
            }
            if (!discussionquestion) {
                res.send({
                    state: "failure",
                    message: "Qustions not found.",
                    discussionquestion: []
                }, 400);
            }
            else {
                for (var i = 0; i < discussionquestion.length; i++) {
                    discussionquestion[i].question_id = discussionquestion[i]._id;
                }
                res.send({
                    state: "success",
                    data: discussionquestion
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
})

//To edit question
router.put('/update_discussion_questions', upload.single('discussion_question_img'), function (req, res) {
    var discussionQuestionEditForm = JSON.parse(req.body.discussionquestion);
    try {
        DiscussionQuestion.findById({ _id: discussionQuestionEditForm.question_id }, function (err, discussionquestion) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong, We are looking into it."
                }, 500);
            }
            if (discussionquestion) {
                discussionquestion.discussion_question = discussionQuestionEditForm.discussion_question;
                discussionquestion.created_by = discussionQuestionEditForm.created_by;
                discussionquestion.edited_at = discussionQuestionEditForm.edited_at;
                discussionquestion.franchisee_id = discussionQuestionEditForm.franchisee_id;
                if (req.file) {
                    discussionquestion.franchisor_question_file_attachment_file_url = req.file.location;
                    discussionquestion.franchisor_question_file_attachment_file_name = req.file.key;
                    discussionquestion.franchisor_question_file_attachment_file_type = req.file.contentType;
                }
                discussionquestion.save(function (err, discussionquestion) {
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Question updated."
                        }, 200);
                    }
                });
            }
            if (!discussionquestion) {
                res.send({
                    state: "failure",
                    message: "Failed to update."
                }, 400);
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
})

//To delete question by id
router.delete('/delete_discussion_question/:question_id', function (req, res) {
    try {
        DiscussionQuestion.findByIdAndRemove({ _id: req.params.question_id }, function (err, discussionquestion) {
            if (err) {
                return res.send({
                    state: err,
                    message: "Something went wrong, We are looking into it."
                }, 500);
            }
            if (!discussionquestion) {
                res.send({
                    message: "Question not found.",
                    state: "failure",
                }, 201);
            }
            else {
                res.send({
                    state: "success",
                    message: "Question deleted successfully.",
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
})

//To add comments
router.post('/discussion_question/addcomments', function (req, res) {
    try {
        DiscussionQuestion.findOne({ _id: req.body.question_id }, function (err, discussionquestion) {
            console.log(discussionquestion, '239')
            console.log('240',req.body);
            if (err) {
                return res.send(500, err);
            }
            else {
                discussionquestion.commentsCount = discussionquestion.commentsCount + 1;
                discussionquestion.discussion_comments.push(req.body.comment);
                
                discussionquestion.save(function (err, discussionquestion) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.send({
                            state: "success",
                            data: discussionquestion
                        }, 200);
                    }
                });
            }
        });
    }
    catch (err) {
        res.send({
            state: "error",
            message: "Something went wrong"
        }, 500);
    }
});

//To get comments based on question id
router.get('/getComments/:question_id',function(req,res){
    try{
        DiscussionQuestion.findOne({_id:req.params.question_id},function(err,discussionquestion){
            if(err){
                return res.send(err);
            }
            if(discussionquestion.discussion_comments.length>0){
                res.send({
                    state:'success',
                    data:discussionquestion.discussion_comments
                },200);
            }
            if(discussionquestion.discussion_comments.length==0){
                res.send({
                    state:'failure',
                    messgae:'No comments'
                },400);
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:"Something went wrong"
        },500);
    }
});

// To approve or decline
router.put('/change_question_status',function(req,res){
    try{
        DiscussionQuestion.findById({_id:req.body._id},function(err,discussionquestion){
            if(err){
                return res.send(500, err);
            }   if(discussionquestion) {
                discussionquestion.status=req.body.status;
                discussionquestion.save(function(err,discussionquestion){
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Question updated.",
                            data: discussionquestion
                        }, 200);
                    }
                });
            }
                    if (!discussionquestion) {
                        res.send({
                            state: "failure",
                            message: "Failed."
                        }, 400);
                    }      
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:"Something went wrong"
        },500);
    }
});

//To vote
router.put('/question/vote',function(req,res){
    try{
        DiscussionQuestion.findOne({_id:req.body.question_id},function(err,discussinquestion){
            if(err){
                return res.send(err);
            }
            else{
                var flag = false;
                var id = req.body.votedBy;
                if(discussinquestion.votedBy.length>0){
                    for(var i=0;i<discussinquestion.votedBy.length;i++){
                        if(discussinquestion.votedBy[i] == id){
                            flag = true;
                        }
                    }
                }
                if(flag){
                    res.send({
                        state:'failure',
                        message:'You have already voted for this question'
                    });
                }
                else{
                    discussinquestion.votes=discussinquestion.votes + 1;
                    discussinquestion.votedBy.push(id);
                    discussinquestion.save(function(err, discussinquestion){
                        if(err){
                            res.send(err);
                        }
                        else{
                            res.send({
                                state:'success',
                                data:discussinquestion
                            });
                        }
                    });
                }
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:"Something went wrong"
        });
    }
});
module.exports = router;