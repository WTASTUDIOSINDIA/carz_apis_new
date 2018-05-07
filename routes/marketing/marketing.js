var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');;
var multer = require('multer');
var path = require('path');
var Campaign = mongoose.model('Campaign');
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
        Campaign.findOne({'campaign_name':req.body.campaign_name},function(err,campaign){
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
                campaign.campaign_name = req.body.campaign_name,
                campaign.campaign_location = req.body.campaign_location,
                campaign.campaign_start_date = req.body.campaign_start_date,
                campaign.campaign_end_date = req.body.campaign_end_date,
                campaign.campaign_type = req.body.campaign_type,
                campaign.campaign_about = req.body.campaign_about,
                campaign.campaign_color = req.body.campaign_color,
                campaign.campaign_medium = req.body.campaign_medium,
                campaign.campaign_budget = req.body.campaign_budget,
                campaign.franchisee_id = req.body.franchisee_id,
                campaign.save(function(err,campaign){
                   if(err){
                     res.send({
                        state:"err",
                        message:"Something went wrong."
                    },500);
                   }
                else{
                    return res.send({
                        state:"success",
                        message:"Campaign Created .",
                        data:campaign
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
                campaign.campaign_name = campaignEditForm.campaign_name;
                campaign.campaign_location = campaignEditForm.campaign_location;
                campaign.campaign_start_date = campaignEditForm.campaign_start_date;
                campaign.campaign_end_date = campaignEditForm.campaign_end_date;
                campaign.campaign_type = campaignEditForm.campaign_type;
                campaign.campaign_about = campaignEditForm.campaign_about;
                campaign.campaign_color = campaignEditForm.campaign_color;
                campaign.campaign_medium = campaignEditForm.campaign_medium;
                campaign.campaign_budget = campaignEditForm.campaign_budget;
                campaign.franchisee_id = campaignEditForm.franchisee_id
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
router.get('/get_all_campaign', function(req,res){
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

// To upload files
// router.post('/upload_campaign_file',fileupload, function (req,res){
//     var file_details = JSON.parse(req.body.file_details);
//     var files = [];
//     Campaign.find({},function(err, campaign){
//         if (err){
//             return res.send(err);
//         }
//         else {
//             var file = [];
//             var getNumber = 0;
//             var length = req.files.file_upload.length;
//             file = req.files.file_upload;
//             for (var i = 0; i < file.length; i++){
//                 var document = new Campaign();
//                 document.link = file[i].location;
//                 document.key = file[i].key;
//                 document.file_name = file[i].originalname;
//                 document.files_type = "doc";
//                 if (file[i].mimetype == "application/pdf") {
//                     document.file_type = "pdf";
//                 }
//                 if (file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i] == "image/jpeg"){
//                     files.file_type = "image";
//                 }
//                 document.date_uploaded = Date.now();
//                 document.franchisee_id = file_details.franchisee_id;
//                 files.push(document);
//             }
//             for (var i = 0; i < files.length; i++){
//                 getNumber = getNumber + 1;
//                 files[i].save(function (err, files){
//                     if (err) {
//                         return res.send(err);
//                     }
//                     else {
//                         if (parseInt(length)== parseInt(getNumber)) {
//                             res.send({
//                                 state: 200,
//                                 status: "success",
//                                 message: "File uploaded"
//                             });
//                         }
//                     }
//                 })
//             }
//         }
//     });
// });
module.exports = router;