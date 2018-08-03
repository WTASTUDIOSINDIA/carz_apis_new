var express = require('express');
var router = express.Router();
var multer = require('multer');
var mongoose = require('mongoose');
var UserManagement = mongoose.model('UserManagement');
var _ = require('lodash');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var bCrypt = require('bcrypt-nodejs');
aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
});
var s0 = new aws.S3({})
var upload = multer({
    storage: multerS3({
        s3: s0,
        bucket: 'celebappfiles',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '.' + file.originalname)
        }
    })
});

var fileupload = upload.fields([{
    name: 'file_upload',
    maxCount: 50
}, {
    name: 'imgFields',
    maxCount: 20
}]) 
// To create user
router.post('/create_user', upload.single('user_img'), function (req, res) {
  console.log('user', req.body);
    var userCreateForm = JSON.parse(req.body.user);
 
    // try {
      UserManagement.findOne({ franchisor_id:userCreateForm.franchisor_id }, function (err, user) {
        if (err) {
          res.send({
            state: "failure",
            message: "Something went wrong."
          }, 500);
        }
        // if (user) {
        //   res.send({
        //     state: "failure",
        //     message: "This user already exists."
        //   }, 400);
        // }
        else {
          user = new UserManagement();
          user.user_name = userCreateForm.user_name;
          user.user_email = userCreateForm.user_email;
          user.user_role = userCreateForm.user_role;
          user.user_status = userCreateForm.user_status;
          if (req.file) {
            user.user_file_link = req.file.location;
            user.user_file_name = req.file.key;
            user.user_file_type = req.file.contentType;
          }
          user.save(function (err, user) {
            if (err) {
              res.send({
                state: "failure",
                message: "Something went wrong."
              }, 500);
            }
            else {
              res.send({
                state: "success",
                message: "User created"
              }, 200);
            }
          });
        }
      });
    // }
    // catch (err) {
    //   return res.send({
    //     state: "error",
    //     message: err
    //   });
    // }
  })

// To update user
  router.put('/update_user', upload.single('user_img'), function (req, res) {
    var userEditForm = JSON.parse(req.body.user);
    try {
      UserManagement.findOne({ user_id:userEditForm.id }, function (err, user) {
        if (err) {
          res.send({
            state: "failure",
            message: "Something went wrong. We are looking into it."
          }, 500);
        }
        if (user) {
          user.user_name = userEditForm.user_name;
          user.user_status = userEditForm.user_status;
          if (req.file) {
            user.franchisor_user_file_link = req.file.location;
            user.franchisor_user_file_name = req.file.key;
            user.franchisor_user_file_type = req.file.contentType;
          }
          user.save(function (err, user) {
            if (err) {
              res.send({
                state: "failure",
                message: "Something went wrong."
              }, 500);
            }
            else {
              res.send({
                state: "success",
                message: "User updated"
              }, 200);
            }
          });
          
        if (!user) {
            res.send({
              state: "failure",
              message: "User not found."
            }, 400);
          }
        }
      });
    }
    catch (err) {
      return res.send({
        state: "error",
        message: err
      });
    }
  })

//   To get user
router.get('/get_user', function (req,res){
    try{
        UserManagement.find({}, function (err, user){
            if(err){
                return res.send({
                    state:'error',
                    message:err
                },500);
            }
            if(user.length == 0){
                return res.send({
                    state:'failure',
                    message:'No users found'
                },200)
            }
            if(user.length > 0){
                return res.send({
                    state:'success',
                    data:user
                })
            }
        })
    }
    catch(err){
        return res.send({
            state:'error',
            message:err
        })
    }
})

router.get('/get_user_by_id/:id', function (req,res){
  try{
      UserManagement.findById({_id:req.params.id}, function (err, user){
          if(err){
              return res.send({
                  state:'error',
                  message:err
              },500);
          }
          if(!user){
              return res.send({
                  state:'failure',
                  message:'No users found'
              },200)
          }
          if(user){
              return res.send({
                  state:'success',
                  data:user
              })
          }
      })
  }
  catch(err){
      return res.send({
          state:'error',
          message:err
      })
  }
})

module.exports = router;