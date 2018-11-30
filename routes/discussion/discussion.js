var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
// var DiscussionQuestion = mongoose.model('DiscussionQuestion');
var DiscussionQuestion = mongoose.model('DiscussionQuestion');
var io = require('socket.io')(http);
var http = require('http').Server(app);
var app = express();
var utils = require('../../common/utils');
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

router.post('/create_discussion_question', upload.single('discussion_question_img'), function (req, res) {
    var discussinQuestionForm = JSON.parse(req.body.discussionquestion);
    console.log('34', req.body.discussionquestion, typeof(req.body.discussionquestion), 'typeoflfjsal;fskfsad');
    try {
        DiscussionQuestion.findOne({'discussion_question': {$regex: new RegExp(discussinQuestionForm.discussion_question,'i')}}, function (err, discussionquestion) {
            if (err) {
                res.send({
                    state: "failure",
                    message: "Something went wrong."
                }, 500);
            }
            if (discussionquestion) {
                res.send({
                    state: "failure",
                    message: "This question already exists."
                }, 201);
            }
            else {
                dquestion = new DiscussionQuestion();
                dquestion.discussion_question = discussinQuestionForm.discussion_question;
                dquestion.created_by = discussinQuestionForm.created_by;
                dquestion.created_at = new Date();
                dquestion.user_id = discussinQuestionForm.user_id;
                dquestion.franchisee_name = discussinQuestionForm.franchisee_name;
                dquestion.user_name = discussinQuestionForm.user_name;
                dquestion.franchisee_address = discussinQuestionForm.franchisee_address;
                dquestion.user_profile_pic = discussinQuestionForm.user_profile_pic;
                if (req.file) {
                    console.log(req.file);
                    var discussion_question_img = {};
                    dquestion.franchisor_question_file_attachment_file_url = req.file.location;
                    dquestion.franchisor_question_file_attachment_file_name = req.file.key;
                    dquestion.franchisor_question_file_attachment_file_type = req.file.contentType;
                }
                dquestion.save(function (err, discussques) {
                console.log('*******', discussques);
                    if (err) {
                        res.send({
                            state: "failure",
                            message: "Something went wrong, We are looking into it."
                        }, 500);
                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Question created successfully",
                            data: discussques
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
        DiscussionQuestion.find({ _id: req.params.question_id }, function (err, discussionquestion) {
            if (err) {
                return res.send(500, err);
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
        DiscussionQuestion.find({},{}, { sort: { 'created_at' : -1 } }, function (err, discussionquestion) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "error"
                }, 500);
            }
            if (!discussionquestion) {
                res.send({
                    state: "failure",
                    message: "Qustions not found.",
                    discussionquestion: []
                }, 201);
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
                }, 201);
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

// delete all questions
//To delete question by id
router.delete('/delete_all_discussion_questions', function (req, res) {
    try {
        DiscussionQuestion.remove({}, function (err, discussionquestion) {
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
                    message: "Questions deleted successfully.",
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


//To get comments based on question id
router.get('/getComments/:question_id', function (req, res) {
    try {
        DiscussionQuestion.findOne({ _id: req.params.question_id }, function (err, discussionquestion) {
            if (err) {
                return res.send(err);
            }
            if (discussionquestion.discussion_comments.length > 0) {
                res.send({
                    state: 'success',
                    data: discussionquestion.discussion_comments
                }, 200);
            }
            if (discussionquestion.discussion_comments.length == 0) {
                res.send({
                    state: 'failure',
                    messgae: 'No comments'
                }, 201);
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

// To approve or decline
router.put('/change_question_status', function (req, res) {
    try {
        DiscussionQuestion.findById({ _id: req.body._id }, function (err, discussionquestion) {
            if (err) {
                return res.send(500, err);
            } if (discussionquestion) {
                console.log('discussionquestion', discussionquestion);
                discussionquestion.status = req.body.status;
                console.log('status', req.body.status);
                discussionquestion.save(function (err, discussionquestion) {
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        io.on('connection', function (socket) {
                            socket.emit('news', { hello: 'world' });
                            socket.on('message', function (data, response) {
                                console.log(data, 'messagediscussion');
                                io.emit('message', { type: 'discussionNotification', text: 'Question posted' });
                            })
                        })
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
                }, 201);
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

//To vote
// router.put('/question/vote',function(req,res){
//     try{
//         DiscussionQuestion.findById({_id:req.body.question_id},function(err,discussionquestion){
//             if(err){
//                 return res.send(err);
//             }
//             else{
//                 console.log('id', id);
//                 console.log(req.body.votedBy);
//                 var flag = false;
//                 var id = req.body.votedBy;
//                 console.log('flag', flag);
//                 if(discussionquestion.votedBy.length>0){
//                     for(var i=0;i<discussionquestion.votedBy.length;i++){
//                         if(discussionquestion.votedBy[i] === id){
//                             flag = true;
//                         }
//                     }
//                 }
//                 if(flag){
//                     res.send({
//                         state:'failure',
//                         message:'You have already voted for this question'
//                     },201);
//                 }
//                 else{
//                     discussionquestion.votes=discussionquestion.votes + 1;
//                     discussionquestion.votedBy.push(id);
//                     discussionquestion.save(function(err, discussionquestion){
//                         if(err){
//                             res.send(err);
//                         }
//                         else{
//                             res.send({
//                                 state:'success',
//                                 data: discussionquestion
//                             },200);
//                         }
//                     });
//                 }
//             }
//         });
//     }
//     catch(err){
//         res.send({
//             state:"error",
//             message:"Something went wrong"
//         },500);
//     }
// });



router.put('/question/vote', function (req, res) {
    try {
        DiscussionQuestion.findOne({ _id: req.body.question_id }, function (err, discussionquestion) {
            if (err) {
                return res.send(err);
            }
            if (discussionquestion) {
             
                var id = req.body.votedBy;
                DiscussionQuestion.find({$and:[{ votedBy: { $elemMatch: { $eq: id } } },{_id:mongoose.Types.ObjectId(req.body.question_id)}]}, (err, data) => {
                    console.log(data);
                    if (err) {
                        return res.send(err);
                    }
                    else if(data.length != 0 || data != "") {
                        res.send({
                        state:'failure',
                        message:'You have already voted for this question'
                    },201);
                    }
                    else {
                        discussionquestion.votes = discussionquestion.votes + 1;
                        discussionquestion.votedBy.push(id);
                        discussionquestion.save(function (err, discussionquestion) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                res.send({
                                    state: 'success',
                                    data: discussionquestion
                                },200);
                            }
                        });
                    }
                })
                
            }
        });
    }
    catch (err) {
        res.send({
            state: "error",
            message: "Something went wrong"
        });
    }
});

//To add Comments by question id
router.put('/discussion_question/addcomments', upload.single('comment_img'), function (req, res) {
    var discussionComments = JSON.parse(req.body.discussionquestion);
    console.log('401', discussionComments);
    try {
        DiscussionQuestion.findById({ _id: discussionComments.question_id }, function (err, discussionquestion) {
            console.log('404', discussionquestion);
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong."
                }, 500)
            }
            else {
                discussionquestion.commentsCount = discussionquestion.commentsCount + 1;
                // discussionquestion.user_profile_pic = discussionComments.franchisee_profile_pic;
                if (req.file) {
                    var comment_img = {};
                    discussionComments.comment.comment_file_attachment_file_url = req.file.location;
                    discussionComments.comment.comment_file_attachment_file_name = req.file.key;
                    discussionComments.comment.comment_file_attachment_file_type = req.file.contentType;
                }
                discussionquestion.discussion_comments.push(discussionComments.comment);
                console.log('423', discussionquestion.discussion_comments);
                console.log('424', discussionquestion);
                discussionquestion.save(function (err, discussionquestion) {

                    // if(req.file){

                    //     discussionquestion.discussion_comments.comment_file_attachment_file_url = req.file.location;
                    //     discussionquestion.discussion_comments.comment_file_attachment_file_name = req.file.key;
                    //     discussionquestion.discussion_comments.comment_file_attachment_file_type = req.file.contentType;
                    // }
                    if (err) {
                        res.send({
                            state: "failure",
                            message: "Something went wrong."
                        }, 500)
                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Comment posted.",
                            data: discussionquestion
                        }, 200);
                    }
                });
            }
            if (!discussionquestion) {
                res.send({
                    state:"failure",
                    message:"No comments found."
                },201);
            }
        });
    }
    catch (err) {
        res.send({
            state: "error",
            message: "Something went wrong"
        }, 500);
    }
})

module.exports = router