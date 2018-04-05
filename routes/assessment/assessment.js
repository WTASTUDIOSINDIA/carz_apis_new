var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
var Partner = mongoose.model('Partner');
var Question_Type = mongoose.model('QuestionType');
var Question = mongoose.model('Question');
var Assessment = mongoose.model('Assessment');
var Folder = mongoose.model('Folder');
var Stages = mongoose.model('Stages');
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
                question.question_type = req.body.question_type;
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
                ques.question_type = req.body.question_type;
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

function create_folder(req,res,franchisee_Id,status){
    var folder = new Folder();
    folder.folder_name = 'Agreement';
    folder.franchisee_Id = franchisee_Id;

    if(status){
        folder.crm_folder = status;
    }
    folder.create_date = Date.now();
    folder.save(function(err,folder){
        if(err){
            return res.send({
                state:"error",
                message:err
            },500);
        }
        else{
            update_franchisee(req, res, franchisee_Id);
        }
    })
}

function update_franchisee(req, res, franchisee_id){
    Franchisee.findOne({_id:franchisee_id},function(err,franchiees){
        if(err){
            return res.send({
                state:"err",
                message:"Something went wrong."
            },500);
        }
        else{

            ////////////////////////////////////// need to work
                franchiees.franchisee_stage_completed = franchiees.franchisee_stage_completed + 1;
            
            franchiees.save(function(err,franchisee){
                if(err){
                    res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong."
                    },500);
                }
                else{
                    console.log("ewedwdsadasdsadsad");
                }
            });
        }
    })
}

function update_franchisee(req, res, franchisee_id){
    Franchisee.findOne({_id:franchisee_id},function(err,franchiees){
        if(err){
            return res.send({
                state:"err",
                message:"Something went wrong."
            },500);
        }
        else{

            ////////////////////////////////////// need to work
                franchiees.franchisee_stage_completed = franchiees.franchisee_stage_completed + 1;

            franchiees.save(function(err,franchisee){
                if(err){
                    res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong."
                    },500);
                }
                else{
                    console.log("ewedwdsadasdsadsad");
                }
            });
        }
    })
}

function update_stage(req,res,franchisee_id,status){
    Stages.findOne({franchisee_id: franchisee_id}, function(err, stage){
        if(err){
            return res.send({
                state:"error",
                message:err
            },500);
        }
        else{
            stage.stage_assessment.status = true;
            stage.stage_assessment.franchisee_id = franchisee_id;
            stage.save(function(err,stage){
                if(err){
                    return res.send({
                        state:"error",
                        message:err
                    },500);
                }
                else{
                    create_folder(req,res,franchisee_id,status);
                }
            })
        }
    });
}

function check_franchisee_partners(req,res,franchisee_Id,status){
    Partner.find({franchisee_id:franchisee_Id},function(err,partner){
        if(err){
            return res.send({
                state:"error",
                message:err
            },500);
        }
        if(partner.length > 0){
            var partner_status = 0;
            for(var i = 0;i<partner.length; i++){
                if(partner[i].test_completed == true){
                    partner_status = partner_status + 1;
                }
                if(partner_status == partner.length){
                    console.log("to update partner");
                    update_stage(req,res,franchisee_Id,status);
                }
            }
        }
    })
}

function update_partners(req,res,partner_id,status){
    Partner.findOne({_id:partner_id},function(err,partner){
        if(err){
            return res.send({
                state:"error",
                message:err
            },500);
        }
        else{
            partner.test_completed = true;
            partner.save(function(err,partner){
                if(err){
                    return res.send({
                        state:"error",
                        message:err
                    },500);
                }
                else{
                    check_franchisee_partners(req,res,partner.franchisee_id,status);
                }
            })
        }
    })
}

router.put('/answer',function(req,res){
    try{
        Assessment.findOne({franchisee_id:req.body.franchisee_id,partner_id:req.body.partner_id},function(err,answer){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(answer){
                check_franchisee_partners(req,res,answer.franchisee_id);
                return res.send({
                    state:"failure",
                    message:"This person has already attempt this test."
                },200);
            }
            else{
                var answer = new Assessment();
                var right_answer = 0;
                var answer_array = req.body.assessment_list;
                for(var i=0;i<answer_array.length;i++){
                    if(answer_array[i].correct_answer == answer_array[i].selected_option){
                        right_answer = right_answer + 1;
                    }
                }
                answer.assessment_list = req.body.assessment_list;
                answer.franchisee_id = req.body.franchisee_id;
                answer.partner_id = req.body.partner_id;
                answer.correct_answers = right_answer;
                answer.total_questions = req.body.total_questions;
                answer.status = 'Completed';
                answer.save(function(err,answer){
                     if(err){
                        return res.send({
                            state:"error",
                            message:err
                        },500);
                    }
                    else{
                        update_partners(req,res,answer.partner_id,req.body.crm_status);
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

router.get('/get_report/:franchisee_Id/:partner_Id',function(req, res){
    try{
        Assessment.findOne({franchisee_id:req.params.franchisee_Id,partner_id:req.params.partner_Id},function(err,report){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(!report){
                return res.send({
                    state:"falure",
                    message:"Franchisee has not attempt the test yet."
                },200);
            }
            if(report){
                Question_Type.find({},function(err,list){
                    var graph_array = [];
                    const obj = {
                        "correct_answers": report.correct_answers,
                        "total_question": report.total_questions
                    };
                    for(var i=0;i<list.length;i++){
                        var ques = {
                            ques_head_val:list[i].question_type_name,
                            correct_opt : 0,
                            total_ques_by_type:0
                        };
                        for(var j=0;j<report.assessment_list.length;j++){
                            if((ques.ques_head_val == report.assessment_list[j].question_type)){
                                    ques.total_ques_by_type = ques.total_ques_by_type + 1;
                                if((report.assessment_list[j].selected_option == report.assessment_list[j].correct_answer)){
                                    ques.correct_opt = ques.correct_opt + 1;
                                }
                            }
                        }
                        graph_array.push(ques);
                    }
                    return res.send({
                        state:"success",
                        message:"Result is out",
                        data:report,
                        graph_data:graph_array
                    },200);
                })
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

module.exports = router;
