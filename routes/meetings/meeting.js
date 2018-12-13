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
var dateFormat = require('dateformat');
var ActivityTracker = mongoose.model('ActivityTracker');
// var app = express();
// var http = require('http').createServer(app);
var io = require('socket.io-client');
// var socket = io('http://localhost:3010?k=foo&p=bar');
var ical = require("ical-generator");
var utils = require('../../common/utils');
var franchisee = require('../../routes/franchisees/franchisee');
var saveActivityTracker = franchisee.saveActivity;
const { google } = require('googleapis');
var socket = io("http://locahost:3000");
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
        subject: "Meeting request approved",//options.subject,
        //html: "test",//options.html,
        alternatives: [{
            contentType: "text/calendar",
            content: new Buffer(cal.toString())
        }]
    }
}


// to create meeting
// 'franchisee_id':meetingForm.franchisee_id,'franchisor_id':meetingForm.franchisor_id,'stage_id':meetingForm.stage_id
socket.once('connect', function () {
    console.log("new client connected");
    console.log("new client connectsed");
});
var activity_data = {
    name: '',
    source: '',
    activity_of: '',
    franchisee_id: '',
    franchisor_id: ''
}
router.post('/create_meeting', function (req, res) {

    var meetingForm = req.body;
    activity_data.franchisor_id = meetingForm.franchisor_id;
    activity_data.franchisee_id = meetingForm.franchisee_id;
    str = JSON.stringify(req.body);
    str1 = JSON.parse(str);
    var attendies = [];
    try {
        // io.emit('meeting_request_notification', data);
        // io.sockets.on('connection', function(socket){
        //     console.log("new client connected");
        // });
        // console.log(socket, "55Socket");
        // console.log(io, "56Socket");
        // socket.emit('chat_message', req);

        // io.on('connect',function(socket){
        //     console.log("SwamyTech");
        //     socket.on('some event',myfunction);
        // })
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
                console.log(meetingForm, "buis");
                meeting.meeting_title = meetingForm.meeting_title;
                meeting.meeting_location = meetingForm.meeting_location;
                meeting.meeting_date = meetingForm.meeting_date;
                meeting.meeting_time = meetingForm.meeting_time;
                meeting.meeting_assigned_people = meetingForm.meeting_assigned_people;
                meeting.meeting_additional_services = meetingForm.meeting_additional_services;
                meeting.meeting_remarks = meetingForm.meeting_remarks
                meeting.meeting_franchisor_remarks = meetingForm.meeting_franchisor_remarks;
                meeting.franchisor_id = meetingForm.franchisor_id;
                if (meetingForm.franchisee_name) {
                    meeting.franchisee_name = meetingForm.franchisee_name;
                }
                if (meeting.partner_name) {
                    meeting.franchisee_name = meetingForm.partner_name;
                }
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
                                if(meetingForm.created_by == 'franchisor'){
                                    activity_data.name = 'Meeting Created';
                                    activity_data.activity_of = 'franchisor';
                                }
                                if(meetingForm.created_by == 'franchisee'){
                                    activity_data.name = 'Meeting Created';
                                    activity_data.activity_of = 'franchisee';
                                }
                                attendies.push(franchisee.franchisee_email);
                                var saveActivity = saveActivityTracker(activity_data);
                                // console.log(saveActivity,'---------------');
                                meeting.save(function (err, meeting) {
                                    if (err) {
                                        res.send({
                                            state: "err",
                                            message: "Something went wrong."
                                        }, 500);
                                    }
                                    else {
                                        // io.sockets.on('connection', function( socket ) {
                                        //     console.log("Krishna Geramany");
                                        //     socket.emit('meeting_request_notification', meeting);
                                        // });

                                        // socket.broadcast.to(params.id).emit('newNotification', params);
                                        // io.emit.to(params.id).to('newNotification', { type: 'new-notification', text: meeting_data });


                                        // io.on('connect', function (socket) {

                                        //     console.log("Rockstar");
                                        //     //console.log(socket);
                                        //     // socket.emit('news', { hello: 'world' });
                                        //     // socket.on('message', function (data, response) {
                                        //     //     //console.log(data, "42_meeting.js");
                                        //     //     var meeting_data = saveMeetingNotification(data, res);
                                        //     //     //console.log(meeting_data, "44_meeting.js");
                                        //     //     socket.emit('message', { type: 'new-message-23', text: meeting_data });
                                        //     //     // Function above that stores the message in the database

                                        //     // });
                                        //     send_notifications('meeting_request', meeting);



                                        //     socket.on('join', (params, callback) => {
                                        //         // if(!isRealString(params.name) || !isRealString(params.room)) {
                                        //         //     callback('Name and room are required.');
                                        //         // }
                                        //         socket.join(params.id);
                                        //         socket.emit('newNotification'.generateMessage('You have a new notification'));
                                        //         socket.broadcast.to(params.id).emit('newNotification', params);
                                        //         io.emit.to(params.id).to('newNotification', { type: 'new-notification', text: meeting_data });
                                        //     });
                                        // });
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

//router.po
function send_notifications(notification_type, data, iofromp) {
    // iofromapp.emit('message', data);
    var notific = new Notification();
    notific.franchisor_id = data.franchisor_id;
    notific.franchisee_id = data.franchisee_id;
    data.meeting_date = dateFormat(data.meeting_date, "dd-mm-yyyy");
    notific.created_at = new Date();
    console.log(data, "Robotooo");
    if (data.meeting_status) {
        notific.meeting_status = data.meeting_status;
        notific.meeting_type = 'Meeting'
        if (data.notification_type === 'meeting_request' && data.meeting_status === 'pending') {
            if (data.notification_to == "franchisor") {
                notific.notification_title = "You have a new meeting request regarding " + data.meeting_title + " with Franchisee on " + data.meeting_date + " at " + data.meeting_date + " " + data.meeting_time;
            }
            if (data.notification_to == "franchisee") {
                notific.notification_title = "You have a new meeting request regarding " + data.meeting_title + " with Franchisor on " + data.meeting_date + " at  " + data.meeting_time;
            }
        }
        else if (data.meeting_status === 'approved') {
            if (data.notification_to == "franchisor") {
 
                notific.notification_title = "Your meeting with " + data.franchisee_name + " titled " + data.meeting_title + " has been approved. ";
            }
            if (data.notification_to == "franchisee") {
                notific.notification_title = "Your meeting with franchisor has been approved";
            }
        }
        else if (data.meeting_status === 'declined') {
            if (data.notification_to == "franchisor") {

                notific.notification_title = "Your meeting with " + data.franchisee_name + " titled " + data.meeting_title + " has been declined. ";
            }
            if (data.notification_to == "franchisee") {
                notific.notification_title = "Your meeting with franchisor has been declined";
            }
        }
        if (data.meeting_status === 'edited') {
            if (data.notification_to == "franchisor") {

                notific.notification_title = "Your meeting with " + data.franchisee_name + " titled " + data.meeting_title + " has been edited, please look below for further details.";
            }
            if (data.notification_to == "franchisee") {
                notific.notification_title = "Your meeting with franchisor has been edited, please look below for further details.";
            }
        }
    }
    else if (data.notification_type === 'nda_approve_decline') {
        notific.notification_type = 'NDA'
        if (data.status === 'approved') {
            notific.notification_title = data.franchisor_name + " has approved your NDA file."
        } if (data.status === 'declined') {
            notific.notification_title = data.franchisor_name + " has declined your NDA file, reason: " + data.rejected_reason
        }
    }
    else if (data.notification_type === 'nda_uploaded') {
        notific.notification_type = 'NDA'
        if (data.notification_to === 'franchisee') {
            notific.notification_title = 'Franchisor' + " has uploaded your nda file, please wait for approval."
        }
        if (data.notification_to === 'franchisor') {
            notific.notification_title = data.franchisee_name + " has uploaded the nda file."
        }
    }
    else if (data.notification_type === 'payment_uploaded') {
        notific.notification_type = 'PAYMENT'
        notific.notification_title = 'Franchisor' + " has uploaded your 1 lakh payment file."
    }
    else if (data.notification_type === 'app_form_uploaded') {
        notific.notification_type = 'APPLICATION FORM'
        if (data.notification_to === 'franchisee') {
            if (data.status === 'approved') {
                notific.notification_title = data.franchisor_name + " has " + data.status + " your application."
            }
            if (data.status === 'declined') {
                notific.notification_title = data.franchisor_name + " has " + data.status + " your application. Reason: " + data.reason;
            }
        }
        if (data.notification_to === 'franchisor') {
            notific.notification_title = data.franchisee_name + " has submitted application, please check for further review."
        }
    }
    else if (data.notification_type === 'agreement_uploaded') {
        notific.notification_type = 'AGREEMENT FILE'
        notific.notification_title = data.franchisor_name + " has uploaded agreement file."
    }
    else if (data.notification_type === 'four_lac_uploaded') {
        notific.notification_type = '4 LAC PAYMENT'
        notific.notification_title = data.franchisor_name + " has uploaded 4 lac payment file."
    }
    else if (data.notification_type === 'kyc_uploaded') {
        notific.notification_type = 'KYC'
        notific.notification_title = " Franchisee's partner, "+ data.partner_name + " has uploaded kyc file " + data.doc_name
    }
    else if (data.notification_type === 'kyc_declined') {
        notific.notification_type = 'KYC'
        notific.notification_title = data.franchisor_name + " has declined your kyc file. " + "\n" + "Reason: " + data.reason + "\n" + "Comment: " + data.comment + "\n" + "Please upload again for further verification."
    }
    else if (data.notification_type === 'kyc_approved') {
        notific.notification_type = 'KYC'
        notific.notification_title = data.franchisor_name + " has approved your kyc file " + data.doc_name
    }
    notific.notification_to = data.notification_to;
    notific.save(function (err, application) {
        console.log(application, "235");
        if (err) {
            console.log(err);
        }
        else {
            socket.on('join', (params, callback) => {
                // if(!isRealString(params.name) || !isRealString(params.room)) {
                //     callback('Name and room are required.');
                // }
                socket.join(params.id);
                // socket.emit('newNotification'.generateMessage('You have a new notification'));
                socket.broadcast.to(params.id).emit('newNotification', params);
                io.emit.to(params.id).to('newNotification', { type: 'new-notification', text: application });
            });
        }
        // return "Test sdsds";
    })
};
// 'franchisee_id':meetingForm.franchisee_id,'franchisor_id':meetingForm.franchisor_id,'stage_id':meetingForm.stage_id
router.post('/create_meeting_old', function (req, res) {
    var meetingForm = req.body;
    str = JSON.stringify(req.body);
    str1 = JSON.parse(str);
    var attendies = [];
    try {
        Meeting.findOne({ 'franchisee_id': meetingForm.franchisee_id, 'meeting_date': meetingForm.meeting_date, 'meeting_title': meetingForm.meeting_title }, function (err, meeting) {
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
                meeting.franchisee_name = meetingForm.franchisee_name;
                meeting.franchisor_id = meetingForm.franchisor_id;
                meeting.franchisee_id = meetingForm.franchisee_id;
                meeting.stage_id = meetingForm.stage_id;
                meeting.notification_to = meetingForm.notification_to;
                meeting.meeting_status = meetingForm.meeting_status;
                meeting.created_by = meetingForm.created_by;
                if (meetingForm.meeting_assigned_people) {
                    meetingForm.meeting_assigned_people.forEach(function (element) {

                        attendies.push(element['user_mail'])

                    });
                }
                Franchisor.findById(meetingForm.franchisor_id, function (err, franchisor) {
                    if (err) {
                        console.log(err);
                    }
                    if (!franchisor) {
                        return res.json({
                            'state': err,
                            'message': 'Franchisor doesnt exist'
                        })
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
                                            socket.emit('news', { hello: 'world' });
                                            socket.on('message', function (data, response) {

                                                var meeting_data = utils.saveMeetingNotification(data, res);
                                                socket.emit('message', { type: 'new-message-23', text: meeting_data });
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
                                        Admin.find({ franchisor_id: meetingForm.franchisor_id }, function (err, user) {
                                            if (err) {
                                                return res.json(500, err);
                                            }
                                            if (user) {
                                                meeting.user_name = user.user_name;
                                                meeting.save();
                                                let i = 0;

                                                // var time = meeting.meeting_time;
                                                // var hours = Number(time.match(/^(\d+)/)[1]);
                                                // var minutes = Number(time.match(/:(\d+)/)[1]);
                                                // var AMPM = time.match(/\s(.*)$/)[1];
                                                // if (AMPM == "PM" && hours < 12) hours = hours + 12;
                                                // if (AMPM == "AM" && hours == 12) hours = hours - 12;
                                                // var sHours = hours.toString();
                                                // var sMinutes = minutes.toString();

                                                // if (hours < 10) sHours = "0" + sHours;
                                                // if (minutes < 10) sMinutes = "0" + sMinutes;

                                                // var d = meeting.meeting_date;
                                                // d.setHours(d.getHours() + sHours);
                                                // d.setMinutes(d.getMinutes() + sMinutes);

                                                attendies.forEach(function (mail) {
                                                    i++;
                                                    let user_data = {};

                                                    user_data.user_mail = mail;
                                                    if (req.body.franchisee_name) {
                                                        user_data.franchisee_name = req.body.franchisee_name;
                                                        user_data.subject = 'Meeting Created';
                                                        user_data.html = "<p>Hi, " + user_data.franchisee_name + "<br>" + "Meeting invite has been sent. Please wait for the Franchisor to accept your meeting request." + "<br><br>" + "Best," + "<br>" + "Carz.</p>"
                                                    }
                                                    else if (req.body.partner_name) {
                                                        user_data.partner_name = req.body.partner_name;
                                                        user_data.subject = 'Meeting Created';
                                                        user_data.html = "<p>Hi, " + user_data.partner_name + "<br>" + "Meeting invite has been sent. Please wait for the Franchisor to accept your meeting request." + "<br><br>" + "Best," + "<br>" + "Carz.</p>"
                                                    }
                                                    // else if(req.body.user_name){
                                                    //     user_data.user_name = req.body.user_name;
                                                    //     user_data.subject = 'Meeting Created';
                                                    //     user_data.html =  "<p>Hi, "+user_data.user_name + "<br>" + "Meeting invite has been sent. Please wait for the Franchisee to accept your meeting request." + "<br><br>" + "Best," + "<br>"+ "Carz.</p>"
                                                    // }
                                                    // console.log(user_data.user_name,'--------username-------');


                                                    utils.send_mail(user_data)

                                                    // var options = {
                                                    //     'summary': meeting.meeting_title,
                                                    //     'location': meeting.meeting_location,
                                                    //     'description': 'A test calandar.',
                                                    //     'start': d,
                                                    //     'hours': sHours,
                                                    //     'minutes': sMinutes,
                                                    //     'mail': mail,
                                                    //     'end': {
                                                    //         'dateTime': '2015-05-28T17:00:00-07:00',
                                                    //         'timeZone': 'America/Los_Angeles',
                                                    //     },
                                                    //     'recurrence': [
                                                    //         'RRULE:FREQ=DAILY;COUNT=2'
                                                    //     ],
                                                    //     'attendees': [
                                                    //         { 'email': 'lpage@example.com' },
                                                    //         { 'email': 'sbrin@example.com' },
                                                    //     ],
                                                    //     'reminders': {
                                                    //         'useDefault': false,
                                                    //         'overrides': [
                                                    //             { 'method': 'email', 'minutes': 24 * 60 },
                                                    //             { 'method': 'popup', 'minutes': 10 },
                                                    //         ],
                                                    //     },
                                                    // };

                                                    // calendar.events.insert({
                                                    //     auth: auth,
                                                    //     calendarId: 'primary',
                                                    //     resource: options,
                                                    // }, function (err, event) {
                                                    //     if (err) {
                                                    //         console.log('There was an error contacting the Calendar service: ' + err);
                                                    //         return;
                                                    //     }
                                                    //     console.log('Event created: %s', event.htmlLink);
                                                    // });

                                                    // var transporter = nodemailer.createTransport({
                                                    //     service: 'Gmail',
                                                    //     secure: false, // use SSL
                                                    //     //    host: "smtp.gmail.com",
                                                    //     port: 25, // port for secure SMTP
                                                    //     auth: {
                                                    //         user: 'carzdev@gmail.com',
                                                    //         pass: 'Carz@123'
                                                    //     }
                                                    // });
                                                    // transporter.sendMail(createGmailCalenderEVent(options), (err, info) => {
                                                    //     if (err) {
                                                    //         console.log(err, "Swamy Mail Error");
                                                    //     } else {
                                                    //         console.log(info, "Swamy Mail Info");
                                                    //     }
                                                    // })
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
    try {
        Meeting.findOne({ '_id': meetingEditForm._id }, function (err, meeting) {
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
                    meeting.meeting_status = 'edited',
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
                            message: "Meeting Updated.",
                            data: meeting
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
    if(req.body.user_role == 'franchisee'){
    if (req.body.date) {
        date = new Date(req.body.date);
        var fdt = date.setHours(0, 0, 0, 0);
        var tdt = date.setHours(23, 59, 59, 999);
        query = { meeting_date: { $gte: fdt, $lte: tdt }, master_franchisee_id: mongoose.Types.ObjectId(req.body._id) };
        // var franchisor_id = mongoose.Types.ObjectId(req.body._id)
        // var master_franchisee_id = mongoose.Types.ObjectId(req.body._id)
    }
    if (!req.body.date || req.body.date == null) {
        date = new Date();
        var fdt = date.setHours(0, 0, 0, 0);
        var tdt = date.setHours(23, 59, 59, 999);
        query = { meeting_date: { $gte: fdt, $lte: tdt }, master_franchisee_id: mongoose.Types.ObjectId(req.body._id) };
        // query = { meeting_date: { $gte: fdt, $lte: tdt } };
        // var franchisor_id = mongoose.Types.ObjectId(req.body._id)
        // var master_franchisee_id = mongoose.Types.ObjectId(req.body._id)
    }
}
else{
    if (req.body.date) {
        date = new Date(req.body.date);
        var fdt = date.setHours(0, 0, 0, 0);
        var tdt = date.setHours(23, 59, 59, 999);
        query = { meeting_date: { $gte: fdt, $lte: tdt }, franchisor_id:  mongoose.Types.ObjectId(req.body._id) };

    }
    if (!req.body.date || req.body.date == null) {
        date = new Date();
        var fdt = date.setHours(0, 0, 0, 0);
        var tdt = date.setHours(23, 59, 59, 999);
        query = { meeting_date: { $gte: fdt, $lte: tdt }, franchisor_id: mongoose.Types.ObjectId(req.body._id) };

    }
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
            if (err) return 
           console.log(err, 'err');
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
    notific.notification_to = getNotifications.notification_to;
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
    // if (getNotifications.meeting_status) {
    //     if (getNotifications.notification_to == 'franchisee') {
    //         notific.notification_to = "franchisor",
    //         console.log('notification_to_1', notific); 
    //     }
    //     else if (getNotifications.notification_to == 'franchisor') {
    //         notific.notification_to = "franchisee",
    //         console.log('notification_to_2', notific);         
    //     }
    //     console.log('notification_to_3', notific); 
    // }
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


// router.get('/get_notifications/:user_id', function (req, res) {
//     try {
//         Notification.find({ $or: [{ franchisor_id: req.params.user_id }, { franchisee_id: req.params.user_id }] }, function (err, meeting) {
//             if (err) {
//                 return res.send(500, err);
//             }
//             else {
//                 res.send({
//                     state: "success",
//                     data: meeting
//                 }, 200);
//             }
//         }).sort({ date: -1 })
//     }
//     catch (err) {
//         return res.send({
//             state: "error",
//             message: err
//         });
//     }
// })
router.get('/get_notifications/:user_id', function (req, res) {
    var notifications = {
        franchisor_id: null,
        franchisee_id: null,
        notification_title: null,
        notification_status: null,
        location: null,
        notification_date: null,
        read_status: null,
        notification_to: null
    }
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
router.get('/get_notifications_old/:user_id', function (req, res) {
    var notifications = {
        franchisor_id: null,
        franchisee_id: null,
        notification_title: null,
        notification_status: null,
        location: null,
        notification_date: null,
        read_status: null,
        notification_to: null
    }
    try {
        Notification.find({ $or: [{ franchisor_id: req.params.user_id }, { franchisee_id: req.params.user_id }] }).
            populate('meeting_id').
            exec((err, notification) => {
                if (err) {
                    console.log(err);
                }
                if (notification) {
                    console.log(notification[0].franchisee_id, 'francfasdjlas;laj;ald')
                    notification.forEach(element => {
                        if (element.meeting_id) {
                            notifications.franchisor_id = element.franchisor_id,
                                notifications.franchisee_id = element.franchisee_id;
                            notifications.notification_title = element.meeting_id.meeting_title,
                                notifications.notification_status = element.meeting_id.meeting_status,
                                notifications.location = element.meeting_id.meeting_location,
                                notifications.notification_date = element.meeting_id.meeting_date,
                                notifications.read_status = element.read_status;
                            notifications.notification_to = 'franchisor'
                        }
                    });
                    console.log(notifications, '/////////////////')
                    return res.json({
                        'state': 'success',
                        'message': 'Successfully fetched notifications',
                        'data': notifications
                    })
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
                // if (err) return handleError(err);
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
        str = JSON.stringify(req.body);
        str1 = JSON.parse(str);
        var attendies = [];
        Meeting.findById({ '_id': req.body.meeting_id, 'franchisee_id': req.body.franchisee_id }, function (err, meeting) {
            if (err) {
                return res.send(500, err);
            }
            if (meeting) {
                if (meeting.meeting_status === "approved" || "declined") {
                    if (meeting.notification_to == 'franchisee') {
                        meeting.notification_to = "franchisor"
                    }
                    else if (meeting.notification_to == 'franchisor') {
                        meeting.notification_to = "franchisee"
                    }
                }
                if (req.body.meeting_status == 'approved') {
                    meeting.meeting_status = req.body.meeting_status;
                    meeting.approved_by = req.body.approved_by;
                    ///////////////// //google calendar///////////////////////
                    if (req.body.meeting_assigned_people) {
                        req.body.meeting_assigned_people.forEach(function (element) {
                            attendies.push(element['user_mail'])
                        });
                    }
                    Franchisor.findById(req.body.franchisor_id, function (err, franchisor) {
                        if (err) {
                            console.log(err);
                        } else {
                            attendies.push(franchisor.user_mail);

                            Franchisee.findById(req.body.franchisee_id, function (err, franchisee) {
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
                                            Admin.find({ franchisor_id: req.body.franchisor_id }, function (err, user) {
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
                if (req.body.meeting_status == 'declined' && req.body.meeting_reason != null) {
                    meeting.meeting_status = req.body.meeting_status;
                    meeting.approved_by = req.body.approved_by;
                    meeting.meeting_reason = req.body.meeting_reason;
                    meeting.franchisee_name = req.body.franchisee_name;
                }
                meeting.save(function (err, meeting) {
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        if (meeting.meeting_status === 'declined') {
                            var reciever_mail;
                            var sender_name;
                            if (meeting.approved_by == 'franchisor') {
                                Franchisee.findById({ _id: meeting.franchisee_id }, (err, data) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    if (data) {
                                        reciever_mail = data.franchisee_email;
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
                                        reciever_mail = data.user_mail;
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
module.exports.send_notifications = send_notifications;
