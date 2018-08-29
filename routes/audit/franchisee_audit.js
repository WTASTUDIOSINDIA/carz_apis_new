
  var express = require('express');
  var router = express.Router();
  var auditService = require('./audit_service');
  var moment = require("moment");
  var mongoose = require('mongoose');
  const objectId = mongoose.Types.ObjectId;
  var schedule = require('node-schedule');
  var nodemailer = require('nodemailer');
  var Franchisee = mongoose.model('Franchisee');
  var Utils = require('../../common/utils');

  var day_rule = new schedule.RecurrenceRule();
  day_rule.dayOfWeek = [new schedule.Range(1, 6)];
  day_rule.hour = 23;
  day_rule.minute = 59;
  day_rule.second = 599;

  var week_rule = new schedule.RecurrenceRule();
  week_rule.dayOfWeek = [6];
  week_rule.hour = 23;
  week_rule.minute = 59;
  week_rule.second = 599;

schedule.scheduleJob(day_rule, function(req,res){

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

          let query = {$and: [{checklist_type:"Daily",franchisee_id :objectId(element._id),created_on:{ $gt: new Date(Date.now() - (1000 * 60 * 60 * 24)),$lt: new Date(Date.now() ) }}]};
          
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

        let curr = new Date; // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        let last = first + 5; // last day is the first day + 6
        
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

router.post('/get_checklist', function (req,res){
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
          if(data.fromDate && data.toDate){
            let from = new Date(data.fromDate);
            let from_date = from.setHours(0,0,0,0);
            let to = new Date(data.toDate);
            let to_date = to.setHours(23, 59, 59, 999);
            second_query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
          }else{
            res.status(400).json({error:'2',message:"From and To Dates are mandatory for Weekly tasks."});
          }

        }
        if(data.checklist_type == "Monthly"){
          if(data.month){
            res.status(400).json({error:'2',message:"still in dev mode."});
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
        query.audit_checklist_type = data.checklist_type
        auditService.findlist(query,second_query,nonworking_query)
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
    }else{
        res.status(400).json({error:'2',message:"checklist type and Franchisee id is mandatory."});
    }

    
})

router.post('/save_franchisee_audit_task', function (req,res){
  let data = req.body;

  if(data.task_id && data.franchisee_id  && data.checklist_type && data.checklist_id){
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

        if(today == send_date){
        query = {$and: [{task_id:task_id,checklist_type:data.checklist_type,franchisee_id :franchisee_id,created_on:{ $gt: new Date(Date.now() - (1000 * 60 * 60 * 24)),$lt: new Date(Date.now() ) }}]};
        //query.task_id = task_id; 
        }else{
          res.status(400).json({error:'2',message:"You are not autherisred..."});
        }
       
      }else{
        res.status(400).json({error:'2',message:"Date is mandatory for Daily tasks."});
      }

    }
    if(data.checklist_type == "Weekly"){
      if(data.date){

        let curr = new Date; // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        let last = first + 5; // last day is the first day + 6
        
        let send_date = new Date(data.date);
        let firstday = new Date(curr.setDate(first));
        let lastday = new Date(curr.setDate(last));

        if((new Date(send_date) >= new Date(firstday)) && (new Date(send_date) <= new Date(lastday))){
          
          query = {$and: [{task_id:task_id,franchisee_id :franchisee_id,created_on:{ $gte: new Date(firstday),$lte: new Date(lastday)}}]};
          //query.task_id = task_id; 
          }else{
            res.status(400).json({error:'2',message:"You are not autherisred.."});
          }

      }else{
        res.status(400).json({error:'2',message:"Date is mandatory for Weekly tasks."});
      }

    }
    if(data.checklist_type == "Monthly"){
      if(data.month){
        res.status(400).json({error:'2',message:"still in dev mode."});
      }else{
        res.status(400).json({error:'2',message:"Month is mandatory for Monthly tasks."});
      }

    }
    if(data.checklist_type == "Quarterly"){
      if(data.month){
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

    auditService.findOne(query)
    .then((response) => {
      if(response){
          if(response.length !== 0){
            //response.task_status = data.task_status;
            return response.remove();
          }else{
            return auditService.create(data);
          }
        }else{
          return auditService.create(data); 
        }
      })

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
   
  }else{
    res.status(400).json({error:'2',message:"Taskid, Franchiseeid, Tasktype and Taskstatus fields are mandatory."});
  }


})



router.post('/get_tasks_at_checklist_id', function (req,res){
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
        if(data.fromDate && data.toDate){
          let from = new Date(data.fromDate);
          let from_date = from.setHours(0,0,0,0);
          let to = new Date(data.toDate);
          let to_date = to.setHours(23, 59, 59, 999);
          second_query = {franchisee_id:objectId(data.franchisee_id),created_on:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
        }else{
          res.status(400).json({error:'2',message:"From and To Dates are mandatory for Weekly tasks."});
        }

      }
      if(data.checklist_type == "Monthly"){
        if(data.month){
          res.status(400).json({error:'2',message:"still in dev mode."});
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
          res.status(200).json({ error: "0", message: "Succesfully fetched", data: response});
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

router.post('/save_non_working_day', function (req,res){
  let data = req.body;

  if(data.franchisee_id && data.checklist_id  && data.checklist_type && data.on_date){

    let from = new Date(data.on_date);
    let from_date = from.setHours(0,0,0,0);
    let to = new Date(data.on_date);
    let to_date = to.setHours(23, 59, 59, 999);
    let nonworking_query = {checklist_type:data.checklist_type,franchisee_id:objectId(data.franchisee_id), on_date:{ $gte: new Date(from_date),$lte: new Date(to_date)  }};
    data.on_date = new Date(data.on_date);
    console.log(data);
    console.log(nonworking_query);
    auditService.findNonWorkingDay(nonworking_query)
    .then((response) => {
        if(response)
        { 
          console.log("update");
          return auditService.updateNonWorkingDay({_id:response._id},data)
          
        }else{
          console.log("new");
          return auditService.createNonWorkingDay(data)
        }
      })

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


  }else{
    res.status(400).json({error:'2',message:"checklist id, checklist type, on-date and franchisee id is mandatory."});
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

module.exports = router;