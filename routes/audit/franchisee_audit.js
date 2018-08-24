
  var express = require('express');
  var router = express.Router();
  var auditService = require('./audit_service');
  var moment = require("moment");
  var mongoose = require('mongoose');
  const objectId = mongoose.Types.ObjectId;
  
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

    if(data.checklist_type){
        let query = {};
       
        if(data.checklist_type == "Daily"){
          if(data.date){

           
 
          }else{
            res.status(400).json({error:'2',message:"Date is mandatory for Daily tasks."});
          }

        }
        if(data.checklist_type == "Weekly"){
          if(data.fromDate && data.toDate){
 
          }else{
            res.status(400).json({error:'2',message:"From and To Dates are mandatory for Weekly tasks."});
          }

        }
        if(data.checklist_type == "Monthly"){
          if(data.month){
 
          }else{
            res.status(400).json({error:'2',message:"Month is mandatory for Monthly tasks."});
          }

        }
        if(data.checklist_type == "Quarterly"){
          if(data.fromMonth && data.toMonth){
 
          }else{
            res.status(400).json({error:'2',message:"From and To Months are mandatory for Quarterly tasks."});
          }

        }
        if(data.checklist_type == "Yearly"){
          if(data.year){
 
          }else{
            res.status(400).json({error:'2',message:"Year is mandatory for Year tasks."});
          }

        }
        query.audit_checklist_type = data.checklist_type
        auditService.findlist(query)
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
        res.status(400).json({error:'2',message:"checklist type is mandatory."});
    }

    
})

router.post('/save_franchisee_audit_task', function (req,res){
  let data = req.body;

  if(data.task_id && data.franchisee_id && data.task_status && data.task_type){
    let task_id = objectId(data.task_id);
    let franchisee_id = objectId(data.franchisee_id);
    let query = {};

    if(data.task_type == "Daily"){
      if(data.date){

        let today = moment().format("D-M-YYYY");
        let s_date = new Date(data.date);
        let send_date = moment(s_date).format("D-M-YYYY");

        if(today == send_date){
        query = {$and: [{task_id:task_id,franchisee_id :franchisee_id,created_on:{ $gt: new Date(Date.now() - (1000 * 60 * 60 * 24)),$lt: new Date(Date.now() ) }}]};
        //query.task_id = task_id; 
        }else{
          res.status(400).json({error:'2',message:"You are not autherisred."});
        }
       
      }else{
        res.status(400).json({error:'2',message:"Date is mandatory for Daily tasks."});
      }

    }
    if(data.task_type == "Weekly"){
      if(data.date){

        let curr = new Date; // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        let last = first + 6; // last day is the first day + 6
        let s_date = new Date(data.date);
        let send_date = moment(s_date).format("D-M-YYYY");
        let firstday = moment(new Date(curr.setDate(first)).toUTCString()).format("D-M-YYYY");
        let lastday = moment(new Date(curr.setDate(last)).toUTCString()).format("D-M-YYYY");

        if(send_date >= firstday && send_date <= lastday){
          console.log(firstday);
          console.log(lastday);
          console.log(send_date);
          query = {$and: [{task_id:task_id,franchisee_id :franchisee_id,created_on:{ $gt: new Date(firstday),$lt: new Date(lastday)}}]};
          //query.task_id = task_id; 
          }else{
            res.status(400).json({error:'2',message:"You are not autherisred."});
          }

      }else{
        res.status(400).json({error:'2',message:"Date is mandatory for Weekly tasks."});
      }

    }
    if(data.task_type == "Monthly"){
      if(data.month){

      }else{
        res.status(400).json({error:'2',message:"Month is mandatory for Monthly tasks."});
      }

    }
    if(data.task_type == "Quarterly"){
      if(data.month){

      }else{
        res.status(400).json({error:'2',message:"From and To Months are mandatory for Quarterly tasks."});
      }

    }
    if(data.task_type == "Yearly"){
      if(data.year){

      }else{
        res.status(400).json({error:'2',message:"Year is mandatory for Year tasks."});
      }

    }

    auditService.findOne(query)
    .then((response) => {
      console.log("----",response);
      if(response){
          if(response.length !== 0){
            console.log("existed");
            response.task_status = data.task_status;
            return response.save();
          }else{
            console.log("new-==");
            return auditService.create(data);
          }
        }else{
          console.log("new----");
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

module.exports = router;