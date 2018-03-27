var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var fs = require('fs');
var path = require('path');
var Meeting = mongoose.model('Meeting');
var Stages = mongoose.model('Stages');
var nodemailer = require('nodemailer');
// to create meeting 
router.post('/create_meeting',  function(req, res) {
    var meetingForm = req.body;
    try{
        Meeting.findOne({'franchisee_id':meetingForm.franchisee_id,'franchisor_id':meetingForm.franchisor_id,
        'stage_id':meetingForm.stage_id},function(err,meeting){
                console.log('meeting',meeting);
            if(err){
                return res.send({
                        state:"err",
                        message:"Something went wrong.We are looking into it."
                    },500);
            }
            if(meeting){
                return res.send({
                    state:"failure",
                    message:"This meeting already exists!"
                },400);
            }
            if(!meeting){
               var meeting = new Meeting();

               meeting.meeting_title = meetingForm.meeting_title,
               meeting.meeting_location = meetingForm.meeting_location,
               meeting.meeting_date = meetingForm.meeting_date,
               meeting.meeting_time = meetingForm.meeting_time,
               meeting.assigned_people = meetingForm.meeting_assigned_people,
               meeting.meeting_additional_services = meetingForm.meeting_additional_services,
               meeting.franchisor_id = meetingForm.franchisor_id,
               meeting.franchisee_id = meetingForm.franchisee_id,
               meeting.stage_id = meetingForm.stage_id
                meeting.save(function(err,meeting){
                   if(err){
                     res.send({
                        state:"err",
                        message:"Something went wrong."
                    },500);
                   }
                else{

                    if(meeting.stage_id == 'Kyc'){
                        update_stage_table(req, res,meeting);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:"Meeting Scheduled .",
                            meeting: meeting
                        },200);
                    }
                }
                });
            }
        });
    }
    catch(err){
		return res.send({
			state:"error",
			message:err
		});
	}
});

//update meeting
router.put('/edit_meeting', function(req, res, next) {
    var meetingEditForm = req.body;
    try{
        Meeting.findOne({'_id':meetingEditForm._id},function(err,meeting){
            console.log('req.body', req.body);
            if(err){
                return res.send({
                        state:"err",
                        message:"Something went wrong.We are looking into it."
                    },500);
            }
            if(meeting){
                meeting.meeting_title = meetingEditForm.meeting_title,
                meeting.meeting_location = meetingEditForm.meeting_location,
                meeting.meeting_date = meetingEditForm.meeting_date,
                meeting.meeting_time = meetingEditForm.meeting_time,
                meeting.meeting_assigned_people = meetingEditForm.meeting_assigned_people,
                meeting.meeting_additional_services = meetingEditForm.meeting_additional_services,
                meeting.franchisor_id = meetingEditForm.franchisor_id,
                meeting.franchisee_id = meetingEditForm.franchisee_id,
                meeting.stage_id = meetingEditForm.stage_id

                meeting.save(function(err,meeting){
                   if(err){
                     res.send({
                        state:"err",
                        message:"Something went wrong."
                    },500);
                   }
                else{
                    res.send({
                        state:"success",
                        message:"Meeting Updated."
                    },200);
                }
                });
            }
            if(!meeting){
                res.send({
                    state:"failure",
                    message:"Meeting exist with this Id."
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
});

//to delete meeting 
router.delete('/delete_meeting/:id',function(req,res){
    try{
        Meeting.findByIdAndRemove({_id:req.params.id},function(err,meeting){
            if(err){
                return res.send(500, err);
            }
            if(!meeting){
                res.send({
                    "message":"Unsucessfull",
                    "data":"failure"
                },400);
            }
            else{
                res.send({
                    "message":"Meeting deleted sucessfully",
                },200);
            }
        })
    }
    catch(err){
        return res.send({
            state:"error",
            message:err
        });
    }
});

//to get meeting by id
router.get('/get_meeting/:franchisee_id/:stage_id',function(req,res){
    try{
        Meeting.find({'franchisee_id':req.params.franchisee_id,'stage_id':req.params.stage_id},function(err,meeting){

            if(err){
                return res.send(500, err);
            }
            if(!meeting){
                res.send({
                    "state":"failure",
                    "data":[]
                },400);
            }
            else{
                res.send({
                    state:"success",
                    data:meeting
                },200);
            }
        })
    }
    catch(err){
        return res.send({
            state:"error",
            message:err
        });
    }
});

// to get all meetings
router.get('/get_all_meetings',function(req,res){
    try{
        Meeting.find({},function(err,meeting){
            if(err){
                return res.send(500, err);
            }
            if(!meeting){
                res.send({
                    "message":"Meetings not found",
                    "state":"failure",
                    "meetings":[]
                },201);
            }
            else{
                res.send({
                    "state":"success",
                    "meetings":meeting
                },200);
            }
        })
    }
    catch(err){
		return res.send({
			state:"error",
			message:err
		});
	}
});

function update_stage_table(req, res,meeting){
    try{
        Stages.findOne({franchisee_id: meeting.franchisee_id}, function(err, stage){
            stage.stage_kycupload.status = true;
            stage.stage_kycupload.franchisee_id = meeting.franchisee_id;
            stage.save(function(err,stage){
                if(err){
                    return res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong.We are looking into it."
                    },500);
                }
                else{
                    return res.send({
                        state:"success",
                        message:"Meeting Scheduled .",
                        meeting: meeting
                    },200);
                }
            });
        });
    }
    catch(err){
		return res.send({
			state:"error",
			message:err
		},500);
	}
}

module.exports = router;