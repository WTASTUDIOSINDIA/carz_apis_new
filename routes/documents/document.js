var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var path = require('path');
var Doc = mongoose.model('Doc');
var FranchiseeType = mongoose.model('FranchiseeType');
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
    console.log('file_details', file_details);
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

router.post('/uploadData',cpUpload,function(req,res){
    try{
        console.log("getData",req.body);
        console.log("req.files",req.files);
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});

//to get uploded files
router.get('/get_uploaded_files/:franchisee_Id/:stage_name',function(req,res){
    Doc.find({uploaded_status:req.params.uploaded_status,franchisee_id:req.params.franchisee_id, stage_name:req.params.stage_name},function(err,file){
        if(err){
            res.send ({
                status: 500,
                message: "Something went wrong.",
                state: "error"
            });
        }
        if(file.length == 0){
            res.send ({
                status: 201,
                message: "No file are uploaded.",
                state: "failure"
            });
        }
        if(file){
            res.send ({
                status: 200,
                file: file,
                state: "success"
            });
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
        FranchiseeType.findOne({type_name:req.body.type_name},function(err,type){
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
                document_list.types={
                    type_name:req.body.type_name,
                    type_files:req.body.type_files
                }
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

router.post('/upload',cpUpload,function(req,res){
    var getData=JSON.parse(req.body);
    try{
        console.log("getData",getData);
        console.log("req.files",req.files);
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});

module.exports = router;