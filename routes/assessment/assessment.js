var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
var Question_Type = mongoose.model('QuestionType');
var Question = mongoose.model('Question');
var _ = require('lodash');

router.post('/add_assessment_type',function(req,res){
    try{
        Question_Type.findOne({'question_type_name':req.body.heading},function(err,questionType){
            if(err){
                return res.send({
                    state:"error",
                    message:"err1"
                },500);
            }
            if(questionType){
                 return res.send({
                    state:"failure",
                    message:"Name exist"
                },200);
            }
            else{
                var question_type = new Question_Type();
                question_type.question_type_name = req.body.heading;
                question_type.save(function(err,question_type){
                    if(err){
                        return res.send({
                            state:"error",
                            message:"err"
                        },500);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:'Successfully added'
                        },200);
                    }
                })
            }
        });
    }
    catch(err){
		return res.send({
			state:"error",
			message:"From here"
		},500);
	}
});

router.get('/question_types',function(req,res){
    try{
        Question_Type.find({},function(err,list){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(list.length == 0){
                return res.send({
                    state:"failure",
                    message:"There is no data"
                },200);
            }
            else{
                return res.send({
                    state:"success",
                    data:list
                },200);
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

router.post('/question_list',function(req,res){
    try{
        Question.findOne({'question_EN':req.body.question,'question_type_id':req.body.question_type_id},function(err,ques){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(ques){
                return res.send({
                    state:"failure",
                    message:"Already created this question"
                },200);
            }
            else{
                var question = new Question();
                question.question_EN = req.body.question_EN;
                question.options = req.body.options;
                question.correct_answer = req.body.correct_answer;
                question.question_type_id = req.body.question_type_id;
                question.save(function(err,question){
                    if(err){
                        return res.send({
                            state:"error",
                            message:err
                        },500);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:"Question created",
                            data:question
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

router.get('/get_question_list',function(req,res){
    try{
        Question.find({},function(err,ques){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(ques.length == 0){
                return res.send({
                    state:"failure",
                    message:"No questions"
                },200);
            }
            if(ques.length > 0){
                return res.send({
                    state:"success",
                    data:ques
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
});

router.get('/get_question_by_id/:id',function(req,res){
    try{
        Question.find({'question_type_id':req.params.id},function(err,ques){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(ques.length == 0){
                return res.send({
                    state:"failure",
                    message:"No questions"
                },200);
            }
            if(ques.length > 0){
                return res.send({
                    state:"success",
                    data:ques
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
});

router.put('/update_question',function(req,res){
    try{
        Question.findOne({_id:req.body.ques_id},function(err,ques){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(!ques){
                return res.send({
                    state:"failure",
                    message:"No question found."
                },200);
            }
            if(ques){
                ques.question_EN = req.body.question_EN;
                ques.options = req.body.options;
                ques.correct_answer = req.body.correct_answer;
                ques.question_type_id = req.body.question_type_id;
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
                            message:"Question created",
                            data:ques
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