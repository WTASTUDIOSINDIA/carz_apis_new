var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var path = require('path');
var multer  = require('multer');
var Franchisee = mongoose.model('Franchisee');
var Library = mongoose.model('Library');
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
        bucket:'carzwta',
        contentType: multerS3.AUTO_CONTENT_TYPE || 'application/octet-stream',
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
            var file = {};
            file.path = req.file.location;
            file.key = req.file.key;
            file.file_name = req.file.originalname;
            file.created_date = req.file.created_date;
            library.franchisee_Id = file_details.franchisee_Id;
            library.folder_Id = file_details.folder_Id;
            library.files.push(file);
            library.save(function(err,lib){
                if(err){
                    return res.send(err);
                }
                else{
                    res.send({
                        state:'success',
                        message:"file uploaded successfully !",
                        files_list:lib
                    });
                }
            });
        }
    });
});

router.post('/test',upload.single('test_file'),function(req,res){
    Library.find({},function(err,lib){
        var file = {};
            file.path = req.file.location;
            file.key = req.file.key;
            res.send({
                        state:'success',
                        message:"file uploaded successfully !",
                        files_list:file
                    });
    })
});

module.exports = router;