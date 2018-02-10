var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
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
//get all franchisees
router.get('/get_franchisees',function(req,res){
    try{
        Franchisee.find({},function(err,franchiees){
            if(err){
                return res.send(500, err);
            }
            if(!franchiees){
                res.send({
                    "status":"201",
                    "message":"Franchiees not found",
                    "message":"failure",
                    "franchisees_list":[]
                });
            }
            else{
                res.send({
                    "status":"200",
                    "state":"success",
                    "franchisees_list":franchiees
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
//get franchisee by id
router.get('/get_franchisee/:id',function(req,res){
    try{
        Franchisee.findById({_id:req.params.id},function(err,franchisee){
            if(err){
                return res.send(500, err);
            }
            if(!franchisee){
                res.send({
                    "status":"201",
                    "state":"failure",
                    "franchisees_data":[]
                });
            }
            else{
                res.send({
                    status:200,
                    state:"success",
                    franchisees_data:franchisee
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
//create franchisee
//upload.single('franchisee_img'),
//JSON.parse(req.body.franchisee_details)
router.post('/create_franchisee',  function(req, res) {
    var franchiseeForm = req.body;
    try{
        Franchisee.findOne({'franchisee_email':franchiseeForm.franchisee_email},function(err,franchisee){
            if(err){
                return res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong.We are looking into it."
                    });
            }
            if(franchisee){
                res.send({
                    status:200,
                    state:"failure",
                    message:"Franchise exist with this Id."
                });
            }
            if(!franchisee){
                var franchisee = new Franchisee();
                franchisee.franchisee_code = franchiseeForm.franchisee_code,
                franchisee.franchisee_name=franchiseeForm.franchisee_name,
                franchisee.franchisee_occupation=franchiseeForm.franchisee_occupation,
                franchisee.franchisee_email=franchiseeForm.franchisee_email,
                franchisee.franchisee_city=franchiseeForm.franchisee_city,
                franchisee.franchisee_state=franchiseeForm.franchisee_state,
                franchisee.franchisee_address=franchiseeForm.franchisee_address,
                franchisee.franchisee_mobile_number=franchiseeForm.franchisee_mobile_number,
                franchisee.franchisee_investment=franchiseeForm.franchisee_investment,
                franchisee.franchisee_preferred_date=franchiseeForm.franchisee_preferred_date,
                franchisee.franchisee_preferred_time=franchiseeForm.franchisee_preferred_time,
                franchisee.franchisee_how_soon_to_start=franchiseeForm.franchisee_how_soon_to_start,
                franchisee.franchisee_franchise_model=franchiseeForm.franchisee_franchise_model,  
                franchisee.franchisee_remarks=franchiseeForm.franchisee_remarks,
                franchisee.lead_age=franchiseeForm.lead_age,
                franchisee.lead_source=franchiseeForm.lead_source
                // if(req.file){
                //     var franchisee_pic = {};
                //     franchisee_pic.path = req.file.location;
                //     franchisee_pic.key = req.file.key;
                //     franchisee.franchisee_pic = franchisee_pic;
                // }
                franchisee.save(function(err,franchisee){
                   if(err){
                     res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong."
                    });
                   }
                else{
                    res.send({
                        status:200,
                        state:"success",
                        message:"Franchisee Created."
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
  
  //update franchisee
  router.put('/edit_franchisee', function(req, res, next) {
    Franchisee.findByIdAndUpdate(req.params.id, 
        name,
        mail, 
        investment, 
        occupation, 
        mobile, 
        age, 
        model, 
        city, 
        state, 
        lead_name, 
        model, 
        address, 
        source, 
        pic, 
        setup_percentage, 
        req.body,
        role, 
        function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  Franchisee.findByIdAndUpdate(function(err, franchisee){
        if(err)
        {
            res.json({msg: 'Failed to update'});
        }
        else{
            res.json({msg: 'Updated sucessfully'});
        }
    });
});
  
  //delete franchisee
  router.delete('/delete_franchisee/:id',function(req,res){
    console.log("req.params",req.params.franchisee_id);
    try{
        Franchisee.findByIdAndRemove({_id:req.params.id},function(err,franchisee){
            if(err){
                return res.send(500, err);
            }
            if(!franchisee){
                res.send({
                    "status":"201",
                    "message":"Unsucessfull",
                    "franchisees_data":"failure"
                });
            }
            else{
                res.send({
                    "status":"200",
                    "message":"User deleted sucessfully",
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