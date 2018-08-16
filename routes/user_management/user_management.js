var express = require('express');
var router = express.Router();
var multer = require('multer');
var mongoose = require('mongoose');
var UserManagement = mongoose.model('UserManagement');
var UserRole = mongoose.model('UserRole');
var Admin = mongoose.model('Admin');
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
      Admin.findOne({ franchisor_id:userCreateForm.franchisor_id }, function (err, user) {
        if (err) {
          res.send({
            state: "error",
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
          user = new Admin();
          user.user_name = userCreateForm.user_name;
          user.user_mail = userCreateForm.user_mail;
          user.user_role = userCreateForm.user_role;
          user.user_status = userCreateForm.user_status;
          user.user_phone_number = userCreateForm.user_phone_number;
          user.franchisor_id= userCreateForm.franchisor_id;
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
    console.log(userEditForm);
    var userEditForm = JSON.parse(req.body.user);
    try {
      Admin.findOne({ _id:userEditForm._id }, function (err, user) {
        if (err) {
          res.send({
            state: "error",
            message: "Something went wrong. We are looking into it."
          }, 500);
        }
        if (user) {
          user.user_name = userEditForm.user_name;
          user.user_mail = userEditForm.user_mail;
          user.user_role = userEditForm.user_role;
          user.user_status = userEditForm.user_status;
          user.user_phone_number = userEditForm.user_phone_number;
          user.franchisor_id = userEditForm.franchisor_id;
          if (req.file) {
            user.franchisor_user_file_link = req.file.location;
            user.franchisor_user_file_name = req.file.key;
            user.franchisor_user_file_type = req.file.contentType;
          }
          console.log(user)
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
      Admin.find({}, function (err, user){
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
// To get user by id
router.get('/get_user_by_id/:id', function (req,res){
  try{
    Admin.findById({_id:req.params.id}, function (err, user){
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
// to delete user
router.delete('/delete_user_by_id/:id', function (req, res) {
  try {
    Admin.findByIdAndRemove({ _id: req.params.id }, function (err, user) {
          if (err) {
              return res.send(500, err);
          }
          if (!user) {
              res.send({
                  message: "Unsucessfull",
                  state: "failure"
              }, 400);
          }
          else {
              res.send({
                  state: 'success',
                  message: "User deleted sucessfully",
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
// To create role
router.post('/create_role', function (req, res){
  try{
    UserRole.findOne({franchisor_id:req.body.franchisor_id},function (err, role){
      if(err){
        res.send({
          state:'error',
          message:'Something went wrong. We are looking into it.'
        },500)
      }
      // if(role){
      //   res.send({
      //     state: 'failure',
      //     message:'Role exists'
      //   },400)
      // }
      else{
        role = new UserRole(),
        role.user_role = req.body.user_role,
        role.user_status = req.body.user_status,
        role.franchisor_id = req.body.franchisor_id
        role.save(function (err, role) {
          if (err) {
            res.send({
              state: "failure",
              message: "Something went wrong."
            }, 500);
          }
          else {
            res.send({
              state: "success",
              message: "Role created"
            }, 200);
          }
        });
      }
    })
  }
  catch(err){
    return res.send({
          state: "error",
          message: err
        });   
  }
})

// To edit role
router.put('/update_role', function(req, res) {
  try {
    UserRole.findOne({_id: req.body._id}, function (err,role) {
      if(err) {
        return res.send({
            state:"err",
            message:"Something went wrong. We are looking into it."
        },500);
      }
      if(role){
        role.user_role = req.body.user_role,
        role.user_status = req.body.user_status,
        role.save(function (err, role){
          if(err){
            res.send({
              state:"err",
              message:"Something went wrong."
            },500);
          }
          else{
            res.send({
              state:"success",
              message:"Role updated."
            },200);
          }
        });
      }
      if(!role){
        res.send({
          state:"failure",
          message:"Failed to update."
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

// to get roles
router.get('/get_roles', function(req, res){
  try{
    UserRole.find({}, function(err, role){
      if(err){
        res.send({
          state:'error',
          message:'Something went wrong'
        },500)
      }
      if(role.length == 0){
        res.send({
          state:'failure',
          message:'Roles not found'
        },400)
      }
      if(role.length > 0){
        res.send({
          state:'success',
          data:role
        },200)
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

// to get roles by id
router.get('/get_roles_by_id/:id', function(req, res){
  UserRole.findById({_id:req.params.id}, function(err, role){
  if(err){
    res.send({
      state:'error',
      message:'Something went wrong'
    },500)
  }
  if(!role){
    res.send({
      state:'failure',
      message:'Failed'
    },400)
  }
  if(role){
    res.send({
      state:'success',
      data:role
    },200)
  }
})
})

// To delete role by id

router.delete('/delete_role_by_id/:id', function (req, res) {
  try {
    UserRole.findByIdAndRemove({ _id: req.params.id }, function (err, role) {
          if (err) {
              return res.send(500, err);
          }
          if (!role) {
              res.send({
                  message: "Unsucessfull",
                  state: "failure"
              }, 400);
          }
          else {
              res.send({
                  state: 'success',
                  message: "Role deleted sucessfully",
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
// to make franchisor notification hide 
// router.post('/make_notification_franchisor_count_hide', function(req,res){
//   Admin.findOne({'_id':req.body.user_id},function(err,user){
//       if(err){
//           return res.send({
//               state:"error",
//               message:err
//           },500);
//       }
//       if(user){
//           var user = new user();
//           user.seen_notification = true;
//           user.save(function(err,user){
         
//           if(err){
//               res.send({
//                   state:"err",
//                   message:"Something went wrong."
//               },500);

//           }
//           else {
//               res.send({
//                   state:"success",
//                   message:"Notification has been viewed",
//                   data: user
//               },200)
//           }
//       });
//       }
//   });
// })

router.post('/make_notification_franchisor_count_hide', function (req, res) {
 
    // try {
      Admin.findOne({ _id:req.body.user_id }, function (err, user) {
        if (err) {
          res.send({
            state: "error",
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
          user = new Admin();
          user.seen_notification = 1;
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
                message: "notification viewed",
                data:user
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

module.exports = router;