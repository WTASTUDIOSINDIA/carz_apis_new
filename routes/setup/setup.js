
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');;
var multer = require('multer');
var path = require('path');
var Partner = mongoose.model('Partner');
var SetupTask = mongoose.model('SetupTask');
var SetupDepartment = mongoose.model('SetupDepartment');
var SetupChecklist = mongoose.model('SetupChecklist');
var Franchisee = mongoose.model('Franchisee');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var KycUploads = mongoose.model('KycUploads');
var bCrypt = require('bcrypt-nodejs');
var FranchiseeTypeList = mongoose.model('FranchiseeTypeList');
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
router.post('/create_setup_department', function (req, res) {
  try {
    SetupDepartment.findOne({ setup_department_name_EN: req.body.setup_department_name_EN, franchisor_id: req.body.franchisor_id }, function (err, department) {
      if (err) {
        res.send({
          state: "failure",
          message: "Something went wrong."
        }, 500);
      }
      if (department) {
        res.send({
          state: "failure",
          message: "This department name already exists."
        }, 200);
      }
      else {
        console.log(department);
        department = new SetupDepartment();
        department.setup_department_name_EN = req.body.setup_department_name_EN;
        department.franchisor_id = req.body.franchisor_id;
        department.save(function (err, department) {
          if (err) {
            res.send({
              state: "failure",
              message: "Something went wrong."
            }, 500);
          }
          else {
            res.send({
              state: "success",
              message: "Department created successfully"
            }, 200);
          }
        });
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

//To create setup checklist
router.post('/create_setup_checklist', function (req, res) {
  try {
    SetupChecklist.findOne({ setup_checklist_name: req.body.setup_checklist_name, setup_department_id: req.body.setup_department_id }, function (err, checklist) {
      if (err) {
        res.send({
          state: "failure",
          message: "Something went wrong."
        }, 500);
      }
      if (checklist) {
        res.send({
          state: "failure",
          message: "This checklist name already exists."
        }, 200);
      }
      else {
        console.log(checklist);
        checklist = new SetupChecklist();
        checklist.setup_checklist_name = req.body.setup_checklist_name_EN;
        checklist.setup_checklist_name_EN = req.body.setup_checklist_name_EN;
        checklist.visible_to = req.body.visible_to;
        checklist.created_at = new Date();
        checklist.setup_department_id = req.body.setup_department_id;
        checklist.save(function (err, checklist) {
          if (err) {
            res.send({
              state: "failure",
              message: "Something went wrong."
            }, 500);
          }
          else {
            res.send({
              state: "success",
              message: "Checklist created successfully"
            }, 200);
          }
        });
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
//To get setup departments by franchisor id
router.get('/get_setup_departments/:franchisor_id', function (req, res) {
  try {
    SetupDepartment.find({ franchisor_id: req.params.franchisor_id }, function (err, departments) {
      if (err) {
        return res.send(500, err);
      }
      if (!departments) {
        res.send({
          message: "Departments are not found",
          state: "failure",
          partner_list: []
        }, 201);
      }
      else {
        res.send({
          state: "success",
          data: departments
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

//To get setup checklists by department id
router.get('/get_setup_checklists/:department_id', function (req, res) {
  try {
    SetupChecklist.find({ setup_department_id: req.params.department_id }, function (err, checklists) {
      if (err) {
        return res.send(500, err);
      }
      if (checklists.length == 0) {
        res.send({
          message: "Checklists are not found",
          state: "failure",
          data: []
        }, 201);
      }
      else {
        res.send({
          state: "success",
          data: checklists
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


//To delete setup checklist by checklist id
router.delete('/delete_setup_checklist/:checklist_id', function (req, res) {
  try {
    SetupChecklist.findByIdAndRemove({ _id: req.params.checklist_id }, function (err, checklist) {
      if (err) {
        return res.send(500, err);
      }
      console.log(checklist);
      if (!checklist) {
        res.send({
          message: "Checklists  not found",
          state: "failure",
          partner_list: []
        }, 201);
      }
      else {
        res.send({
          state: "success",
          message: "Checklist deleted successfully!",
          data: checklist
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


//Create Task for checklists
router.post('/create_setup_checklist_task', upload.single('checklist_task_img'), function (req, res) {
  var checklistTaskForm = JSON.parse(req.body.task);
  // console.log(checklistTaskForm);
  try {
    SetupTask.findOne({ task_name: checklistTaskForm.task_name_EN, setup_checklist_id: checklistTaskForm.setup_checklist_id }, function (err, task) {
      if (err) {
        res.send({
          state: "failure",
          message: "Something went wrong."
        }, 500);
      }
      console.log(task);
      if (task) {
        res.send({
          state: "failure",
          message: "This task name already exists."
        }, 400);
      }
      else {
        console.log(task);
        task = new SetupTask();
        task.task_name = checklistTaskForm.task_name_EN;
        task.task_name_EN = checklistTaskForm.task_name_EN;
        task.task_radio_options = checklistTaskForm.task_radio_options;
        task.task_type = checklistTaskForm.task_type;
        task.franchisee_file_upload_required = checklistTaskForm.franchisee_file_upload_required;
        task.setup_checklist_id = checklistTaskForm.setup_checklist_id;
        if (req.file) {
          console.log(req.file);
          task.franchisor_task_file_attachment_file_url = req.file.location;
          task.franchisor_task_file_attachment_file_name = req.file.key;
          task.franchisor_task_file_attachment_file_type = req.file.contentType;
        }
        task.save(function (err, task) {


          if (err) {
            res.send({
              state: "failure",
              message: "Something went wrong."
            }, 500);
          }
          else {
            res.send({
              state: "success",
              message: "Checklist created successfully"
            }, 200);
          }
        });
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

//Get checklists task
router.get('/get_setup_checklists_tasks/:checklist_id', function (req, res) {
  try {
    SetupTask.find({ setup_checklist_id: req.params.checklist_id }, function (err, task) {
      if (err) {
        return res.send(500, err);
      }
      if (task.length == 0) {
        res.send({
          message: "Tasks are not found",
          state: "failure",
          data: []
        }, 201);
      }
      else {
        res.send({
          state: "success",
          data: task
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
router.delete('/delete_checklist_task/:task_id', function (req, res) {
  try {
    SetupTask.findByIdAndRemove({ _id: req.params.task_id }, function (err, task) {
      if (err) {
        return res.send(500, err);
      }

      if (!task) {
        res.send({
          message: "Task  not found",
          state: "failure",
        }, 201);
      }
      else {
        res.send({
          state: "success",
          message: "Task deleted successfully!",
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


//To edit setup checklists
router.put('/edit_setup_checklist', function(req, res) {
  try {
    SetupChecklist.findOne({_id: req.body._id}, function (err,checklist) {
      console.log(req.body);
      console.log(err);
      if(err) {
        return res.send({
            state:"err",
            message:"Something went wrong. We are looking into it."
        },500);
      }
      if(checklist){
        checklist.setup_checklist_name = req.body.setup_checklist_name_EN;
        checklist.setup_checklist_name_EN = req.body.setup_checklist_name_EN;
        checklist.visible_to = req.body.visible_to;
        checklist.setup_department_id = req.body.setup_department_id;
        checklist.created_at = Date.now();
        checklist.save(function (err, checklist){
          if(err){
            res.send({
              state:"err",
              message:"Something went wrong."
            },500);
          }
          else{
            res.send({
              state:"success",
              message:"Setup checklist updated."
            },200);
          }
        });
      }
      if(!checklist){
        res.send({
          state:"failure",
          message:"Failed to edit."
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

//To edit checklist tasks
// router.put('/edit_setup_checklists_tasks', function (req, res) {
//   try {
//     SetupTask.findOne({ task_id: req.params._id}, function (err, task) {
//       if(err){
//         return res.send({
//           state:"err",
//           message:"Something went wrong. We are looking into it"
//         },500);
//       }
//       if(task){
//         task.task_name = req.body.task_name_EN;
//         task.task_name_EN = req.body.task_name_EN;
//         task_task_radio_options = req.body.task_radio_options;
//         task.task_type = req.body.task_type;
//         task.franchisee_file_upload_required = req.body.franchisee_file_upload_required;
//         task.save(function (err, task){
//           if(err){
//             res.send({
//               state:"err",
//               message:"Something went wrong"
//             },500);
//           }
//           else{
//             res.send({
//               state:"success",
//               message:"Setup checklist task updated."
//             },200);
//           }
//         });
//       }
//       if(!task){
//         res.send({
//           state:"failure",
//           message: "Failed to edit."
//         },400);
//       }
//     })
//   }
//   catch(err){
//     return res.send({
//       state:"error",
//       message:err
//     });
//   }
// });


router.put('/edit_setup_checklists_tasks', upload.single('checklist_task_img'), function(req, res){
  var checklistTaskEditForm = JSON.parse(req.body.task);
  console.log(checklistTaskEditForm);
  try{
    SetupTask.findById({_id: checklistTaskEditForm.task_id},function(err,task){
  if(err){
    return res.send({
      state:"err",
      message:"Something went wrong.We are looking into it."
    },500);
  }
  if (task){
    task.task_name = checklistTaskEditForm.task_name_EN;
    task.task_name_EN = checklistTaskEditForm.task_name_EN;
    task.task_radio_options = checklistTaskEditForm.task_radio_options;
    task.task_type = checklistTaskEditForm.task_type;
    task.franchisee_file_upload_required = checklistTaskEditForm.franchisee_file_upload_required;
    task.setup_checklist_id = checklistTaskEditForm.setup_checklist_id;
    if (req.file) {
      console.log(req.file);
      var checklist_task_img = {};
      task.franchisor_task_file_attachment_file_url = req.file.location;
      task.franchisor_task_file_attachment_file_name = req.file.key;
      task.franchisor_task_file_attachment_file_type = req.file.contentType;
    }
    task.save(function(err, task){
      if(err){
        res.send({
           state:"err",
           message:"Something went wrong."
       },500);
      }
   else{
       res.send({
           state:"success",
           message:"Task Updated."
       },200);
   }
    });
  }
  if(!task){
    res.send({
        state:"failure",
        message:"Failed to update"
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
})

var fileupload = upload.fields([{
  name: 'file_upload',
  maxCount: 50
}, {
  name: 'imgFields',
  maxCount:20
}])

// To upload files
router.post('/upload_setup_checklist_task_file',  fileupload, function  (req,res){
  var file_details = JSON.parse(req.body.file_details);
  console.log(req.body.file_details);
  var files = [];
  SetupTask.find({},function(err, setupTask){
      if (err){
          return res.send(err);
      }
      else {
          var file = [];
          var getNumber = 0;
          var length = req.files.file_upload.length;
          file = req.files.file_upload;
          for (var i = 0; i < file.length; i++){
              var document = new SetupTask();
              document.link = file[i].location;
              document.key = file[i].key;
              document.file_name = file[i].originalname;
              document.files_type = "doc";
              if (file[i].mimetype == "application/pdf") {
                  document.file_type = "pdf";
              }
              if (file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i] == "image/jpeg"){
                  files.file_type = "image";
              }
              document.date_uploaded = Date.now();
              document.checklist_id = file_details.checklist_id;
              files.push(document);
          }
          for (var i = 0; i < files.length; i++){
              getNumber = getNumber + 1;
              files[i].save(function (err, files){
                  if (err) {
                      return res.send(err);
                  }
                  else {
                      if (parseInt(length)== parseInt(getNumber)) {
                          res.send({
                              status: "success",
                              message: "File uploaded"
                          },200);
                      }
                  }
              })
          }
      }
  });
});

router.get('/get_setup_checklist_task_file/:id', function (req, res) {
  SetupTask.find({task_id: req.params.id}, function (err, file) {
    if (err) {
      return res.send(err);
    }
    if (file.length == 0) {
      return res.send({
        status: 'failure',
        message: "file not found!"
      },400);
    }
    if (file.length > 0) {
      return res.send({
        status: 'success',
        files: file
      },200);
    }
  })
})

module.exports = router;
