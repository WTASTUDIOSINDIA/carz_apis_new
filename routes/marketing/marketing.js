var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');;
var multer = require('multer');
var path = require('path');
var Campaign = mongoose.model('Campaign');
var Franchisee = mongoose.model('Franchisee');
var Folder = mongoose.model('Folder');
var Library = mongoose.model('Library');
var _ = require('lodash');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var utils = require('../../common/utils');
var bCrypt = require('bcrypt-nodejs');
aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
});
let camp_file = [];
//carzwtaff
var s0 = new aws.S3({})
var upload = multer({
    storage: multerS3({
        s3: s0,
        bucket: 'carzdev',
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
// var createCampaignFiles = upload.fields([{
//     name: 'createCampaignFiles',
//     maxCount: 50
//   }, {
//     name: 'imgFields',
//     maxCount: 20
//   }])




// To create campaign
var createCampaignFiles = upload.fields([{ name: 'createCampaignFiles', maxCount: 50 }, { name: 'imgFields', maxCount: 20 }])
router.post('/create_campaign', createCampaignFiles, function (req, res) {

    var campaignForm = JSON.parse(req.body.campaign);
    console.log(campaignForm);
    try {
        Campaign.findOne({ 'franchisor_id': campaignForm.franchisor_id, 'title': { $regex: new RegExp(campaignForm.title, 'i') } }, function (err, campaign) {

            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            // if(campaign){
            //     return res.send({
            //         state:"failure",
            //         message:"This campaign already exists!"
            //     },400);
            // }
            if (!campaign) {
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
                if (campaignForm.visible_to == 'franchisee') {
                    campaign.visible_to_franchisee_id = campaignForm.visible_to_franchisee_id;
                    campaign.visible_to_franchisee_name = campaignForm.visible_to_franchisee_name;
                }
                campaign.visible_to = campaignForm.visible_to;
                campaign.created_by = campaignForm.created_by;
                let files = req.files.createCampaignFiles;
                // let camp_file = [];
                if (undefined != files && files.length != 0) {
                    for (var i = 0; i < files.length; i++) {

                        let c_file = {
                            "campaign_file_attachment_file_url": files[i].location,
                            "campaign_file_attachment_file_name": files[i].key,
                            "campaign_file_attachment_file_type": files[i].contentType
                        }
                        campaign.campaign_files.push(c_file);
                    }
                }

                // campaign.campaign_files = camp_file;
                campaign.save(function (err, campaign23) {
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        campaign23.meta.campaign_id = campaign23._id;
                        campaign23.save(function (err, campaign24) {
                            var folder = new Folder();
                            folder.marketing_folder = true;
                            folder.campaign_id = campaign._id;
                            folder.franchisee_Id = campaignForm.franchisee_id;
                            folder.franchisor_Id = campaignForm.franchisor_id;
                            folder.folder_name = campaignForm.title;
                            folder.save(function (err, folder) {
                                console.log("campaign folder created");
                                console.log('folder----------------', folder);
                            });

                            if (folder) {
                                if (campaign.campaign_files.length > 0 || campaign.campaign_files.length !== 0) {

                                    createCampaignFiles = req.files.createCampaignFiles;
                                    console.log('campaignfiles///////////////////////', campaign.campaign_files);
                                    for (i = 0; i < campaign.campaign_files.length; i++) {
                                        var library = new Library();
                                        library.path = campaign.campaign_files[i].campaign_file_attachment_file_url;
                                        library.key = campaign.campaign_files[i].campaign_file_attachment_file_type;
                                        library.file_name = campaign.campaign_files[i].campaign_file_attachment_file_name;
                                        if (library.key == "application/pdf") {
                                            library.image_type = "pdf";
                                        }
                                        if (library.key == "image/png" || library.key == "image/jpg" || library.key == "image/jpeg" || library.key == "image/gif") {
                                            library.image_type = "image";
                                        }
                                        library.date_uploaded = Date.now();
                                        library.folder_Id = folder._id;
                                        library.is_campaign_file = true;
                                        library.campaign_id = campaign._id;
                                        library.franchisee_Id = campaignForm.franchisee_id;
                                        library.save(function (err, library) {
                                            camp_file.length == 0;
                                            console.log('library++++++++++', library);
                                            return res.send({
                                                state: "success",
                                                message: "Campaign Created",
                                                data: campaign24
                                            }, 200);
                                        });
                                    }
                                }
                                else {
                                    return res.send({
                                        state: "success",
                                        message: "Campaign Created",
                                        data: campaign24
                                    }, 200);
                                }

                            }
                        });

                    }
                });
            }
            else {
                return res.send({
                    state: "failure",
                    message: "Campaign title already exists!"
                }, 200);
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

// To update campaign
router.put('/update_campaign', createCampaignFiles, function (req, res) {
    ///console.log('campaign', campaignEditForm);
    var campaignEditForm = JSON.parse(req.body.campaign);
    //var campaignEditForm = req.body;
    console.log(req.body.campaign);
    // try{
    Campaign.findOne({ '_id': campaignEditForm._id }, function (err, campaign) {
        console.log(campaign);
        if (err) {
            return res.send({
                state: "err",
                message: "Something went wrong. We are looking into it."
            }, 500);
        }
        if (campaign) {
            if (campaignEditForm.amount_spent > Number(campaignEditForm.budget)) {
                return res.send({
                    state: "err",
                    message: "Amount spent is greater than the allocated budget."
                }, 500);
            }
            else {
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
                if (campaignEditForm.visible_to == 'franchisee') {
                    campaign.visible_to_franchisee_id = campaignEditForm.visible_to_franchisee_id;
                    campaign.visible_to_franchisee_name = campaignEditForm.visible_to_franchisee_name;
                }
                campaign.visible_to = campaignEditForm.visible_to;
                campaign.amount_spent = campaignEditForm.amount_spent;
                campaign.leads_generated = campaignEditForm.leads_generated;
                campaign.footfalls = campaignEditForm.footfalls;
                campaign.campaign_duration = campaignEditForm.campaign_duration;
                campaign.campaign_status = campaignEditForm.campaign_status;
                // console.log(req.file, "143");
                let files = req.files.createCampaignFiles;
                // let camp_file = [];
                if (undefined !== files && files.length != 0) {
                    for (var i = 0; i < files.length; i++) {

                        let c_file = {
                            "campaign_file_attachment_file_url": files[i].location,
                            "campaign_file_attachment_file_name": files[i].key,
                            "campaign_file_attachment_file_type": files[i].contentType
                        }
                        campaign.campaign_files.push(c_file);
                    }
                }
                // campaign.campaign_files = camp_file;
                console.log('camp', campaign);
                campaign.save(function (err, campaign) {
                    if (err) {
                        console.log(err, 'campaign error/////////////////')
                    }
                    if (campaign) {
                        res.send({
                            state: "success",
                            message: "Campaign updated.",
                            data: campaign
                        }, 200);
                    }
                    // var folder = new Folder();
                    // Folder.findOne({ campaign_id: req.body.campaign_id }, (err, fold) => {
                    //     console.log('++++++++++++++++----',fold);
                    //     if (err) {
                    //         console.log(err, 'error');
                    //     }
                    //     if (fold) {
                    //     console.log('*****************+----',fold);
                    //         createCampaignFiles = req.files.createCampaignFiles;
                    //         console.log('campaignfiles///////////////////////', campaign.campaign_files);
                    //         // for (i = 0; i < campaign.campaign_files.length; i++) {
                    //         //     var library = new Library();
                    //         //     library.path = campaign.campaign_files[i].campaign_file_attachment_file_url;
                    //         //     library.key = campaign.campaign_files[i].campaign_file_attachment_file_type;
                    //         //     library.file_name = campaign.campaign_files[i].campaign_file_attachment_file_name;
                    //         //     if (library.key == "application/pdf") {
                    //         //         library.image_type = "pdf";
                    //         //     }
                    //         //     if (library.key == "image/png" || library.key == "image/jpg" || library.key == "image/jpeg" || library.key == "image/gif") {
                    //         //         library.image_type = "image";
                    //         //     }
                    //         //     library.date_uploaded = Date.now();
                    //         //     library.folder_Id = fold._id;
                    //         //     library.campaign_id = campaign._id;
                    //         //     library.franchisee_Id = campaignEditForm.franchisee_id;
                    //         //     library.save(function (err, library) {
                    //         //         if(err) {
                    //         //             console.log(err, 'errrrrrrorrororrorroro')
                    //         //         }
                    //         //         console.log('library++++++++++', library);
                    //         //         res.send({
                    //         //             state: "success",
                    //         //             message: "Campaign updated.",
                    //         //             data: campaign
                    //         //         }, 200);
                    //         //     });

                    //         // }
                    //     }
                    //     if (!fold) {
                    //         var folder = new Folder();
                    //         folder.marketing_folder = true;
                    //     folder.campaign_id = campaign._id;
                    //     folder.franchisee_Id = campaignEditForm.franchisee_id;
                    //     folder.franchisor_Id = campaignEditForm.franchisor_id;
                    //     folder.folder_name = campaignEditForm.title;
                    //     folder.save(function (err, folder) {
                    //         if(err) {
                    //             console.log(err, 'err1');
                    //         }
                    //         console.log("campaign folder created");
                    //         console.log('folder----------------', folder);
                    //         if (folder) {
                    //             createCampaignFiles = req.files.createCampaignFiles;
                    //             console.log('campaignfiles///////////////////////', campaign.campaign_files);
                    //             for (i = 0; i < campaign.campaign_files.length; i++) {
                    //                 var library = new Library();
                    //                 library.path = campaign.campaign_files[i].campaign_file_attachment_file_url;
                    //                 library.key = campaign.campaign_files[i].campaign_file_attachment_file_type;
                    //                 library.file_name = campaign.campaign_files[i].campaign_file_attachment_file_name;
                    //                 if (library.key == "application/pdf") {
                    //                     library.image_type = "pdf";
                    //                 }
                    //                 if (library.key == "image/png" || library.key == "image/jpg" || library.key == "image/jpeg" || library.key == "image/gif") {
                    //                     library.image_type = "image";
                    //                 }
                    //                 library.date_uploaded = Date.now();
                    //                 library.folder_Id = folder._id;
                    //                 library.campaign_id = campaign._id;
                    //                 library.franchisee_Id = campaignEditForm.franchisee_id;
                    //                 library.save(function (err, library) {
                    //                     if(err) {
                    //                         console.log(err, 'error2')
                    //                     }
                    //                     console.log('library++++++++++', library);
                    //                     res.send({
                    //                         state: "success",
                    //                         message: "Campaign updated.",
                    //                         data: campaign
                    //                     }, 200);
                    //                 });

                    //             }

                    //         }
                    //     });
                    //     }


                    // })
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

                        // });
                    }
                });
            }

        }
        if (!campaign) {
            res.send({
                state: "failure",
                message: "Failed to update."
            }, 400);
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

router.delete('/delete_campaign_file/:id', function (req, res) {
    try {
        Library.findByIdAndRemove({ _id: req.params.id }, function (err, library) {
            if (err) {
                return res.send(500, err);
            }
            if (!library) {
                res.send({
                    "message": "Unsuccessfull",
                    "state": "failure"
                }, 400);
            }
            else {
                res.send({
                    "message": "Campaign deleted.",
                    "state": "success"
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
})
//To get all campaign
router.get('/get_all_campaigns/:franchisor_id', function (req, res) {
    try {
        Campaign.find({ franchisor_id: req.params.franchisor_id }, function (err, campaign) {
            if (err) {
                return res.send(500, err);
            }
            if (!campaign) {
                res.send({
                    "message": "Campaign not found",
                    "state": "failure",
                    "campaign": []
                }, 201);
            }
            else {
                for (var i = 0; i < campaign.length; i++) {
                    campaign[i].campaign_id = campaign[i]._id;
                }
                res.send({
                    "state": "success",
                    "data": campaign
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
})
router.get('/get_campaigns_by_franchisee/:franchisor_id/:franchisee_id', function (req, res) {
    try {
        Campaign.find({ $or: [{ franchisor_id: req.params.franchisor_id, franchisee_id: req.params.franchisee_id }, { visible_to: 'franchisee', visible_to_franchisee_id: { $elemMatch: { $eq: req.params.franchisee_id } } }, { visible_to: 'All', created_by: 'franchisor' }] }, function (err, campaigns) {
            if (err) {
                return res.send(500, err);
            }
            if (!campaigns) {
                res.send({
                    message: "Campaign not found",
                    state: "failure",
                    data: []
                }, 201);
            }
            else {
                for (var i = 0; i < campaigns.length; i++) {
                    campaigns[i].campaign_id = campaigns[i]._id;
                }
                res.send({
                    state: "success",
                    data: campaigns
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
})

router.get('/get_campaign/:id', function (req, res) {
    Campaign.find({ _id: req.params.id }, function (err, campaign) {
        if (err) {
            return res.send(err);
        }
        if (campaign.length == 0) {
            return res.send({
                status: 'failure',
                message: "file not found!"
            }, 400);
        }
        if (campaign.length > 0) {
            return res.send({
                status: 'success',
                data: campaign
            }, 200);
        }
    })
})
// To delete campaigns
router.delete('/delete_campaigns', function (req, res) {
    try {
        Campaign.remove({}, function (err, campaign) {
            if (err) {
                return res.send(500, err);
            }
            if (!campaign) {
                res.send({
                    "message": "Unsuccessfull",
                    "data": "failure"
                }, 400);
            }
            else {
                res.send({
                    "message": "Campaigns deleted.",
                    "state": "success"
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
// To delete campaign by id
router.delete('/delete_campaign/:campaign_id', function (req, res) {
    try {
        Campaign.findByIdAndRemove({ _id: req.params.campaign_id }, function (err, campaign) {
            if (err) {
                return res.send(500, err);
            }
            if (!campaign) {
                res.send({
                    "message": "Unsuccessfull",
                    "data": "failure"
                }, 400);
            }
            else {
                res.send({
                    "message": "Campaign deleted.",
                    "state": "success"
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

var fileupload = upload.fields([{
    name: 'file_upload',
    maxCount: 50
}, {
    name: 'imgFields',
    maxCount: 20
}])
// To upload files
router.post('/upload_campaign_file', fileupload, function (req, res) {
    var file_details = JSON.parse(req.body.file_details);
    console.log(req.body, file_details);
    var files = [];
    Campaign.find({}, function (err, campaign) {
        if (err) {
            return res.send(err);
        }
        else {
            var file = [];
            var getNumber = 0;
            var length = req.files.files_upload.length;
            file = req.files.files_upload;
            for (var i = 0; i < file.length; i++) {
                var document = new Campaign();
                document.link = file[i].location;
                document.key = file[i].key;
                document.file_name = file[i].originalname;
                // document.files_type = "doc";
                if (file[i].mimetype == "application/pdf") {
                    document.file_type = "pdf";
                }
                if (file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i] == "image/jpeg") {
                    files.file_type = "image";
                }
                document.date_uploaded = Date.now();
                document.franchisor_id = file_details.franchisor_id;
                files.push(document);
                console.log(document);
            }
            for (var i = 0; i < files.length; i++) {
                getNumber = getNumber + 1;
                files[i].save(function (err, files) {
                    if (err) {
                        return res.send(err);
                    }
                    else {
                        if (parseInt(length) == parseInt(getNumber)) {
                            res.send({
                                status: "success",
                                message: "File uploaded",
                                data: campaign
                            }, 200);
                        }
                    }
                })
            }
        }
    });
});
// To get uploaded files
router.get('/get_campaign_files/:id', function (req, res) {
    Campaign.find({ _id: req.params.campaign_id }, function (err, file) {
        if (err) {
            return res.send(err);
        }
        if (file.length == 0) {
            return res.send({
                status: 'failure',
                message: "file not found!"
            }, 400);
        }
        if (file.length > 0) {
            return res.send({
                status: 'success',
                files: file
            }, 200);
        }
    })
})
router.get('/get_after_campaign_files/:campaign_id', function (req, res) {
    Library.find({ campaign_id: req.params.campaign_id }, function (err, files) {
        if (files) {
            res.send({
                state: 'success',
                files: files
            })
        }
    })
})



//upload_campaign_files
var cpUpload = upload.fields([{ name: 'after_campaign_files', maxCount: 50 }, { name: 'imgFields', maxCount: 20 }])
router.put('/upload_campaign_files', cpUpload, function (req, res) {
    var file_details = JSON.parse(req.body.file_details);
    var after_campaign_files = [];
    Folder.findOne({ campaign_id: file_details.campaign_id }, function (err, folder) {
        if (folder) {
            after_campaign_files = req.files.after_campaign_files;
            for (var i = 0; i < after_campaign_files.length; i++) {
                var library = new Library();
                library.path = after_campaign_files[i].location;
                library.key = after_campaign_files[i].key;
                library.file_name = after_campaign_files[i].originalname;
                if (library.key == "application/pdf") {
                    library.image_type = "pdf";
                }
                if (library.key == "image/png" || library.key == "image/jpg" || library.key == "image/jpeg" || library.key == "image/gif") {
                    library.image_type = "image";
                }
                // library.uploaded_status = status;
                library.date_uploaded = Date.now();
                library.folder_Id = folder._id;
                library.campaign_id = file_details.campaign_id;
                library.is_campaign_file = true;
                //library.franchisee_Id = campaignDetails.franchisee_id;;
                library.save(function (err, library) {
                    console.log("campaign file created1");
                    console.log('library++++++++++', library);
                    // console.log('folder_id++++++++++', folder_Id);
                    if (library) {
                        res.send({
                            state: "success",
                            message: "Updated.",
                            data: folder
                        }, 200);
                    }
                });
            }

        }
        if (!folder) {
            var folder = new Folder();
            folder.marketing_folder = true;
            folder.campaign_id = campaign._id;
            folder.franchisee_Id = campaignDetails.franchisee_id;
            folder.franchisor_Id = campaignDetails.franchisor_id;
            folder.folder_name = campaign.title;
            folder.save(function (err, folder) {
                console.log("campaign folder created2");
                console.log('folder----------------', folder);
                if (folder) {
                    after_campaign_files = req.files.after_campaign_files;
                    for (var i = 0; i < after_campaign_files.length; i++) {
                        var library = new Library();
                        library.path = after_campaign_files[i].location;
                        library.key = after_campaign_files[i].key;
                        library.file_name = after_campaign_files[i].originalname;
                        if (after_campaign_files[i].mimetype == "application/pdf") {
                            library.image_type = "pdf";
                        }
                        if (after_campaign_files[i].mimetype == "image/png" || after_campaign_files[i].mimetype == "image/jpg" || after_campaign_files[i].mimetype == "image/jpeg" || after_campaign_files[i].mimetype == "image/gif") {
                            library.image_type = "image";
                        }
                        // library.uploaded_status = status;
                        library.date_uploaded = Date.now();
                        library.folder_Id = folder._id;
                        library.campaign_id = file_details.campaign_id;
                        library.is_campaign_file = true;
                        //library.franchisee_Id = campaignDetails.franchisee_id;;
                        library.save(function (err, library) {
                            console.log("campaign file created1");
                            console.log('library++++++++++', library);
                            // console.log('folder_id++++++++++', folder_Id);
                            if (library) {
                                res.send({
                                    state: "success",
                                    message: "Updated.",
                                    data: folder
                                }, 200);
                            }
                        });
                    }
                }
            });
        }
    })
});
// after campaign details
router.put('/after_campaign_details', cpUpload, function (req, res) {
    var campaignDetails = JSON.parse(req.body.campaign);
    console.log(req.body.campaign);
    // try{
    Campaign.findOne({ '_id': campaignDetails._id }, function (err, campaign) {
        console.log(campaign);
        if (err) {
            return res.send({
                state: "err",
                message: "Something went wrong. We are looking into it."
            }, 500);
        }
        if (campaign) {
            campaign.amount_spent = campaignDetails.amount_spent;
            campaign.leads_generated = campaignDetails.leads_generated;
            campaign.footfalls = campaignDetails.footfalls;
            campaign.campaign_duration = campaignDetails.campaign_duration;
            campaign.campaign_status = campaignDetails.campaign_status;
            campaign.franchisor_id = campaignDetails.franchisor_id;
            campaign.franchisee_id = campaignDetails.franchisee_id;
            campaign.franchisee_feedback = campaignDetails.franchisee_feedback;
            campaign.franchisor_feedback = campaignDetails.franchisor_feedback;

            console.log(req.file, '492');
            if (req.file) {
                console.log(req.file, '492');
                campaign.after_campaign_file_attachment_file_url = req.file.location;
                campaign.after_campaign_file_attachment_file_name = req.file.key;
                campaign.after_campaign_file_attachment_file_type = req.file.contentType;
            }
            campaign.save(function (err, campaign) {
                {

                    res.send({
                        state: "success",
                        message: "Campaign updated.",
                        data: campaign
                    }, 200);
                }
            });

        }
        if (!campaign) {
            res.send({
                state: "failure",
                message: "Failed to update!."
            }, 400);
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

// Filters
// All for franchisor login
router.get('/get_all_filter_campaigns/:franchisor_id', function (req, res) {
    try {
        Campaign.find({ franchisor_id: req.params.franchisor_id }, function (err, campaigns) {
            if (err) {
                return res.send(500, err)
            }
            if (!campaigns) {
                res.send({
                    state: 'failure',
                    message: 'Campaign not found'
                }, 400)
            }
            else {
                res.send({
                    state: 'success',
                    data: campaigns
                }, 200)
            }
        })
    }
    catch (err) {
        return res.send({
            state: 'error',
            message: err
        })
    }
})

// my campaigns for franchisor login
router.get('/get_my_campaign_by_franchisor/:franchisor_id', function (req, res) {
    try {
        Campaign.find({ franchisor_id: req.params.franchisor_id, created_by: 'franchisor' }, function (err, campaigns) {
            if (err) {
                return res.send(500, err)
            }
            if (!campaigns) {
                res.send({
                    state: 'failure',
                    message: 'Campaign not found'
                }, 400)
            }
            else {
                res.send({
                    state: 'success',
                    data: campaigns
                }, 200)
            }
        })
    }
    catch (err) {
        return res.send({
            state: 'error',
            message: err
        })
    }
})

// franchisee filter for franchisor login
router.get('/get_franchisee_filter_by_franchisor/:franchisor_id', function (req, res) {
    try {
        Campaign.find({ franchisor_id: req.params.franchisor_id, created_by: 'franchisee' }, function (err, campaigns) {
            if (err) {
                return res.send(500, err)
            }
            if (!campaigns) {
                res.send({
                    state: 'failure',
                    message: 'Campaign not found'
                }, 400)
            }
            else {
                res.send({
                    state: 'success',
                    data: campaigns
                }, 200)
            }
        })
    }
    catch (err) {
        return res.send({
            state: 'error',
            message: err
        })
    }
})

// filter for all franchisee login
router.get('/get_all_franchisee_filter_campaigns/:franchisee_id', function (req, res) {
    try {
        Campaign.find({ franchisee_id: req.params.franchisee_id }, function (err, campaigns) {
            if (err) {
                return res.send(500, err)
            }
            if (!campaigns) {
                res.send({
                    state: 'failure',
                    message: 'Campaign not found'
                }, 400)
            }
            else {
                res.send({
                    state: 'success',
                    data: campaigns
                }, 200)
            }
        })
    }
    catch (err) {
        return res.send({
            state: 'error',
            message: err
        })
    }
})

// my campaigns for franchisor login
router.get('/get_filter_my_campaign/:franchisee_id', function (req, res) {
    try {
        Campaign.find({ franchisee_id: req.params.franchisee_id, created_by: 'franchisee' }, function (err, campaigns) {
            if (err) {
                return res.send(500, err)
            }
            if (!campaigns) {
                res.send({
                    state: 'failure',
                    message: 'Campaign not found'
                }, 400)
            }
            else {
                res.send({
                    state: 'success',
                    data: campaigns
                }, 200)
            }
        })
    }
    catch (err) {
        return res.send({
            state: 'error',
            message: err
        })
    }
})

// franchisee filter for franchisor login
router.get('/get_franchisor_filter_specific_franchisee/:franchisee_id', function (req, res) {
    try {
        Campaign.find({ franchisee_id: req.params.franchisee_id, created_by: 'franchisee', visible_to_franchisee_id: req.body.franchisee_id }, function (err, campaigns) {
            if (err) {
                return res.send(500, err)
            }
            if (!campaigns) {
                res.send({
                    state: 'failure',
                    message: 'Campaign not found'
                }, 400)
            }
            else {
                res.send({
                    state: 'success',
                    data: campaigns
                }, 200)
            }
        })
    }
    catch (err) {
        return res.send({
            state: 'error',
            message: err
        })
    }
})

module.exports = router;
