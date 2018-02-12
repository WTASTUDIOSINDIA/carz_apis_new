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
        bucket:'carztest',
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

router.post('/upload_file',upload.single('file_upload'),function(req,res){
    var file_details = JSON.parse(req.body.file_details);
    Library.findOne({'folder_Id':file_details.folder_Id,'franchisee_Id':file_details.franchisee_Id},function(err,lib){
        if(err){
            return res.send(err);
        }
        else{
            var library = new Library();
            library.file_name = req.file.originalname;
            library.path = req.file.location;
            library.key = req.file.key;
            library.uploaded_status = req.file.uploaded_status;
            library.date_uploaded = Date.now();
            library.franchisee_Id = file_details.franchisee_Id;
            library.folder_Id = file_details.folder_Id;
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
            var params = {Bucket: 'carztest', Key : req.body.key};
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

router.get('/get_common_files',function(req,res){
    Library.findOne({uploaded_status:0},function(err,file){
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
    console.log('req.body', req.body);
    Folder.findOne({franchisee_Id:req.body.franchisee_id,folder_name:req.body.folder_name},function(err,folder){
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
var cpUpload = upload.fields([{ name: 'test_file', maxCount: 20 }, { name: 'imgFields', maxCount: 20 }])
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