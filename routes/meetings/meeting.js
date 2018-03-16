var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var fs = require('fs');
var path = require('path');
var Meeting = mongoose.model('Meeting');
var nodemailer = require('nodemailer');
// to create meeting 
router.post('/create_meeting',  function(req, res) {
    var meetingForm = req.body;
    console.log('req.body', req.body);
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
                res.send({
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
                    res.send({
                        state:"success",
                        message:"Meeting Scheduled .",
                        meeting: meeting
                    },200);
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
            Meeting.findOne({'franchisee_id':req.params.franchisee_id,'stage_id':req.params.stage_id},function(err,meeting){

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

router.put('/send_mail',function(req,res){
    try{
        Meeting.findOne({franchisee_id:req.body.franchisee_id},function(err,franchise){
            if(err){
                return res({
                    "state":"failure",
                    "message":err
                })
            }
            else{
                var filepath ='https://celebappfiles.s3.ap-south-1.amazonaws.com/1521119220821.angular-from-theory-to-practice.pdf';
                var fromName = "CARZ";
                    var mailOptions={
                    to: "ikshit1@gmail.com,whyso.09@gmail.com",
                    subject: req.body.subject,
                    from: "ikshitnodemailer@gmail.com",
                    headers: {
                        "X-Laziness-level": 1000,
                        "charset" : 'UTF-8'
                    },
                    attachments: [{
                        filename: "Application Form.pdf",
                        contentType: 'application/pdf',
                        path: 'https://celebappfiles.s3.ap-south-1.amazonaws.com/1521119220821.angular-from-theory-to-practice.pdf'
                    }],
                    html: req.body.body
                    //html: '<a href="https://howdydev.herokuapp.com/resetpassword/'+pwdchangerequest.passcode+'">Click here to change your password</a>'
                }
                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    secure: false, // use SSL
                    port: 25, // port for secure SMTP
                    auth: {
                        user: 'ikshitnodemailer@gmail.com',
                        pass: 'ikshit1007007'
                    }
                });
                transporter.sendMail(mailOptions, function(error, response){
                    if(error){
                        return res.send(error);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:"Email send successfully"
                        });
                    }
                });
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

module.exports = router;