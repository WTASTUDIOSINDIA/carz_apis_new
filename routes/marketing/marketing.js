var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');;
var multer = require('multer');
var path = require('path');
var Campaign = mongoose.model('Campaign');
var Franchisee = mongoose.model('Franchisee');
var _ = require('lodash');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var bCrypt = require('bcrypt-nodejs');
aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
});
//carzwtaff
var s0 = new aws.S3({})
var upload = multer({
    storage: multerS3({
        s3: s0,
        bucket: 'celebappfiles',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {
                fieldName: file.fieldname
            });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '.' + file.originalname)
        }
    })
});

// To create campaign
router.post('/create_campaign',  function(req, res) {
    var campaignForm = req.body;
    console.log(req.body);
    try{
        Campaign.findOne({'title':req.body.title},function(err,campaign){
            console.log("campaign",campaign);
            if(err){
                return res.send({
                        state:"err",
                        message:"Something went wrong.We are looking into it."
                    },500);
            }
            if(campaign){
                return res.send({
                    state:"failure",
                    message:"This campaign already exists!"
                },200);
            }
            if(!campaign){
               var campaign = new Campaign();
                campaign.title = req.body.title,
                campaign.location = req.body.location,
                campaign.start = req.body.start,
                campaign.end = req.body.end,
                campaign.type = req.body.type,
                campaign.notes = req.body.notes,
                campaign.color = req.body.color,
                campaign.medium = req.body.medium,
                campaign.budget =   req.body.budget,
                campaign.meta = req.body.meta,
                campaign.franchisor_id = req.body.franchisor_id,
                campaign.save(function(err,campaign23){
                   if(err){
                     res.send({
                        state:"err",
                        message:"Something went wrong."
                    },500);
                   }
                else{
                    console.log(campaign);
                    campaign23.meta.campaign_id = campaign23._id;
                    campaign23.save(function(err,campaign24){
                        console.log(campaign);
                    return res.send({
                        state:"success",
                        message:"Campaign Created .",
                        data:campaign24
                    },200);
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

// To update campaign
router.put('/update_campaign', function(req,res){
    var campaignEditForm = req.body;
    try{
        Campaign.findOne({'_id':campaignEditForm._id},function(err,campaign){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something wen wrong. We are looking into it."
                },500);
            }
            if(campaign){
                campaign.title = campaignEditForm.title;
                campaign.location = campaignEditForm.location;
                campaign.start = campaignEditForm.start;
                campaign.end = campaignEditForm.end;
                campaign.type = campaignEditForm.type;
                campaign.notes = campaignEditForm.notes;
                campaign.color = campaignEditForm.color;
                campaign.medium = campaignEditForm.medium;
                campaign.budget = campaignEditForm.budget;
                campaign.feedback = campaignEditForm.feedback
                campaign.franchisor_id = campaignEditForm.franchisor_id
                campaign.save(function(err,campaign){
                    if(err){
                        res.send({
                            state:"err",
                            message:"Something went wrong."
                        },500);
                    }
                    else{
                        res.send({
                            state:"success",
                            message:"Campaign updated."
                        },200);
                    }
                });
            }
            if(!campaign){
                res.send({
                    state:"failure",
                    message:"Failed to update."
                },400);
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

//To get all campaign
router.get('/get_all_campaigns', function(req,res){
    try{
        Campaign.find({}, function(err,campaign){
            if(err){
                return res.send(500, err);
            }
            if(!campaign){
                res.send({
                    "message":"Campaign not found",
                    "state":"failure",
                    "campaign":[]
                },201);
            }
            else{
                for(var i = 0; i < campaign.length; i++){
                    campaign[i].campaign_id = campaign[i]._id;
                }
                res.send({
                    "state":"success",
                    "data":campaign
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
})
// To delete campaigns
router.delete('/delete_campaigns', function(req,res){
    try{
        Campaign.remove({},function(err,campaign){
            if(err){
                return res.send(500,err);
            }
            if(!campaign){
                res.send({
                    "message":"Unsuccessfull",
                    "data":"failure"
                },400);
            }
            else{
                res.send({
                    "message":"Campaigns deleted.",
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
// To delete campaign by id
router.delete('/delete_campaign/:id', function(req,res){
    try{
        Campaign.findByIdAndRemove({_id:req.params.id},function(err,campaign){
            if(err){
                return res.send(500,err);
            }
            if(!campaign){
                res.send({
                    "message":"Unsuccessfull",
                    "data":"failure"
                },400);
            }
            else{
                res.send({
                    "message":"Campaign deleted.",
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

var fileupload = upload.fields([{
    name: 'file_upload',
    maxCount: 50
  }, {
    name: 'imgFields',
    maxCount: 20
  }])
// To upload files
router.post('/upload_campaign_file',  fileupload, function  (req,res){
    var file_details = JSON.parse(req.body.file_details);
    var files = [];
    Campaign.find({},function(err, campaign){
        if (err){
            return res.send(err);
        }
        else {
            var file = [];
            var getNumber = 0;
            var length = req.files.file_upload.length;
            file = req.files.file_upload;
            for (var i = 0; i < file.length; i++){
                var document = new Campaign();
                document.link = file[i].location;
                document.key = file[i].key;
                document.file_name = file[i].originalname;
                document.files_type = "doc";
                if (file[i].mimetype == "application/pdf") {
                    document.file_type = "pdf";
                }
                if (file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i] == "image/jpeg"){
                    files.file_type = "image";
                }
                document.date_uploaded = Date.now();
                document.franchisor_id = file_details.franchisor_id;
                files.push(document);
            }
            for (var i = 0; i < files.length; i++){
                getNumber = getNumber + 1;
                files[i].save(function (err, files){
                    if (err) {
                        return res.send(err);
                    }
                    else {
                        if (parseInt(length)== parseInt(getNumber)) {
                            res.send({
                                state: 200,
                                status: "success",
                                message: "File uploaded"
                            });
                        }
                    }
                })
            }
        }
    });
});
// To get uploaded files
router.get('/get_campaign_files/:id', function (req, res) {
    Campaign.find({
      franchisor_id: req.params.id
    }, function (err, file) {
      if (err) {
        return res.send(err);
      }
      if (file.length == 0) {
        return res.send({
          state: 200,
          status: 'failure',
          message: "file not found !"
        });
      }
      if (file.length > 0) {
        return res.send({
          state: 200,
          status: 'success',
          files: file
        });
      }
    })
  })
module.exports = router;