var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var path = require('path');
var multer  = require('multer');
var Franchisee = mongoose.model('Franchisee');
var Library = mongoose.model('Library');
var Folder = mongoose.model('Folder');
/*S3 uploads*/
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
        bucket:'carztesting',
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
var cpUpload = upload.fields([{ name: 'file_upload', maxCount: 20 }, { name: 'imgFields', maxCount: 20 }])
router.post('/upload_file',cpUpload,function(req,res){
    var file_details = JSON.parse(req.body.file_details);
    Library.findOne({'folder_Id':file_details.folder_Id,'franchisee_Id':file_details.franchisee_Id},function(err,lib){
        if(err){
            return res.send(err);
        }
        else{
            var library = new Library();
            library.uploaded_status = file_details.uploaded_status;
            library.date_uploaded = Date.now();
            library.franchisee_Id = file_details.franchisee_Id;
            library.folder_Id = file_details.folder_Id;
            library.image_type = "docs";
            var file = [];
            file=req.files.file_upload;
            for(var i=0;i<file.length;i++){
                library.path = file[i].location;
                library.key = file[i].key;
                library.file_name = file[i].originalname;
                if(file[i].mimetype == "application/pdf"){
                    library.image_type = "pdf";
                }
                if(file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i].mimetype == "image/jpeg" || file[i].mimetype == "image/gif"){
                    library.image_type = "image";
                }
            }
            library.save(function(err,lib){
                if(err){
                    return res.send(err);
                }
                else{
                    res.send({
                        state:200,
                        status:'success',
                        message:"file uploaded successfully !",
                        files_list:library
                    });
                }
            });
        }
    });
});

router.delete('/delete_file_by_Id',function(req,res){
    Library.findOne({_id:req.body.file_id},function(err,file){
        if(err){
            res.send ({
                status: 500,
                message: "File deleted successfully.",
                state: "error"
            });
        }
        if(!file){
            res.send ({
                status: 201,
                message: "File not found.",
                state: "failure"
            });
        }
        if(file){
            var params = {Bucket: 'carztesting', Key : req.body.key};
            s0.deleteObject(params, function (err, response) {
                if (err) {
                    return res.send({ "error": err });
                }
                else{
                    res.send ({
                        status: 200,
                        message: "File deleted successfully.",
                        state: "success"
                    });
                }
            });
        }
    });
});

router.get('/get_common_files/:uploaded_status',function(req,res){
    Library.find({uploaded_status:req.params.uploaded_status},function(err,file){
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

router.get('/get_folder_by_id/:franchisee_id',function(req,res){
    Folder.find({franchisee_Id:req.params.franchisee_id},function(err,folder){
        if(err){
            res.send ({
                status: 500,
                message: "Something went wrong.",
                state: "error"
            });
        }
        if(folder.length==0){
            res.send ({
                status: 201,
                message: "Folder not found.",
                state: "failure"
            });
        }
        if(folder.length>0){
            res.send ({
                status: 200,
                folder: folder,
                state: "success"
            });
        }
    });
});

router.get('/get_files_by_id/:folder_id/:franchisee_id',function(req,res){
    Library.findOne({franchisee_Id:req.params.franchisee_id,folder_Id:req.params.folder_Id},function(err,file){
        if(err){
            res.send ({
                status: 500,
                message: "File deleted successfully.",
                state: "error"
            });
        }
        if(!file){
            res.send ({
                status: 201,
                message: "File not found.",
                state: "failure"
            });
        }
        if(file){
            res.send ({
                status: 200,
                file: file,
                state: "failure"
            });
        }
    });
});

router.post('/create_Folder',function(req,res){
    Folder.findOne({franchisee_Id:req.body.franchisee_Id,folder_name:req.body.folder_name},function(err,folder){
        if(err){
            res.send ({
                status: 500,
                message: "File deleted successfully.",
                state: "error"
            });
        }
        if(folder){
            res.send ({
                status: 201,
                message: "Folder exsit with this name.",
                state: "failure"
            });
        }
        if(!folder){
           var folder = new Folder();
           folder.folder_name = req.body.folder_name;
           folder.franchisee_Id = req.body.franchisee_Id;
           folder.create_date = Date.now();
           folder.save(function(err,folder){
                if(err){
                    res.send ({
                        status: 500,
                        message: "File deleted successfully.",
                        state: "error"
                    });
                }
                else{
                    res.send ({
                        status: 200,
                        message: "Folder created successfully.",
                        state: "success"
                    });
                }
           })
        }
    });
});

router.delete('/delete/folder/:id',function(req,res){
    Folder.remove({_id:req.body.folder_Id},function(err,folder){
        if(err){
            res.send ({
                status: 500,
                message: "Something went wrong.Looking into it.",
                state: "error"
            });
        }
        if(!folder){
            res.send ({
                status: 201,
                message: "Folder not found.",
                state: "failure"
            });
        }
        if(folder){
            res.send ({
                status: 200,
                message: "Folder deleted successfully.",
                state: "success"
            });
        }
    })
})

router.put('/update/folder/:id',function(req,res){
    Folder.findOne({_id:req.body.folder_Id},function(err,folder){
        if(err){
            res.send ({
                status: 500,
                message: "Something went wrong.Looking into it.",
                state: "error"
            });
        }
        if(!folder){
            res.send ({
                status: 201,
                message: "Folder not found.",
                state: "failure"
            });
        }
        if(folder){
            folder.folder_name=req.body.folder_name;
            folder.save(function(err,folder){
                if(err){
                    res.send ({
                        status: 500,
                        message: "Something went wrong.Looking into it.",
                        state: "error"
                    });
                }
                else{
                    res.send ({
                        status: 200,
                        message: "Folder deleted successfully.",
                        state: "success",
                        folder:folder
                    });
                }
            })
        }
    })
})

router.post('/test',cpUpload,function(req,res){
    Library.find({},function(err,lib){
        var file = {};
        console.log("req.file",req.files.test_file);
        file=req.files.test_file;
            for(var i=0;i<file.length;i++){
                file.path = file[i].location;
                file.key = file[i].key;
            }
            res.send({
                state:'success',
                message:"file uploaded successfully !",
                files_list:file
            });
    })
});

module.exports = router;