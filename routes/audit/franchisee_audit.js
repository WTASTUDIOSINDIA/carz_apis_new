
  var express = require('express');
  var router = express.Router();
  var multer = require('multer');
  var auditService = require('./audit_service');
  var moment = require("moment");
  var mongoose = require('mongoose');
  const objectId = mongoose.Types.ObjectId;
  var schedule = require('node-schedule');
  var nodemailer = require('nodemailer');
  var Franchisee = mongoose.model('Franchisee');
  var Utils = require('../../common/utils');
  var aws = require('aws-sdk');
  var multerS3 = require('multer-s3');
  aws.config.loadFromPath('./config.json');
  aws.config.update({
      signatureVersion: 'v4'
  });
  var s0 = new aws.S3({})
  var upload = multer({
      storage:multerS3({
          s3:s0,
          bucket:'carzdev',
          contentType: multerS3.AUTO_CONTENT_TYPE,
          acl: 'public-read',
          metadata: function (req, file, cb) {
              cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
            cb(null, Date.now().toString() + '.' + file.originalname)
          }
      })
  });

  var day_rule = new schedule.RecurrenceRule();
  day_rule.dayOfWeek = [new schedule.Range(1, 6)];
  day_rule.hour = 23;
  day_rule.minute = 59;
  day_rule.second = 599;

  var sec_rule = new schedule.RecurrenceRule();
  sec_rule.second = 10;

  var week_rule = new schedule.RecurrenceRule();
  week_rule.dayOfWeek = [6];
  week_rule.hour = 23;
  week_rule.minute = 59;
  week_rule.second = 599;

  var month_rule = new schedule.RecurrenceRule();
  var curr_month = new Date().getMonth();
  month_rule.month = curr_month+1;
  month_rule.hour = 23;
  month_rule.minute = 59;
  month_rule.second = 599;

  var india = moment.tz(new Date(), "Asia/Kolkata");
  
  //console.log(india.format());

schedule.scheduleJob(day_rule, function(req,res){

  let curr = new Date().getDay(); // get current date

if(curr != 0){
  Franchisee.find({archieve_franchisee: false,lead_type:"Franchisees"}, {'_id':1, "franchisee_email":1}).lean().exec(function(err,franchiees){
    if(err){
        return res.send(500, err);
    }
    if(!franchiees){
        res.send({
            "status":400,
            "message":"Franchiees not found",
            "message":"failure",
            "franchisees_list":[]
        },404);
    }
    else{
        franchiees.forEach(function(element){

          let from = new Date(india);
          let from_date = from.setHours(0,0,0,0);
          let to = new Date(india);
          let to_date = to.setHours(23, 59, 59, 999);

          let query = {$and: [{checklist_type:"Daily",franchisee_id :objectId(element._id),created_on:{ $gt: new Date(from_date),$lt: new Date(to_date) }}]};
          let nonworking_query = {checklist_type:"Daily",franchisee_id:objectId(element._id), on_date:{ $gt: new Date(from_date),$lt: new Date(to_date)}};
          
          
          auditService.findNonWorkList(nonworking_query)
          .then((resp) => {
            if(resp){
             console.log("Non working day");
            }else{
              auditService.findFranchiseeTasksByDaily(query)
              .then((response) => {
                if(response){
                    if(response.length == 0){
                      Utils.send_mail(element);
                    }
                  }else{
                      Utils.send_mail(element);
                  }
                })
              .catch((error) => {
                  res.status(500).json({ error: "2", message: "Internal server error"});
              });
            }
          })
          .catch((error) => {
            console.log("Found some error!");
          });


        });
    }
})
}
});



schedule.scheduleJob(day_rule, function(req,res){

  Franchisee.find({archieve_franchisee: false,lead_type:"Franchisees"}, {'_id':1, "franchisee_email":1, "franchisee_created_on":1,"franchisor_id":1}).lean().exec(function(err,franchiees){
    if(err){
        return res.send(500, err);
    }
    if(!franchiees){
        res.send({
            "status":400,
            "message":"Franchiees not found",
            "message":"failure",
            "franchisees_list":[]
        },404);
    }
    else{

        franchiees.forEach(function(element){

          if(element.franchisee_created_on){

            let curr = new Date(india); // get current date
            let check_date = curr.getDate() - 5; // First day is the day of the month - the day of the week
            
            let check_date_full = new Date(curr.setDate(check_date));
 
          var i =0;  
          //var curr = new Date();
          let day = curr.getDay();
          let firstday = new Date(curr.getTime() - 60*60*24* day*1000); // will return firstday (i.e. Sunday) of the week
          let lastday = new Date(firstday.getTime() + 60 * 60 *24 * 6 * 1000); // adding (60*60*6*24*1000) means adding six days to the firstday which results in lastday (Saturday) of the week
/*
          let nonworking_query = {checklist_type:"Daily",franchisee_id :objectId(element._id),created_on:{ $gt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 5)),$lt: new Date(Date.now() ) }};
          auditService.findNonWorkList(nonworking_query)
              .then((resp) => {
                console.log(resp);
                if(resp){
                  data_list.push({non_working_day:resp.status,checklist_data:response})
                res.status(200).json({ error: "0", message: "Succesfully fetched", data: data_list});
                }else{
                  data_list.push({non_working_day:"false",checklist_data:response})
                  res.status(200).json({ error: "0", message: "Succesfully fetched", data: data_list});
                }
              })
              .catch((error) => {
                res.status(500).json({ error: "2", message: "Internal server error"});
              });
*/

          if(new Date(check_date_full) > new Date(element.franchisee_created_on)){

            let from = new Date(india);
            let from_date = from.setHours(0,0,0,0);
            let to = new Date(india);
            let to_date = to.setHours(23, 59, 59, 999);

          let query = {$and: [{checklist_type:"Daily",franchisee_id :objectId(element._id),created_on:{ $gt: new Date(new Date(from_date) - (1000 * 60 * 60 * 24 * 5)),$lt: new Date(to_date) }}]};
          
          auditService.findFranchiseeTasksByDaily(query)
          .then((response) => {
            if(response){
                if(response.length == 0){
                  console.log("email");
                  Utils.send_mail(element);
                }
              }else{
                  console.log("email");
                  Utils.send_mail(element);
              }
            })
          .catch((error) => {
              res.status(500).json({ error: "2", message: "Internal server error"});
          });
        }
      }

        });
    }
})
  
});



schedule.scheduleJob(week_rule, function(req,res){

  Franchisee.find({archieve_franchisee: false,lead_type:"Franchisees"}, {'_id':1, "franchisee_email":1}).lean().exec(function(err,franchiees){
    if(err){
        return res.send(500, err);
    }
    if(!franchiees){
        res.send({
            "status":400,
            "message":"Franchiees not found",
            "message":"failure",
            "franchisees_list":[]
        },404);
    }
    else{
        franchiees.forEach(function(element){

        let curr = new Date(india); // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        let last = first + 6; // last day is the first day + 6
        
        let firstday = new Date(curr.setDate(first));
        let lastday = new Date(curr.setDate(last));

          let query = {$and: [{checklist_type:"Weekly",franchisee_id :objectId(element._id),created_on:{ $gte: new Date(firstday),$lte: new Date(lastday)}}]};
          
          auditService.findFranchiseeTasksByDaily(query)
          .then((response) => {
            if(response){
                if(response.length == 0){
                  console.log("email");
                  Utils.send_mail(element);
                }
              }else{
                  console.log("email");
                  Utils.send_mail(element);
              }
            })
          .catch((error) => {
              res.status(500).json({ error: "2", message: "Internal server error"});
          });


        });
    }
})
  
});
  


schedule.scheduleJob(month_rule, function(req,res){

  Franchisee.find({archieve_franchisee: false,lead_type:"Franchisees"}, {'_id':1, "franchisee_email":1}).lean().exec(function(err,franchiees){
    if(err){
        return res.send(500, err);
    }
    if(!franchiees){
        res.send({
            "status":400,
            "message":"Franchiees not found",
            "message":"failure",
            "franchisees_list":[]
        },404);
    }
    else{
        franchiees.forEach(function(element){

          var date = new Date(india);
          var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          let from_date = firstDay.setHours(0,0,0,0);
          
          let to_date = lastDay.setHours(23, 59, 59, 999);

          let query = {$and: [{checklist_type:"Monthly",franchisee_id :objectId(element._id),created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }}]};
          
          auditService.findFranchiseeTasksByDaily(query)
          .then((response) => {
            if(response){
                if(response.length == 0){
                  console.log("email");
                  Utils.send_mail(element);
                }
              }else{
                  console.log("email");
                  Utils.send_mail(element);
              }
            })
          .catch((error) => {
              res.status(500).json({ error: "2", message: "Internal server error"});
          });


        });
    }
})
  
});


  router.get('/get_audit_checklist', function (req,res){
    let requestFrom = req.headers["x-request-from"];
    let query = {};
    auditService.findcheckelist(query)
    .then((response) => {
      if(response)
      { 
        res.status(200).json({ error: "0", message: "Succesfully fetched", data: response});
      }else{
        res.status(404).json({ error: "1", message: "Error in getting details"});
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "2", message: "Internal server error"});
    });
})

router.post('/get_checklist',Utils.authenticated, function (req,res){
    let data = req.body;

    if(data.checklist_type && data.franchisee_id){
        let query = {};
        let second_query = {};
        let nonworking_query = {};
        if(data.checklist_type == "Daily"){
          if(data.date){
            let from = new Date(data.date);
            let from_date = from.setHours(0,0,0,0);
            let to = new Date(data.date);
            let to_date = to.setHours(23, 59, 59, 999);
            second_query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
            nonworking_query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), on_date:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
          }else{
            res.status(400).json({error:'2',message:"Date is mandatory for Daily tasks."});
          }

        }
        if(data.checklist_type == "Weekly"){
          if(data.date){
            

            var curr = new Date(data.date);
            let day = curr.getDay();
            let firstday = new Date(curr.getTime() - 60*60*24* day*1000); // will return firstday (i.e. Sunday) of the week
            let lastday = new Date(firstday.getTime() + 60 * 60 *24 * 6 * 1000); // adding (60*60*6*24*1000) means adding six days to the firstday which results in lastday (Saturday) of the week

            let from = new Date(firstday);
            let from_date = from.setHours(0,0,0,0);
            let to = new Date(lastday);
            let to_date = to.setHours(23, 59, 59, 999);

            second_query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
          }else{
            res.status(400).json({error:'2',message:"Date is mandatory for Weekly tasks."});
          }

        }
        if(data.checklist_type == "Monthly"){
          if(data.date){
            let curr = new Date(data.date); // get date
            let month = curr.getMonth(); 
            let year = curr.getFullYear(); 
            var date = new Date(year, month, 1);
            var days = [];
    
            while (date.getMonth() === month) {
               days.push(new Date(date));
               date.setDate(date.getDate() + 1);
            }

            var date_length = days.length;
            let from = days[0];
            var d = new Date(from);
            d.setHours(d.getHours() + 5);
            d.setMinutes(d.getMinutes() + 30);
            let from_date = d.setHours(0,0,0,0);
            let to = days[date_length-1];
            var t = new Date(to);
            t.setHours(t.getHours() + 5);
            t.setMinutes(t.getMinutes() + 30);
            let to_date = t.setHours(23, 59, 59, 999);

            second_query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};


          }else{
            res.status(400).json({error:'2',message:"Date is mandatory for Monthly tasks."});
          }

        }
        if(data.checklist_type == "Quarterly"){
          if(data.fromMonth && data.toMonth){
            res.status(400).json({error:'2',message:"still in dev mode."});
          }else{
            res.status(400).json({error:'2',message:"From and To Months are mandatory for Quarterly tasks."});
          }

        }
        if(data.checklist_type == "Yearly"){
          if(data.year){
            res.status(400).json({error:'2',message:"still in dev mode."});
          }else{
            res.status(400).json({error:'2',message:"Year is mandatory for Year tasks."});
          }

        }
        query.audit_checklist_type = data.checklist_type
        auditService.findlist(query,second_query,nonworking_query)
        .then((response) => {
          if(response)
          { 
            let data_list = [];
            
            if(data.checklist_type == "Daily"){
              console.log(nonworking_query);
              auditService.findNonWorkList(nonworking_query)
              .then((resp) => {
                console.log(resp);
                if(resp){
                  data_list.push({non_working_day:resp.status,checklist_data:response})
                res.status(200).json({ error: "0", message: "Succesfully fetched", data: data_list});
                }else{
                  data_list.push({non_working_day:"false",checklist_data:response})
                  res.status(200).json({ error: "0", message: "Succesfully fetched", data: data_list});
                }
              })
              .catch((error) => {
                res.status(500).json({ error: "2", message: "Internal server error"});
              });

            }else{
              console.log()
              data_list.push({non_working_day:"false",checklist_data:response})
              res.status(200).json({ error: "0", message: "Succesfully fetched", data: data_list});
            }
            
          }else{
            res.status(404).json({ error: "1", message: "Error in getting details"});
          }
        })
        .catch((error) => {
          res.status(500).json({ error: "2", message: "Internal server error"});
        });
    }else{
        res.status(400).json({error:'2',message:"checklist type and Franchisee id is mandatory."});
    }

    
})

router.post('/save_franchisee_audit_task',upload.single('file'),Utils.authenticated, function (req,res){
  let data = JSON.parse(req.body.task_data);
  
  var not_act = false;
  if(data.task_id && data.franchisee_id  && data.checklist_type && data.checklist_id){
    console.log(req.file);
    if(req.file){
    data["file_name"] = req.file.originalname;
    data["file_url"] = req.file.location;
    data["file_type"] = req.file.mimetype;
    }
    if(!data.task_status){
      data.task_status = false;
    }
    let task_id = objectId(data.task_id);
    let franchisee_id = objectId(data.franchisee_id);
    let query = {};

    if(data.checklist_type == "Daily"){
      if(data.date){

        let today = moment().format("D-M-YYYY");
        let s_date = new Date(data.date);
        let send_date = moment(s_date).format("D-M-YYYY");

        let from = new Date(india);
        let from_date = from.setHours(0,0,0,0);
        let to = new Date(india);
        let to_date = to.setHours(23, 59, 59, 999);

        if(today == send_date){
        query = {$and: [{task_id:task_id,checklist_type:data.checklist_type,franchisee_id :franchisee_id,created_on:{ $gte: new Date(from_date),$lte: new Date(to_date) }}]};
        //query.task_id = task_id; 
        }else{
          not_act = true;
          res.status(203).json({error:'2',message:"You can not complete this task right now!"});
        }
       
      }else{
        res.status(203).json({error:'2',message:"Date is mandatory for Daily tasks."});
      }

    }
    if(data.checklist_type == "Weekly"){
      if(data.date){

        let send_date = new Date(data.date);

        var curr = new Date(india);
        let day = curr.getDay();
        let firstday = new Date(curr.getTime() - 60*60*24* day*1000); // will return firstday (i.e. Sunday) of the week
        let lastday = new Date(firstday.getTime() + 60 * 60 *24 * 6 * 1000); // adding (60*60*6*24*1000) means adding six days to the firstday which results in lastday (Saturday) of the week

        if((new Date(send_date) >= new Date(firstday)) && (new Date(send_date) <= new Date(lastday))){
          
          query = {$and: [{task_id:task_id,franchisee_id :franchisee_id,created_on:{ $gte: new Date(firstday),$lte: new Date(lastday)}}]};
          //query.task_id = task_id; 
          }else{
            not_act = true;
            res.status(203).json({error:'2',message:"You can not complete this task right now!"});
          }

      }else{
        res.status(203).json({error:'2',message:"Date is mandatory for Weekly tasks."});
      }

    }
    if(data.checklist_type == "Monthly"){
      if(data.date){

        let curr_d = new Date(india); // get current date
        let month_d = curr_d.getMonth(); 
        let year_d = curr_d.getFullYear(); 
        var date_d = new Date(year_d, month_d, 1);
        var days_d = [];

        while (date_d.getMonth() === month_d) {
           days_d.push(new Date(date_d));
           date_d.setDate(date_d.getDate() + 1);
        }

        var date_length_d = days_d.length;
        let from_d = days_d[0];
        var d_d = new Date(from_d);
        d_d.setHours(d_d.getHours() + 5);
        d_d.setMinutes(d_d.getMinutes() + 30);
        let from_date_d = new Date(d_d.setHours(0,0,0,0));
        let to_d = days_d[date_length_d-1];
        var t_d = new Date(to_d);
        t_d.setHours(t_d.getHours() + 5);
        t_d.setMinutes(t_d.getMinutes() + 30);
        let to_date_d = new Date(t_d.setHours(23, 59, 59, 999));
        let send_date = new Date(data.date);

        if((new Date(send_date) >= new Date(from_date_d)) && (new Date(send_date) <= new Date(to_date_d))){

        let curr = new Date(data.date); // get date
            let month = curr.getMonth(); 
            let year = curr.getFullYear(); 
            var date = new Date(year, month, 1);
            var days = [];
    
            while (date.getMonth() === month) {
               days.push(new Date(date));
               date.setDate(date.getDate() + 1);
            }

            var date_length = days.length;
            let from = days[0];
            var d = new Date(from);
            d.setHours(d.getHours() + 5);
            d.setMinutes(d.getMinutes() + 30);
            let from_date = d.setHours(0,0,0,0);
            let to = days[date_length-1];
            var t = new Date(to);
            t.setHours(t.getHours() + 5);
            t.setMinutes(t.getMinutes() + 30);
            let to_date = t.setHours(23, 59, 59, 999);

            query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
          }else{
            not_act = true;
            res.status(203).json({error:'2',message:"You can not complete this task right now!"});
          }

      }else{
        res.status(203).json({error:'2',message:"Month is mandatory for Monthly tasks."});
      }

    }
    if(data.checklist_type == "Quarterly"){
      if(data.month){
        res.status(203).json({error:'2',message:"still in dev mode."});
      }else{
        res.status(203).json({error:'2',message:"From and To Months are mandatory for Quarterly tasks."});
      }

    }
    if(data.checklist_type == "Yearly"){
      if(data.year){
        res.status(203).json({error:'2',message:"still in dev mode."});
      }else{
        res.status(203).json({error:'2',message:"Year is mandatory for Year tasks."});
      }

    }
    if(!not_act){
    auditService.findOne(query)
    .then((response) => {
      if(response){
          if(response.length !== 0){
            //response.task_status = data.task_status;
            response.remove()
            .then((response) => {
              if(response)
              { 
                res.status(200).json({ error: "0", message: "Removed Successfully", data: response});
              }else{
                res.status(404).json({ error: "1", message: "Error in getting details"});
              }
            })
            .catch((error) => {
              res.status(500).json({ error: "2", message: "Internal server error"});
          });
          }else{
            
            auditService.findOneTaskById({_id:task_id})
            .then((resp) => {
              if(resp){

                if(resp.audit_file_upload_required == true && req.file){
                  res.status(203).json({ error: "2", message: "File upload is mandetory for this task"});
                }else if(resp.audit_task_type == 'Radio Button' && !req.body.task_data.radio_option_answer){
                  console.log(req, "631 list of request data");
                  res.status(203).json({ error: "2", message: "Please select the radio option before submitting!"});
                }
                else {
                auditService.create(data)
                .then((response) => {
                  if(response)
                  { 
                    res.status(200).json({ error: "0", message: "Succesfully Completed", data: response});
                  }else{
                    res.status(404).json({ error: "1", message: "Error in getting details"});
                  }
                })
                .catch((error) => {
                  res.status(500).json({ error: "2", message: "Internal server error"});
              });
            }
          }
          })
          }
        }else{
          auditService.findOneTaskById({_id:task_id})
            .then((resp) => {
              if(resp){
                
                var task_data = JSON.parse(req.body.task_data)
                if(resp.audit_file_upload_required == true && !req.file){

                  res.status(203).json({ error: "2", message: "File upload is mandetory"});
                }
                else if(resp.audit_task_type == 'Radio Button' && !task_data.radio_option_answer){
                  
                  res.status(203).json({ error: "2", message: "Please select the radio option before submitting!"});
                }
                else if(resp.audit_task_type == 'Short Answer' && !task_data.reason){
                  
                  res.status(203).json({ error: "2", message: "Please enter the reason before submitting!"});
                }
                else{

                auditService.create(data)
                .then((response) => {
                  if(response)
                  { 
                    res.status(200).json({ error: "0", message: "Succesfully created", data: response});
                  }else{
                    res.status(404).json({ error: "1", message: "Error in getting details"});
                  }
                })
                .catch((error) => {
                  res.status(500).json({ error: "2", message: "Internal server error"});
              });
            }
          }
          })
        }
      })
    .catch((error) => {
        res.status(500).json({ error: "2", message: "Internal server error"});
    });
  }
  }else{
    res.status(203).json({error:'2',message:"Taskid, Franchiseeid, Tasktype and Taskstatus fields are mandatory."});
  }


})

//get_franchisee_task_by_id

//to get uploded files
router.get('/get_franchisee_task_by_id/:id',function(req,res){
  let task_id = req.params.id;
  
  if(task_id){

    let query = {_id:objectId(task_id)};
    
    auditService.findOneTaskById(query)
    .then((response) => {
      if(response){
        res.status(200).json({ error: "0", message: "Succesfully created", data: response});
        }else{
          throw {
            reason : "NotFound"
          }
        }
      })
    .catch((error) => {
      if(err.reason == "NotFound")
        res.status(404).json({error:'2',message:"Details not found with the given id"});
      else
        res.status(500).json({ error: "2", message: "Internal server error"});
    });


  }else{
    res.status(400).json({error:'2',message:"checklist id, checklist type, on-date and franchisee id is mandatory."});
}
});

router.post('/get_tasks_at_checklist_id',Utils.authenticated, function (req,res){
  let data = req.body;

  if(data.checklist_id && data.checklist_type && data.franchisee_id){
      let query = {};
      let second_query = {};
      let nonworking_query = {};
      if(data.checklist_type == "Daily"){
        if(data.date){
          let from = new Date(data.date);
          let from_date = from.setHours(0,0,0,0);
          let to = new Date(data.date);
          let to_date = to.setHours(23, 59, 59, 999);
          second_query = {franchisee_id:objectId(data.franchisee_id),created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)}};
          nonworking_query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), on_date:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
        }else{
          res.status(400).json({error:'2',message:"Date is mandatory for Daily tasks."});
        }

      }
      if(data.checklist_type == "Weekly"){
        if(data.date){

         
          var curr = new Date(data.date);
          let day = curr.getDay();
          let firstday = new Date(curr.getTime() - 60*60*24* day*1000); // will return firstday (i.e. Sunday) of the week
          let lastday = new Date(firstday.getTime() + 60 * 60 *24 * 6 * 1000); // adding (60*60*6*24*1000) means adding six days to the firstday which results in lastday (Saturday) of the week

          let from = new Date(firstday);
          let from_date = from.setHours(0,0,0,0);
          let to = new Date(lastday);
          let to_date = to.setHours(23, 59, 59, 999);
          
          second_query = {franchisee_id:objectId(data.franchisee_id),created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
        }else{
          res.status(400).json({error:'2',message:"Date is mandatory for Weekly tasks."});
        }

      }
      if(data.checklist_type == "Monthly"){
        if(data.date){

            let curr = new Date(data.date); // get date
            let month = curr.getMonth(); 
            let year = curr.getFullYear(); 
            var date = new Date(year, month, 1);
            var days = [];
    
            while (date.getMonth() === month) {
               days.push(new Date(date));
               date.setDate(date.getDate() + 1);
            }

            var date_length = days.length;
            let from = days[0];
            var d = new Date(from);
            d.setHours(d.getHours() + 5);
            d.setMinutes(d.getMinutes() + 30);
            let from_date = d.setHours(0,0,0,0);
            let to = days[date_length-1];
            var t = new Date(to);
            t.setHours(t.getHours() + 5);
            t.setMinutes(t.getMinutes() + 30);
            let to_date = t.setHours(23, 59, 59, 999);

            second_query = {franchisee_id:objectId(data.franchisee_id), created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};

        }else{
          res.status(400).json({error:'2',message:"Month is mandatory for Monthly tasks."});
        }

      }
      if(data.checklist_type == "Quarterly"){
        if(data.fromMonth && data.toMonth){
          res.status(400).json({error:'2',message:"still in dev mode."});
        }else{
          res.status(400).json({error:'2',message:"From and To Months are mandatory for Quarterly tasks."});
        }

      }
      if(data.checklist_type == "Yearly"){
        if(data.year){
          res.status(400).json({error:'2',message:"still in dev mode."});
        }else{
          res.status(400).json({error:'2',message:"Year is mandatory for Year tasks."});
        }

      }
      query._id = objectId(data.checklist_id);
      auditService.findtasks(query,second_query,nonworking_query)
      .then((response) => {
        if(response)
        { 
          let data_list=[];
          //res.status(200).json({ error: "0", message: "Succesfully fetched", data: response});
          if(data.checklist_type == "Daily"){
            console.log(nonworking_query);
            auditService.findNonWorkList(nonworking_query)
            .then((resp) => {
              console.log(resp);
              if(resp){
                data_list.push({non_working_day:resp.status,tasklist_data:response})
              res.status(200).json({ error: "0", message: "Succesfully fetched", data: data_list});
              }else{
                data_list.push({non_working_day:"false",tasklist_data:response})
                res.status(200).json({ error: "0", message: "Succesfully fetched", data: data_list});
              }
            })
            .catch((error) => {
              res.status(500).json({ error: "2", message: "Internal server error"});
            });

          }else{
            data_list.push({non_working_day:"false",tasklist_data:response})
            res.status(200).json({ error: "0", message: "Succesfully fetched", data: data_list});
          }

        }else{
          res.status(404).json({ error: "1", message: "Error in getting details"});
        }
      })
      .catch((error) => {
        res.status(500).json({ error: "2", message: "Internal server error"});
      });
  }else{
      res.status(400).json({error:'2',message:"checklist type and id is mandatory."});
  }

  
})

router.post('/save_non_working_day',Utils.authenticated, function (req,res){
  let data = req.body;

  if(data.franchisee_id  && data.checklist_type && data.on_date){

    let from = new Date(data.on_date);
    let from_date = from.setHours(0,0,0,0);
    let to = new Date(data.on_date);
    let to_date = to.setHours(23, 59, 59, 999);
    let nonworking_query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), on_date:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
    data.on_date = new Date(data.on_date);

    auditService.findNonWorkingDay(nonworking_query)
    .then((response) => {
        if(response)
        { 
          response.remove()
          .then((response) => {
            if(response)
            { 
              res.status(200).json({ error: "0", message: "Succesfully removed as a non working day", data: response});
            }else{
              res.status(404).json({ error: "1", message: "Error in getting details"});
            }
          })
    
        .catch((error) => {
            res.status(500).json({ error: "2", message: "Internal server error"});
        });
          
        }else{
          
          auditService.createNonWorkingDay(data)
          .then((response) => {
            if(response)
            { 
              res.status(200).json({ error: "0", message: "Succesfull added as non working day", data: response});
            }else{
              res.status(404).json({ error: "1", message: "Error in getting details"});
            }
          })
    
        .catch((error) => {
            res.status(500).json({ error: "2", message: "Internal server error"});
        });
        }
      })

    .catch((error) => {
        res.status(500).json({ error: "2", message: "Internal server error"});
    });


  }else{
    res.status(400).json({error:'2',message:"checklist type, on-date, remarks and franchisee id is mandatory."});
}
})


router.post('/delete_non_working_day', function (req,res){
  let data = req.body;

  if(data.nonworking_id ){

    let query = {_id:objectId(data.nonworking_id)};
    
    auditService.findNonWorkingDay(query)
    .then((response) => {
      if(response){
            return response.remove(); 
        }else{
          throw {
            reason : "NotFound"
          }
        }
      })
    .catch((error) => {
      if(err.reason == "NotFound")
        res.status(404).json({error:'2',message:"Details not found with the given id"});
      else
        res.status(500).json({ error: "2", message: "Internal server error"});
    });


  }else{
    res.status(400).json({error:'2',message:"checklist id, checklist type, on-date and franchisee id is mandatory."});
}
})

router.post('/get_calender_list',Utils.authenticated, function (req,res){
  let data = req.body;

  if(data.franchisee_id && data.checklist_type && data.date){

    data.franchisee_id = objectId(data.franchisee_id);


    if(data.checklist_type == "Daily"){

    let curr = new Date(data.date); // get date
        let month = curr.getMonth(); 
        let year = curr.getFullYear(); 
        var date = new Date(year, month, 1);
        var days = [];

        while (date.getMonth() === month) {
          if(new Date(date).getDay() != 0){
           days.push(new Date(date));
          }
           date.setDate(date.getDate() + 1);
        }
    auditService.findTasksList(data.checklist_type)
    .then((response) => {
      if(response){
        if(response.length != 0){

          var day_list = [];
      
          days.forEach(function(day){
            let from = new Date(day);
            let from_date = from.setHours(0,0,0,0);
            let to = new Date(day);
            let to_date = to.setHours(23, 59, 59, 999);
            let date_query = {checklist_type:data.checklist_type,franchisee_id:data.franchisee_id, created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)}};
            let non_working_day_query = {checklist_type:data.checklist_type,franchisee_id:data.franchisee_id, on_date:{ $gte: new Date(from_date),$lte: new Date(to_date)}};
            auditService.findCalenderList(date_query,non_working_day_query)
            .then((resp) => {
              if(resp){
                auditService.findNonWorkList(non_working_day_query)
                .then((r) => {
                  
                  if(r){
                    day_list.push({"date":new Date(to_date),"total_tasks":response.length,"completed_tasks":resp.length,"non_working_day":r.status});
                  }else{
                    day_list.push({"date":new Date(to_date),"total_tasks":response.length,"completed_tasks":resp.length,"non_working_day":false});
                  }
                  if(days.length == day_list.length){
                    res.status(200).json({ error: "0", message: "Tasks found",data:day_list});
                  }
                })
                
                }else{
                auditService.findNonWorkList(non_working_day_query)
                .then((r) => {
                  console.log(r);
                  if(r){
                    day_list.push({"date":new Date(to_date),"total_tasks":response.length,"completed_tasks":resp.length,"non_working_day":r.status});
                  }else{
                    day_list.push({"date":new Date(to_date),"total_tasks":response.length,"completed_tasks":resp.length,"non_working_day":false});
                  }
                  if(days.length == day_list.length){
                    res.status(200).json({ error: "0", message: "Tasks found",data:day_list});
                  }
                })
                
                }
              
              })
              
            })
            
        }else{
          res.status(400).json({ error: "0", message: "No Tasks found"});
        }
      }
    })
    
    .catch((error) => {
      if(err.reason == "NotFound")
        res.status(404).json({error:'2',message:"Details not found with the given id"});
      else
        res.status(500).json({ error: "2", message: "Internal server error"});
    });
  }

  else if(data.checklist_type == "Weekly"){
    var d = new Date(data.date);
    var getTot = daysInMonth(d.getMonth(),d.getFullYear());
    var sat_days = new Array();

    for(var i=1;i<=getTot;i++){
        var newDate = new Date(d.getFullYear(),d.getMonth(),i)
        if(newDate.getDay()==6){
          sat_days.push(new Date(newDate));
        }
        
    }

    auditService.findTasksList(data.checklist_type)
    .then((response) => {
      if(response){
        if(response.length != 0){
          var week_list = [];

          sat_days.forEach(function(sat_day){
            
          var curr = new Date(sat_day);
          let day = curr.getDay();
          let firstday = new Date(curr.getTime() - 60*60*24* day*1000); // will return firstday (i.e. Sunday) of the week
          let lastday = new Date(firstday.getTime() + 60 * 60 *24 * 6 * 1000); // adding (60*60*6*24*1000) means adding six days to the firstday which results in lastday (Saturday) of the week

          let from = new Date(firstday);
          let from_date = from.setHours(0,0,0,0);
          let to = new Date(lastday);
          let to_date = to.setHours(23, 59, 59, 999);
          query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
         
          auditService.findCalenderList(query)
          .then((resp) => {
            if(resp){
             week_list.push({"date":new Date(to_date),"total_tasks":response.length,"completed_tasks":resp.length});
             if(sat_days.length == week_list.length){
             res.status(200).json({ error: "0", message: "Tasks found",data:week_list});
             }
            }else{
              res.status(400).json({ error: "3", message: "Something went wrong"});
            }
          })
          .catch((error) => {
              res.status(500).json({ error: "2", message: "Internal server error2"});
          });
        })
  }else{
    res.status(400).json({ error: "3", message: "No Tasks found"});
  }
}
})

.catch((error) => {
    res.status(500).json({ error: "2", message: "Internal server error1"});
});

  }

  else if(data.checklist_type == "Monthly"){

    auditService.findTasksList(data.checklist_type)
    .then((response) => {
      if(response){
        if(response.length != 0){
          var month_list = [];
      
          var date = new Date(data.date);
          var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          let from_date = firstDay.setHours(0,0,0,0);
          
          let to_date = lastDay.setHours(23, 59, 59, 999);

          query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
          auditService.findCalenderList(query)
          .then((resp) => {
            if(resp){
             month_list.push({"date":new Date(to_date),"total_tasks":response.length,"completed_tasks":resp.length});
             res.status(200).json({ error: "0", message: "Tasks found",data:month_list});
            }else{
              res.status(400).json({ error: "3", message: "Something went wrong"});
            }
          })
          .catch((error) => {
              res.status(500).json({ error: "2", message: "Internal server error2"});
          });
  }else{
    res.status(400).json({ error: "3", message: "No Tasks found"});
  }
}
})

.catch((error) => {
    res.status(500).json({ error: "2", message: "Internal server error1"});
});
  }
  else{
    res.status(404).json({error:'2',message:"Undefined checklist type"});
  }

  }else{
    res.status(400).json({error:'2',message:"checklist id, checklist type, on-date and franchisee id is mandatory."});

  }

})

function daysInMonth(month,year) {
  return new Date(year, month, 0).getDate();
}

module.exports = router;