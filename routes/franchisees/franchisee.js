var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId;
var multer = require('multer');
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
var franchiseeService = require('./franchisee-service');
var FranchiseeTypeList = mongoose.model('FranchiseeTypeList');
var Library = mongoose.model('Library');
var Folder = mongoose.model('Folder');
var Doc = mongoose.model('Doc');
var KycUploads = mongoose.model('KycUploads');
var Franchisor = mongoose.model('Franchisor');
var Admin = mongoose.model('Admin');
var Auth = mongoose.model('Auth');
var fs = require('fs');
var csv = require('csv')
var path = require('path');
var Meeting = mongoose.model('Meeting');
var Campaign = mongoose.model('Campaign');
var nodemailer = require('nodemailer');
var _ = require('lodash');

var auto = require('run-auto');
// var Discussion = mongoose.model('Discussion');
// import { utils } from '../../common/utils';
var utils = require('../../common/utils');
// import {
//     isUser,
//     requires
// } from '../../authenticate/authenticate-service';
var authenticate = require('../authenticate/authenticate-service')
// import moment from "moment";
var moment = require('moment');
var Stages = mongoose.model('Stages');
var ActivityTracker = mongoose.model('ActivityTracker');
var Partner = mongoose.model('Partner');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var bCrypt = require('bcrypt-nodejs');
aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
});
var s0 = new aws.S3({})
var upload = multer({
    storage: multerS3({
        s3: s0,
        bucket: 'carzdev',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '.' + file.originalname)
        }
    })
});

//to get total franchisees count

router.get('/total_franchisees_count/:franchisor_id', function(req, res){
   // try {
        Franchisee.count({franchisor_id: req.params.franchisor_id,archieve_franchisee: false}, function (err, count) {
            if (err) {
                return res.send(500, err);
            }
            if (count) {
                res.send({
                    state: 'success',
                    count: count
                }, 200);
            } 
            else  {
                res.send({
                    state: 'success',
                    count: count
                }, 201);
            }          
        })
    // }
    // catch (err) {
    //     return res.send({
    //         state: "error",
    //         message: err
    //     });
    // }
});
// To upload profile pic
// var cpUpload = upload.fields([{ name: 'file_upload', maxCount: 50 }, { name: 'imgFields', maxCount: 20 }])
// router.post('/profile_pic',cpUpload,function(req,res){
//     var file=[];
//     Franchisee.find({},function(err,profilepic){
//         if(err){
//             return res.send(err);
//         }
//         else{
//             var file = [];
//             file=req.file.file_upload;
//                 var franchisee = new Franchisee();
//                 franchisee.path = file.location;
//                 franchisee.key = file.key;
//                 franchisee.file_name = file.originalname;
//                 if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
//                     franchisee.image_type = "image";
//                 }
//                 franchisee.franchisee_id = req.body.franchisee_id;
//                 file.push();

//                 file.save(function(err,file){
//                 if(err){
//                         return res.send(err);
//                 }
//                 else{
//                         res.send({
//                             status:'success',
//                             message:"Profile picture uploaded successfully!"
//                         },200);

//                 }
//             })

//         }
//     });
// });
//get all franchisees
router.get('/get_franchisees/:franchisor_id', function (req, res) {
    try {
        Franchisee.find({ archieve_franchisee: false, franchisor_id: req.params.franchisor_id }, {}).lean().exec(function (err, franchiees) {
            if (err) {
                return res.send(500, err);
            }
            if (!franchiees) {
                res.send({
                    "status": 400,
                    "message": "Franchiees not found",
                    "message": "failure",
                    "franchisees_list": []
                }, 404);
            }
            else {

                // let franchisee_data = [];
                // franchiees.forEach((franchiee)=>{
                //     franchiee.franchisee_profile_pic = utils.getPreSignedURL( franchiee.franchisee_profile_pic);
                //     franchisee_data.push(franchiee);
                // })
                // console.log("---------------------"+franchisee_data);
                res.send({
                    status: "200",
                    state: "success",
                    franchisees_list: franchiees,
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

router.get('/get_franchisees_new', function (req, res) {
   
        let query;
        let sk;
        let lt;
        if(req.query.skip){
            sk=Number(req.query.skip);
        }else{
            sk = '';   
        }

        if(req.query.limit){
            lt=Number(req.query.limit);
        }else{
            lt = '';   
        }
        
        if (req.query.search) {
          
          query =  Object.assign(req.query.filter || '',{$text: {$search: req.query.search}})
          
        } else {
            if(req.query.filter){
            query = req.query.filter || '';
            }
        }
 
        Franchisee
          .find(query)
          .sort(req.query.sort || '')
          .select(req.query.select || '')
          .limit(lt || '')
          .skip(sk || '')
          .exec(function (err, franchiees) {
            if (err) {
                console.log(err);
                return res.send(500, err);
            }
            if (!franchiees) {
                console.log("not found");
                res.send({
                    "status": 400,
                    "message": "Franchiees not found",
                    "message": "failure",
                    "franchisees_list": []
                }, 404);
            }
            else {
                Franchisee
                .find(query)
                .count()
                .exec(function (err, count) {
                  if (err) {
                      console.log(err);
                      return res.send(500, err);
                  }
                  if (!count) {
                      console.log("not found");
                      res.send({
                          "status": 400,
                          "message": "Franchiees not found",
                          "message": "failure",
                          "franchisees_list": []
                      }, 404);
                  }
                  else {
                      console.log(count);
                      res.send({
                          status: "200",
                          state: "success",
                          items: franchiees,
                          count: count
                      }, 200);
                  }
              })
            }
        })
    })
   
  
    router.get('/get_franchisees_new_one', function (req, res) {
    
        let query;
        let sk;
        let lt;
        let data_body = req.query;
        let data_query = req.query;
        if(data_query.skip){
            sk=Number(data_query.skip);
        }else{
            sk = 0;   
        }

        if(data_query.limit){
            lt=Number(data_query.limit);
        }else{
            lt = '';   
        }

    
        if (data_query.search) {
            let search_query = {
                "$or": [
                    { "franchisee_name" : { "$regex": data_query.search, "$options":"i"} },
                    { "franchisee_address" :   { "$regex": data_query.search, "$options":"i"} }, 
                    { "franchisee_pincode" :           { "$regex": data_query.search, "$options":"i"} }, 
                    { "franchisee_franchise_model" :        { "$regex": data_query.search, "$options":"i"} }, 
                    { "franchisee_franchise_type" :    { "$regex": data_query.search, "$options":"i"} }, 
                    { "partner_name" :      { "$regex": data_query.search, "$options":"i"} },
                    { "franchisee_city":     { "$regex": data_query.search, "$options":"i"} }
                ]
            };
            if(data_body.lead_type){
                
                if(data_body.franchisee_franchise_type){
                query =  Object.assign({ archieve_franchisee: false, franchisor_id: data_body.franchisor_id,lead_type: data_body.lead_type,franchisee_franchise_type:data_body.franchisee_franchise_type},search_query)
                }else{
                query =  Object.assign({ archieve_franchisee: false, franchisor_id: data_body.franchisor_id,lead_type: data_body.lead_type},search_query)
                }
            }else{
                if(data_body.franchisee_franchise_type){
                query =  Object.assign({ archieve_franchisee: false, franchisor_id: data_body.franchisor_id,franchisee_franchise_type:data_body.franchisee_franchise_type},search_query)
                }else{
                query =  Object.assign({ archieve_franchisee: false, franchisor_id: data_body.franchisor_id},search_query)
            }
        }
          
        } else {
            if(data_body.lead_type){
                if(data_body.franchisee_franchise_type){
                    query = Object.assign({ archieve_franchisee: false, franchisor_id: data_body.franchisor_id,lead_type: data_body.lead_type,franchisee_franchise_type:data_body.franchisee_franchise_type});
                }else{
                    query = Object.assign({ archieve_franchisee: false, franchisor_id: data_body.franchisor_id,lead_type: data_body.lead_type});
                }    
        }else{
            if(data_body.franchisee_franchise_type){
                query = Object.assign({ archieve_franchisee: false, franchisor_id: data_body.franchisor_id,franchisee_franchise_type:data_body.franchisee_franchise_type});
            }else{
                query = Object.assign({ archieve_franchisee: false, franchisor_id: data_body.franchisor_id});  
            }
            }
        }
        let sortquery = "";
        if(data_query.sort){
           
            let sortname = data_query.sort;
            if(sortname == "franchisee_name" ){
            sortquery = { franchisee_name : data_query.order };
            }
            if(sortname == "franchisee_address" ){
            sortquery = { franchisee_address : data_query.order };
            }
            if(sortname == "franchisee_pincode" ){
            sortquery = { franchisee_address : data_query.order };
            }
            if(sortname == "franchisee_franchise_model" ){
            sortquery = { franchisee_address : data_query.order };
            }
            if(sortname == "franchisee_franchise_type" ){
            sortquery = { franchisee_franchise_type : data_query.order };
            }
        }else{
            sortquery = {franchisee_created_on : 1};
        }
        
        Franchisee
          .find(query)
          .sort(sortquery)
          .select(data_query.select || '')
          .limit(lt || '')
          .skip(sk || '')
          .lean()
          .exec(function (err, franchiees) {
            if (err) {
                console.log(err);
                return res.send(500, err);
            }
            if (!franchiees) {
                console.log("not found");
                res.send({
                    "status": 200,
                    "message": "Franchiees not found",
                    "message": "failure",
                    "franchisees_list": []
                }, 404);
            }
            else {
                Franchisee
                .find(query)
                .count()
                .lean()
                .exec(function (err, count) {
                  if (err) {
                      
                      return res.send(500, err);
                  }
                  if (!count) {
                      
                      res.send({
                          "status": 200,
                          "message": "Franchiees not found",
                          "message": "failure",
                          "franchisees_list": []
                      }, 404);
                  }
                  else {
                      console.log(count);
                      res.send({
                          status: "200",
                          state: "success",
                          items: franchiees,
                          count: count,
                          skip:sk
                      }, 200);
                  }
              })
            }
        })
    })

//get franchisee by id


router.post('/get_franchiseelist_counts',utils.authenticated, function (req, res) {
   
    let data = req.body;
    if(data.franchisor_id) {
    if(data.franchisor_id.length == 24) {
    data.franchisor_id = objectId(data.franchisor_id);
    franchiseeService.findandCount({franchisor_id:data.franchisor_id})
    .then((response) => {
      if(response){
        let data = {};
        let total = 0;
        response.forEach((resp) => {
          if(resp._id.key == "Hot"){
            data.Hot = resp.count;
          }
          if(resp._id.key == "Warm"){
            data.Warm = resp.count;
          }
          if(resp._id.key == "Cold"){
            data.Cold = resp.count;
          }
          if(resp._id.key == "On Hold"){
            data.On_Hold = resp.count;
          }
          if(resp._id.key == "Franchisees"){
            data.Franchisees = resp.count;
          }
          if(resp._id.key == "Rejected"){
            data.Rejected = resp.count;
          }
          if(resp._id.key == "Unassigned"){
            data.Unassigned = resp.count;
          }
          total += resp.count;
        });
        if(data.Hot == undefined){
          data.Hot = 0;
        }
        if(data.Warm == undefined){
          data.Warm = 0;
        }
        if(data.Cold == undefined){
          data.Cold = 0;
        }
         if(data.On_Hold == undefined){
          data.On_Hold = 0;
        }
         if(data.Franchisees == undefined){
          data.Franchisees = 0;
        }
         if(data.Rejected == undefined){
          data.Rejected = 0;
        }
         if(data.Unassigned == undefined){
          data.Unassigned = 0;
        }
        data.all = total;
       
        res.status(201).json({ error: "0", message: "Successfully fetched", data: data});
      }else{
        res.status(404).json({ error: "1", message: "Error in fetching"});
      }
      
    })
    .catch((error) => {
      res.status(500).json({ error: "4", message: "Internal server error"});
    });
  }else{
    res.status(400).json({error:'2',message:"Please enter valid doctor id."});
  }}
  else{
    res.status(403).json({error:'2',message:"id is required, Missing required parameters."});
  }
    })


router.get('/get_franchisee/:id', function (req, res) {
    try {
        Franchisee.findById({ _id: req.params.id }, function (err, franchisee) {
            if (err) {
                return res.send(500, err);
            }
            if (!franchisee) {
                res.send({
                    "state": "failure",
                    "franchisees_data": []
                }, 400);
            }
            else {
                //     let franchisee_data =[];
                //   franchisee.franchisee_profile_pic = utils.getPreSignedURL( franchisee.franchisee_profile_pic);
                //     franchisee_data.push(franchisee);
                res.send({
                    status: 200,
                    state: "success",
                    franchisees_data: franchisee
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

// get all leads count
router.post('/get_all_leads', utils.authenticated, (req, res) => {
    let master_query = { master_franchisee_id: { $exists: false } }
    if (req.body._id) {
        master_query = { master_franchisee_id: req.body._id }
    }
    if (req.body.location) {
        var query = { $and: [{ lead_type: { $exists: true, $ne: "" }}, {franchisee_address: req.body.location }, master_query ] }
    }
    else if (!req.body.location || req.body.location == null) {
        query = { $and: [{ lead_type: { $exists: true, $ne: "" } }, master_query ] }
    }
    var hot_leads = 0
    var warm_leads = 0
    var cold_leads = 0
    var unassigned = 0
    var rejected = 0
    var franchisee = 0
    var onhold = 0
    var total = 0
    Franchisee.aggregate([
        { $match: query },
        {
            $group: {
                _id: {
                    key: "$lead_type",
                },
                count: { "$sum": 1 }
            }
        }
    ]).exec()
        .then((total_leads) => {
            total_leads.forEach(lead => {
                if (lead._id.key == "Cold") {
                    cold_leads = cold_leads + lead.count
                    total = total + lead.count
                }
                if (lead._id.key == "Hot") {
                    hot_leads = hot_leads + lead.count
                    total = total + lead.count
                }
                if (lead._id.key == "Warm") {
                    warm_leads = warm_leads + lead.count
                    total = total + lead.count
                }
                if (lead._id.key == "Unassigned") {
                    unassigned = unassigned + lead.count
                    total = total + lead.count
                }
                if (lead._id.key == "Rejected") {
                    rejected = rejected + lead.count
                    total = total + lead.count
                }
                if (lead._id.key == "Franchisees") {
                    franchisee = franchisee + lead.count
                    total = total + lead.count
                }
                if (lead._id.key == "On Hold") {
                    onhold = onhold + lead.count
                    total = total + lead.count
                }
                if (lead._id.key == undefined) {
                    cold_leads = 0
                }
                if (lead._id.key == undefined) {
                    hot_leads = 0
                }
                if (lead._id.key == undefined) {
                    warm_leads = 0
                }
                if (lead._id.key == undefined) {
                    unassigned = 0
                }
                if (lead._id.key == undefined) {
                    rejected = 0
                }
                if (lead._id.key == undefined) {
                    franchisee = 0
                }
                if (lead._id.key == undefined) {
                    onhold = 0
                }
            });
            return res.json({
                state: 'success',
                message: 'successfully fetched lead details',
                'hot_leads': hot_leads,
                'warm_leads': warm_leads,
                'cold_leads': cold_leads,
                'unassigned': unassigned,
                'rejected': rejected,
                'franchisee': franchisee,
                'on_hold': onhold,
                'total_leads': total
            })
        })
})

router.post('/get_leads_by_location', (req, res) => {
    let master_query = { master_franchisee_id: { $exists: false } }
    if (req.body._id) {
        master_query = { master_franchisee_id: req.body._id }
    }
    if (req.body.country && !req.body.state && !req.body.city) {
        query = { $and: [{ 'franchisee_country': req.body.country }, master_query] }
    }
    if (req.body.country && req.body.state && !req.body.city) {
        query = { $and: [{ 'franchisee_country': req.body.country, 'franchisee_state': req.body.state }, master_query] }
    }
    if (req.body.country && req.body.state && req.body.city) {
        query = { $and: [{ 'franchisee_country': req.body.country, 'franchisee_state': req.body.state, 'franchisee_city': req.body.city }, master_query] }
    }
    Franchisee.find(query, (err, data) => {
        if (err) {
            return res.json(500, err);
        }
        if (data) {
            return res.json({
                state: 'success',
                message: 'Successfully fetched leads by location',
                no_of_leads: data.length,
                country: req.body.country
            })
        }
    })
})

// get franchisee status
router.post('/get_franchisee_status', utils.authenticated, (req, res) => {
    let status = {
        profile_pending: 0,
        discussion_pending: 0,
        kyc_pending: 0,
        interview_pending: 0,
        agreement_pending: 0,
        setup_pending: 0
    }
    let master_query = { master_franchisee_id: { $exists: false } }
    if (req.body._id) {
        master_query = { master_franchisee_id: req.body._id }
    }
    Stages.aggregate([
        { $match: { $and: [{ 'stage_profile': 'completed' }, { 'stage_discussion.status': false }, master_query] } },
        { $group: { _id: null, profile_complete: { $sum: 1 } } }
    ]).exec()
        .then((stat) => {
            // status.discussion_pending = stat[0].discussion_pending;
            if (stat[0] == undefined) {
                status.profile_pending = 0;
            }
            else {
                status.profile_pending = stat[0].profile_complete
            }
        })
        .then(() => {
            return Stages.aggregate([
                { $match: { $and: [{ 'stage_discussion.status': true }, { 'stage_kycupload.status': false }, master_query] } },
                { $group: { _id: null, discussion_complete: { $sum: 1 } } }
            ]).exec()
                .then((disc) => {
                    if (disc[0] == undefined) {
                        status.discussion_pending = 0;
                    }
                    else {
                        status.discussion_pending = disc[0].discussion_complete;
                    }
                    return (disc);
                })
        })
        .then(() => {
            return Stages.aggregate([
                { $match: { $and: [{ 'stage_kycupload.status': true }, { 'stage_assessment.status': false }, master_query] } },
                { $group: { _id: null, kyc_complete: { $sum: 1 } } }
            ]).exec()
                .then((kyc) => {
                    if (kyc[0] == undefined) {
                        status.kyc_pending = 0;
                    }
                    else {
                        status.kyc_pending = kyc[0].kyc_complete;
                    }
                    return (kyc);
                })
        })
        .then(() => {
            return Stages.aggregate([
                { $match: { $and: [{ 'stage_assessment.status': true }, { 'stage_agreenent.status': false }, master_query] } },
                { $group: { _id: null, assessment_complete: { $sum: 1 } } }
            ]).exec()
                .then((assessment) => {
                    if (assessment[0] == undefined) {
                        status.interview_pending = 0;
                    }
                    else {
                        status.interview_pending = assessment[0].assessment_complete;
                    }
                    return (assessment);
                })

        })
        .then(() => {
            return Stages.aggregate([
                { $match: { $and: [{ 'stage_agreenent.status': true }, { 'stage_setup.status': false }, master_query] } },
                { $group: { _id: null, agreement_complete: { $sum: 1 } } }
            ]).exec()
                .then((agreement) => {
                    if (agreement[0] == undefined) {
                        status.agreement_pending = 0;
                    }
                    else {
                        status.agreement_pending = agreement[0].agreement_complete;
                    }
                    return (agreement);
                })
        })
        .then(() => {
            return Stages.aggregate([
                { $match: { $and: [{ 'stage_setup.status': true }, master_query] } },
                { $group: { _id: null, setup_complete: { $sum: 1 } } }
            ]).exec()
                .then((setup) => {
                    if (setup[0] == undefined) {
                        status.setup_pending = 0;
                    }
                    else {
                        status.setup_pending = setup[0].setup_complete;
                    }
                    return (setup);
                })
        })
        .then(() => {
            return res.json({
                state: 'success',
                message: 'Successfully fetched status data',
                data: status
            })
        })
        .catch((err) => {
            return res.json(500, err)
        })
})

// to get total revenue 
router.post('/get_total_revenue', utils.authenticated, (req, res) => {
    var query = { $exists: true };
    let master_query = {}
    if (req.body._id) {
        master_query = { master_franchisee_id: req.body._id }
    }
    if (req.body.type === 'yearly') {
        var first_day_of_year = new Date(req.body.date, 0, 1);
        var last_day_of_year = new Date(req.body.date, 11, 31);
        query = { $gte: first_day_of_year, $lte: last_day_of_year }
    }
    if (req.body.type === 'monthly') {
        var firstDay = new Date(req.body.date);
        var lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0)
        // console.log(day);
        // var lastDay = new Date(req.body.date);
        var fdt = new Date(firstDay.setHours(0, 0, 0, 0));
        var ldt = new Date(lastDay.setHours(23, 59, 59, 999));
        query = { $gte: fdt, $lte: ldt }
    }
    var one_lac_total = 0;
    var four_lac_total = 0;
    var total_leads = 0;
    var progress = 0;
    Stages.aggregate([
        { $match: { $and: [{ 'stage_discussion.payment_status': 'uploaded' }, { 'stage_discussion.one_lac_payment_uploaded_date': query }, master_query] } },
        { $group: { _id: null, one_lac_count: { $sum: 1 } } }
    ]).exec()
        .then((one_lac) => {
            if (one_lac[0] !== undefined) {
                one_lac_total = one_lac[0].one_lac_count * 100000;
            }
            return Stages.aggregate([
                { $match: { $and: [{ 'stage_agreenent.four_lac_payment_status': 'uploaded' }, { 'stage_agreenent.four_lac_payment_uploaded_date': query }, master_query] } },
                { $group: { _id: null, four_lac_count: { $sum: 1 } } }
            ]).exec()
                .then((four_lac) => {
                    if (four_lac[0] !== undefined) {
                        four_lac_total = four_lac[0].four_lac_count * 400000;
                    }
                    return (one_lac, four_lac);
                })
        })
        .then(() => {
            return Stages.aggregate([
                { $match: master_query },
                { $group: { _id: null, count: { $sum: 1 } } }
            ]).exec()
                .then((leads_count) => {
                    total_leads = leads_count[0].count * 5 * 100000;
                })
        })
        .then(() => {
            progress = ((one_lac_total + four_lac_total) / total_leads) * 100;
            return res.json({
                state: 'success',
                message: 'Successfully fetched total revenue',
                'total_one_lac_revenue': one_lac_total,
                'total_four_lac_revenue': four_lac_total,
                'total_received': one_lac_total + four_lac_total,
                'total_revenue': total_leads,
                'progress': progress
            })
        })
        .catch((err) => {
            return res.json(500, err)
        })
})

router.post('/get_revenue_graph', utils.authenticated, (req, res) => {
    var year = req.body.date;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date;
    var months_data = [];
    var data = [];
    months.forEach(month => {
        date = month + ', ' + year;
        let firstDay = new Date(date);
        let lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0)
        let fdt = new Date(firstDay.setHours(0, 0, 0, 0));
        let ldt = new Date(lastDay.setHours(23, 59, 59, 999));
        let one_lac_total = 0;
        let four_lac_total = 0;
        let total_leads = 0;
        let progress = 0;
        let query = { $gte: fdt, $lte: ldt };
        let master_query = { master_franchisee_id: { $exists: false } }
        if (req.body._id) {
            master_query = { master_franchisee_id: req.body._id }
        }
        Stages.aggregate([
            { $match: { $and: [{ 'stage_discussion.payment_status': 'uploaded' }, { 'stage_discussion.one_lac_payment_uploaded_date': query }, master_query] } },
            { $group: { _id: null, one_lac_count: { $sum: 1 } } }
        ]).exec()
            .then((one_lac) => {

                if (one_lac == "" || one_lac == null || one_lac.length == 0) {
                    months_data.push({ "month": fdt, "total": 0 });
                    if (months_data.length == months.length) {
                        months_data.sort((x, y) => {
                            return x.month - y.month;
                        })
                        // return months_data;
                        for (let j = 0; j < months_data.length; j++) {
                            data.push(months_data[j].total);
                        }
                        return res.json({
                            state: 'success',
                            message: 'Successfully fetched total revenue',
                            'total_yearly_revenue': data
                        })
                    }
                }
                else {
                    if (one_lac[0].one_lac_count) {
                        one_lac_total = one_lac[0].one_lac_count * 100000;
                    }
                    Stages.aggregate([
                        { $match: { $and: [{ 'stage_agreenent.four_lac_payment_status': 'uploaded' }, { 'stage_agreenent.four_lac_payment_uploaded_date': query }, master_query] } },
                        { $group: { _id: null, four_lac_count: { $sum: 1 } } }
                    ]).exec()
                        .then((four_lac) => {

                            if (four_lac[0] !== undefined) {
                                four_lac_total = four_lac[0].four_lac_count * 400000;
                            }
                            let total = four_lac_total + one_lac_total;
                            months_data.push({ "month": fdt, "total": total });
                            if (months_data.length == months.length) {
                                months_data.sort((x, y) => {
                                    return x.month - y.month;
                                })
                                for (let j = 0; j < months_data.length; j++) {
                                    data.push(months_data[j].total);
                                }
                                // return months_data;
                                return res.json({
                                    state: 'success',
                                    message: 'Successfully fetched total revenue',
                                    'total_yearly_revenue': data
                                })
                            }
                            // return (one_lac, four_lac);
                        })
                        .catch((err) => {
                            return res.json(500, err)
                        })
                }
            })
            // .then(() => {
            //     return Stages.aggregate([
            //         { $match: {} },
            //         { $group: { _id: null, count: { $sum: 1 } } }
            //     ]).exec()
            //         .then((leads_count) => {
            //             console.log(leads_count);
            //             total_leads = leads_count[0].count * 5 * 100000;
            //         })
            // })
            // .then((response) => {
            //     // progress = ((one_lac_total + four_lac_total) / total_leads) * 100;
            //     // var total_received = one_lac_total + four_lac_total;
            //     // console.log(total_received, 'total_received');
            //     // months_data.push(total_received);
            //     // console.log(months_data, 'months_data')
            //     // console.log(i);
            //     // if (i === 12) {
            //         // return res.json({
            //         //     state: 'success',
            //         //     message: 'Successfully fetched total revenue',
            //         //     'total_yearly_revenue': months_data
            //         // })
            //     // }
            //     console.log(response);
            //     return res.json({
            //         state: 'success',
            //         message: 'Successfully fetched total revenue',
            //         'total_yearly_revenue': response
            //     })
            // })
            .catch((err) => {
                console.log(err)
                return res.json(500, err)
            })
    });
})

router.post('/get_revenue_by_months', (req, res) => {
    date = new Date(req.body.date);
    var one_lac_total = 0;
    var four_lac_total = 0;
    Stages.aggregate([
        {
            "$project": {
                "stage_discussion.nda_file_uploaded": { "$month": date }
            },
            "$match": { "stage_discussion.nda_file_uploaded": 8 },
            "$group": { _id: null }
        }
    ]).exec()
        .then((one_lac) => {
            console.log(one_lac, 'one_lac')
        })
        .catch((err) => {
            console.log(err)
            return res.json(500, err)
        })
})

// to make franchisee notification count hide
router.post('/make_notification_franchisee_count_hide', function (req, res) {
    Franchisee.find({ '_id': req.body.user_id }, function (err, franchisee) {
        if (err) {
            return res.send({
                state: "error",
                message: err
            }, 500);
        }
        if (franchisee) {
            var franchisee = new Franchisee();
            franchisee.seen_notification = 1;
            franchisee.save(function (err, franchisee) {

                if (err) {
                    res.send({
                        state: "err",
                        message: "Something went wrong."
                    }, 500);

                }
                else {
                    res.send({
                        state: "success",
                        message: "Notification has been viewed",
                        data: franchisee
                    }, 200)
                }
            });
        }
    });
})

router.post('/make_user_notification_count_invisible', function (req, res) {

    try {
        console.log(req.body.user_role == 'franchisor');
        //if(req.body.user_role == 'franchisor'){
        //seen_notification = false;
        // Admin.findById({_id:req.body.user_id}, function(err, user){
        //     if(err){
        //         return res.send(500, err);
        //     }
        //     if(user){
        //         user.seen_notification = true;
        //         user.save(function(err,user){

        //         console.log(user);
        //         if(err){
        //             res.send({
        //                 state:"err",
        //                 message:"Something went wrong."
        //             },500);

        //         }
        //         else {
        //             res.send({
        //                 state:"success",
        //                 message:"Notification has been viewed",
        //                 data: user
        //             },200)
        //         }
        //     });
        //     }
        // });
        // }
        // if(req.body.user_role == 'franchisee'){
        Franchisee.findById({ _id: req.body.user_id }, function (err, franchisee) {
            if (err) {
                return res.send(500, err);
            }
            if (franchisee) {
                franchisee.seen_notification = true;
                franchisee.save(function (err, franchisee) {

                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);

                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Notification has been viewed",
                            data: franchisee
                        }, 200)
                    }
                });
            }
        });
        // }
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
});
//validate franchisee by email
router.post('/validate_franchisee', function (req, res) {
    var FranchiseeValidateForm = req.body;
    try {
        Franchisee.findOne({ 'franchisee_email': FranchiseeValidateForm.franchisee_email }, function (err, franchisee) {
            if (err) {
                return res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            if (franchisee) {
                return res.send({
                    state: "failure",
                    message: "This email already exists!"
                }, 400);
            }
            else {
                return res.send({
                    state: "success",
                    message: "Success!"
                }, 200);
            }
        });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
});
//validate franchisee by pincode
router.post('/validate_franchisee_pincode', function (req, res) {
    var FranchiseeValidateForm = req.body;
    try {
        Franchisee.findOne({ $and: [{ franchisee_pincode: franchiseeForm.franchisee_pincode }, { lead_type: 'Franchisees' }] }, function (err, franchisee) {
            if (err) {
                return res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            if (franchisee) {
                return res.send({
                    state: "failure",
                    message: "This pincode already exists!"
                }, 400);
            }
            else {
                return res.send({
                    state: "success",
                    message: "Success!"
                }, 200);
            }
        });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
});
//validate franchisee by mobile number
router.post('/validate_mobile_number', function (req, res) {
    var FranchiseeValidateForm = req.body;
    try {
        Franchisee.findOne({ 'partner_mobile_number': FranchiseeValidateForm.partner_mobile_number }, function (err, franchisee) {
            if (err) {
                return res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            if (franchisee) {
                return res.send({
                    state: "failure",
                    message: "This number already exists!"
                }, 400);
            }
            else {
                return res.send({
                    state: "success",
                    message: "Success!"
                }, 200);
            }
        });
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        }, 500);
    }
});
//create franchisee
router.post('/create_franchisee', function (req, res) {

    let franchiseeForm = req.body;

    try {//'franchisee_pincode':franchiseeForm.franchisee_pincode

        Franchisee.findOne({ $and: [{ franchisee_pincode: franchiseeForm.franchisee_pincode }, { lead_type: 'Franchisees' }] }, function (err, franchisee) {
            if (franchisee) {
                return res.send({
                    status: 500,
                    state: "failure",
                    message: "This franchisee pincode already exists!"
                });
            }
            else {
                //Franchisee.findOne({'franchisee_code':franchiseeForm.franchisee_code},function(err,franchisee){
                Franchisee.findOne({ 'franchisee_email': franchiseeForm.partner_email }, function (err, franchisee) {
                    if (err) {
                        return res.send({
                            status: 500,
                            state: "err",
                            message: "Something went wrong.We are looking into it."
                        });
                    }
                    if (franchisee) {
                        res.send({
                            status: 200,
                            state: "failure",
                            message: "This email already exists!"
                        });
                    }


                    if (!franchisee) {
                        // if(franchiseeForm.franchisee_name || franchiseeForm.partner_name){
                        //   return res.send({
                        //           status:500,
                        //           state:"err",
                        //           message:"Please specify Partner Name."
                        //       });
                        // }
                        var franchisee = new Franchisee();
                        //  franchisee.franchisee_code = franchiseeForm.franchisee_code,
                        franchisee.franchisee_name = franchiseeForm.franchisee_name;

                        if (!franchiseeForm.franchisee_name) {
                            // franchisee.franchisee_name=franchiseeForm.partner_name;

                        };
                        if (franchiseeForm.franchisee_img) {
                            if (franchiseeForm.franchisee_img != "") {

                                let fileExt = "";
                                if (franchiseeForm.franchisee_img.indexOf("image/png") != -1)
                                    fileExt = "png";
                                else if (franchiseeForm.franchisee_img.indexOf("image/jpeg") != -1)
                                    fileExt = "jpeg";
                                else if (franchiseeForm.franchisee_img.indexOf("image/jpg") != -1)
                                    fileExt = "jpg";
                                else if (franchiseeForm.franchisee_img.indexOf("video/mp4") != -1)
                                    fileExt = "mp4";
                                else
                                    fileExt = "png";

                                let imageKey = "franchisee_img/img_" + moment().unix();
                                console.log(imageKey)
                                if (franchiseeForm.franchisee_img) {
                                    // console.log('++++++++++++++++716',uploadToS3(imageKey, fileExt, franchiseeForm.franchisee_img));
                                    utils.uploadToS3(imageKey, fileExt, franchiseeForm.franchisee_img);
                                    delete franchiseeForm.franchisee_img;
                                }
                                franchiseeForm.prof_pic_org_url = utils.awsFileUrl() + imageKey + "." + fileExt;
                                //   franchiseeForm.franchisee_profile_pic = utils.getPreSignedURL(franchiseeForm.prof_pic_org_url);
                                franchiseeForm.franchisee_profile_pic = franchiseeForm.prof_pic_org_url;

                            } else {
                                franchiseeForm.franchisee_profile_pic = utils.awsFileUrl() + "franchisee_img/fallout.png";
                            }
                        } else {
                            franchiseeForm.franchisee_profile_pic = utils.awsFileUrl() + "franchisee_img/fallout.png";
                        }
                        franchiseeForm.franchisee_pass = createHash('mypassword');
                        franchiseeForm.franchisee_email = franchiseeForm.partner_email;
                        franchiseeForm.franchisee_mobile_number = franchiseeForm.partner_mobile_number;
                        franchiseeForm.partner_name = franchiseeForm.partner_name;
                        franchiseeForm.stage_profile = "completed";
                        /*franchisee.franchisee_email = franchiseeForm.partner_email;
                        franchisee.franchisee_occupation = franchiseeForm.partner_occupation;
                        franchisee.franchisee_city = franchiseeForm.franchisee_city;
                        franchisee.franchisee_state = franchiseeForm.franchisee_state;
                        franchisee.franchisee_address = franchiseeForm.franchisee_address;
                        franchisee.country_code = franchiseeForm.country_code;
                        franchisee.franchisee_mobile_number = franchiseeForm.partner_mobile_number;
                        franchisee.franchisee_investment = franchiseeForm.franchisee_investment;
                        franchisee.franchisee_preferred_date = franchiseeForm.franchisee_preferred_date;
                        franchisee.franchisee_preferred_time = franchiseeForm.franchisee_preferred_time;
                        franchisee.franchisee_how_soon_to_start = franchiseeForm.franchisee_how_soon_to_start;
                        franchisee.franchisee_franchise_model = franchiseeForm.franchisee_franchise_model;
                        franchisee.franchisee_franchise_type = franchiseeForm.franchisee_franchise_type,
                            franchisee.franchisee_remarks = franchiseeForm.franchisee_remarks,
                            franchisee.franchisee_country = franchiseeForm.franchisee_country,
                            franchisee.bussiness_type_id = franchiseeForm.bussiness_type_id,
                            franchisee.franchisee_pincode = franchiseeForm.franchisee_pincode,
                            franchisee.lead_age = franchiseeForm.partner_age,
                            franchisee.lead_source = franchiseeForm.lead_source,
                            franchisee.master_franchisee_id = franchiseeForm.master_franchisee_id,
                            franchisee.user_role = franchiseeForm.user_role,
                            franchisee.bussiness_type_id = franchiseeForm.bussiness_type_id;
                        franchisee.franchisee_pass = createHash('mypassword');
                        franchisee.bussiness_type = franchiseeForm.bussiness_type_id;
                        franchisee.partners_list = 1;
                        franchisee.partner_name = franchiseeForm.partner_name;
                        franchisee.franchisor_id = franchiseeForm.franchisor_id;
                        franchisee.stage_profile = "completed";
                        if (req.file) {
                            var franchisee_pic = {};
                            franchisee_pic.path = req.file.location;
                            franchisee_pic.key = req.file.key;
                            franchisee.franchisee_profile_pic = franchisee_pic;
                        }
                        
*/
                        //franchisee = franchiseeForm;
                        Franchisee.create(franchiseeForm, function (err, franchisee) {
                            if (err) {
                                res.send({
                                    status: 500,
                                    state: "err",
                                    message: "Something went wrong."
                                }, 500);
                            }
                            else {

                                var stage = new Stages();
                                stage.franchisee_id = franchisee._id,
                                    stage.stage_profile = franchisee.stage_profile
                                stage.save((err) => {
                                    if (err, stage) {
                                        console.log(err, 'errorrrr');
                                    }
                                    if (stage) {
                                        console.log('Stage saved', stage)
                                    }
                                });

                                var partner = new Partner();


                                partner.partner_name = franchiseeForm.partner_name,
                                    partner.partner_occupation = franchiseeForm.partner_occupation,
                                    partner.partner_email = franchisee.franchisee_email,
                                    partner.country_code = franchiseeForm.country_code,
                                    partner.partner_mobile_number = franchiseeForm.partner_mobile_number,
                                    partner.partner_age = franchiseeForm.partner_age,
                                    partner.partner_address = franchiseeForm.partner_address,
                                    partner.partner_house_number = franchiseeForm.partner_house_number,
                                    partner.partner_city = franchiseeForm.partner_city,
                                    partner.partner_state = franchiseeForm.partner_state,
                                    partner.partner_pincode = franchiseeForm.partner_pincode,
                                    partner.partner_country = franchiseeForm.partner_country,
                                    partner.main_partner = true,
                                    partner.bussiness_type_id = franchiseeForm.bussiness_type_id;
                                partner.franchisee_id = franchisee._id;
                                partner.partner_profile_pic = franchisee.franchisee_profile_pic;
                                partner.partner_occupation_others = franchisee.partner_occupation_others;
                                partner.save(function (err, partner) {
                                    if (err) {
                                        res.send({
                                            state: "err",
                                            message: "Something went wrong."
                                        }, 500);
                                    }
                                    else {
                                        if (franchiseeForm.master_franchisee_id) {
                                            Franchisee.findById({ _id: franchiseeForm.master_franchisee_id }, function (err, franchisee) {
                                                console.log(franchisee, "342");
                                                franchisee.sub_franchisee_count = franchisee.sub_franchisee_count + 1;
                                                franchisee.save(function (err, franchisee) {
                                                    console.log(franchisee, "345");
                                                })
                                            })
                                        }
                                        kyc_Upload(req, res, partner, franchisee, franchiseeForm);


                                        // Library.findOne({franchisee_Id:franchisee._id,folder_name: 'Discussion'}, function(err, folder){
                                        //   if(folder){
                                        //     console.log("folder already exists");
                                        //   }
                                        //   else {
                                        var library = new Library();
                                        library.franchisee_Id = franchisee._id;
                                        library.folder_name = 'Discussion';
                                        library.save(function (err, library) {
                                            console.log("discussion folder created");
                                        });
                                        //   }
                                        // })
                                        res.send({
                                            state: "success",
                                            message: "Franchisee created successfully.",
                                            data: franchisee
                                        }, 200);
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
//Creating kyc table for the frachisee
function kyc_Upload(req, res, partner, franchisee, franchiseeForm) {

    //FranchiseeTypeList.find({businessType_id:franchiseeForm.bussiness_type_id},function(err,type){
    //5aacf0e9be01b01e4456acd4
    var business_type_id = '';
    if (partner.bussiness_type_id) {
        business_type_id = partner.bussiness_type_id;

    }
    else {
        business_type_id = '5aacf0e9be01b01e4456acd4';
    }
    FranchiseeTypeList.find({ businessType_id: business_type_id }, function (err, type) {
        if (err) {
            return res.send({
                state: "error",
                message: err
            }, 500);
        }
        else {
            var kyc = new KycUploads();
            kyc.franchisee_id = franchisee._id;
            kyc.partner_id = partner._id;
            kyc.docs_types = type;
            kyc.save(function (err, kyc) {
                if (err) {
                    return res.send({
                        state: "error",
                        message: err
                    }, 500);
                }
                else {
                    // return res.send({
                    //     state:"success",
                    //     data: franchisee,
                    //     message:"Franchisee Created."
                    // },200);
                }
            })
        }
    })
}
//To get docs by franchisee id
router.get('/get_kyc_docs/:id', function (req, res) {
    KycUploads.find({ franchisee_id: req.params.id }, function (err, kyc) {
        if (err) {
            return res.send({
                state: "error",
                message: err
            }, 500);
        }
        if (kyc.length == 0) {
            return res.send({
                state: "failure",
                message: "Data not foound"
            }, 400);
        }
        if (kyc.length > 0) {
            return res.send({
                state: "success",
                data: kyc
            }, 200);
        }
    })
});
//To get by franchisee and partner id
router.get('/get_kyc_docs_by_partner/:id/:partner_id', function (req, res) {
    KycUploads.findOne({ partner_id: req.params.partner_id }, function (err, kyc) {
        if (err) {
            return res.send({
                state: "error",
                message: err
            }, 500);
        }
        if (!kyc) {
            return res.send({
                state: "failure",
                message: "Data not foound"
            }, 200);
        }
        if (kyc) {
            return res.send({
                state: "success",
                data: kyc
            }, 200);
        }
    })
});
//create multiple franchisee
router.post('/create_multiple_franchisee', function (req, res) {
    var franchiseeMultipleForm = req.body;
    try {
        Franchisee.find({}, function (err, franchisee) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            else {
                var franchisee_length = (franchiseeMultipleForm.length - 1);
                for (var i = 0; i < franchiseeMultipleForm.length - 1; i++) {
                    var franchisee = new Franchisee();
                    franchisee.franchisee_name = franchiseeMultipleForm[i].franchisee_name,
                        franchisee.franchisee_email = franchiseeMultipleForm[i].franchisee_email,
                        franchisee.franchisee_pincode = franchiseeMultipleForm[i].franchisee_pincode,
                        franchisee.franchisee_country = franchiseeMultipleForm[i].franchisee_country,
                        franchisee.franchisee_state = franchiseeMultipleForm[i].franchisee_state,
                        franchisee.franchisee_city = franchiseeMultipleForm[i].franchisee_city,
                        franchisee.franchisee_area = franchiseeMultipleForm[i].franchisee_area
                    franchisee.master_franchisee_id = franchiseeMultipleForm[i].master_franchisee_id

                    franchisee.save(function (err, franchisee) {
                        if (err) {
                            return res.send({
                                state: "err",
                                message: "Something went wrong."
                            }, 500);
                        }
                        else {
                            if (franchisee_length == i) {
                                return res.send({
                                    state: "success",
                                    message: "Multiple Franchisee Created."
                                }, 200);
                            }
                        }
                    });
                }
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


//save frachisee and partner information api
router.put('/save_partner_and_franchisee_information', function (req, res) {

    console.log('franchisee+++++++++++++++++', req.body.franchisee);
    console.log('partners++++++++++++++++', req.body.partners_list);
    var franchiseeEditForm = req.body.franchisee;
    var partners_list = req.body.partners_list;
    try {
        Franchisee.findOne({ '_id': franchiseeEditForm._id }, function (err, franchisee) {
            if (err) {
                return res.send({
                    status: 500,
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            //If franchisee found,it will enter inside
            if (franchisee) {
                franchisee.franchisee_code = franchiseeEditForm.franchisee_code,
                    franchisee.franchisee_name = franchiseeEditForm.franchisee_name,
                    franchisee.franchisee_occupation = franchiseeEditForm.franchisee_occupation,
                    franchisee.franchisee_email = franchiseeEditForm.franchisee_email,
                    franchisee.franchisee_city = franchiseeEditForm.franchisee_city,
                    franchisee.franchisee_state = franchiseeEditForm.franchisee_state,
                    franchisee.bussiness_type_id = franchiseeEditForm.bussiness_type_id,
                    franchisee.franchisee_pincode = franchiseeEditForm.franchisee_pincode,
                    franchisee.franchisee_address = franchiseeEditForm.franchisee_address,
                    franchisee.franchisee_mobile_number = franchiseeEditForm.franchisee_mobile_number,
                    franchisee.franchisee_investment = franchiseeEditForm.franchisee_investment,
                    franchisee.franchisee_preferred_date = franchiseeEditForm.franchisee_preferred_date,
                    franchisee.franchisee_preferred_time = franchiseeEditForm.franchisee_preferred_time,
                    franchisee.franchisee_how_soon_to_start = franchiseeEditForm.franchisee_how_soon_to_start,
                    franchisee.franchisee_franchise_model = franchiseeEditForm.franchisee_franchise_model,
                    franchisee.franchisee_franchise_type = franchiseeEditForm.franchisee_franchise_type,
                    franchisee.franchisee_remarks = franchiseeEditForm.franchisee_remarks,
                    franchisee.lead_age = franchiseeEditForm.lead_age,
                    franchisee.bussiness_type_id = franchiseeEditForm.bussiness_type_id;
                franchisee.lead_source = franchiseeEditForm.lead_source
                franchisee.save(function (err, franchisee) {
                    if (err) {
                        res.send({
                            status: 500,
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        for (let i = 0; i < partners_list.length; i++) {
                            var partnerEditForm = partners_list[i];
                            Partner.findById({ '_id': partnerEditForm._id }, function (err, partner) {


                                if (partners_list[i]) {
                                    if (partnerEditForm.partner_pic) {
                                        if (partnerEditForm.partner_pic != "") {

                                            let fileExt = "";
                                            if (partnerEditForm.partner_pic.indexOf("image/png") != -1)
                                                fileExt = "png";
                                            else if (partnerEditForm.partner_pic.indexOf("image/jpeg") != -1)
                                                fileExt = "jpeg";
                                            else if (partnerEditForm.partner_pic.indexOf("image/jpg") != -1)
                                                fileExt = "jpg";
                                            else if (partnerEditForm.partner_pic.indexOf("video/mp4") != -1)
                                                fileExt = "mp4";
                                            else
                                                fileExt = "png";

                                            let imageKey = "partner_pic/img_" + moment().unix();
                                            if (partnerEditForm.partner_pic) {
                                                utils.uploadToS3(imageKey, fileExt, partnerEditForm.partner_pic);
                                            }
                                            partnerEditForm.prof_pic_org_url = utils.awsFileUrl() + imageKey + "." + fileExt;
                                            partnerEditForm.partner_profile_pic = partnerEditForm.prof_pic_org_url;

                                        } else {
                                            partnerEditForm.partner_profile_pic = utils.awsFileUrl() + "franchisee_img/fallout.png";
                                        }
                                    } else {
                                        partnerEditForm.partner_profile_pic = utils.awsFileUrl() + "franchisee_img/fallout.png";
                                    }

                                    partner.partner_name = partnerEditForm.partner_name;
                                    partner.partner_occupation = partnerEditForm.partner_occupation;
                                    partner.partner_email = partnerEditForm.partner_email;
                                    partner.partner_address = partnerEditForm.partner_address;
                                    partner.partner_city = partnerEditForm.partner_city;
                                    partner.partner_state = partnerEditForm.partner_state;
                                    partner.partner_country = partnerEditForm.partner_country;
                                    partner.partner_pincode = partnerEditForm.partner_pincode;
                                    partner.partner_mobile_number = partnerEditForm.partner_mobile_number;
                                    partner.partner_age = partnerEditForm.partner_age;
                                    partner.country_code = partnerEditForm.country_code;
                                    partner.partner_house_number = partnerEditForm.partner_house_number;
                                    partner.bussiness_type_id = partnerEditForm.bussiness_type_id;
                                    partner.partner_occupation_others = partnerEditForm.partner_occupation_others;
                                    partner.partner_profile_pic = partnerEditForm.partner_profile_pic;
                                    partner.save(function (err, partner) {
                                        if (err) {

                                            res.send({
                                                state: "err",
                                                message: "Something went wrong."
                                            }, 500);
                                        } else {
                                            Franchisee.findOne({ _id: partner.franchisee_id }, function (err, franchiees) {
                                                if (err) {
                                                    return res.send({
                                                        state: "err",
                                                        message: "Something went wrong. We are looking into it."
                                                    }, 500);
                                                } else {

                                                    if (partner.main_partner) {
                                                        franchiees.franchisee_profile_pic = partner.partner_profile_pic;
                                                        franchiees.franchisee_mobile_number = partner.partner_mobile_number;
                                                        franchiees.franchisee_occupation = partner.partner_occupation;
                                                        franchiees.partner_occupation_others - partner.partner_occupation_others;
                                                        franchiees.lead_age = partner.partner_age;
                                                    }
                                                    franchiees.save(function (err, franchiees) {
                                                        if (err) {
                                                            return res.send({
                                                                state: "failure",
                                                                message: "Updation in franchisee got wrong"
                                                            }, 500);
                                                        } else {
                                                            console.log(partner, 358);
                                                            kyc_Upload(req, res, partner, franchiees, "Partner franchisee Updated.");
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }


                                res.send({
                                    status: 200,
                                    state: "success",
                                    message: "Franchisee Updated.",
                                    data: franchisee, partner
                                }, 200);
                            })
                        }
                    }
                });
            }
            if (!franchisee) {
                res.send({
                    status: 400,
                    state: "failure",
                    message: "Franchise exist with this Id."
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
})


//update franchisee
router.put('/edit_franchisee', upload.single('franchisee_img'), function (req, res, next) {
    var franchiseeEditForm = JSON.parse(req.body.franchisee);
    try {
        Franchisee.findOne({ '_id': franchiseeEditForm._id }, function (err, franchisee) {
            if (err) {
                return res.send({
                    status: 500,
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            //If franchisee found,it will enter inside
            if (franchisee) {
                franchisee.franchisee_code = franchiseeEditForm.franchisee_code,
                    franchisee.franchisee_name = franchiseeEditForm.franchisee_name,
                    franchisee.franchisee_occupation = franchisee.franchisee_occupation,
                    franchisee.franchisee_email = franchiseeEditForm.franchisee_email,
                    franchisee.franchisee_city = franchiseeEditForm.franchisee_city,
                    franchisee.franchisee_state = franchiseeEditForm.franchisee_state,
                    franchisee.bussiness_type_id = franchiseeEditForm.bussiness_type_id,
                    franchisee.franchisee_pincode = franchiseeEditForm.franchisee_pincode,
                    franchisee.franchisee_address = franchiseeEditForm.franchisee_address,
                    franchisee.franchisee_mobile_number = franchiseeEditForm.franchisee_mobile_number,
                    franchisee.franchisee_investment = franchiseeEditForm.franchisee_investment,
                    franchisee.franchisee_preferred_date = franchiseeEditForm.franchisee_preferred_date,
                    franchisee.franchisee_preferred_time = franchiseeEditForm.franchisee_preferred_time,
                    franchisee.franchisee_how_soon_to_start = franchiseeEditForm.franchisee_how_soon_to_start,
                    franchisee.franchisee_franchise_model = franchiseeEditForm.franchisee_franchise_model,
                    franchisee.franchisee_franchise_type = franchiseeEditForm.franchisee_franchise_type,
                    franchisee.franchisee_remarks = franchiseeEditForm.franchisee_remarks,
                    franchisee.lead_age = franchiseeEditForm.lead_age,
                    franchisee.bussiness_type_id = franchiseeEditForm.bussiness_type_id;
                franchisee.lead_source = franchiseeEditForm.lead_source
                if (req.file) {
                    var franchisee_pic = {};
                    franchisee_pic.path = req.file.location;
                    franchisee_pic.key = req.file.key;
                    franchisee.franchisee_pic = franchisee_pic;
                }
                franchisee.save(function (err, franchisee) {
                    if (err) {
                        res.send({
                            status: 500,
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        res.send({
                            status: 200,
                            state: "success",
                            message: "Franchisee Updated."
                        }, 200);
                    }
                });
            }
            //If franchisee not found,it will enter inside and send error message
            if (!franchisee) {
                res.send({
                    status: 400,
                    state: "failure",
                    message: "Franchise exist with this Id."
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
//delete franchisee
router.delete('/delete_franchisee/:id', function (req, res) {
    f_id = mongoose.Types.ObjectId(req.params.id);
    try {
        Franchisee.findByIdAndRemove({ _id: req.params.id }, function (err, franchisee) {
            if (err) {
                return res.send(500, err);
            }
            if (!franchisee) {
                res.send({
                    "status": 400,
                    "message": "Unsucessfull",
                    "franchisees_data": "failure"
                }, 400);
            }
            else {
                Stages.findOneAndRemove({ 'franchisee_id': f_id }, (err, stage) => {
                    if (err) {
                        return res.json(500, err);
                    }
                    if (stage) {
                        console.log('stage_deleted');
                        res.send({
                            "status": "200",
                            "message": "User deleted sucessfully",
                        }, 200);
                    }
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
});
//delete franchisee
router.delete('/delete_franchisees', function (req, res) {
    try {
        Franchisee.remove({}, function (err, franchisee) {
            if (err) {
                return res.send(500, err);
            }
            if (!franchisee) {
                res.send({
                    "status": 400,
                    "message": "Unsucessfull",
                    "franchisees_data": "failure"
                }, 400);
            }
            else {
                res.send({
                    "status": "200",
                    "message": "Franchisees deleted sucessfully",
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
//for get stagesSchema
router.get('/get_stages/:franchisee_id', function (req, res) {
    try {
        Stages.find({ franchisee_id: req.params.franchisee_id }, function (err, stages) {
            if (err) {
                return res.send(500, err);
            }
            if (!stages) {
                res.send({
                    "status": 404,
                    "message": "Franchiees not found",
                    "message": "failure",
                    "franchisees_list": []
                }, 404);
            }
            else {
                res.send({
                    "status": "200",
                    "state": "success",
                    "stages_list": stages
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

//for get stagesSchema
router.get('/get_stages', function (req, res) {
    try {
        Stages.find({}, function (err, stages) {
            if (err) {
                return res.send(500, err);
            }
            if (!stages) {
                res.send({
                    "status": 404,
                    "message": "Franchiees not found",
                    "message": "failure",
                    "franchisees_list": []
                }, 404);
            }
            else {
                res.send({
                    "status": "200",
                    "state": "success",
                    "stages_list": stages
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
//for get stagesSchema
router.get('/get_stage_by_id/:id', function (req, res) {
    try {
        Stages.findById({ _id: req.params.id }, function (err, stage) {
            if (err) {
                return res.send(500, err);
            }
            if (!stage) {
                res.send({
                    "status": 404,
                    "message": "Stage not found",
                    "message": "failure"
                }, 404);
            }
            else {
                res.send({
                    "status": "200",
                    "state": "success",
                    "data": stage
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
//delete stage
router.delete('/delete_stage/:id', function (req, res) {
    try {
        Stages.findByIdAndRemove({ _id: req.params.id }, function (err, stage) {
            if (err) {
                return res.send(500, err);
            }
            if (!stage) {
                res.send({
                    "status": 400,
                    "message": stage
                }, 400);
            }
            else {
                res.send({
                    "status": "200",
                    "message": "Stage deleted sucessfully",
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

router.delete('/delete_stages', function (req, res) {
    Stages.remove({}, function (err, stage) {
        if (err) {
            return res.send(500, err);
        }
        if (!stage) {
            res.send({
                "status": 400,
                "message": stage
            }, 400);
        }
        else {
            res.send({
                "status": "200",
                "message": "Stages deleted sucessfully",
            }, 200);
        }
    })
});

function update_franchisee(req, res, franchisee_id, val, stage) {
    Franchisee.findOne({ _id: franchisee_id }, function (err, franchiees) {
        if (err) {
            return res.send({
                state: "err",
                message: "Something went wrong."
            }, 500);
        }
        else {
            console.log(franchiees, 'franchiees');
            franchiees.franchisee_stage_completed = franchiees.franchisee_stage_completed + val;
            franchiees.first_lakh_payment = 'Submitted';
            franchiees.discussion_payment = "Payment uploaded proceed to application form"
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
                        message: "Stage Updated",
                        data: stage,
                        franchiees: franchiees
                    }, 200);
                }
            });
        }
    })
}

var stageForm = {};
var activity_data = {
    name: '',
    source: '',
    activity_of: '',
    franchisee_id: '',
    franchisor_id: ''
}
//name, source, activity_of, franchisee_id, franchisor_id
var cpUpload = upload.single('file');
router.put('/edit_stage', cpUpload, function (req, res) {

    stageForm = JSON.parse(req.body.franchisee_id);
    activity_data.franchisor_id = stageForm.franchisor_id;
    activity_data.franchisee_id = stageForm.franchisee_id;
    var stage_Completed = 0;
    try {
        Stages.findOne({ franchisee_id: stageForm.franchisee_id }, function (err, stage) {
            if (err) {
                return res.send({
                    status: 500,
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (stage) {
                //'payment'
                if (stageForm.sub_stage === 'payment') {
                    //  stage.stage_discussion.status = false;
                    stage.stage_discussion.payment_status = 'uploaded';
                    stage.stage_discussion.payment_value = 100000;
                    stage.stage_discussion.payment_file = req.file.location;
                    stage.stage_discussion.one_lac_payment_uploaded_date = new Date();
                    stage.stage_discussion.payment_file_name = req.file.originalname;
                    activity_data.name = '1 Lac Payment updated!';
                    activity_data.activity_of = 'franchisor';


                }
                //'nda'
                if (stageForm.sub_stage === 'nda') {
                    activity_data.activity_of = stageForm.user_role;
                    if (stageForm.user_role == 'franchisor' && stage.stage_discussion.nda_status == 'pending') {
                        stage.stage_discussion.nda_status = "approved";
                        activity_data.name = 'NDA Uploaded';
                    }
                    if (stage.stage_discussion.nda_status == 'pending' && stageForm.user_role == 'franchisee') {
                        stage.stage_discussion.nda_status = "uploaded";
                        activity_data.name = 'NDA Uploaded';

                    }
                    if (stage.stage_discussion.nda_status == 'uploaded' && stageForm.user_role == 'franchisor') {
                        stage.stage_discussion.nda_status = stageForm.nda_status;
                        activity_data.name = 'NDA ' + stageForm.nda_status;
                    }
                    if (stage.stage_discussion.nda_status == 'declined' && stageForm.user_role == 'franchisee') {
                        stage.stage_discussion.nda_status = 'uploaded';
                        activity_data.name = 'NDA Reuploaded';
                    }
                    // if(stage.stage_discussion.nda_status == 'declined' && stageForm.user_role == 'franchisor'){
                    //   stage.stage_discussion.nda_status = 'approved';
                    //   activity_data.name = 'NDA Reuploaded';
                    // }


                    // stage.stage_discussion.status = false;
                    if (req.file) {
                        stage.stage_discussion.nda_file = req.file.location;
                        stage.stage_discussion.nda_file_name = req.file.originalname;
                        if (req.file.mimetype == "application/pdf") {
                            stage.stage_discussion.nda_file_type = "pdf";
                        }
                        if (req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/gif") {
                            stage.stage_discussion.nda_file_type = "image";
                        }
                        stage.stage_discussion.nda_file_uploaded = Date.now();
                    }
                }
                //kyc background verification upload
                if (stageForm.sub_stage == 'kycupload') {
                    // stage.stage_kycupload = false;
                    stage.stage_kycupload.bgverification_file_link = req.file.location;
                    stage.stage_kycupload.bgverification_file_name = req.file.originalname;

                }
                //'application_form
                if (stageForm.sub_stage == 'application_form') {

                    if (stageForm.user_role == 'franchisor' && stage.stage_discussion.application_status == 'pending') {
                        stage.stage_discussion.application_status = "approved";
                    }
                    if (stage.stage_discussion.application_status == 'pending' && stageForm.user_role == 'franchisee') {
                        stage.stage_discussion.application_status = "Submitted";
                    }
                    if (stage.stage_discussion.application_status == 'Submitted' && stageForm.user_role == 'franchisor') {
                        stage.stage_discussion.application_status = stageForm.application_status;
                    }
                    if (stage.stage_discussion.application_status == 'Submitted' && stage.stage_discussion.application_status == 'approved' && stageForm.user_role == 'franchisor') {
                        stage.stage_discussion.status = true;
                    }
                    if (stage.stage_discussion.application_status == 'Submitted' && stageForm.user_role == 'franchisor') {
                        stage.stage_discussion.application_status = stageForm.application_status;
                    }
                    if (stage.stage_discussion.application_status == 'declined' && stageForm.user_role == 'franchisee') {
                        stage.stage_discussion.application_status = 'Submitted';
                    }
                    //  send_mail(req,res,stageForm);
                    // stage_Completed = 1;
                    // stage.stage_discussion.status = true;
                }
                //assessment
                if (stageForm.sub_stage == 'assessment') {
                    stage_Completed = 1;
                    stage.stage_assessment.status = true;
                    stage.stage_assessment.franchisee_id = stageForm.franchisee_id;
                }
                //aggrement
                if (stageForm.sub_stage == 'aggrement') {
                    // stage.stage_agreenent.status = false;
                    stage.stage_agreenent.agreement_value = 400000;
                    stage.stage_agreenent.agreement_file = req.file.location;
                    stage.stage_agreenent.four_lac_payment_status = 'uploaded';
                    stage.stage_agreenent.four_lac_payment_uploaded_date = new Date();
                    stage.stage_agreenent.agreement_file_name = req.file.originalname;
                    franchisee_id = stageForm.franchisee_id;
                    activity_data.activity_of = 'franchisor';
                    activity_data.name = '4 Lac payment Uploaded';
                }
                //aggrement copy
                if (stageForm.sub_stage == 'aggrement_Copy') {
                    // stage_Completed = 1;
                    // stage.stage_agreenent.status = true;
                    stage.stage_agreenent.final_agreement_file = req.file.location;
                    stage.stage_agreenent.final_agreement_file_name = req.file.originalname;
                    activity_data.activity_of = 'franchisor';
                    activity_data.name = 'Agreement Uploaded';
                };
                //save data in the table
                stage.save(function (err, stage) {

                    saveActivity(activity_data);
                    if (req.file) {
                        var get_id_of_crm_file = upload_folder_file(req, res, req.file, stageForm.fileStatus, stageForm.folder_Id, stageForm.franchisee_id, stageForm.sub_stage);
                        get_id_of_crm_file.then(result => {
                            console.log(result, 883);
                        })

                    }
                    if (err) {
                        return res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        console.log(activity_data);


                        //
                        // if(stage.stage_agreenent.agreement_file){
                        //     Franchisee.findOne({_id:stageForm.franchisee_id},function(err,franchiees){
                        //         if(err){
                        //             return res.send({
                        //                 state:"err",
                        //                 message:"Something went wrong."
                        //             },500);
                        //         }
                        //         else{
                        //             franchiees.second_lakh_payment = 'Submitted';
                        //             franchiees.save(function(err,franchisee){
                        //                 if(err){
                        //                     res.send({
                        //                         status:500,
                        //                         state:"err",
                        //                         message:"Something went wrong."
                        //                     },500);
                        //                 }
                        //                 else{
                        //                     return res.send({
                        //                         state:"success",
                        //                         message:"Stage Updated",
                        //                         data: stage,
                        //                         franchiees:franchiees
                        //                     },200);
                        //                 }
                        //             });
                        //         }
                        //     })
                        // }
                        // if(stage.stage_agreenent.final_agreement_file){
                        //     Franchisee.findOne({_id:stageForm.franchisee_id},function(err,franchiees){
                        //         if(err){
                        //             return res.send({
                        //                 state:"err",
                        //                 message:"Something went wrong."
                        //             },500);
                        //         }
                        //         else{
                        //             franchiees.agreement_file_uploaded = 'Agreement file uploaded proceed to Setup.'
                        //             franchiees.save(function(err,franchisee){
                        //                 if(err){
                        //                     res.send({
                        //                         status:500,
                        //                         state:"err",
                        //                         message:"Something went wrong."
                        //                     },500);
                        //                 }
                        //                 else{
                        //                     return res.send({
                        //                         state:"success",
                        //                         message:"Stage Updated",
                        //                         data: stage,
                        //                         franchiees:franchiees
                        //                     },200);
                        //                 }
                        //             });
                        //         }
                        //     })
                        // }
                        // if(stage.stage_discussion.nda_file){
                        //     Franchisee.findOne({_id:stageForm.franchisee_id},function(err,franchiees){
                        //         if(err){
                        //             return res.send({
                        //                 state:"err",
                        //                 message:"Something went wrong."
                        //             },500);
                        //         }
                        //         else{
                        //             franchiees.nda_uploaded = 'NDA file uploaded proceed to Payment.'
                        //             franchiees.save(function(err,franchisee){
                        //                 if(err){
                        //                     res.send({
                        //                         status:500,
                        //                         state:"err",
                        //                         message:"Something went wrong."
                        //                     },500);
                        //                 }
                        //                 else{
                        //                     return res.send({
                        //                         state:"success",
                        //                         message:"Stage Updated",
                        //                         data: stage,
                        //                         franchiees:franchiees
                        //                     },200);
                        //                 }
                        //             });
                        //         }
                        //     })
                        // }


                        // console.log('activity', activity_object);
                        // var activity_object = {
                        //     activity_name: 'nda',
                        //     activity_time : new Date()
                        // };
                        // console.log('activity', activity_tracker);

                        // activity_tracker(activity_object, res)
                        return res.send({
                            state: "success",
                            message: "Stage Updated",
                            data: stage
                        }, 200);
                    }
                    //update_franchisee(req, res, stageForm.franchisee_id,stage_Completed,stage);

                })
            }
            //If requesting it for first time
            if (!stage) {
                var stage = new Stages();
                if (stageForm.sub_stage === 'nda') {
                    console.log(stageForm, "stageform");
                    if (stageForm.user_role == 'franchisor' && stage.stage_discussion.nda_status == 'pending') {
                        stage.stage_discussion.nda_status = "approved";
                    }
                    if (stage.stage_discussion.nda_status == 'pending' && stageForm.user_role == 'franchisee') {
                        stage.stage_discussion.nda_status = "uploaded";

                    }
                    if (stage.stage_discussion.nda_status == 'uploaded' && stageForm.user_role == 'franchisor') {
                        stage.stage_discussion.nda_status = stageForm.nda_status;
                    }
                    if (stage.stage_discussion.nda_status == 'declined' && stageForm.user_role == 'franchisee') {
                        stage.stage_discussion.nda_status = 'uploaded';
                    }
                    if (stage.stage_discussion.nda_status == 'declined' && stageForm.user_role == 'franchisor') {
                        stage.stage_discussion.nda_status = 'approved';
                    }


                    // stage.stage_discussion.status = false;
                    if (req.file) {
                        stage.stage_discussion.nda_file = req.file.location;
                        stage.stage_discussion.nda_file_name = req.file.originalname;
                        if (req.file.mimetype == "application/pdf") {
                            stage.stage_discussion.nda_file_type = "pdf";
                        }
                        if (req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/gif") {
                            stage.stage_discussion.nda_file_type = "image";
                        }
                        stage.stage_discussion.nda_file_uploaded = Date.now();
                    }
                }
                stage.franchisee_id = stageForm.franchisee_id;
                stage.folder_id = stageForm.folder_Id;
                stage.stage_discussion.status = false;
                stage.stage_discussion.payment_value = 100000;
                stage.stage_discussion.nda_file = req.file.location;
                stage.stage_discussion.nda_file_name = req.file.originalname;
                // stage.stage_discussion.payment_file = req.file.location;
                // stage.stage_discussion.payment_file_name = req.file.originalname;
                if (req.file.mimetype == "application/pdf") {
                    stage.stage_discussion.nda_file_type = "pdf";
                }
                if (req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/gif") {
                    stage.stage_discussion.nda_file_type = "image";
                }
                stage.stage_discussion.nda_file_uploaded = Date.now();
                stage.save(function (err, stage) {
                    upload_folder_file(req, res, req.file, stageForm.fileStatus, stageForm.folder_Id, stageForm.franchisee_id, stageForm.sub_stage);
                    if (err) {
                        return res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        update_franchisee(req, res, stageForm.franchisee_id, stage_Completed, stage);
                    }
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
});

function saveActivity(data) {
    try {
        console.log(data, '1284');
        var activitytracker = new ActivityTracker();
        activitytracker.activity_name = data.name;
        console.log(data, '1285');
        activitytracker.activity_source = data.source;
        console.log(data, '1286');
        activitytracker.activity_of = data.activity_of;
        console.log(data, '1287');
        activitytracker.franchisee_id = data.franchisee_id;
        console.log(data, '1288');
        activitytracker.franchisor_id = data.franchisor_id;
        console.log(data, '1289');
        activitytracker.save(function (err, activitytracker) {
            console.log(err, '1289 swamy');
            if (err) {
                console.log(err, 'activitytracker creation error');
            }
            else {
                console.log(activitytracker, 'activitytracker');
            }
            return;
        });
    } catch (e) {

    } finally {

    }
}
function send_mail(req, res, stageForm) {
    try {
        Meeting.findOne({ franchisee_id: stageForm.franchisee_id }, function (err, franchise) {
            if (err) {
                return res.send({
                    "state": "failure",
                    "message": err
                })
            }
            else {
                var filepath = 'https://carzdev.s3.ap-south-1.amazonaws.com/1521119220821.angular-from-theory-to-practice.pdf';
                var fromName = "CARZ";
                var mailOptions = {
                    to: stageForm.to,
                    subject: stageForm.subject,
                    from: "ikshitnodemailer@gmail.com",
                    headers: {
                        "X-Laziness-level": 1000,
                        "charset": 'UTF-8'
                    },
                    attachments: [{
                        filename: "Application Form.pdf",
                        contentType: 'application/pdf',
                        path: 'https://carzdev.s3.ap-south-1.amazonaws.com/1521119220821.angular-from-theory-to-practice.pdf'
                    }],
                    html: stageForm.body
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
                transporter.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        return res.send(error);
                    }
                    else {
                        return;
                    }
                });
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
};

router.put('/update_stage', function (req, res) {
    var stage_Completed = 0;
    try {
        Stages.findOne({ franchisee_id: req.body.franchisee_id }, function (err, stage) {
            if (err) {
                return res.send({
                    status: 500,
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            console.log("here", stage);
            if (req.body.stage_name == 'Discussion') {
                stage_Completed = 1;
                stage.stage_discussion.status = true;
            }
            if (req.body.stage_name == 'Agreement_Copy') {
                stage_Completed = 1;
                stage.stage_agreenent.status = true;
            }
            if (req.body.stage_name == 'Kyc_Uploads') {
                stage_Completed = 1;
                stage.stage_kycupload.status = true;
                stage.stage_kycupload.franchisee_id = req.body.franchisee_id;
            }
            if (req.body.stage_name == 'Asessments') {
                stage_Completed = 1;
                stage.stage_assessment.status = true;
                stage.stage_assessment.franchisee_id = req.body.franchisee_id;
            }
            if (req.body.stage_name == 'setup') {
                stage_Completed = 1;
                stage.stage_setup.status = true;
            }
            stage.save(function (err, stage) {
                if (err) {
                    return res.send({
                        status: 500,
                        state: "err",
                        message: "Something went wrong.We are looking into it."
                    }, 500);
                }
                else {
                    update_franchisee(req, res, req.body.franchisee_id, stage_Completed, stage);
                }
            })
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
})

router.get('/master_franchisee_list', function (req, res) {
    try {
        Franchisee.find({ user_role: "master_franchisee" }, function (err, master_franchisee) {
            if (err) {
                return res.send({
                    status: 500,
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (master_franchisee.length == 0) {
                return res.send({
                    state: "err",
                    message: "Master franchisee not created yet"
                }, 400);
            }
            else {
                return res.send({
                    state: "success",
                    data: master_franchisee
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

router.get('/master_franchisee/franchisee_list/:id', function (req, res) {
    try {
        Franchisee.find({ $or: [{ master_franchisee_id: req.params.id }, { _id: req.params.id }], archieve_franchisee: false }, function (err, franchisee) {
            if (err) {
                return res.send({
                    status: 500,
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (franchisee.length == 0) {
                return res.send({
                    state: "err",
                    message: "Master franchisee not created yet"
                }, 400);
            }
            else {
                return res.send({
                    state: "success",
                    data: franchisee
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

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
async function upload_folder_file(req, res, obj, status, folder_Id, franchisee_Id, sub_stage_name) {
    console.log(folder_Id, '1167');

    if (!folder_Id) {
        var folder = new Folder();
        folder.crm_folder = true;
        folder.franchisee_Id = franchisee_Id;
        if (sub_stage_name == 'nda' || sub_stage_name == 'payment') {
            folder.folder_name = 'Discussion';
        }
        if (sub_stage_name == 'aggrement' || sub_stage_name == 'aggrement_Copy') {
            folder.folder_name = 'Agreements';
        }
        await folder.save(async function (err, folder) {
            if (err) {
                console.log(err, 'folder_error');
            }
            if (folder) {
                //            console.log(folder, 'folderdata');
                folder_Id = folder._id;
            }

            console.log(folder_Id, "1504");
            var library = new Library();
            library.path = obj.location;
            library.key = obj.key;
            library.file_name = obj.originalname;
            if (obj.mimetype == "application/pdf") {
                library.image_type = "pdf";
            }
            if (obj.mimetype == "image/png" || obj.mimetype == "image/jpg" || obj.mimetype == "image/jpeg" || obj.mimetype == "image/gif") {
                library.image_type = "image";
            }
            library.uploaded_status = status;
            library.date_uploaded = Date.now();
            library.folder_Id = folder_Id;
            library.franchisee_Id = franchisee_Id;
            await library.save(function (err, library) {
                console.log(library, '1914 file line');
                if (err) {
                    res.send({
                        status: 500,
                        state: "err",
                        message: "Something went wrong."
                    }, 500);
                }

                else {
                    console.log(library._id, "1189");
                    Stages.findOne({ franchisee_id: franchisee_Id }, function (err, stage) {
                        //payment, nda, aggrement, aggrement_Copy
                        console.log(sub_stage_name, '1976666666');
                        if (sub_stage_name == 'payment') {
                            stage.stage_discussion.first_payment_library_file_id = library._id;
                        }
                        if (sub_stage_name == 'nda') {
                            stage.stage_discussion.nda_library_file_id = library._id;
                            console.log(stage.stage_discussion.nda_library_file_id, '19811111')
                        }
                        if (sub_stage_name == 'aggrement') {
                            stage.stage_agreenent.second_payment_library_file_id = library._id;
                        }
                        if (sub_stage_name == 'aggrement_Copy') {
                            stage.stage_agreenent.final_agreement_library_file_id = library._id;
                        }
                        stage.save(function (err, stage) {
                            if (err) {
                                console.log(err, "error while saving stage files");
                            }
                            if (stage) {
                                console.log(stage, "library file attached to files");
                            }
                        })

                        //  get_id_of_crm_file = library._id;
                        return library._id;
                        //     return new Promise(resolve => {
                        //
                        //     resolve('resolved');
                        //
                        // });
                    })
                }

            });
        })
    }
    if (folder_Id) {
        console.log(folder_Id, "1504");
        var library = new Library();
        library.path = obj.location;
        library.key = obj.key;
        library.file_name = obj.originalname;
        if (obj.mimetype == "application/pdf") {
            library.image_type = "pdf";
        }
        if (obj.mimetype == "image/png" || obj.mimetype == "image/jpg" || obj.mimetype == "image/jpeg" || obj.mimetype == "image/gif") {
            library.image_type = "image";
        }
        library.uploaded_status = status;
        library.date_uploaded = Date.now();
        library.folder_Id = folder_Id;
        library.franchisee_Id = franchisee_Id;
        await library.save(function (err, library) {
            console.log(library, '1914 file line');
            if (err) {
                res.send({
                    status: 500,
                    state: "err",
                    message: "Something went wrong."
                }, 500);
            }

            else {
                console.log(library._id, "1189");
                Stages.findOne({ franchisee_id: franchisee_Id }, function (err, stage) {
                    //payment, nda, aggrement, aggrement_Copy
                    console.log(sub_stage_name, '1976666666');
                    if (sub_stage_name == 'payment') {
                        stage.stage_discussion.first_payment_library_file_id = library._id;
                    }
                    if (sub_stage_name == 'nda') {
                        stage.stage_discussion.nda_library_file_id = library._id;
                        console.log(stage.stage_discussion.nda_library_file_id, '19811111')
                    }
                    if (sub_stage_name == 'aggrement') {
                        stage.stage_agreenent.second_payment_library_file_id = library._id;
                    }
                    if (sub_stage_name == 'aggrement_Copy') {
                        stage.stage_agreenent.final_agreement_library_file_id = library._id;
                    }
                    stage.save(function (err, stage) {
                        if (err) {
                            console.log(err, "error while saving stage files");
                        }
                        if (stage) {
                            console.log(stage, "library file attached to files");
                        }
                    })

                    //  get_id_of_crm_file = library._id;
                    return library._id;
                    //     return new Promise(resolve => {
                    //
                    //     resolve('resolved');
                    //
                    // });
                })
            }

        });
    }
}


var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};


var request = require("request"),
    csv = require("csv");


// accepts the POST form submit of the CSV file
router.post("/upload/data", function (req, res) {
    // the name under "files" must correspond to the name of the
    // file input field in the submitted form (here: "csvdata")
    csv().from.path(req.files.csvdata.path, {
        delimiter: ",",
        escape: '"'
    })
        // when a record is found in the CSV file (a row)
        .on("record", function (row, index) {
            var franchisee_name, frachisee_email;

            // skip the header row
            if (index === 0) {
                return;
            }

            // read in the data from the row
            franchisee_name = row[0].trim();
            frachisee_email = row[1].trim();
            console.log(franchisee_email);
            console.log(franchisee_name);
            franchisee.save();


            // perform some operation with the data
            // ...
        })
        // when the end of the CSV document is reached
        .on("end", function () {
            // redirect back to the root
            res.redirect("/");
        })
        // if any errors occur
        .on("error", function (error) {
            console.log(error.message);
        });
});

router.post('/import_franchisee', function (req, res) {
    var franchiseeMultipleForm = req.body;

    try {

        var errors_count = 0;
        Franchisee.find({}, function (err, franchisee) {
            if (err) {
                return res.send({
                    state: "failure",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            };


            if (franchisee) {

                var franchisee_length = (franchiseeMultipleForm.length - 1);

                var existing_franchisees_list = get_existing_mails(franchiseeMultipleForm);
                existing_franchisees_list.then(function (list) {
                    
                    if (list.length != 0) {
                        return res.send({
                            state: "failure",
                            message: list.join() + " already exists in the database"
                        }, 201);
                    }
                    else {
                        for (var i = 0; i < franchiseeMultipleForm.length; i++) {
                            if (!franchiseeMultipleForm[i].partner_name) {
                                franchiseeMultipleForm[i].partner_name = franchiseeMultipleForm[i].franchisee_name
                            };
                            if (!franchiseeMultipleForm[i].franchisee_name && !franchiseeMultipleForm[i].franchisee_pincode && !franchiseeMultipleForm[i].franchisee_email && !franchiseeMultipleForm[i].partner_mobile_number) {

                            }
                            else {
                                var franchisee_mail = franchiseeMultipleForm[i].franchisee_email;
                                // if(!franchiseeMultipleForm[i].partner_name){
                                //   return res.send({
                                //           status:500,
                                //           state:"failure",
                                //           message:"Looks like franchisee name or partner name is missing in list"
                                //       });
                                // }


                                var franchisee = new Franchisee();
                                franchisee.franchisee_name = franchiseeMultipleForm[i].franchisee_name;
                                franchisee.franchisee_address = franchiseeMultipleForm[i].franchisee_address;
                                franchisee.franchisee_city = franchiseeMultipleForm[i].franchisee_city;
                                franchisee.franchisee_state = franchiseeMultipleForm[i].franchisee_state;
                                franchisee.franchisee_pincode = franchiseeMultipleForm[i].franchisee_pincode;
                                franchisee.franchisee_country = franchiseeMultipleForm[i].franchisee_country;
                                franchisee.lead_source = franchiseeMultipleForm[i].lead_source;
                                franchisee.lead_age = franchiseeMultipleForm[i].partner_age;
                                franchisee.franchisee_occupation = franchiseeMultipleForm[i].partner_occupation;
                                franchisee.franchisee_mobile_number = franchiseeMultipleForm[i].partner_mobile_number;
                                franchisee.franchisee_franchise_type = franchiseeMultipleForm[i].franchisee_franchise_type;
                                franchisee.franchisee_franchise_model = franchiseeMultipleForm[i].franchisee_franchise_model;
                                franchisee.franchisee_preferred_date = franchiseeMultipleForm[i].franchisee_date;
                                franchisee.franchisee_email = franchiseeMultipleForm[i].franchisee_email.trim();
                                franchisee.partner_name = franchiseeMultipleForm[i].partner_name;
                                franchisee.franchisee_investment = franchiseeMultipleForm[i].franchisee_investment;
                                franchisee.partner_occupation = franchiseeMultipleForm[i].partner_occupation;
                                franchisee.partner_mobile_number = franchiseeMultipleForm[i].partner_mobile_number;
                                franchisee.partner_age = franchiseeMultipleForm[i].partner_age;
                                franchisee.partner_house_number = franchiseeMultipleForm[i].partner_house_number;
                                franchisee.partner_address = franchiseeMultipleForm[i].partner_address;
                                franchisee.partner_city = franchiseeMultipleForm[i].partner_city;
                                franchisee.franchisee_pass = createHash('mypassword');
                                franchisee.partner_state = franchiseeMultipleForm[i].partner_state;
                                franchisee.partner_pincode = franchiseeMultipleForm[i].partner_pincode;
                                franchisee.partner_country = franchiseeMultipleForm[i].partner_country;
                                franchisee.bussiness_type_id = franchiseeMultipleForm[i].bussiness_type_id;
                                franchisee.lead_type = franchiseeMultipleForm[i].lead_type;
                                franchisee.stage_profile = "completed";
                                franchisee.save(function (err, franchisee) {

                                    if (err) {
                                return res.send({
                                            state: "err",
                                            message: "Something went wrong."
                                        }, 500);
                                    }
                                    else {
                                        //  if(franchisee_length==i){
                                            var stage = new Stages();
                                stage.franchisee_id = franchisee._id,
                                    stage.stage_profile = 'completed'
                                stage.save((err) => {
                                    if (err, stage) {
                                        console.log(err, 'errorrrr');
                                    }
                                    if (stage) {
                                        console.log('Stage saved', stage)
                                    }
                                });

                                        var partner = new Partner();
                                        

                                        partner.partner_name = franchisee.partner_name;
                                        partner.partner_occupation = franchisee.partner_occupation;
                                        partner.partner_email = franchisee.franchisee_email.trim();
                                        partner.partner_mobile_number = franchisee.partner_mobile_number;
                                        partner.partner_age = franchisee.partner_age;
                                        partner.partner_house_number = franchisee.partner_house_number;
                                        partner.partner_address = franchisee.partner_address;
                                        partner.partner_city = franchisee.partner_city;
                                        partner.partner_state = franchisee.partner_state;
                                        partner.partner_pincode = franchisee.partner_pincode;
                                        partner.partner_country = franchisee.partner_country;
                                        partner.main_partner = true;
                                        partner.bussiness_type_id = franchisee.bussiness_type_id;
                                        partner.franchisee_id = franchisee._id;
                                        partner.partner_profile_pic = franchisee.franchisee_profile_pic
                                        partner.save(function (err, partner) {
                                            if (err) {
                                                res.send({
                                                    state: "err",
                                                    message: "Something went wrong."
                                                }, 500);
                                            }
                                            else {
                                                res.status(200).send({
                                                    state: "success",
                                                    message: "Franchisee Created."
                                                });
                                                
                                                var folder = new Folder();
                                                folder.crm_folder = true;
                                                folder.franchisee_Id = franchisee._id;
                                                folder.folder_name = 'Discussion';
                                                folder.save(function (err, folder) {
                                                    if (err) {
                                                        console.log(err, 'folder_error');
                                                    }
                                                    if (folder) {
                                                        console.log(folder, 'folderdata');
                                                    }

                                                })
                                                kyc_Upload(req, res, partner, franchisee, franchisee);
                                            }
                                        });
                                    }// Else statement after franchisee created
                                });
                            }

                        };
                    } //else statement of list length
                })
            }
        });
        // for(var i=0;i<franchiseeMultipleForm.length;i++){
        //
        //   var franchisee_mail = franchiseeMultipleForm[i].franchisee_email;
        //
        //     Franchisee.find({franchisee_email: franchiseeMultipleForm[i].franchisee_email},function(err,franchisee){
        //         if(franchisee){
        //           error_mode = true;
        //           errors_count = +1;
        //
        //           existing_franchisees.push(franchisee.franchisee_email);
        //
        //
        //         }

        // else {
        //
        //   if(errors_count === 0){
        //     var franchisee = new Franchisee();
        //     franchisee.franchisee_name = franchiseeMultipleForm[i].franchisee_name,
        //     franchisee.franchisee_address = franchiseeMultipleForm[i].franchisee_address,
        //     franchisee.franchisee_city = franchiseeMultipleForm[i].franchisee_city,
        //     franchisee.franchisee_state = franchiseeMultipleForm[i].franchisee_state,
        //     franchisee.franchisee_pincode = franchiseeMultipleForm[i].franchisee_pincode,
        //     franchisee.franchisee_country = franchiseeMultipleForm[i].franchisee_country,
        //     franchisee.lead_source = franchiseeMultipleForm[i].lead_source,
        //     franchisee.franchisee_franchise_type = franchiseeMultipleForm[i].franchisee_franchise_type,
        //     franchisee.franchisee_franchise_model = franchiseeMultipleForm[i].franchisee_franchise_model,
        //     franchisee.franchisee_date = franchiseeMultipleForm[i].franchisee_date,
        //     franchisee.franchisee_email = franchiseeMultipleForm[i].franchisee_email,
        //     franchisee.franchisee_investment = franchiseeMultipleForm[i].franchisee_investment,
        //
        //     franchisee.save(function(err,franchisee, next){
        //         if(err){
        //           console.log(err, "error 1188");
        //             return res.send({
        //                 state:"err",
        //                 message:"Something went wrong."
        //             },500);
        //         }
        //         else{
        //             if(franchisee_length==i){
        //                 return res.send({
        //                     state:"success",
        //                     message:"Franchisee Created."
        //                 },200);
        //                 var partner = new Partner();
        //
        //
        //                 partner.partner_name=franchiseeMultipleForm[i].franchisee_name,
        //                 partner.partner_occupation=franchiseeMultipleForm[i].partner_occupation,
        //                 partner.partner_email=franchiseeMultipleForm[i].franchisee_email,
        //                 partner.partner_mobile_number=franchiseeMultipleForm[i].partner_mobile_number,
        //                 partner.partner_age=franchiseeMultipleForm[i].partner_age,
        //                 partner.partner_address = franchiseeMultipleForm[i].partner_address,
        //                 partner.partner_city = franchiseeMultipleForm[i].partner_city,
        //                 partner.partner_state = franchiseeMultipleForm[i].partner_state,
        //                 partner.partner_pincode = franchiseeMultipleForm[i].partner_pincode,
        //                 partner.partner_country = franchiseeMultipleForm[i].partner_country,
        //                 partner.main_partner = true,
        //
        //                 partner.franchisee_id=franchisee._id;
        //                 partner.partner_profile_pic = franchisee.franchisee_profile_pic
        //                 partner.save(function(err,partner){
        //                     if(err){
        //                         res.send({
        //                             state:"err",
        //                             message:"Something went wrong."
        //                         },500);
        //                     }
        //                     else{
        //                         kyc_Upload(req, res,partner,franchisee,franchiseeMultipleForm[i]);
        //                     }
        //                 });
        //             }
        //         }
        //     });
        //   }
        // }

        //      });
        //
        //
        // }

        //     }
        // });
    }
    catch (err) {
        console.log(err, "error 1188");
        return res.send({
            state: "error",
            message: err
        });
    }
});
async function get_existing_mails(values) {
    var existing_franchisees = [];
    for (var i = 0; i < values.length; i++) {
        var franchisee_mail = values[i].franchisee_email;
        await Franchisee.find({ franchisee_email: values[i].franchisee_email, archieve_franchisee: false }, function (err, franchisee) {
            if (franchisee) {
                for (var j = 0; j < franchisee.length; j++) {
                    (function (j) {
                        existing_franchisees.push(franchisee[j].franchisee_email);
                    })(j);
                }
            }
        });
    }
    return existing_franchisees;
}

// To select lead type
router.put('/lead_type', function (req, res) {
    try {
        Franchisee.findOne({ _id: req.body.franchisee_Id }, function (err, franchisee) {
            if (err) {
                return res.send({
                    status: 500,
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (franchisee) {
                if (req.body.lead_type === 'Rejected' && req.body.rejected_franchisee_reason != null) {
                    franchisee.rejected_franchisee_reason = req.body.rejected_franchisee_reason;
                }
                franchisee.lead_type = req.body.lead_type
                franchisee.franchisee_created_on = new Date();
                franchisee.save(function (err, franchisee) {
                    if (err) {
                        res.send({
                            status: 500,
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        res.send({
                            status: 200,
                            state: "success",
                            message: "Lead type created."
                        }, 200);
                    }
                });
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

// To archive
router.put('/archieve_franchisee', function (req, res) {
    f_id = mongoose.Types.ObjectId(req.body._id);
    try {
        // Franchisee.findById({_id:req.body._id},function(err,franchisee){
        //     if(err){
        //         return res.send(500, err);
        //     }   if(franchisee) {
        //         franchisee.archieve_franchisee=true;
        //         franchisee.save(function(err,franchisee){
        //             console.log('1482', franchisee);
        //             if (err) {
        //                 res.send({
        //                     state: "err",
        //                     message: "Something went wrong."
        //                 }, 500);
        //             }
        //             else {
        //                 Franchisee.findById({_id:req.body.master_franchisee_id},function(err, franchisee){
        //                   console.log(franchisee, "1501");
        //                   franchisee.sub_franchisee_count =  franchisee.sub_franchisee_count-1;
        //                   franchisee.save(function (err, franchisee){
        //                     console.log(franchisee, "1504");
        //                   })
        //                 })
        //                 res.send({
        //                     state: "success",
        //                     message: "Franchisee status updated.",
        //                     data: franchisee
        //                 }, 200);
        //             }
        //         });
        //     }
        //     if (!franchisee) {
        //         res.send({
        //             state: "failure",
        //             message: "Failed to update status."
        //         }, 400);
        //     }
        // });
        Franchisee.findByIdAndRemove({ _id: req.body._id }, function (err, franchisee) {
            if (err) {
                return res.send(500, err);
            } else {
                Stages.findOneAndRemove({ 'franchisee_id': f_id }, (err, stage) => {
                    if (err) {
                        return res.json(500, err);
                    }
                    if (stage) {
                        console.log('stage_deleted');
                        res.send({
                            "status": "200",
                            "message": "User deleted sucessfully",
                        }, 200);
                    }
                })
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

router.put('/disable_onboarding', function (req, res) {
    try {
        Franchisee.findById({ _id: req.body.franchisee_id }, function (err, franchisee) {
            console.log(franchisee, "1548");
            if (err) {
                return res.send(500, err);
            }
            if (franchisee) {
                franchisee.show_kt_popup_first_time = false;
                franchisee.franchisee_id = req.body.franchisee_id;
                franchisee.save(function (err, franchisee) {
                    console.log(franchisee, "1555");
                })
                console.log(franchisee.show_kt_popup_first_time);
                if (err) {
                    res.send({
                        state: "err",
                        message: "Something went wrong."
                    }, 500);

                }
                else {
                    res.send({
                        state: "success",
                        message: "Onboarding disabled.",
                        data: franchisee
                    }, 200)
                }
            }
        });
    }
    catch (err) {
        res.send({
            state: "error",
            message: "Something went wrong."
        }, 500);
    }
})


//   edit  franchisee my profile
router.put('/edit_my_profile', function (req, res) {
    try {
        Franchisee.findById({ _id: req.body.franchisee_id }, function (err, franchisee) {
            if (err) {
                return res.send(500, err);
            }
            if (franchisee) {
                franchisee.franchisee_name = req.body.franchisee_name;
                franchisee.franchisee_email = req.body.franchisee_email;
                franchisee.franchisee_pass = req.body.franchisee_pass;
                franchisee.franchisee_confirm_pass = req.body.franchisee_confirm_password;
                franchisee.save(function (err, franchisee) {
                })
                if (err) {
                    res.send({
                        state: "err",
                        message: "Something went wrong."
                    }, 500);

                }
                else {
                    res.send({
                        state: "success",
                        message: "My profile updated.",
                        data: franchisee
                    }, 200)
                }
            }
        });
    }
    catch (err) {
        res.send({
            state: "error",
            message: "Something went wrong."
        }, 500);
    }
})


router.put('/edit_franchisee_profile', function (req, res) {
    if (req.body.franchisee_name) {
        try {

            Franchisee.findById({ _id: req.body.user_id }, function (err, user) {
                if (err) {
                    return res.send(500, err);
                }
                if (user) {
                    user.franchisee_name = req.body.franchisee_name;
                    if (req.body.franchisee_pass) {
                        user.franchisee_pass = createHash(req.body.franchisee_pass);//req.body.user_pass;
                    }
                    user.save(function (err, user) {
                    })
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);

                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Profile updated successfully!",
                            data: user
                        }, 200)
                    }
                }
            });
        }
        catch (err) {
            res.send({
                state: "error",
                message: "Something went wrong."
            }, 500);
        }
    } else {

        res.send({
            state: "error",
            message: "Missing required parameters."
        }, 400);

    }
})

router.get('/get_admins', function (req, res) {
    try {
        Franchisor.find({}, function (err, user) {
            if (err) {
                return res.send(500, err);
            }
            if (!user) {
                res.send({
                    state: 'failure',
                    user: []
                }, 400);
            }
            else {
                res.send({
                    state: 'success',
                    data: user
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

function notify_user(req, res, message, reason, rejected_franchisee_reason) {
    var fromName = "CARZ";
    var mailOptions = {
        to: 'vishnu@wtastudios.com',
        subject: 'notify',
        from: "ikshitnodemailer@gmail.com",
        headers: {
            "X-Laziness-level": 1000,
            "charset": 'UTF-8'
        },

        html: 'File rejected.'
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
    transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
            return res.send(error);
        }
        else {
            return res.send({
                state: "success",
                message: message,
                data: kyc_data
            }, 200);
        }
    });
}

module.exports = router;
