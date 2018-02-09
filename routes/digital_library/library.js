var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var path = require('path');
var multer  = require('multer');
var Franchisee = mongoose.model('Franchisee');
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

router.put('/upload_file',upload.single('upload_file'),function(req,res){
    res.send({
        state:'failure',
                message:'Data not found.'
    });
    Library.find({},function(err,lib){
        if(err){
            return res.send(err);
        }
        if(!lib){
            res.send({
                state:'failure',
                message:'Data not found.'
            });
        }
        if(lib){
            if(req.file){
                var profile_pic = {};
                profile_pic.path = req.file.location;
                profile_pic.key = req.file.key;
                lib.franchisee_pic = profile_pic;
            }
            lib.save(function(err,audience){
                if(err){
                    return res.send(err);
                }
                else{
                    res.send({
                        state:'success',
                        message:"uploaded"
                    });
                }
            });
        }
    });
})

module.exports = router;