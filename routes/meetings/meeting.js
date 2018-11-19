var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');;
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
var Franchisor = mongoose.model('Franchisor');
var Meeting = mongoose.model('Meeting');
var Notification = mongoose.model('Notification');
var Stages = mongoose.model('Stages');
var Admin = mongoose.model('Admin');
var nodemailer = require('nodemailer');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ical = require("ical-generator");
const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');
const auth = new GoogleAuth();

const calendar = google.calendar("v3");

function createGmailCalenderEVent(options) {
    let cal = ical();
    cal.createEvent({
        start: new Date(options.start),
        end: new Date(options.start),
        summary: options.summary || options.subject,
        description: options.description || "",
        location: options.location
    });
    return {
        from: "sasirekhachinthas@gmail.com",//options.from,
        to: options.mail,//options.to.required,
        subject: "New Calendar Event from Carz",//options.subject,
        //html: "test",//options.html,
        alternatives: [{
            contentType: "text/calendar",
            content: new Buffer(cal.toString())
        }]
    }
}


// to create meeting
// 'franchisee_id':meetingForm.franchisee_id,'franchisor_id':meetingForm.franchisor_id,'stage_id':meetingForm.stage_id
router.post('/create_meeting', function (req, res) {
    var meetingForm = req.body;
    str = JSON.stringify(req.body);
    str1 = JSON.parse(str);
    var attendies = [];
    try {
        Meeting.findOne({ 'franchisee_id': meetingForm.franchisee_id, 'meeting_date': meetingForm.meeting_date, 'meeting_title': meetingForm.meeting_title }, function (err, meeting) {
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
                meeting.meeting_title = meetingForm.meeting_title;
                meeting.meeting_location = meetingForm.meeting_location;
                meeting.meeting_date = meetingForm.meeting_date;
                meeting.meeting_time = meetingForm.meeting_time;
                meeting.meeting_assigned_people = meetingForm.meeting_assigned_people;
                meeting.meeting_additional_services = meetingForm.meeting_additional_services;
                meeting.meeting_remarks = meetingForm.meeting_remarks
                meeting.meeting_franchisor_remarks = meetingForm.meeting_franchisor_remarks;
                meeting.franchisor_id = meetingForm.franchisor_id;
                meeting.franchisee_id = meetingForm.franchisee_id;
                meeting.stage_id = meetingForm.stage_id;
                meeting.notification_to = meetingForm.notification_to;
                meeting.meeting_status = meetingForm.meeting_status;
                meeting.created_by = meetingForm.created_by;
                // console.log(meetingForm.meeting_assigned_people);
                if (meetingForm.meeting_assigned_people) {
                    meetingForm.meeting_assigned_people.forEach(function (element) {

                        attendies.push(element['user_mail'])

                    });
                }

                Franchisor.findById(meetingForm.franchisor_id, function (err, franchisor) {
                    if (err) {
                        console.log(err);
                    } else {
                        attendies.push(franchisor.user_mail);

                        Franchisee.findById(meetingForm.franchisee_id, function (err, franchisee) {
                            if (err) {
                                console.log(err);
                            } else {
                                attendies.push(franchisee.franchisee_email);

                                meeting.save(function (err, meeting) {
                                    if (err) {
                                        res.send({
                                            state: "err",
                                            message: "Something went wrong."
                                        }, 500);
                                    }
                                    else {

                                        io.on('connection', function (socket) {
                                            //console.log(socket);
                                            socket.emit('news', { hello: 'world' });
                                            socket.on('message', function (data, response) {
                                                //console.log(data, "42_meeting.js");
                                                var meeting_data = saveMeetingNotification(data, res);
                                                //console.log(meeting_data, "44_meeting.js");
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
                                        //console.log('sda', meetingForm.franchisor_id);
                                        Admin.find({ franchisor_id: meetingForm.franchisor_id }, function (err, user) {
                                            if (err) {
                                                return res.json(500, err);
                                            }
                                            if (user) {
                                                //console.log(user, "90");
                                                meeting.user_name = user.user_name;
                                                meeting.save();
                                                let i = 0;

                                                var time = meeting.meeting_time;
                                                var hours = Number(time.match(/^(\d+)/)[1]);
                                                var minutes = Number(time.match(/:(\d+)/)[1]);
                                                var AMPM = time.match(/\s(.*)$/)[1];
                                                if (AMPM == "PM" && hours < 12) hours = hours + 12;
                                                if (AMPM == "AM" && hours == 12) hours = hours - 12;
                                                var sHours = hours.toString();
                                                var sMinutes = minutes.toString();

                                                if (hours < 10) sHours = "0" + sHours;
                                                if (minutes < 10) sMinutes = "0" + sMinutes;

                                                var d = meeting.meeting_date;
                                                d.setHours(d.getHours() + sHours);
                                                d.setMinutes(d.getMinutes() + sMinutes);

                                                attendies.forEach(function (mail) {
                                                    i++;
                                                    var options = {
                                                        'summary': meeting.meeting_title,
                                                        'location': meeting.meeting_location,
                                                        'description': 'A test calandar.',
                                                        'start': d,
                                                        'hours': sHours,
                                                        'minutes': sMinutes,
                                                        'mail': mail,
                                                        'end': {
                                                            'dateTime': '2015-05-28T17:00:00-07:00',
                                                            'timeZone': 'America/Los_Angeles',
                                                        },
                                                        'recurrence': [
                                                            'RRULE:FREQ=DAILY;COUNT=2'
                                                        ],
                                                        'attendees': [
                                                            { 'email': 'lpage@example.com' },
                                                            { 'email': 'sbrin@example.com' },
                                                        ],
                                                        'reminders': {
                                                            'useDefault': false,
                                                            'overrides': [
                                                                { 'method': 'email', 'minutes': 24 * 60 },
                                                                { 'method': 'popup', 'minutes': 10 },
                                                            ],
                                                        },
                                                    };

                                                    calendar.events.insert({
                                                        auth: auth,
                                                        calendarId: 'primary',
                                                        resource: options,
                                                    }, function (err, event) {
                                                        if (err) {
                                                            console.log('There was an error contacting the Calendar service: ' + err);
                                                            return;
                                                        }
                                                        console.log('Event created: %s', event.htmlLink);
                                                    });

                                                    var transporter = nodemailer.createTransport({
                                                        service: 'Gmail',
                                                        secure: false, // use SSL
                                                        //    host: "smtp.gmail.com",
                                                        port: 25, // port for secure SMTP
                                                        auth: {
                                                            user: 'carzdev@gmail.com',
                                                            pass: 'Carz@123'
                                                        }
                                                    });
                                                    transporter.sendMail(createGmailCalenderEVent(options), (err, info) => {
                                                        if (err) {
                                                            console.log(err, "Swamy Mail Error");
                                                        } else {
                                                            console.log(info, "Swamy Mail Info");
                                                        }
                                                    })
                                                    if (i == attendies.length) {
                                                        return res.send({
                                                            state: "success",
                                                            message: "Meeting Scheduled .",
                                                            meeting: meeting
                                                        }, 200);
                                                    }
                                                });


                                            }
                                        })
                                        //}
                                    }
                                });

                            }

                        });
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
                    meeting.notification_to - meetingEditForm.notification_to,
                    meeting.meeting_status = meetingEditForm.meeting_status,
                    meeting.created_by = meetingEditForm.created_by,
                    meeting.approved_by = meetingEditForm.approved_by;
                    if (meetingEditForm.meeting_reason) {
                        meeting.meeting_reason = meetingEditForm.meeting_reason
                    };
                meeting.save(function (err, meeting) {
                    if (err) {
                        res.send({
                            state: "failure",
                            message: "Something went wrong.",
                            data: err
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
        // Meeting.find({}, function (err, meeting) {
        //     if (err) {
        //         return res.send(500, err);
        //     }
        //     if (!meeting) {
        //         res.send({
        //             "message": "Meetings not found",
        //             "state": "failure",
        //             "meetings": []
        //         }, 201);
        //     }
        //     else {
        //         res.send({
        //             "state": "success",
        //             "meetings": meeting
        //         }, 200);
        //     }
        // })

        Meeting.find().populate('franchisee_id', 'franchisee_name franchisee_profile_pic') // only works if we pushed refs to person.eventsAttended
            .exec(function (err, meeting) {
                if (err) return handleError(err);
                // if (err) {
                //             return res.send(500, err);
                //         }
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
            });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
});

router.post('/get_meetings_count', async (req, res) => {
    if (req.body.date) {
        date = new Date(req.body.date);
        console.log(typeof (date));
        console.log(date);
        var fdt = date.setHours(0, 0, 0, 0);
        console.log(fdt, 'fdt');
        var tdt = date.setHours(23, 59, 59, 999);
        console.log(tdt, 'tdt');
        query = { meeting_date: { $gte: fdt, $lte: tdt } }
    }
    if (!req.body.date || req.body.date == null) {
        date = new Date();
        console.log(typeof (date));
        console.log(date);
        var fdt = date.setHours(0, 0, 0, 0);
        console.log(fdt, 'fdt');
        var tdt = date.setHours(23, 59, 59, 999);
        console.log(tdt, 'tdt');
        query = { meeting_date: { $gte: fdt, $lte: tdt } }
    }
    // console.log(query);
    //   Meeting.find(query, (err, data) => {
    //     if (err) {
    //         return res.json(500, err);
    //     }
    //     if (!data) {
    //         return res.json({
    //             state: 'error',
    //             message: 'No meetings found',
    //         })
    //     }
    //     if (data) {
    //         // console.log(data);
    //         // for(var i = 0; i<data.length; i++){
    //         //     Franchisee.findById({_id: data[i].franchisee_id}, function(err, franchisee){
    //         //         console.log(franchisee.franchisee_name);                    
    //         //         data[i]['franchisee_name'] = franchisee.franchisee_name;
    //         //         data[i]['franchisee_profile_pic'] = franchisee.franchisee_profile_pic;
    //         //     })
    //         // }
    //         data.forEach(function(meeting){
    //                  Franchisee.findById({_id: meeting.franchisee_id}, function(err, franchisee){
    //                      console.log(meeting);
    //                     meeting.franchisee_name_2 = franchisee.franchisee_name;
    //                     console.log(meeting, '459');
    //                     console.log(franchisee.franchisee_name, '460');
    //                  });


    //             });
    //         return res.json({
    //             state: 'success',
    //             message: 'Successfully fetched meeting data',
    //             meetings: data,
    //             meetings_count: data.length
    //         })
    //     }
    // })
    console.log('473', query);
    Meeting.find(query)
        .populate('franchisee_id', 'franchisee_name franchisee_profile_pic') // only works if we pushed refs to person.eventsAttended
        .exec(function (err, data) {
            if (err) return handleError(err);
            if (!data) {
                return res.json({
                    state: 'error',
                    message: 'No meetings found',
                })
            }
            if (data) {
                return res.json({
                    state: 'success',
                    message: 'Successfully fetched meeting data',
                    meetings: data,
                    meetings_count: data.length
                });
            }
        });

})
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
    notific.meeting_status = getNotifications.meeting_status;
    if (!getNotifications.meeting_status == 'pending') {
        notific.notification_to = getNotifications.notification_to;
    }
    notific.discussion_notification = getNotifications.discussion_notification;
    if (getNotifications.meeting_reason) {
        notific.meeting_reason = getNotifications.meeting_reason;
    }
    if (getNotifications.meeting_status) {
        notific.approved_by = getNotifications.approved_by;
    }
    if (getNotifications.meeting_status) {
        if (getNotifications.notification_to == 'franchisee') {
            notific.notification_to = "franchisor",
                console.log(notific.notification_to, '1', getNotifications.notification_to);
        }
        else if (getNotifications.notification_to == 'franchisor') {
            notific.notification_to = "franchisee",
                console.log(notific.notification_to, '2', getNotifications.notification_to);
        }
    }
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

router.get('/get_notifications/:user_id', function (req, res) {
    try {
        Notification.find({ $or: [{ franchisor_id: req.params.user_id }, { franchisee_id: req.params.user_id }] }, function (err, meeting) {
            if (err) {
                return res.send(500, err);
            }
            else {
                res.send({
                    state: "success",
                    data: meeting
                }, 200);
            }
        }).sort({ date: -1 })
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
        // Meeting.find({ 'franchisee_id': req.params.franchisee_id }, function (err, meeting) {

        //     if (err) {
        //         return res.send(500, err);
        //     }
        //     if (!meeting) {
        //         res.send({
        //             "state": "failure",
        //             "data": []
        //         }, 400);
        //     }
        //     else {
        //         res.send({
        //             state: "success",
        //             data: meeting
        //         }, 200);
        //     }
        // })
        Meeting.find({ 'franchisee_id': req.params.franchisee_id }).populate('franchisee_id', 'franchisee_name franchisee_profile_pic') // only works if we pushed refs to person.eventsAttended
            .exec(function (err, meeting) {
                if (err) return handleError(err);
                // if (err) {
                //             return res.send(500, err);
                //         }
                if (!meeting) {
                    res.send({
                        "message": "Meetings not found",
                        "state": "failure",
                        "data": []
                    }, 201);
                }
                else {
                    res.send({
                        "state": "success",
                        data: meeting
                    }, 200);
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


router.get('/change_read_status/:id', (req, res) => {
    console.log(req.params.id);
    var id_array = [];
    Notification.find({ $or: [{ franchisor_id: req.params.id }, { franchisee_id: req.params.id }] }, (err, data) => {
        if (err) {
            return res.json(500, err);
        }
        if (data) {
            // console.log(data, 'data');
            for (i = 0; i < data.length; i++) {
                // data[i].read_status = true;
                // data[i].save();
                id_array.push(data[i]._id);
            }
            Notification.update({ _id: { $in: id_array } }, { read_status: true }, { multi: true }, (err, success) => {
                if (err) {
                    return res.json(err);
                }
                if (success) {
                    return res.json({
                        state: 'success',
                        message: 'Successfully changed notification read status'
                    })
                }
            })
        }
    })
})

// To approve or decline
router.put('/change_meeting_status', function (req, res) {
    try {
        Meeting.findById({ _id: req.body.meeting_id }, function (err, meeting) {
            if (err) {
                return res.send(500, err);
            }
            if (meeting) {
                console.log('meet', req.body.meeting_status);
                if (req.body.meeting_status == 'approved') {
                    meeting.meeting_status = req.body.meeting_status;
                    meeting.approved_by = req.body.approved_by;
                }
                if (req.body.meeting_status == 'declined' && req.body.meeting_reason != null) {
                    meeting.meeting_status = req.body.meeting_status;
                    meeting.approved_by = req.body.approved_by;
                    meeting.meeting_reason = req.body.meeting_reason;
                }
                meeting.save(function (err, meeting) {
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        console.log(meeting, 'here');
                        if (meeting.meeting_status === 'declined') {
                            var reciever_mail;
                            var sender_name;
                            if (meeting.approved_by == 'franchisor') {
                                Franchisee.findById({ _id: meeting.franchisee_id }, (err, data) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    if (data) {
                                        console.log(data, 'mail_data');
                                        reciever_mail = data.franchisee_email;
                                        console.log(reciever_mail, 'receiver_mail');
                                        mailSend(reciever_mail, "carz");
                                    }
                                })
                            }
                            if (meeting.approved_by == 'franchisee') {
                                Franchisor.findById({ _id: meeting.franchisor_id }, (err, data) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    if (data) {
                                        console.log(data, 'mail_data');
                                        reciever_mail = data.user_mail;
                                        console.log(reciever_mail, 'receiver_mail');
                                        Franchisee.findById({ _id: meeting.franchisee_id }, (err, success) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            if (success) {
                                                sender_name = success.franchisee_name;
                                                mailSend(reciever_mail, sender_name);

                                            }
                                        })
                                    }
                                })
                            }
                            function mailSend(reciever_mail, sender_name) {

                                var mailOptions = {
                                    to: reciever_mail,
                                    subject: 'Carz meeting status',
                                    from: "carzdev@gmail.com",
                                    headers: {
                                        "X-Laziness-level": 1000,
                                        "charset": 'UTF-8'
                                    },

                                    html: "<p>Your meeting with <b>" + sender_name + "</b> has been declined.</p><div><p>Reason: " + meeting.meeting_reason + " </p></div><div><p>Best,</p><p>Carz.</p></div>"
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
                        io.on('connection', function (socket) {
                            console.log(socket);
                            socket.emit('news', { hello: 'world' });
                            socket.on('message', function (data, response) {
                                console.log(data, "42_meeting.js");
                                var meeting_data = saveMeetingNotification(data, response);
                                console.log(meeting_data, "44_meeting.js");
                                io.emit('message', { type: 'new-message-23', text: meeting_data });
                                // Function above that stores the message in the database

                            });
                        });
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
    catch (err) {
        res.send({
            state: "error",
            message: "Something went wrong"
        }, 500);
    }
});

module.exports = router;
module.exports.saveMeetingNotification = saveMeetingNotification;
