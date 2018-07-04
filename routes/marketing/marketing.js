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
var fileupload = upload.fields([{
    name: 'file_upload',
    maxCount: 50
  }, {
    name: 'imgFields',
    maxCount: 20
  }])
// To create campaign
router.post('/create_campaign', upload.single('campaign_file'), function(req, res) {
    console.log('43',req,res);
    var campaignForm = JSON.parse(req.body.campaign);
    console.log('45',req.body.campaign);
    try{
        Campaign.findOne({'title':campaignForm.title},function(err,campaign){
            console.log("campaign",campaign);
            if(err){
                return res.send({
                        state:"err",
                        message:"Something went wrong.We are looking into it."
                    },500);
            }
            // if(campaign){
            //     return res.send({
            //         state:"failure",
            //         message:"This campaign already exists!"
            //     },400); 
            // }
            if(!campaign){
               var campaign = new Campaign();
                campaign.title = campaignForm.title;
                campaign.location = campaignForm.location;
                campaign.start = campaignForm.start;
                campaign.end = campaignForm.end;
                campaign.type = campaignForm.type;
                campaign.notes = campaignForm.notes;
                campaign.campaign_color = campaignForm.campaign_color;
                campaign.medium = campaignForm.medium;
                campaign.budget = campaignForm.budget;
                campaign.meta = campaignForm.meta;
                campaign.franchisor_id = campaignForm.franchisor_id;
                campaign.franchisee_id = campaignForm.franchisee_id;
                campaign.visible_to = campaignForm.visible_to;
                console.log(req.file, "74");
                if (req.file){
                    console.log(req.file);
                    campaign.campaign_file_attachment_file_url = req.file.location;
                    campaign.campaign_file_attachment_file_name = req.file.key;
                    campaign.campaign_file_attachment_file_type = req.file.contentType;
                }
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
router.put('/update_campaign',upload.single('campaign_file'), function(req,res){
    console.log('campaign', campaignEditForm);
    // var campaignEditForm = JSON.parse(req.body);
    var campaignEditForm = req.body;
    console.log(req.body.campaign);
    // try{
        Campaign.findOne({'_id':campaignEditForm._id},function(err,campaign){
            console.log(campaign);
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
                campaign.campaign_color = campaignEditForm.campaign_color;
                campaign.medium = campaignEditForm.medium;
                campaign.budget = campaignEditForm.budget;
                campaign.meta = campaignEditForm.meta;
                campaign.franchisor_id = campaignEditForm.franchisor_id;
                campaign.franchisee_id = campaignEditForm.franchisee_id;
                campaign.visible_to = campaignEditForm.visible_to;
                // console.log(req.file, "143");
                if (req.file){
                    console.log(req.file);
                    campaign.campaign_file_attachment_file_url = req.file.location;
                    campaign.campaign_file_attachment_file_name = req.file.key;
                    campaign.campaign_file_attachment_file_type = req.file.contentType;
                }
                campaign.save(function(err,campaign23){
                    // if(err){
                    //     res.send({
                    //         state:"err",
                    //         message:"Something went wrong."
                    //     },500);
                    // }
                    {
                        // console.log(campaign23);
                        // campaign23.meta.campaign_id = campaign23._id;
                        // campaign23.save(function(err,campaign24){
                        //     console.log(campaign);
                        res.send({
                            state:"success",
                            message:"Campaign updated.",
                            // data:campaign24
                        },200);
                    // });
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
    // }
    // catch(err){
    //     return res.send({
    //         state:"error",
    //         message:err
    //     });
    // }
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

router.get('/get_campaign/:id', function (req, res) {
    Campaign.findById({_id: req.params.id}, function (err, campaign) {
      if (err) {
        return res.send(err);
      }
      if (campaign.length == 0) {
        return res.send({
          status: 'failure',
          message: "file not found!"
        },400);
      }
      if (campaign.length > 0) {
        return res.send({
          status: 'success',
          data: campaign
        },200);
      }
    })
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
router.delete('/delete_campaign/:campaign_id', function(req,res){
    try{
        Campaign.findByIdAndRemove({_id:req.params.campaign_id},function(err,campaign){
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
// var fileupload = upload.fields([{
//     name: 'files_upload',
//     maxCount: 50
//   }, {
//     name: 'imgFields',
//     maxCount: 20
//   }])
// To upload files
router.post('/upload_campaign_file',  fileupload, function  (req,res){
    var file_details = JSON.parse(req.body.file_details);
    console.log(req.body,file_details);
    var files = [];
    Campaign.find({},function(err, campaign){
        if (err){
            return res.send(err);
        }
        else {
            var file = [];
            var getNumber = 0;
            var length = req.files.files_upload.length;
            file = req.files.files_upload;
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
                console.log(document);
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
                                status: "success",
                                message: "File uploaded"
                            },200);
                        }
                    }
                })
            }
        }
    });
});
// To get uploaded files
router.get('/get_campaign_files/:id', function (req, res) {
    Campaign.find({_id: req.params.campaign_id}, function (err, file) {
      if (err) {
        return res.send(err);
      }
      if (file.length == 0) {
        return res.send({
          status: 'failure',
          message: "file not found!"
        },400);
      }
      if (file.length > 0) {
        return res.send({
          status: 'success',
          files: file
        },200);
      }
    })
  })
module.exports = router;