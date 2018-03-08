var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var path = require('path');
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
        bucket:'carzwta',
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

// To Create Partner Franchisee
router.post('/create_partner_franchisee', function(req, res){
    console.log(req.body);
    var partnerForm = req.body;
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

                partner.partner_name=partnerForm.partner_name,
                partner.partner_occupation=partnerForm.partner_occupation,
                partner.partner_email=partnerForm.partner_email,
                partner.partner_address=partnerForm.partner_address,
                partner.partner_city=partnerForm.partner_city,
                partner.partner_state=partnerForm.partner_state,
                partner.partner_country=partnerForm.partner_country,
                partner.partner_pincode=partnerForm.partner_pincode,
                partner.partner_mobile_number=partnerForm.partner_mobile_number,
                partner.partner_age=partnerForm.partner_age,
                partner.partner_lead_source=partnerForm.partner_lead_source,
                partner.partner_investment=partnerForm.partner_investment,
                partner.partner_franchise_type=partnerForm.partner_franchise_type,
                partner.partner_how_soon_to_start=partnerForm.partner_how_soon_to_start,
                partner.partner_remarks=partnerForm.partner_remarks,
                partner.partner_preferred_date=partnerForm.partner_preferred_date,
                partner.partner_preferred_time=partnerForm.partner_preferred_time,

                partner.save(function(err,partner){
                    if(err){
                        res.send({
                            state:"err",
                            message:"Something went wrong."
                        },500);
                    }
                    else{
                        res.send({
                            state:"Success",
                            message:"Partner franchisee created."
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
});

//update franchisee
router.put('/edit_partner_franchisee', function(req, res, next) {
    var partnerEditForm = req.body;
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

                partner.partner_name=partnerEditForm.partner_name,
                partner.partner_occupation=partnerEditForm.partner_occupation,
                partner.partner_email=partnerEditForm.partner_email,
                partner.partner_address=partnerEditForm.partner_address,
                partner.partner_city=partnerEditForm.partner_city,
                partner.partner_state=partnerEditForm.partner_state,
                partner.partner_country=partnerEditForm.partner_country,
                partner.partner_pincode=partnerEditForm.partner_pincode,
                partner.partner_mobile_number=partnerEditForm.partner_mobile_number,
                partner.partner_age=partnerEditForm.partner_age,
                partner.partner_lead_source=partnerEditForm.partner_lead_source,
                partner.partner_investment=partnerEditForm.partner_investment,
                partner.partner_franchise_type=partnerEditForm.partner_franchise_type,
                partner.partner_how_soon_to_start=partnerEditForm.partner_how_soon_to_start,
                partner.partner_remarks=partnerEditForm.partner_remarks,
                partner.partner_preferred_date=partnerEditForm.partner_preferred_date,
                partner.partner_preferred_time=partnerEditForm.partner_preferred_time


                partner.save(function(err,partner){
                   if(err){
                     res.send({
                        state:"err",
                        message:"Something went wrong."
                    },500);
                   }
                else{
                    res.send({
                        state:"success",
                        message:"Partner franchisee Updated."
                    },200);
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
router.get('/get_partner_franchisee/:id',function(req,res){
    try{
        Partner.findById({_id:req.params.id},function(err,partner){
            if(err){
                return res.send(500, err);
            }
            if(!partner){
                res.send({
                    "state":"failure",
                    "partner_data":[]
                },201);
            }
            else{
                res.send({
                    state:"success",
                    partner_data:partner
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
module.exports = router;