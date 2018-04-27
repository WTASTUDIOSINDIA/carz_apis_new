
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
        checklist.created_at = Date.now();
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
  var checklistTaskForm = JSON.stringify(req.body.task)
  try {
    SetupTask.findOne({ task_name: req.body.task_name, setup_checklist_id: req.body.setup_checklist_id }, function (err, task) {
      if (err) {
        res.send({
          state: "failure",
          message: "Something went wrong."
        }, 500);
      }
      if (task) {
        res.send({
          state: "failure",
          message: "This task name already exists."
        }, 200);
      }
      else {
        console.log(task);
        task = new SetupTask();
        task.setup_checklist_name = req.body.setup_checklist_name_EN;
        task.setup_checklist_name_EN = req.body.setup_checklist_name_EN;
        task.visible_to = req.body.visible_to;
        task.created_at = Date.now();
        task.task_radio_options = req.body.task_radio_options;
        task.task_type = req.body.task_type;
        task.setup_checklist_id = req.body.setup_checklist_id;
        if (req.file) {
          var checklist_task_img = {};
          checklist_task_img.path = req.file.location;
          checklist_task_img.key = req.file.key;
          task.checklist_task_img = checklist_task_img;
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
router.get('/get_setup_checklists_task/:checklist_id', function (req, res) {
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


module.exports = router;
