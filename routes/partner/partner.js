
var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer = require('multer');
var path = require('path');
var Partner = mongoose.model('Partner');
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



//validate franchisee by mobile number
router.post('/validate_mobile_number', function(req, res) {
 var PartnerValidateForm = req.body;
 try{
 Partner.findOne({'partner_mobile_number':PartnerValidateForm.partner_mobile_number},function(err,partner){
 if(err){
 return res.send({
 state:"error",
 message:err
 },500);
 }
 if(partner){
 return res.send({
 state:"failure",
 message:"This number already exists!"
 }, 400);
 }
 else{
 return res.send({
 state:"success",
 message:"Success!"
 }, 200);
 }
 });
 }
 catch(err){
        return res.send({
            state:"error",
            message:err
        },500);
    }
});

//validate franchisee by pincode
router.post('/validate_partner_pincode', function(req, res) {
 var PartnerValidateForm = req.body;
 try{
 Partner.findOne({'partner_pincode':PartnerValidateForm.partner_pincode},function(err,franchisee){
 if(err){
 return res.send({
 state:"error",
 message:err
 },500);
 }
 if(partner){
 return res.send({
 state:"failure",
 message:"This pincode already exists!"
 }, 400);
 }
 else{
 return res.send({
 state:"success",
 message:"Success!"
 }, 200);
 }
 });
 }
 catch(err){
        return res.send({
            state:"error",
            message:err
        },500);
    }
});

//validate franchisee by email
router.post('/validate_partner_email', function(req, res) {
 var PartnerValidateForm = req.body;
 try{
 Partner.findOne({'partner_email':PartnerValidateForm.partner_email},function(err,partner){
 if(err){
 return res.send({
 state:"error",
 message:err
 },500);
 }
 if(partner){
 return res.send({
 state:"failure",
 message:"This email already exists!"
 }, 400);
 }
 else{
 return res.send({
 state:"success",
 message:"Success!"
 }, 200);
 }
 });
 }
 catch(err){
        return res.send({
            state:"error",
            message:err
        },500);
    }
});

// To Create Partner Franchisee
router.post('/create_partner_franchisee',upload.single('partner_pic'),function(req, res){
 var partnerForm =JSON.parse(req.body.partner);
 try{
 Partner.findOne({'partner_email': partnerForm.partner_email},function(err, partner){
 if(err){
 return res.send({
 state:"err",
 message:"Something went wrong. We are looking into it."
 },500);
 }
 if(partner){
 res.send({
 state: "failure",
 message:"Partner already exists!"
 },200);
 }
 if(!partner){
 var partner = new Partner();
 if(req.file){
 var partner_pic = {};
 partner_pic.path = req.file.location;
 partner_pic.key = req.file.key;
 partner.partner_profile_pic = partner_pic;
 }
 partner.partner_name=partnerForm.partner_name;
 partner.partner_occupation=partnerForm.partner_occupation;
 partner.partner_email=partnerForm.partner_email;
 partner.partner_mobile_number=partnerForm.partner_mobile_number;
 partner.partner_age=partnerForm.partner_age;
 partner.franchisee_id=partnerForm.franchisee_id;
 partner.partner_address = partnerForm.partner_address;
 partner.partner_city = partnerForm.partner_city;
 partner.partner_state = partnerForm.partner_state;
 partner.partner_country = partnerForm.partner_country;
 partner.partner_pincode = partnerForm.partner_pincode;
 partner.bussiness_type = partnerForm.bussiness_type;
 partner.bussiness_type_id = partnerForm.bussiness_type_id;

 partner.save(function(err,partner){
 if(err){
 res.send({
 state:"err",
 message:"Something went wrong."
 },500);
 }
 else{
 Franchisee.findOne({_id:partnerForm.franchisee_id},function(err,franchiees){
 if(err){
 return res.send({
 state:"err",
 message:"Something went wrong. We are looking into it."
 },500);
 }
 else{

 if(franchiees.partners_list){
 franchiees.partners_list = franchiees.partners_list + 1;
 }
 else{
 franchiees.partners_list = 1;
 }
 franchiees.save(function(err,franchiees){
 if(err){
 return res.send({
 state:"err",
 message:"Updation in franchisee got wrong"
 },500);
 }
 else{
 kyc_Upload(req, res,partner,franchiees,"Partner franchisee created.");
 }
 });
 }
 });
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
function kyc_Upload(req,res,partner,partnerForm,message){
  console.log(partner, "223");
 FranchiseeTypeList.find({businessType_id:partner.bussiness_type_id},function(err,type){
 if(err){
 return res.send({
 state:"error",
 message:err
 },500);
 }
 else{
 KycUploads.findOne({partner_id:partner._id},function(err,kyc){
 if(err){
 return res.send({
 state:"error",
 message:err
 },500);
 }
 if(!kyc){
 var kyc = new KycUploads();
 kyc.franchisee_id = partner.franchisee_id;
 kyc.partner_id = partner._id;
 var businessType_array = type;
 kyc.docs_types = type;
 kyc.save(function(err,kyc){
 if(err){
 return res.send({
 state:"error",
 message:err
 },500);
 }
 else{
 res.send({
 state:"Success",
 message:message
 },200);
 }
 })
 }
 if(kyc){
   kyc.franchisee_id = partner.franchisee_id;
   kyc.partner_id = partner._id;
   var businessType_array = type;
   kyc.docs_types = [];
   kyc.docs_types = type;
   kyc.save(function(err,kyc){
   if(err){
   return res.send({
   state:"error",
   message:err
   },500);
   }
   else{
   res.send({
   state:"Success",
   message:message
   },200);
   }
   })
 }
 })
 }
 })
}
//update franchisee

router.put('/edit_partner_franchisee', upload.single('partner_pic'), function(req, res, next) {
 var partnerEditForm = JSON.parse(req.body.partner);
 try{
 Partner.findOne({'_id':partnerEditForm._id},function(err,partner){
 if(err){
 return res.send({
 state:"err",
 message:"Something went wrong.We are looking into it."
 },500);
 }

 //If partner franchisee found,it will enter inside
 if(partner){

 partner.partner_name=partnerEditForm.partner_name;
 partner.partner_occupation=partnerEditForm.partner_occupation;
 partner.partner_email=partnerEditForm.partner_email;
 partner.partner_address=partnerEditForm.partner_address;
 partner.partner_city=partnerEditForm.partner_city;
 partner.partner_state=partnerEditForm.partner_state;
 partner.partner_country=partnerEditForm.partner_country;
 partner.partner_pincode=partnerEditForm.partner_pincode;
 partner.partner_mobile_number=partnerEditForm.partner_mobile_number;
 partner.partner_age=partnerEditForm.partner_age;
 partner.partner_lead_source=partnerEditForm.partner_lead_source;
 partner.partner_investment=partnerEditForm.partner_investment;
 partner.partner_franchise_type=partnerEditForm.partner_franchise_type;
 partner.partner_how_soon_to_start=partnerEditForm.partner_how_soon_to_start;
 partner.partner_remarks=partnerEditForm.partner_remarks;
 partner.partner_preferred_date=partnerEditForm.partner_preferred_date;
 partner.partner_preferred_time=partnerEditForm.partner_preferred_time;
 partner.bussiness_type = partnerEditForm.bussiness_type;
 partner.bussiness_type_id = partnerEditForm.bussiness_type_id;
 if(req.file){

 var partner_pic = {};
 partner_pic.path = req.file.location;
 partner_pic.key = req.file.key;
 partner.partner_profile_pic = partner_pic;
 }


 partner.save(function(err,partner){
 if(err){

 res.send({
 state:"err",
 message:"Something went wrong."
 },500);
 }
 else{
 Franchisee.findOne({_id:partner.franchisee_id},function(err,franchiees){
 if(err){
 return res.send({
 state:"err",
 message:"Something went wrong. We are looking into it."
 },500);
 }
 else{

 if(partner.main_partner){
 franchiees.franchisee_profile_pic = partner.partner_profile_pic;
 franchiees.franchisee_mobile_number = partner.partner_mobile_number;
 franchiees.franchisee_occupation = partner.partner_occupation;
 franchiees.lead_age = partner.partner_age;
 }
 franchiees.save(function(err,franchiees){
 if(err){
 return res.send({
 state:"err",
 message:"Updation in franchisee got wrong"
 },500);
 }
 else{
   console.log(partner, 358);
 kyc_Upload(req, res,partner,franchiees,"Partner franchisee Updated.");
 }
 });
 }
 });
 }
 });
 }
 //If partner franchisee not found,it will enter inside and send error message
 if(!partner){
 res.send({
 state:"failure",
 message:"Partner franchise exist with this Id."
 },201);
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

//get all partner franchisees
router.get('/get_partner_franchisee',function(req,res){
 try{
 Partner.find({},function(err,partner){
 if(err){
 return res.send(500, err);
 }
 if(!partner){
 res.send({
 "message":"Partner franchiees not found",
 "state":"failure",
 "partner_list":[]
 },201);
 }
 else{
 res.send({
 "state":"success",
 "partner_list":partner
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

//get partner franchisee by id
router.get('/get_franchisee_partners/:id',function(req,res){
 try{
 Partner.find({franchisee_id:req.params.id},function(err,partner){
 if(err){
 return res.send(500, err);
 }
 if(!partner){
 res.send({
 "state":"failure",
 "data":[]
 },201);
 }
 else{
 res.send({
 state:"success",
 data:partner
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

//delete partner franchisee
router.delete('/delete_partner_franchisee/:id',function(req,res){
 try{
 Partner.findByIdAndRemove({_id:req.params.id},function(err,partner){
 if(err){
 return res.send(500, err);
 }
 if(!partner){
 res.send({
 "message":"Unsucessfull",
 "partner_data":"failure"
 },201);
 }
 else{
 res.send({
 "state":"success",
 "message":"User deleted sucessfully",
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
router.put('/make_default_profile',function(req,res){
 try{
 Partner.findById({_id:req.body.partnerId},function(err,partner){
 if(err){
 return res.send(500, err);
 }
 if(!partner){
 res.send({
 "message":"Unsucessfull",
 "partner_data":"failure"
 },201);
 }
 else{
 Franchisee.findOne({_id:partner.franchisee_id},function(err,franchisee){
 if(err){
 return res.send(500, err);
 }
 else{
 franchisee.franchisee_email = partner.partner_email;
 franchisee.franchisee_mobile_number = partner.partner_mobile_number;
 franchisee.franchisee_name = partner.partner_name;
 franchisee.lead_age = partner.partner_age;
 franchisee.franchisee_occupation = partner.partner_occupation;
 franchisee.save(function(err,franchisee){
 if(err){
 return res.send(500, err);
 }
 else{
 return res.send({
 "state":"success",
 "message":franchisee.franchisee_name+' '+ 'is your default profile'
 },200);
 }
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
});
module.exports = router;
