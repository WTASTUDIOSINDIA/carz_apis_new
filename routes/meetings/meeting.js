var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var fs = require('fs');
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
var Meeting = mongoose.model('Meeting');
var Notification = mongoose.model('Notification');
var Stages = mongoose.model('Stages');
var nodemailer = require('nodemailer');
// to create meeting
// 'franchisee_id':meetingForm.franchisee_id,'franchisor_id':meetingForm.franchisor_id,'stage_id':meetingForm.stage_id
router.post('/create_meeting',  function(req, res) {
    var meetingForm = req.body;
    try{
        Meeting.findOne({'franchisee_id':meetingForm.franchisee_id,'franchisor_id':meetingForm.franchisor_id,'meeting_date':meetingForm.meeting_date,'meeting_time':meetingForm.meeting_time},function(err,meeting){
            // console.log(meetingForm);
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
                },200);
            }
            if(!meeting){
               var meeting = new Meeting();

               meeting.meeting_title = meetingForm.meeting_title,
               meeting.meeting_location = meetingForm.meeting_location,
               meeting.meeting_date = meetingForm.meeting_date,
               meeting.meeting_time = meetingForm.meeting_time,
               meeting.meeting_assigned_people = meetingForm.meeting_assigned_people,
               meeting.meeting_additional_services = meetingForm.meeting_additional_services,
               meeting.meeting_remarks = meetingForm.meeting_remarks
               meeting.meeting_franchisor_remarks = meetingForm.meeting_franchisor_remarks,
               meeting.franchisor_id = meetingForm.franchisor_id,
               meeting.franchisee_id = meetingForm.franchisee_id,
               meeting.stage_id = meetingForm.stage_id,
               meeting.notification_to = meetingForm.notification_to
                meeting.save(function(err,meeting){
                   if(err){
                     res.send({
                        state:"err",
                        message:"Something went wrong."
                    },500);
                   }
                else{

                    // if(meeting.stage_id == 'Kyc'){
                    //     update_stage_table(req, res,meeting);
                    // }
                    //else{
                        return res.send({
                            state:"success",
                            message:"Meeting Scheduled .",
                            meeting: meeting
                        },200);
                    //}
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
    console.log(req.body);
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
                meeting.stage_id = meetingEditForm.stage_id,
                meeting.meeting_remarks = meetingEditForm.meeting_remarks,
                meeting.meeting_franchisor_remarks = meetingEditForm.meeting_franchisor_remarks,
                meeting.notification_to - meetingEditForm.notification_to

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
                    message:"Failed to edit."
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
function saveMeetingNotification(data){
    var getNotifications = data;
    // console.log(getNotifications);
    // console.log(data);
    var notific = new Notification();
    notific.franchisor_id = getNotifications.franchisor_id;
    notific.franchisee_id = getNotifications.franchisee_id;
    notific.created_at = getNotifications.created_at;
    notific.meeting_date = getNotifications.meeting_date;
    notific.meeting_time = getNotifications.meeting_time;
    notific.meeting_location = getNotifications.meeting_location;
    notific.Status = getNotifications.Status;
    notific.notification_to = getNotifications.notification_to;
    notific.save(function (err, application) {
            console.log(application);
            if(err) {
                console.log(err);
            }
            else {
                console.log("Successss");
            }
        })
}

router.get('/get_notifications', function(req, res){
    try{
        Notification.find({},function(err,meeting){
            if(err){
                return res.send(500, err);
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
})

//to get franchisee notification
router.get('/get_franchisee_notification', function(req, res){
    try{
        Notification.findById({_id:req.params.franchisee_id}, function (err, meeting){
            if(err){
                return 
                res.send(500,err);
            }
            if(!notification){
                res.send({
                    state:"failure",
                    data:[]
                },400)
            }
            else {
                res.send({

                    state:"success",
                    data:notification
                },200)
            }
        });
    }
    catch(err){
        return res.send({
            state:"error",
            message: err
        },500)
    }
})

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
                    var stage_Completed = 1;
                    update_franchisee(req, res, meeting.franchisee_id,stage_Completed,meeting);
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
function update_franchisee(req, res, franchisee_id,val,meeting){
    Franchisee.findOne({_id:franchisee_id},function(err,franchiees){
        if(err){
            return res.send({
                state:"err",
                message:"Something went wrong."
            },500);
        }
        else{
            if(franchiees.franchisee_stage_completed <3){
                franchiees.franchisee_stage_completed = franchiees.franchisee_stage_completed + val;
            }
            franchiees.save(function(err,franchisee){
                if(err){
                    res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong."
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
        }
    })
}
// to get meetings by franchisee id
router.get('/get_meeting_franchisee/:franchisee_id',function(req,res){
    try{
        Meeting.find({'franchisee_id':req.params.franchisee_id},function(err,meeting){

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

module.exports = router;
module.exports.saveMeetingNotification = saveMeetingNotification;
