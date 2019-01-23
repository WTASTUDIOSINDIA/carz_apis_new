var express = require('express');
var router = express.Router();
var multer = require('multer');
var mongoose = require('mongoose');
var UserManagement = mongoose.model('UserManagement');
var UserRole = mongoose.model('UserRole');
var Admin = mongoose.model('Admin');
var _ = require('lodash');
var aws = require('aws-sdk');
var utils = require('../../common/utils');
var moment = require('moment');
var multerS3 = require('multer-s3');
var createHash = function (password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};
var bCrypt = require('bcrypt-nodejs');
aws.config.loadFromPath('./config.json');
aws.config.update({
  signatureVersion: 'v4'
});
var s0 = new aws.S3({})
var upload = multer({
  storage: multerS3({
    s3: s0,
    bucket: 'carzdev',
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
router.post('/create_user', utils.authenticated, function (req, res) {
  let userCreateForm = req.body;
  // try {
  Admin.findOne({ franchisor_id: userCreateForm.franchisor_id, user_mail: userCreateForm.user_mail, user_phone_number: userCreateForm.user_phone_number }, function (err, user) {
    if (err) {
      res.send({
        state: "error",
        message: "Something went wrong."
      }, 500);
    }
    if (user) {
      res.send({
        state: "failure",
        message: "This details already exists."
      }, 201);
    }
    else {
      user = new Admin();
      if (userCreateForm.user_img) {
        if (userCreateForm.user_img != "") {

          let fileExt = "";
          if (userCreateForm.user_img.indexOf("image/png") != -1)
            fileExt = "png";
          else if (userCreateForm.user_img.indexOf("image/jpeg") != -1)
            fileExt = "jpeg";
          else if (userCreateForm.user_img.indexOf("image/jpg") != -1)
            fileExt = "jpg";
          else
            fileExt = "png";

          let imageKey = "user_img/img_" + moment().unix();
          if (userCreateForm.user_img) {
            utils.uploadToS3(imageKey, fileExt, userCreateForm.user_img);
            delete userCreateForm.user_img;
          }
          userCreateForm.prof_pic_org_url = utils.awsFileUrl() + imageKey + "." + fileExt;
          userCreateForm.user_profile_pic = userCreateForm.prof_pic_org_url;


        } else {
          userCreateForm.user_profile_pic = utils.awsFileUrl() + "franchisee_img/fallout.png";
        }
      } else {
        userCreateForm.user_profile_pic = utils.awsFileUrl() + "franchisee_img/fallout.png";
      }
      user.user_pass = createHash(userCreateForm.user_pass);
      user.user_name = userCreateForm.user_name;
      user.user_mail = userCreateForm.user_mail;
      user.user_type_role = userCreateForm.user_type_role;
      user.user_status = userCreateForm.user_status;
      user.user_department - userCreateForm.user_department;
      user.user_country_code = userCreateForm.user_country_code;
      user.user_phone_number = userCreateForm.user_phone_number;
      user.user_profile_pic = userCreateForm.user_profile_pic;
      user.franchisor_id = userCreateForm.franchisor_id;
      // if (req.file) {
      //   user.user_file_link = req.file.location;
      //   user.user_file_name = req.file.key;
      //   user.user_file_type = req.file.contentType;
      // }
      user.save(function (err, user) {
        if (err) {
          res.send({
            state: "failure",
            message: "Something went wrong."
          }, 500);
        }
        else {
          let user_data = {};
          user_data.user_mail = user.user_mail;
          user_data.user_name = user.user_name;
          user_data.subject = 'User Created';
          user_data.html = "<p>Hi, " + user_data.user_name + "<br>" + "Your account has been created by the franchisor. Please login with your email, by clicking on " + "http://ec2-13-228-158-215.ap-southeast-1.compute.amazonaws.com/" + "<br>" + "Best," + "<br>" + "Carz.</p>"
          console.log(user_data,'user_data');
          utils.send_mail(user_data)
          console.log(user.user_phone_number, '+++++');
          utils.sendMobileOTPForUserManagement(user.user_phone_number); 
          // let messageData = {source:user.user_name, destination:'+91' + user.user_phone_number, text: 'messageText' };
          // utils.messages(messageData);
          res.send({
            state: "success",
            message: "User created",
            data: user
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

//validate user email
router.post('/validate_user_mail', function (req, res) {
  try {
    Admin.findOne({ 'user_mail': req.body.user_mail }, function (err, user) {
      if (err) {
        return res.send({
          state: "error",
          message: err
        }, 500);
      }
      if (user) {
        return res.send({
          state: "failure",
          message: "This email already exists!"
        }, 400);
      }
      else {
        return res.send({
          state: "success",
          message: "Success!"
        }, 200);
      }
    });
  }
  catch (err) {
    return res.send({
      state: "error",
      message: err
    }, 500);
  }
});


//validate user email
router.post('/validate_user_phone_number', function (req, res) {
  try {
    Admin.findOne({ 'user_phone_number': req.body.user_phone_number }, function (err, user) {
      if (err) {
        return res.send({
          state: "error",
          message: err
        }, 500);
      }
      if (user) {
        return res.send({
          state: "failure",
          message: "This number already exists!"
        }, 400);
      }
      else {
        return res.send({
          state: "success",
          message: "Success!"
        }, 200);
      }
    });
  }
  catch (err) {
    return res.send({
      state: "error",
      message: err
    }, 500);
  }
});


router.put('/update_user', function (req, res, next) {
  let userEditForm = req.body;
  // try {
  Admin.findOne({ '_id': userEditForm._id }, function (err, user) {
    if (err) {
      return res.send({
        state: "err",
        message: "Something went wrong.We are looking into it."
      }, 500);
    }
    if (user) {
      if (userEditForm.user_img) {
        if (userEditForm.user_img != "") {

          let fileExt = "";
          if (userEditForm.user_img.indexOf("image/png") != -1)
            fileExt = "png";
          else if (userEditForm.user_img.indexOf("image/jpeg") != -1)
            fileExt = "jpeg";
          else if (userEditForm.user_img.indexOf("image/jpg") != -1)
            fileExt = "jpg";
          else if (userEditForm.user_img.indexOf("video/mp4") != -1)
            fileExt = "mp4";
          else
            fileExt = "png";

          let imageKey = "user_img/img_" + moment().unix();
          if (userEditForm.user_img) {
            utils.uploadToS3(imageKey, fileExt, userEditForm.user_img);
            delete userEditForm.user_img;
          }
          userEditForm.prof_pic_org_url = utils.awsFileUrl() + imageKey + "." + fileExt;
          userEditForm.user_profile_pic = userEditForm.prof_pic_org_url;

        } else {
          userEditForm.user_profile_pic = utils.awsFileUrl() + "franchisee_img/fallout.png";
        }
      } else {
        userEditForm.user_profile_pic = utils.awsFileUrl() + "franchisee_img/fallout.png";
      }

      user.user_name = userEditForm.user_name;
      user.user_mail = userEditForm.user_mail;
      user.user_role = userEditForm.user_role;
      user.user_status = userEditForm.user_status;
      user.user_department = userEditForm.user_department;
      user.user_country_code = userEditForm.user_country_code;
      user.user_phone_number = userEditForm.user_phone_number;
      user.franchisor_id = userEditForm.franchisor_id;
      user.user_type_role = userEditForm.user_type_role;
      user.user_profile_pic = userEditForm.user_profile_pic;
      user.save(function (err, user) {
        if (err) {
          res.send({
            state: "err",
            message: "Something went wrong."
          }, 500);
        }
        else {
          res.send({
            state: "success",
            message: "User updated.",
            data: user
          }, 200);
        }
      });
    }
    if (!user) {
      res.send({
        state: "failure",
        message: "No users found."
      }, 201);
    }
  });
  // } catch (err) {
  //     return res.send({
  //         state: "error",
  //         message: err
  //     });
  // }
});

//   To get user
router.get('/get_user/:franchisor_id', function (req, res) {
  try {
    Admin.find({ franchisor_id: req.params.franchisor_id }, function (err, user) {
      if (err) {
        return res.send({
          state: 'error',
          message: err
        }, 500);
      }
      if (user.length == 0) {
        return res.send({
          state: 'failure',
          message: 'No users found'
        }, 200)
      }
      else {
        // let user_data = [];
        //     user.forEach((user_img)=>{
        //       user_img.profile_pic = utils.getPreSignedURL( user_img.profile_pic);
        //       user_data.push(user_img);
        //   })
        return res.send({
          state: 'success',
          data: user
        })
      }
    })
  }
  catch (err) {
    return res.send({
      state: 'error',
      message: err
    })
  }
})
// To get user by id
router.get('/get_user_by_id/:id', function (req, res) {
  try {
    Admin.findById({ _id: req.params.id }, function (err, user) {
      if (err) {
        return res.send({
          state: 'error',
          message: err
        }, 500);
      }
      if (!user) {
        return res.send({
          state: 'failure',
          message: 'No users found'
        }, 200)
      }
      if (user) {
        // let user_data = [];
        //   user.profile_pic = utils.getPreSignedURL( partner.profile_pic);
        //         user_data.push(user);
        return res.send({
          state: 'success',
          data: user
        })
      }
    })
  }
  catch (err) {
    return res.send({
      state: 'error',
      message: err
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
router.post('/create_role', function (req, res) {
  try {
    UserRole.findOne({ franchisor_id: req.body.franchisor_id }, function (err, role) {
      if (err) {
        res.send({
          state: 'error',
          message: 'Something went wrong. We are looking into it.'
        }, 500)
      }
      // if(role){
      //   res.send({
      //     state: 'failure',
      //     message:'Role exists'
      //   },400)
      // }
      else {
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
  catch (err) {
    return res.send({
      state: "error",
      message: err
    });
  }
})

// To edit role
router.put('/update_role', function (req, res) {
  try {
    UserRole.findOne({ _id: req.body._id }, function (err, role) {
      if (err) {
        return res.send({
          state: "err",
          message: "Something went wrong. We are looking into it."
        }, 500);
      }
      if (role) {
        role.user_role = req.body.user_role,
          role.user_status = req.body.user_status,
          role.save(function (err, role) {
            if (err) {
              res.send({
                state: "err",
                message: "Something went wrong."
              }, 500);
            }
            else {
              res.send({
                state: "success",
                message: "Role updated."
              }, 200);
            }
          });
      }
      if (!role) {
        res.send({
          state: "failure",
          message: "Failed to update."
        }, 400);
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

// to get roles
router.get('/get_roles', function (req, res) {
  try {
    UserRole.find({}, function (err, role) {
      if (err) {
        res.send({
          state: 'error',
          message: 'Something went wrong'
        }, 500)
      }
      if (role.length == 0) {
        res.send({
          state: 'failure',
          message: 'Roles not found'
        }, 400)
      }
      if (role.length > 0) {
        res.send({
          state: 'success',
          data: role
        }, 200)
      }
    })
  }
  catch (err) {
    return res.send({
      state: 'error',
      message: err
    })
  }
})

// to get roles by id
router.get('/get_roles_by_id/:id', function (req, res) {
  UserRole.findById({ _id: req.params.id }, function (err, role) {
    if (err) {
      res.send({
        state: 'error',
        message: 'Something went wrong'
      }, 500)
    }
    if (!role) {
      res.send({
        state: 'failure',
        message: 'Failed'
      }, 400)
    }
    if (role) {
      res.send({
        state: 'success',
        data: role
      }, 200)
    }
  })
})

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
  Admin.findOne({ _id: req.body.user_id }, function (err, user) {
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
            data: user
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