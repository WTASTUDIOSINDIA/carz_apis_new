var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
var FranchiseeTypeList = mongoose.model('FranchiseeTypeList');
var Library = mongoose.model('Library');
var Folder = mongoose.model('Folder');
var Doc = mongoose.model('Doc');
var KycUploads = mongoose.model('KycUploads');
var Admin = mongoose.model('Admin');
var fs = require('fs');
var csv = require('csv')
var path = require('path');
var Meeting = mongoose.model('Meeting');
var nodemailer = require('nodemailer');
var _ = require('lodash');
// var Discussion = mongoose.model('Discussion');
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

router.get('/get_activities_tracker/:franchisee_id/:franchisor_id', function(req, res){
  try {
    ActivityTracker.find({franchisee_id: req.params.franchisee_id, franchisor_id: req.params.franchisor_id}, function(err, activity_tracker){
      if(err){
        res.send({
          status: 500,
          state: "failure",
          message: err
        });
      }
      else if(activity_tracker.length == 0){
        res.send({
          status: 200,
          state: "success",
          message: "No data found.",
          data: activity_tracker
        });
      }
      else if (activity_tracker.length > 0){
        res.send({
          status: 200,
          state: "success",
          data: activity_tracker
        });
      }
    })
  } catch (e) {

  }
});
router.post('/save_activity', function(req, res){
  try {
    var activitytracker = new ActivityTracker();
    activitytracker.activity_name = req.body.name;
    activitytracker.activity_source = req.body.source;
    activitytracker.activity_of = req.body.activity_of;
    activitytracker.franchisee_id = req.body.franchisee_id;
    activitytracker.franchisor_id = req.body.franchisor_id;
    activitytracker.save(function(err, activitytracker){
      if(err){
        res.send({
          status: 500,
          state: "failure",
          error: err
        });
      }
      if(activitytracker) {
        res.send({
          status: 200,
          state: "success",
          data: activitytracker
        });
      }

    });
  } catch (e) {
    res.send({
      status: 500,
      state: "failure",
      error: e
    });
  }
});
module.exports = router;
