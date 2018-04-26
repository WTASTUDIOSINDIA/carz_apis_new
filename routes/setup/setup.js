
var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer = require('multer');
var path = require('path');
var Partner = mongoose.model('Partner');
var SetupTask = mongoose.model('SetupTask');
var SetupDepartment = mongoose.model('SetupDepartment');
var SetupChecklist = mongoose.model('SetupChecklist');
var Franchisee = mongoose.model('Franchisee');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var KycUploads = mongoose.model('KycUploads');
var bCrypt = require('bcrypt-nodejs');
var FranchiseeTypeList = mongoose.model('FranchiseeTypeList');
aws.config.loadFromPath('./config.json');
aws.config.update({
 signatureVersion: 'v4'
});
var s0 = new aws.S3({})
var upload = multer({
 storage:multerS3({
 s3:s0,
 bucket:'celebappfiles',
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
router.post('/create_setup_department', function(req, res){
  try{
    SetupDepartment.findOne({setup_department_name_EN: req.body.setup_department_name_EN, franchisor_id: req.body.franchisor_id}, function(err, department){
      if(err){
        res.send({
        state:"failure",
        message:"Something went wrong."
        },500);
      }
      if(department) {
        res.send({
        state:"failure",
        message:"This department name already exists."
      },200);
      }
      else {
        console.log(department);
        department = new SetupDepartment();
        department.setup_department_name_EN = req.body.setup_department_name_EN;
        department.franchisor_id = req.body.franchisor_id;
        department.save(function(err, department){
          if(err){
            res.send({
            state:"failure",
            message:"Something went wrong."
            },500);
          }
          else {
            res.send({
            state:"success",
            message:"Department created successfully"
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
})
router.get('/get_setup_departments/:franchisor_id', function(req, res){
  try{
    SetupDepartment.find({franchisor_id: req.params.franchisor_id},function(err,departments){
      if(err){
          return res.send(500, err);
      }
      if(!departments){
        res.send({
        "message":"Departments are not found",
        "state":"failure",
        "partner_list":[]
        },201);
      }
      else{
        res.send({
        "state":"success",
        "data":departments
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
