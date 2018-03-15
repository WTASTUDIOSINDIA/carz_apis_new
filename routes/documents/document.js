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


// To upload files
var cpUpload = upload.fields([{ name: 'file_upload', maxCount: 50 }, { name: 'imgFields', maxCount: 20 }])
router.post('/upload_file',cpUpload,function(req,res){
    var file_details = JSON.parse(req.body);
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
                var doc = new Doc();
                doc.path = file[i].location;
                doc.key = file[i].key;
                doc.file_name = file[i].originalname;
                if(file[i].mimetype == "application/pdf"){
                    doc.image_type = "pdf";
                }
                if(file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i].mimetype == "image/jpeg"){
                    doc.image_type = "image";
                }
                doc.is_provide = req.body.is_provide;
                doc.stage_name = req.body.stage_name;
                doc.date_uploaded = Date.now();
                doc.franchisee_id = req.body.franchisee_id;
                files.push(doc);
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

//to get files
router.get('/get_uploaded_files/:franchisee_Id/:stage_name',function(req,res){
    Doc.find({uploaded_status:req.params.uploaded_status,franchisee_Id:req.params.franchisee_Id, stage_name:req.params.stage_name},function(err,file){
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

router.get('/get_type',function(req,res){
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
                    state:"suces",
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

router.post('/set_type',function(req,res){
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
})

module.exports = router;