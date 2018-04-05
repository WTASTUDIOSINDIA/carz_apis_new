var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var path = require('path');
var Doc = mongoose.model('Doc');
var FranchiseeType = mongoose.model('FranchiseeType');
var Library = mongoose.model('Library');
var FranchiseeTypeList = mongoose.model('FranchiseeTypeList');
var _ = require('lodash');
var KycUploads = mongoose.model('KycUploads');
var Reasons = mongoose.model('Reasons');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var bCrypt = require('bcrypt-nodejs');
aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
});
//carzwta
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
// To upload files kyc
var cpUpload = upload.fields([{ name: 'file_upload', maxCount: 50 }, { name: 'imgFields', maxCount: 20 }])
router.post('/upload_file',cpUpload,function(req,res){
    var file_details = (req.body);
    var files=[];
    Doc.find({},function(err,kyc){
        if(err){
            return res.send(err);
        }
        else{
            var file = [];
            var getNumber = 0;
            var length = req.files.file_upload.length;
            file=req.files.file_upload;
            for(var i=0;i<file.length;i++){
                var document = new Doc();
                document.path = file[i].location;
                document.key = file[i].key;
                document.file_name = file[i].originalname;
                if(file[i].mimetype == "application/pdf"){
                    document.image_type = "pdf";
                }
                if(file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i].mimetype == "image/jpeg"){
                    document.image_type = "image";
                }
                document.is_provide = req.body.is_provide;
                document.stage_name = req.body.stage_name;
                document.date_uploaded = Date.now();
                document.franchisee_id = req.body.franchisee_id;
                files.push(document);
            }
            for(var i=0;i<files.length;i++){
                getNumber = getNumber + 1;
                files[i].save(function(err,files){
                if(err){
                        return res.send(err);
                }
                else{
                    if(parseInt(length) == parseInt(getNumber)){
                        res.send({
                            state:200,
                            status:'success',
                            message:"file uploaded successfully !"
                        });
                    }
                }
            })
            }
        }
   });
});
//to get uploded files
router.get('/get_uploaded_files/:franchisee_Id/:stage_name',function(req,res){
    Doc.find({uploaded_status:req.params.uploaded_status,franchisee_id:req.params.franchisee_id, stage_name:req.params.stage_name},function(err,file){
        if(err){
            res.send ({
                message: "Something went wrong.",
                state: "error"
            },500);
        }
        if(file.length == 0){
            res.send ({
                message: "No file are uploaded.",
                state: "failure"
            },201);
        }
        if(file){
            res.send ({
                file: file,
                state: "success"
            },200);
        }
    });
});
router.get('/get_business_type',function(req,res){
    try{
        FranchiseeType.find({},function(err,type){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            else{
                return res.send({
                    state:"success",
                    FranchiseeType:type
                },200);
            }
        })
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});
router.post('/set_business_type',function(req,res){
    try{
        FranchiseeType.findOne({bussiness_type_name:req.body.bussiness_type_name},function(err,type){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(type){
                return res.send({
                    state:"failure",
                    message:"Franchisee type with this name exist."
                },400);
            }
            else{
                var document_list = new FranchiseeType();
                document_list.bussiness_type_name=req.body.bussiness_type_name;
                document_list.save(function(err,document_list){
                    if(err){
                        return res.send({
                            state:"err",
                            message:"Something went wrong.We are looking into it."
                        },500);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:"Successfully added in the array."
                        },200);
                    }
                })
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});
router.post('/create_business_type',function(req,res){
    try{
        FranchiseeTypeList.findOne({doc_name:req.body.doc_name},function(err,type){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(type){
                return res.send({
                    state:"failure",
                    message:"Franchisee type with this name exist."
                },400);
            }
            else{
                var document_list_types = new FranchiseeTypeList();
                document_list_types.businessType_id=req.body.businessType_id;
                document_list_types.doc_name=req.body.doc_name;
                document_list_types.doc_link="";
                document_list_types.save(function(err,document_list_types){
                    if(err){
                        return res.send({
                            state:"err",
                            message:"Something went wrong.We are looking into it."
                        },500);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:"Successfully added in the array.",
                            document_list_types:document_list_types
                        },200);
                    }
                })
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});
router.delete('/delete/business_type/:id',function(req,res){
    try{
        FranchiseeTypeList.findByIdAndRemove({_id:req.params.id},function(err,type){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(!type){
                return res.send({
                    state:"err",
                    message:"Id is wrong."
                },500);
            }
            else{
                return res.send({
                    state:"success",
                    message:"Removed successfully"
                },200);
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});
router.get('/get_business_type_list/:id',function(req,res){
    try{
        FranchiseeTypeList.find({businessType_id:req.params.id},function(err,type){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            else{
                return res.send({
                    state:"success",
                    FranchiseeTypeList:type
                },200);
            }
        })
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});
router.delete('/delete/franchiseeType/:id',function(req,res){
    try{
        FranchiseeType.findByIdAndRemove({_id:req.params.id},function(err,type){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(!type){
                return res.send({
                    state:"err",
                    message:"Id is wrong."
                },500);
            }
            else{
                return res.send({
                    state:"success",
                    message:"Removed successfully"
                },200);
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});
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
function update_kyc(req,res,kyc,message){
    KycUploads.findById({_id:kyc._id},function(err,update_kyc){
        if(err){
            return res.send({
                state:"error",
                message:err
            },500);
        }
        else{
            update_kyc.docs_types = kyc.docs_types;
            update_kyc.save(function(err,kyc){
                res.send({
                    state:"success",
                    message:message
                },200);
            });
        }
    });
}
function update_business_type(req,res,getData,doc){
    KycUploads.findOne({franchisee_id:doc.franchisee_id,partner_id:doc.partner_id},function(err,kyc){
        if(err){
            return res.send({
                state:"error",
                message:err
            },500);
        }
        if(!kyc){
            return res.send({
                state:"failure",
                message:err
            },400);
        }
        else{
            var search=getData.doc_name;
            var results=_.findIndex(kyc.docs_types, function(chr) {
                return chr.doc_name == search;
              });
            kyc.docs_types[results].doc_link = doc.link;
            update_kyc(req,res,kyc,"Uploaded successfully");
        }
    });
}
router.put('/upload_doc',upload.single('doc_file'),function(req,res){
    var getData=JSON.parse(req.body.document);
    try{
        var doc  = new Doc();
        doc.doc_name= getData.doc_name;
        doc.link=  req.file.location;
        doc.key=  req.file.key;
        doc.franchisee_id= getData.franchisee_id;
        doc.partner_id= getData.partner_id;
        if(req.file.mimetype == "application/pdf"){
            doc.file_type = "pdf";
        }
        if(req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/gif"){
            doc.file_type = "image";
        }
        doc.stage_name= getData.stage_name;
        doc.date_uploaded=new Date();
        doc.save(function(err,doc){
            upload_folder_file(req, res, req.file, getData.status, getData.folder_Id,getData.franchisee_id)
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            else{
                update_business_type(req,res,getData,doc);
            }
        })
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});
function find_and_delete_file(req,res,lib_file){
    // remove
    Library.remove({path:lib_file},function(err,lib){
        if(err){
            return res.send({
                state:"error",
                message:err
            },500);
        }
        else{
        }
    })
}
router.put('/delete_doc',function(req,res){
    try{
        KycUploads.findOne({_id : req.body.kyc_id},function(err,kyc){
            if(err){
                res.send({
                    state:"error",
                    message:err
                },500);
            }
            else{
                var search=req.body.doc_name;
                var results=_.findIndex(kyc.docs_types, function(chr) {
                    return chr.doc_name == search;
                });
                console.log("kyc.docs_types[results].doc_link",kyc.docs_types[results].doc_link);
                find_and_delete_file(req,res,kyc.docs_types[results].doc_link);
                kyc.docs_types[results].doc_link = "";
                update_kyc(req,res,kyc,"Doc deleted successfully!");
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});
router.put('/reject_doc',function(req,res){
    try{
        KycUploads.findOne({_id : req.body.kyc_id},function(err,kyc){
            if(err){
                res.send({
                    state:"error",
                    message:err
                },500);
            }
            else{
                var reason = new Reasons()
                reason.reason_listed = req.body.reason_listed;
                reason.reason_in_text = req.body.reason_in_text;
                reason.status  = req.body.status;
                reason.doc_name  = req.body.doc_name;
                reason.franchisee_Id  = req.body.franchisee_Id;
                reason.partner_Id  = req.body.partner_Id;
                reason.kyc_id = req.body.kyc_id;
                reason.save(function(err,reason){
                    if(err){
                        res.send({
                            state:"error",
                            message:err
                        },500);
                    }
                    else{
                        var search=req.body.doc_name;
                        var results=_.findIndex(kyc.docs_types, function(chr) {
                            return chr.doc_name == search;
                        });
                        kyc.docs_types[results].doc_link = "";
                        update_kyc(req,res,kyc,"Doc rejected!");
                    }
                });
            }
        })
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});
router.put('/approve_doc',function(req,res){
    var kycForm = req.body;
    console.log("kycForm",kycForm);
    try{
        KycUploads.findById({ _id : kycForm.kyc_id},function(err,kyc){
            console.log('kyc11',kyc);
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(!kyc){
                return res.send({
                    state:"failure",
                    message:"Not found"
                },200);
            }
            else{
                var reason = new Reasons()
                reason.status  = req.body.status;
                reason.doc_name  = req.body.doc_name;
                reason.franchisee_Id  = req.body.franchisee_Id;
                reason.partner_Id  = req.body.partner_Id;
                reason.kyc_id =kyc._id;
                reason.save(function(err,reason){
                    if(err){
                        res.send({
                            state:"error",
                            message:err
                        },500);
                    }
                    else{
                        var search=req.body.doc_name;
                        var results=_.findIndex(kyc.docs_types, function(chr) {
                            return chr.doc_name == search;
                        });
                        kyc.docs_types[results].doc_status = 'Approved';
                        update_kyc(req,res,kyc,"Doc rejected!");
                    }
                });
            }
        })
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});

module.exports = router;