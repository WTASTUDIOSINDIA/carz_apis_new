var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var path = require('path');
var Franchisee = mongoose.model('Franchisee');
var FranchiseeTypeList = mongoose.model('FranchiseeTypeList');
var Library = mongoose.model('Library');
var Doc = mongoose.model('Doc');
var KycUploads = mongoose.model('KycUploads');
var fs = require('fs');
var csv = require('csv')
var path = require('path');
var Meeting = mongoose.model('Meeting');
var nodemailer = require('nodemailer');
var _ = require('lodash');
// var Discussion = mongoose.model('Discussion');
var Stages = mongoose.model('Stages');
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
router.get('/get_franchisees',function(req,res){
    try{
        Franchisee.find({},function(err,franchiees){
            if(err){
                return res.send(500, err);
            }
            if(!franchiees){
                res.send({
                    "status":404,
                    "message":"Franchiees not found",
                    "message":"failure",
                    "franchisees_list":[]
                },404);
            }
            else{
                res.send({
                    "status":"200",
                    "state":"success",
                    "franchisees_list":franchiees
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
//get franchisee by id
router.get('/get_franchisee/:id',function(req,res){
    try{
        Franchisee.findById({_id:req.params.id},function(err,franchisee){
            if(err){
                return res.send(500, err);
            }
            if(!franchisee){
                res.send({
                    "status":400,
                    "state":"failure",
                    "franchisees_data":[]
                },400);
            }
            else{
                res.send({
                    status:200,
                    state:"success",
                    franchisees_data:franchisee
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
//validate franchisee by email
router.post('/validate_franchisee',  function(req, res) {
    var FranchiseeValidateForm = req.body;
    try{
        Franchisee.findOne({'franchisee_email':FranchiseeValidateForm.franchisee_email},function(err,franchisee){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(franchisee){
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
//validate franchisee by pincode
router.post('/validate_franchisee_pincode',  function(req, res) {
    var FranchiseeValidateForm = req.body;
    try{
        Franchisee.findOne({'franchisee_pincode':FranchiseeValidateForm.franchisee_pincode},function(err,franchisee){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(franchisee){
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
//validate franchisee by mobile number
router.post('/validate_mobile_number',  function(req, res) {
    var FranchiseeValidateForm = req.body;
    try{
        Franchisee.findOne({'partner_mobile_number':FranchiseeValidateForm.partner_mobile_number},function(err,franchisee){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(franchisee){
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
//create franchisee
router.post('/create_franchisee',upload.single('franchisee_img'),function(req, res) {
    var franchiseeForm =JSON.parse(req.body.franchisee);
    try{
        //Franchisee.findOne({'franchisee_code':franchiseeForm.franchisee_code},function(err,franchisee){
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
                    message:"This franchisee already exists!"
                });
            }
            if(!franchisee){
               var franchisee = new Franchisee();
              //  franchisee.franchisee_code = franchiseeForm.franchisee_code,
                franchisee.franchisee_name=franchiseeForm.franchisee_name,
                franchisee.franchisee_email=franchiseeForm.franchisee_email,
                franchisee.franchisee_occupation=franchiseeForm.partner_occupation,
                franchisee.franchisee_city=franchiseeForm.franchisee_city,
                franchisee.franchisee_state=franchiseeForm.franchisee_state,
                franchisee.franchisee_address=franchiseeForm.franchisee_address,
                franchisee.franchisee_mobile_number=franchiseeForm.partner_mobile_number,
                franchisee.franchisee_investment=franchiseeForm.franchisee_investment,
                franchisee.franchisee_preferred_date=franchiseeForm.franchisee_preferred_date,
                franchisee.franchisee_preferred_time=franchiseeForm.franchisee_preferred_time,
                franchisee.franchisee_how_soon_to_start=franchiseeForm.franchisee_how_soon_to_start,
                franchisee.franchisee_franchise_model=franchiseeForm.franchisee_franchise_model,
                franchisee.franchisee_franchise_type=franchiseeForm.franchisee_franchise_type,
                franchisee.franchisee_remarks=franchiseeForm.franchisee_remarks,
                franchisee.franchisee_country=franchiseeForm.franchisee_country,
                franchisee.bussiness_type_id = franchiseeForm.bussiness_type_id,
                franchisee.franchisee_pincode=franchiseeForm.franchisee_pincode,
                franchisee.lead_age=franchiseeForm.partner_age,
                franchisee.lead_source=franchiseeForm.lead_source,
                franchisee.master_franchisee_id=franchiseeForm.master_franchisee_id,
                franchisee.user_role=franchiseeForm.user_role,
                franchisee.bussiness_type_id=franchiseeForm.bussiness_type_id;
                franchisee.franchisee_pass = createHash('mypassword');
                franchisee.bussiness_type = franchiseeForm.bussiness_type_id;
                franchisee.partners_list = 1;

                if(req.file){
                    var franchisee_pic = {};
                    franchisee_pic.path = req.file.location;
                    franchisee_pic.key = req.file.key;
                    franchisee.franchisee_profile_pic = franchisee_pic;
                }
                franchisee.save(function(err,franchisee){
                   if(err){
                     res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong."
                    },500);
                   }
                else{

                    var partner = new Partner();


                    partner.partner_name=franchisee.franchisee_name,
                    partner.partner_occupation=franchiseeForm.partner_occupation,
                    partner.partner_email=franchisee.franchisee_email,
                    partner.partner_mobile_number=franchiseeForm.partner_mobile_number,
                    partner.partner_age=franchiseeForm.partner_age,
                    partner.partner_address = franchiseeForm.partner_address,
                    partner.partner_city = franchiseeForm.partner_city,
                    partner.partner_state = franchiseeForm.partner_state,
                    partner.partner_pincode = franchiseeForm.partner_pincode,
                    partner.partner_country = franchiseeForm.partner_country,
                    partner.main_partner = true,
                    partner.bussiness_type_id=franchiseeForm.bussiness_type_id;
                    partner.franchisee_id=franchisee._id;
                    partner.partner_profile_pic = franchisee.franchisee_profile_pic
                    partner.save(function(err,partner){
                        if(err){
                            res.send({
                                state:"err",
                                message:"Something went wrong."
                            },500);
                        }
                        else{
                            kyc_Upload(req, res,partner,franchisee,franchiseeForm);
                            res.send({
                                state:"success",
                                message:"Franchisee created successfully.",
                                data: franchisee
                            },200);
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
//Creating kyc table for the frachisee
function kyc_Upload(req,res,partner,franchisee,franchiseeForm){
console.log(partner, "partner");
  console.log(franchisee, "franchisee");
  console.log(franchiseeForm, "franchiseeForm");
    FranchiseeTypeList.find({businessType_id:franchiseeForm.bussiness_type_id},function(err,type){
        if(err){
            return res.send({
                state:"error",
                message:err
            },500);
        }
        else{
            var kyc = new KycUploads();
            kyc.franchisee_id = franchisee._id;
            kyc.partner_id = partner._id;
            kyc.docs_types = type;
            kyc.save(function(err,kyc){
                if(err){
                    return res.send({
                        state:"error",
                        message:err
                    },500);
                }
                else{
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
router.get('/get_kyc_docs/:id', function(req,res){
    KycUploads.find({franchisee_id:req.params.id},function(err,kyc){
        if(err){
            return res.send({
                state:"error",
                message:err
            },500);
        }
        if(kyc.length == 0){
            return res.send({
                state:"failure",
                message:"Data not foound"
            },400);
        }
        if(kyc.length > 0){
            return res.send({
                state:"success",
                data:kyc
            },200);
        }
    })
});
//To get by franchisee and partner id
router.get('/get_kyc_docs_by_partner/:id/:partner_id', function(req,res){
    KycUploads.findOne({partner_id:req.params.partner_id},function(err,kyc){
        if(err){
            return res.send({
                state:"error",
                message:err
            },500);
        }
        if(!kyc){
            return res.send({
                state:"failure",
                message:"Data not foound"
            },200);
        }
        if(kyc){
            return res.send({
                state:"success",
                data:kyc
            },200);
        }
    })
});
//create multiple franchisee
router.post('/create_multiple_franchisee',  function(req, res) {
    var franchiseeMultipleForm = req.body;
    try{
        Franchisee.find({},function(err,franchisee){
            if(err){
                return res.send({
                        state:"err",
                        message:"Something went wrong.We are looking into it."
                    },500);
            }
            else{
                var franchisee_length = (franchiseeMultipleForm.length-1);
                for(var i=0;i<franchiseeMultipleForm.length-1;i++){
                    var franchisee = new Franchisee();
                    franchisee.franchisee_name = franchiseeMultipleForm[i].franchisee_name,
                    franchisee.franchisee_email = franchiseeMultipleForm[i].franchisee_email,
                    franchisee.franchisee_pincode = franchiseeMultipleForm[i].franchisee_pincode,
                    franchisee.franchisee_country = franchiseeMultipleForm[i].franchisee_country,
                    franchisee.franchisee_state = franchiseeMultipleForm[i].franchisee_state,
                    franchisee.franchisee_city = franchiseeMultipleForm[i].franchisee_city,
                    franchisee.franchisee_area = franchiseeMultipleForm[i].franchisee_area
                    franchisee.master_franchisee_id = franchiseeMultipleForm[i].master_franchisee_id

                    franchisee.save(function(err,franchisee){
                        if(err){
                            return res.send({
                                state:"err",
                                message:"Something went wrong."
                            },500);
                        }
                        else{
                            if(franchisee_length==i){
                                return res.send({
                                    state:"success",
                                    message:"Multiple Franchisee Created."
                                },200);
                            }
                        }
                    });
               }
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
router.put('/edit_franchisee',upload.single('franchisee_img'), function(req, res, next) {
    var franchiseeEditForm = JSON.parse(req.body.franchisee);
    try{
        Franchisee.findOne({'_id':franchiseeEditForm._id},function(err,franchisee){
            if(err){
                return res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong.We are looking into it."
                    },500);
            }
            //If franchisee found,it will enter inside
            if(franchisee){
                franchisee.franchisee_code = franchiseeEditForm.franchisee_code,
                franchisee.franchisee_name=franchiseeEditForm.franchisee_name,
                franchisee.franchisee_occupation=franchisee.franchisee_occupation,
                franchisee.franchisee_email=franchiseeEditForm.franchisee_email,
                franchisee.franchisee_city=franchiseeEditForm.franchisee_city,
                franchisee.franchisee_state=franchiseeEditForm.franchisee_state,
                franchisee.bussiness_type_id = franchiseeEditForm.bussiness_type_id,
                franchisee.franchisee_pincode =franchiseeEditForm.franchisee_pincode,
                franchisee.franchisee_address=franchiseeEditForm.franchisee_address,
                franchisee.franchisee_mobile_number=franchiseeEditForm.franchisee_mobile_number,
                franchisee.franchisee_investment=franchiseeEditForm.franchisee_investment,
                franchisee.franchisee_preferred_date=franchiseeEditForm.franchisee_preferred_date,
                franchisee.franchisee_preferred_time=franchiseeEditForm.franchisee_preferred_time,
                franchisee.franchisee_how_soon_to_start=franchiseeEditForm.franchisee_how_soon_to_start,
                franchisee.franchisee_franchise_model=franchiseeEditForm.franchisee_franchise_model,
                franchisee.franchisee_franchise_type = franchiseeEditForm.franchisee_franchise_type,
                franchisee.franchisee_remarks=franchiseeEditForm.franchisee_remarks,
                franchisee.lead_age=franchiseeEditForm.lead_age,
                franchisee.bussiness_type_id=franchiseeEditForm.bussiness_type_id;
                franchisee.lead_source=franchiseeEditForm.lead_source
                if(req.file){
                    var franchisee_pic = {};
                    franchisee_pic.path = req.file.location;
                    franchisee_pic.key = req.file.key;
                    franchisee.franchisee_pic = franchisee_pic;
                }
                franchisee.save(function(err,franchisee){
                   if(err){
                     res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong."
                    },500);
                   }
                else{
                    res.send({
                        status:200,
                        state:"success",
                        message:"Franchisee Updated."
                    },200);
                }
                });
            }
            //If franchisee not found,it will enter inside and send error message
            if(!franchisee){
                res.send({
                    status:400,
                    state:"failure",
                    message:"Franchise exist with this Id."
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
//delete franchisee
router.delete('/delete_franchisee/:id',function(req,res){
    try{
        Franchisee.findByIdAndRemove({_id:req.params.id},function(err,franchisee){
            if(err){
                return res.send(500, err);
            }
            if(!franchisee){
                res.send({
                    "status":400,
                    "message":"Unsucessfull",
                    "franchisees_data":"failure"
                },400);
            }
            else{
                res.send({
                    "status":"200",
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
//delete franchisee
router.delete('/delete_franchisees',function(req,res){
    try{
        Franchisee.remove({},function(err,franchisee){
            if(err){
                return res.send(500, err);
            }
            if(!franchisee){
                res.send({
                    "status":400,
                    "message":"Unsucessfull",
                    "franchisees_data":"failure"
                },400);
            }
            else{
                res.send({
                    "status":"200",
                    "message":"Franchisees deleted sucessfully",
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
//for get stagesSchema
router.get('/get_stages/:franchisee_id', function(req, res){
    try{
        Stages.find({franchisee_id: req.params.franchisee_id},function(err,stages){
            if(err){
                return res.send(500, err);
            }
            if(!stages){
                res.send({
                    "status":404,
                    "message":"Franchiees not found",
                    "message":"failure",
                    "franchisees_list":[]
                },404);
            }
            else{
                res.send({
                    "status":"200",
                    "state":"success",
                    "stages_list":stages
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

//for get stagesSchema
router.get('/get_stages', function(req, res){
    try{
        Stages.find({},function(err,stages){
            if(err){
                return res.send(500, err);
            }
            if(!stages){
                res.send({
                    "status":404,
                    "message":"Franchiees not found",
                    "message":"failure",
                    "franchisees_list":[]
                },404);
            }
            else{
                res.send({
                    "status":"200",
                    "state":"success",
                    "stages_list":stages
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
//for get stagesSchema
router.get('/get_stage_by_id/:id', function(req, res){
    try{
        Stages.findById({_id:req.params.id},function(err,stage){
            if(err){
                return res.send(500, err);
            }
            if(!stage){
                res.send({
                    "status":404,
                    "message":"Stage not found",
                    "message":"failure"
                },404);
            }
            else{
                res.send({
                    "status":"200",
                    "state":"success",
                    "data":stage
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
//delete stage
router.delete('/delete_stage/:id',function(req,res){
    try{
        Stages.findByIdAndRemove({_id:req.params.id},function(err,stage){
            if(err){
                return res.send(500, err);
            }
            if(!stage){
                res.send({
                    "status":400,
                    "message":stage
                },400);
            }
            else{
                res.send({
                    "status":"200",
                    "message":"Stage deleted sucessfully",
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

function update_franchisee(req, res, franchisee_id,val,stage){
    Franchisee.findOne({_id:franchisee_id},function(err,franchiees){
        if(err){
            return res.send({
                state:"err",
                message:"Something went wrong."
            },500);
        }
        else{
            franchiees.franchisee_stage_completed = franchiees.franchisee_stage_completed + val;
            franchiees.first_lakh_payment = 'Submitted';
            franchiees.save(function(err,franchisee){
                if(err){
                    res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong."
                    },500);
                }
                else{
                    return res.send({
                        state:"success",
                        message:"Stage Updated",
                        data: stage,
                        franchiees:franchiees
                    },200);
                }
            });
        }
    })
}

//update_stage
var cpUpload = upload.single('file');
router.put('/edit_stage', cpUpload, function(req, res){
    var stageForm = JSON.parse(req.body.franchisee_id);
    console.log(stageForm);
    var stage_Completed = 0;
    try{
        Stages.findOne({franchisee_id: stageForm.franchisee_id}, function(err, stage){
            if(err){
                return res.send({
                    status:500,
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(stage){
                console.log(stageForm);
                //'payment'
                if(stageForm.sub_stage == 'payment'){
                   // stage.stage_discussion.status = false;
                    stage.stage_discussion.payment_value = 100000;
                    stage.stage_discussion.payment_file =  req.file.location;
                    stage.stage_discussion.payment_file_name =  req.file.originalname;
                }
                //'nda'
                if(stageForm.sub_stage == 'nda'){
                   // stage.stage_discussion.status = false;
                    stage.stage_discussion.nda_file =  req.file.location;
                    stage.stage_discussion.nda_file_name =  req.file.originalname;
                    if(req.file.mimetype == "application/pdf"){
                        stage.stage_discussion.nda_file_type = "pdf";
                    }
                    if(req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/gif"){
                        stage.stage_discussion.nda_file_type = "image";
                    }
                    stage.stage_discussion.nda_file_uploaded = Date.now();
                }
                //kyc background verification upload
                if(stageForm.sub_stage == 'kycupload'){
                    console.log(req.file);
                    // stage.stage_kycupload = false;
                    stage.stage_kycupload.bgverification_file_link = req.file.location;
                    stage.stage_kycupload.bgverification_file_name = req.file.originalname;
                }
                //'application_form
                if(stageForm.sub_stage == 'application_form'){
                    send_mail(req,res,stageForm);
                    // stage_Completed = 1;
                    // stage.stage_discussion.status = true;
                }
                //assessment
                if(stageForm.sub_stage == 'assessment'){
                    stage_Completed = 1;
                    stage.stage_assessment.status = true;
                    stage.stage_assessment.franchisee_id = stageForm.franchisee_id;
                }
                //aggrement
                if(stageForm.sub_stage == 'aggrement'){
                    // stage.stage_agreenent.status = false;
                    stage.stage_agreenent.agreement_value = 400000;
                    stage.stage_agreenent.agreement_file =  req.file.location;
                    stage.stage_agreenent.agreement_file_name =  req.file.originalname;
                    franchisee_id = stageForm.franchisee_id;
                }
                //aggrement copy
                if(stageForm.sub_stage == 'aggrement_Copy'){
                    // stage_Completed = 1;
                    // stage.stage_agreenent.status = true;
                    stage.stage_agreenent.final_agreement_file = req.file.location;
                    stage.stage_agreenent.final_agreement_file_name=req.file.originalname;
                };
                //save data in the table
                stage.save(function(err, stage){
                    if(req.file){
                         upload_folder_file(req, res,req.file, stageForm.fileStatus, stageForm.folder_Id, stageForm.franchisee_id);
                    }
                    if(err){
                        return res.send({
                            state:"err",
                            message:"Something went wrong."
                        },500);
                    }
                    else{
                        if(stage.stage_agreenent.agreement_file){
                            Franchisee.findOne({_id:stageForm.franchisee_id},function(err,franchiees){
                                if(err){
                                    return res.send({
                                        state:"err",
                                        message:"Something went wrong."
                                    },500);
                                }
                                else{
                                    //franchiees.franchisee_stage_completed = franchiees.franchisee_stage_completed + val;
                                    franchiees.second_lakh_payment = 'Submitted';
                                    franchiees.save(function(err,franchisee){
                                        if(err){
                                            res.send({
                                                status:500,
                                                state:"err",
                                                message:"Something went wrong."
                                            },500);
                                        }
                                        else{
                                            return res.send({
                                                state:"success",
                                                message:"Stage Updated",
                                                data: stage,
                                                franchiees:franchiees
                                            },200);
                                        }
                                    });
                                }
                            })
                        }
                        else{
                            return res.send({
                                state:"success",
                                message:"Stage Updated",
                                data: stage
                            },200);
                        }
                        //update_franchisee(req, res, stageForm.franchisee_id,stage_Completed,stage);
                    }
                })
            }
            //If requesting it for first time
            if(!stage){
                var stage = new Stages();
                stage.franchisee_id = stageForm.franchisee_id;
                stage.folder_id = stageForm.folder_Id;
                stage.stage_discussion.status = false;
                stage.stage_discussion.payment_value = 100000;
                stage.stage_discussion.payment_file =  req.file.location;
                stage.stage_discussion.payment_file_name =  req.file.originalname;
                if(req.file.mimetype == "application/pdf"){
                    stage.stage_discussion.payment_file_type = "pdf";
                }
                if(req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/gif"){
                    stage.stage_discussion.payment_file_type = "image";
                }
                stage.stage_discussion.payment_file_uploaded = Date.now();
                stage.save(function(err, stage){
                    upload_folder_file(req, res,req.file, stageForm.fileStatus, stageForm.folder_Id, stageForm.franchisee_id);
                    if(err){
                        return res.send({
                            state:"err",
                            message:"Something went wrong."
                        },500);
                    }
                    else{
                        update_franchisee(req, res, stageForm.franchisee_id,stage_Completed,stage);
                    }
                })
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

function send_mail(req,res,stageForm){
    try{
        Meeting.findOne({franchisee_id:stageForm.franchisee_id},function(err,franchise){
            if(err){
                return res.send({
                    "state":"failure",
                    "message":err
                })
            }
            else{
                var filepath ='https://celebappfiles.s3.ap-south-1.amazonaws.com/1521119220821.angular-from-theory-to-practice.pdf';
                var fromName = "CARZ";
                    var mailOptions={
                    to: stageForm.to,
                    subject: stageForm.subject,
                    from: "ikshitnodemailer@gmail.com",
                    headers: {
                        "X-Laziness-level": 1000,
                        "charset" : 'UTF-8'
                    },
                    attachments: [{
                        filename: "Application Form.pdf",
                        contentType: 'application/pdf',
                        path: 'https://celebappfiles.s3.ap-south-1.amazonaws.com/1521119220821.angular-from-theory-to-practice.pdf'
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
                transporter.sendMail(mailOptions, function(error, response){
                    if(error){
                        return res.send(error);
                    }
                    else{
                        return ;
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
};

router.put('/update_stage',function(req,res){
    var stage_Completed = 0;
    try{
        Stages.findOne({franchisee_id: req.body.franchisee_id}, function(err, stage){
            if(err){
                return res.send({
                    status:500,
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            console.log("here",stage);
            if(req.body.stage_name == 'Discussion'){
                stage_Completed = 1;
                stage.stage_discussion.status = true;
            }
            if(req.body.stage_name == 'Agreement_Copy'){
                stage_Completed = 1;
                stage.stage_agreenent.status = true;
            }
            if(req.body.stage_name == 'Kyc_Uploads'){
                stage_Completed = 1;
                stage.stage_kycupload.status = true;
                stage.stage_kycupload.franchisee_id = req.body.franchisee_id;
            }
            if(req.body.stage_name == 'Asessments'){
                stage_Completed = 1;
                stage.stage_assessment.status = true;
                stage.stage_assessment.franchisee_id = req.body.franchisee_id;
            }
            stage.save(function(err,stage){
                if(err){
                    return res.send({
                        status:500,
                        state:"err",
                        message:"Something went wrong.We are looking into it."
                    },500);
                }
                else{
                    update_franchisee(req, res, req.body.franchisee_id ,stage_Completed,stage);
                }
            })
        })
    }
    catch(err){
        return res.send({
            state:"error",
            message:err
        });
    }
})

router.get('/master_franchisee_list',function(req,res){
    try{
        Franchisee.find({user_role:"master_franchisee"},function(err,master_franchisee){
            if(err){
                return res.send({
                    status:500,
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(master_franchisee.length == 0){
                return res.send({
                    state:"err",
                    message:"Master franchisee not created yet"
                },400);
            }
            else{
                return res.send({
                    state:"success",
                    data:master_franchisee
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

router.get('/master_franchisee/franchisee_list/:id',function(req,res){
    try{
        Franchisee.find( { $or:[{master_franchisee_id:req.params.id}, {_id: req.params.id} ]},function(err,franchisee){
            if(err){
                return res.send({
                    status:500,
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(franchisee.length == 0){
                return res.send({
                    state:"err",
                    message:"Master franchisee not created yet"
                },400);
            }
            else{
                return res.send({
                    state:"success",
                    data:franchisee
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

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
function upload_folder_file(req, res, obj, status, folder_Id,franchisee_Id){
    var library = new Library();
    library.path = obj.location;
    library.key = obj.key;
    library.file_name = obj.originalname;
    if(obj.mimetype == "application/pdf"){
        library.image_type = "pdf";
    }
    if(obj.mimetype == "image/png" || obj.mimetype == "image/jpg" || obj.mimetype == "image/jpeg" || obj.mimetype == "image/gif"){
        library.image_type = "image";
    }
    library.uploaded_status = status;
    library.date_uploaded = Date.now();
    library.folder_Id = folder_Id;
    library.franchisee_Id = franchisee_Id;
    library.save(function(err,library){
        if(err){
        res.send({
            status:500,
            state:"err",
            message:"Something went wrong."
        },500);
        }
    else{
    }
    });
}

var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};


var request = require("request"),
 csv = require("csv");


    // accepts the POST form submit of the CSV file
    router.post("/upload/data", function(req, res) {
        // the name under "files" must correspond to the name of the
        // file input field in the submitted form (here: "csvdata")
        csv().from.path(req.files.csvdata.path, {
            delimiter: ",",
            escape: '"'
        })
        // when a record is found in the CSV file (a row)
        .on("record", function(row, index) {
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
        .on("end", function() {
            // redirect back to the root
            res.redirect("/");
        })
        // if any errors occur
        .on("error", function(error) {
            console.log(error.message);
        });
    });

    router.post('/import_franchisee',  function(req, res) {
        var franchiseeMultipleForm = req.body;

        try{

          var errors_count = 0;
            Franchisee.find({},function(err,franchisee){
                if(err){
                    return res.send({
                            state:"failure",
                            message:"Something went wrong.We are looking into it."
                        },500);
                };


                  if(franchisee){

                    var franchisee_length = (franchiseeMultipleForm.length-1);

                  var existing_franchisees_list =   get_existing_mails(franchiseeMultipleForm);
                  existing_franchisees_list.then(function(list){
                    console.log(list.join());
                    console.log(list);
                    if(list.length != 0){
                      return res.send({
                              state:"failure",
                              message:list.join() + " already exists in the database"
                          },201);
                    }
                    else {
                      for(var i=0;i<franchiseeMultipleForm.length;i++){

                        var franchisee_mail = franchiseeMultipleForm[i].franchisee_email;


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
                                  franchisee.franchisee_email = franchiseeMultipleForm[i].franchisee_email;
                                  franchisee.franchisee_investment = franchiseeMultipleForm[i].franchisee_investment;
                                  franchisee.partner_occupation = franchiseeMultipleForm[i].partner_occupation;
                                  franchisee.partner_mobile_number = franchiseeMultipleForm[i].partner_mobile_number;
                                  franchisee.partner_age = franchiseeMultipleForm[i].partner_age;
                                  franchisee.partner_address = franchiseeMultipleForm[i].partner_address;
                                  franchisee.partner_city = franchiseeMultipleForm[i].partner_city;
                                  franchisee.franchisee_pass = createHash('mypassword');
                                  franchisee.partner_state = franchiseeMultipleForm[i].partner_state;
                                  franchisee.partner_pincode = franchiseeMultipleForm[i].partner_pincode;
                                  franchisee.partner_country = franchiseeMultipleForm[i].partner_country;
                                  franchisee.bussiness_type_id = franchiseeMultipleForm[i].bussiness_type_id;
                                  franchisee.save(function(err,franchisee){

                                      if(err){
                                        console.log(err, "error 1188");
                                          return res.send({
                                              state:"err",
                                              message:"Something went wrong."
                                          },500);
                                      }
                                      else{
                                        //  if(franchisee_length==i){

                                              var partner = new Partner();
console.log(franchisee);

                                              partner.partner_name=franchisee.franchisee_name;
                                              partner.partner_occupation=franchisee.partner_occupation;
                                              partner.partner_email=franchisee.franchisee_email;
                                              partner.partner_mobile_number=franchisee.partner_mobile_number;
                                              partner.partner_age=franchisee.partner_age;
                                              partner.partner_address = franchisee.partner_address;
                                              partner.partner_city = franchisee.partner_city;
                                              partner.partner_state = franchisee.partner_state;
                                              partner.partner_pincode = franchisee.partner_pincode;
                                              partner.partner_country = franchisee.partner_country;
                                              partner.main_partner = true;
                                              partner.bussiness_type_id = franchisee.bussiness_type_id;
                                              partner.franchisee_id=franchisee._id;
                                              partner.partner_profile_pic = franchisee.franchisee_profile_pic
                                              partner.save(function(err,partner){
                                                  if(err){
                                                      res.send({
                                                          state:"err",
                                                          message:"Something went wrong."
                                                      },500);
                                                  }
                                                  else{
                                                    res.status(200).send({
                                                       state:"success",
                                                       message:"Franchisee Created."
                                                   });
                                                   console.log(partner);
                                                   console.log(franchisee);
                                                      kyc_Upload(req, res,partner,franchisee,franchisee);
                                                  }
                                              });
                                          }// Else statement after franchisee created
                                      });
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
        catch(err){
          console.log(err, "error 1188");
            return res.send({
                state:"error",
                message:err
            });
        }
    });
  async  function get_existing_mails(values){
      var existing_franchisees = [];
      for(var i=0;i<values.length;i++){
        var franchisee_mail = values[i].franchisee_email;
        await  Franchisee.find({franchisee_email: values[i].franchisee_email},function(err,franchisee){
              if(franchisee){
                for(var j=0; j<franchisee.length; j++){
                  (function(j){
                    existing_franchisees.push(franchisee[j].franchisee_email);
                  })(j);
                }
              }
            });
          }
          return existing_franchisees;
        }

// To select lead type
    router.put('/lead_type',function(req, res) {
        try{
            Franchisee.findOne({_id:req.body.franchisee_Id},function(err,franchisee){
                if(err){
                    return res.send({
                            status:500,
                            state:"err",
                            message:"Something went wrong.We are looking into it."
                        },500);
                }
                if(franchisee){
                    franchisee.lead_type = req.body.lead_type
                    franchisee.save(function(err,franchisee){
                       if(err){
                         res.send({
                            status:500,
                            state:"err",
                            message:"Something went wrong."
                        },500);
                       }
                    else{
                        res.send({
                            status:200,
                            state:"success",
                            message:"Lead type created."
                        },200);
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
