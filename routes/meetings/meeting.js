var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');;
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
var Meeting = mongoose.model('Meeting');
var Notification = mongoose.model('Notification');
var Stages = mongoose.model('Stages');
var Admin = mongoose.model('Admin');
var nodemailer = require('nodemailer');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// to create meeting
// 'franchisee_id':meetingForm.franchisee_id,'franchisor_id':meetingForm.franchisor_id,'stage_id':meetingForm.stage_id
router.post('/create_meeting', function (req, res) {
    var meetingForm = req.body;
    str = JSON.stringify(req.body);
    str1 = JSON.parse(str);
    console.log(str + "adsaaaa");
    try {
        Meeting.findOne({ 'franchisee_id': meetingForm.franchisee_id, 'franchisor_id': meetingForm.franchisor_id, 'meeting_time': meetingForm.meeting_time }, function (err, meeting) {
            // console.log(meetingForm);
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (meeting) {
                return res.send({
                    state: "failure",
                    message: "This meeting already exists!"
                }, 200);
            }
            if (!meeting) {
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
                meeting.save(function (err, meeting) {
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {

                        // if(meeting.stage_id == 'Kyc'){
                        //     update_stage_table(req, res,meeting);
                        // }
                        //else{
                        io.on('connection', function (socket) {
                            console.log(socket);
                            socket.emit('news', { hello: 'world' });
                            socket.on('message', function (data, response) {
                                console.log(data, "42_meeting.js");
                                var meeting_data = saveMeetingNotification(data, res);
                                console.log(meeting_data, "44_meeting.js");
                                io.emit('message', { type: 'new-message-23', text: meeting_data });
                                // Function above that stores the message in the database

                            });

                            socket.on('join', (params, callback) => {
                                // if(!isRealString(params.name) || !isRealString(params.room)) {
                                //     callback('Name and room are required.');
                                // }
                                socket.join(params.id);
                                socket.emit('newNotification'.generateMessage('You have a new notification'));
                                socket.broadcast.to(params.id).emit('newNotification', params);
                                io.emit.to(params.id).to('newNotification', { type: 'new-notification', text: meeting_data });
                            });
                        });
                        console.log('sda', meetingForm.franchisor_id);
                        Admin.find({ franchisor_id: meetingForm.franchisor_id }, function (err, user) {
                            if (err) {
                                return res.json(500, err);
                            }
                            if (user) {
                                console.log(user, "90");
                                meeting.user_name = user.user_name;
                                meeting.save();
                                console.log(meeting, 'meeting....');
                                return res.send({
                                    state: "success",
                                    message: "Meeting Scheduled .",
                                    meeting: meeting
                                }, 200);
                            }
                        })
                        //}
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
});

//update meeting
router.put('/edit_meeting', function (req, res, next) {
    var meetingEditForm = req.body;
    console.log(req.body);
    try {
        Meeting.findOne({ '_id': meetingEditForm._id }, function (err, meeting) {
            console.log('req.body', req.body);
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (meeting) {
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

                meeting.save(function (err, meeting) {
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Meeting Updated."
                        }, 200);
                    }
                });
            }
            if (!meeting) {
                res.send({
                    state: "failure",
                    message: "Failed to edit."
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
});

//to delete meeting
router.delete('/delete_meeting/:id', function (req, res) {
    try {
        Meeting.findByIdAndRemove({ _id: req.params.id }, function (err, meeting) {
            if (err) {
                return res.send(500, err);
            }
            if (!meeting) {
                res.send({
                    "message": "Unsucessfull",
                    state: "failure"
                }, 400);
            }
            else {
                res.send({
                    state: 'success',
                    "message": "Meeting deleted sucessfully",
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

//to get meeting by id
router.get('/get_meeting/:franchisee_id/:stage_id', function (req, res) {
    try {
        Meeting.find({ 'franchisee_id': req.params.franchisee_id, 'stage_id': req.params.stage_id }, function (err, meeting) {

            if (err) {
                return res.send(500, err);
            }
            if (!meeting) {
                res.send({
                    "state": "failure",
                    "data": []
                }, 400);
            }
            else {
                res.send({
                    state: "success",
                    data: meeting
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

// to get all meetings
router.get('/get_all_meetings', function (req, res) {
    try {
        Meeting.find({}, function (err, meeting) {
            if (err) {
                return res.send(500, err);
            }
            if (!meeting) {
                res.send({
                    "message": "Meetings not found",
                    "state": "failure",
                    "meetings": []
                }, 201);
            }
            else {
                res.send({
                    "state": "success",
                    "meetings": meeting
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
/**
 * Creates an access token with VoiceGrant using your Twilio credentials.
 *
 * @param {Object} request - POST or GET request that provides the recipient of the call, a phone number or a client
 * @param {Object} response - The Response Object for the http request
 * @returns {string} - The Access Token string
 */
function saveMeetingNotification(request, response) {
    var getNotifications = request;
    // console.log(getNotifications);
    console.log(request, "225");
    var notific = new Notification();
    notific.franchisor_id = getNotifications.franchisor_id;
    notific.franchisee_id = getNotifications.franchisee_id;
    notific.created_at = getNotifications.created_at;
    notific.meeting_title = getNotifications.meeting_title;
    notific.meeting_date = getNotifications.meeting_date;
    notific.meeting_time = getNotifications.meeting_time;
    notific.meeting_location = getNotifications.meeting_location;
    notific.status = getNotifications.status;
    notific.notification_to = getNotifications.notification_to;
    notific.discussion_notification = getNotifications.discussion_notification;
    notific.save(function (err, application) {
        console.log(application, "235");
        if (err) {
            console.log(err);
        }
        else {

            console.log("Successss");
            return "Test sdsds";
        }
        return "Test sdsds";
    })
}

router.get('/get_notifications', function (req, res) {
    try {
        Notification.find({}, function (err, meeting) {
            if (err) {
                return res.send(500, err);
            }
            else {
                res.send({
                    state: "success",
                    data: meeting
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
router.delete('/delete_notifications', function (req, res) {
    try {
        Notification.remove({}, function (err, notifications) {
            if (err) {
                return res.send(500, err);
            }
            else {
                res.send({
                    state: "success",
                    message: "notifications deleted successfully"
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

//to get franchisee notification
router.get('/get_franchisee_notifications/:franchisee_id/:franchisor_id', function (req, res) {
    try {

        Notification.find({ franchisee_id: req.params.franchisee_id, franchisor_id: req.params.franchisor_id }, function (err, meeting) {
            if (err) {
                return res.send(500, err);
            }
            if (!meeting) {
                res.send({
                    state: "failure",
                    data: []
                }, 400)
            }
            else {
                res.send({

                    state: "success",
                    data: meeting
                }, 200)
            }
        });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500)
    }
})

router.get('/get_franchisor_notifications/:franchisee_id', function (req, res) {


    try {

        Notification.find({ franchisee_id: req.params.franchisee_id }, function (err, meeting) {
            if (err) {
                return res.send(500, err);
            }
            if (!meeting) {

                res.send({
                    state: "failure",
                    data: []
                }, 400)

                console.log(meeting);
            }
            else {
                res.send({

                    state: "success",
                    data: meeting
                }, 200)
            }
        });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500)
    }
})

router.get('/get_franchisor_notifications/:franchisor_id', function (req, res) {
    try {

        Notification.find({ franchisor_id: req.params.franchisor_id }, function (err, meeting) {
            if (err) {
                return res.send(500, err);
            }
            if (!meeting) {

                res.send({
                    state: "failure",
                    data: []
                }, 400)
                console.log(meeting);
            }
            else {
                res.send({
                    state: "success",
                    data: meeting
                }, 200)
            }
        });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500)
    }
})

function update_stage_table(req, res, meeting) {
    try {
        Stages.findOne({ franchisee_id: meeting.franchisee_id }, function (err, stage) {
            stage.stage_kycupload.status = true;
            stage.stage_kycupload.franchisee_id = meeting.franchisee_id;
            stage.save(function (err, stage) {
                if (err) {
                    return res.send({
                        status: 500,
                        state: "err",
                        message: "Something went wrong.We are looking into it."
                    }, 500);
                }
                else {
                    var stage_Completed = 1;
                    update_franchisee(req, res, meeting.franchisee_id, stage_Completed, meeting);
                }
            });
        });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
}
function update_franchisee(req, res, franchisee_id, val, meeting) {
    Franchisee.findOne({ _id: franchisee_id }, function (err, franchiees) {
        if (err) {
            return res.send({
                state: "err",
                message: "Something went wrong."
            }, 500);
        }
        else {
            if (franchiees.franchisee_stage_completed < 3) {
                franchiees.franchisee_stage_completed = franchiees.franchisee_stage_completed + val;
            }
            franchiees.save(function (err, franchisee) {
                if (err) {
                    res.send({
                        status: 500,
                        state: "err",
                        message: "Something went wrong."
                    }, 500);
                }
                else {
                    return res.send({
                        state: "success",
                        message: "Meeting Scheduled .",
                        meeting: meeting
                    }, 200);
                }
            });
        }
    })
}
// to get meetings by franchisee id
router.get('/get_meeting_franchisee/:franchisee_id', function (req, res) {
    try {
        Meeting.find({ 'franchisee_id': req.params.franchisee_id }, function (err, meeting) {

            if (err) {
                return res.send(500, err);
            }
            if (!meeting) {
                res.send({
                    "state": "failure",
                    "data": []
                }, 400);
            }
            else {
                res.send({
                    state: "success",
                    data: meeting
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


// To approve or decline
router.put('/change_meeting_status',function(req,res){
    try{
        Meeting.findById({_id:req.body.meeting_id},function(err,meeting){
            if(err){
                return res.send(500, err);
            }   
            if(meeting) {
                if(meeting.meeting_status === 'approved'){
                    meeting.meeting_status= req.body.meeting_status,
                    meeting.approved_by = req.body.approved_by
                }
                if(meeting.meeting_status === 'declined'){
                    meeting.meeting_status= req.body.meeting_status,
                    meeting.approved_by = req.body.approved_by,
                    meeting.meeting_reason = req.body.meeting_reason
                }
                    meeting.save(function(err,meeting){
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Meeting updated.",
                            data: meeting
                        }, 200);
                    }
                });
            
            }
                    if (!meeting) {
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

module.exports = router;
module.exports.saveMeetingNotification = saveMeetingNotification;
