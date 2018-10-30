
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var Partner = mongoose.model('Partner');
var SetupTask = mongoose.model('SetupTask');
var SetupDepartment = mongoose.model('SetupDepartment');
var UserAnswersOfTask = mongoose.model('UserAnswersOfTask');
var UserSpecificChecklist = mongoose.model('UserSpecificChecklist');
var SetupChecklist = mongoose.model('SetupChecklist');
var Versions = mongoose.model('Versions');
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
router.post('/create_setup_department', function (req, res) {
  try {
    SetupDepartment.findOne({ 'setup_department_name_EN': { $regex: new RegExp(req.body.setup_department_name_EN, 'i') }, franchisor_id: req.body.franchisor_id }, function (err, department) {
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

// To update setup department
router.put('/update_setup_department', function (req, res) {
  try {
    SetupDepartment.findOne({ setup_department_name_EN: { $regex: new RegExp(req.body.setup_department_name_EN, 'i') } }, function (err, department) {
      if (err) {
        return res.send({
          state: "err",
          message: "Something went wrong.We are looking into it.",
          data: err
        }, 500);
      }
      if (department) {
        res.send({
          state: "failure",
          message: "Department name already exists!"
        }, 201);
      }
      if (!department) {
        let data = {};
        data.setup_department_name_EN = req.body.setup_department_name_EN;
        data.franchisor_id = req.body.franchisor_id;
        SetupDepartment.findByIdAndUpdate(req.body._id, data, { new: true }, function (err, dep) {

          if (dep) {
            res.send({
              state: "success",
              message: "Department Updated.",
              data: department
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


//To create setup checklist
router.post('/create_setup_checklist', function (req, res) {
  try {
    SetupChecklist.findOne({ setup_checklist_name_EN: { $regex: new RegExp(req.body.setup_checklist_name_EN, 'i') }, setup_department_id: req.body.setup_department_id, version_id: req.body.version_id }, function (err, checklist) {
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
        checklist.version_id = req.body.version_id;
        checklist.franchisor_id = req.body.franchisor_id;
        checklist.save(function (err, checklist) {
          if (err) {
            res.send({
              state: "failure",
              message: "Something went wrong."
            }, 500);
          }
          else {
            SetupDepartment.findById({ _id: req.body.setup_department_id }, function (err, department) {
              console.log(department, "116");
              department.tasks_length = department.tasks_length + 1;
              department.save(function (err, department) {
                console.log(department, "119");
              })
            })
            res.send({
              state: "success",
              data: checklist,
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

// To get department by id
router.get('/get_setup_department_by_id/:id', function (req, res) {
  try {
    SetupDepartment.find({ _id: req.params.id }, function (err, departments) {
      if (err) {
        return res.send(500, err);
      }
      if (!departments) {
        res.send({
          message: "Departments not found",
          state: "failure",
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
//To delete department by id
router.delete('/delete_department/:franchisor_id/:department_id', function (req, res) {
  try {
    SetupDepartment.findByIdAndRemove({ _id: req.params.franchisor_id, _id: req.params.department_id }, function (err, departments) {
      if (err) {
        return res.send(500, err);
      }
      if (!departments) {
        res.send({
          state: 'failure',
          message: 'No departments found'
        }, 400)
      }
      else {
        res.send({
          state: 'success',
          message: 'Department deleted'
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
// To get checklist by id
router.get('/get_setup_checklists/:department_id', function (req, res) {
  try {
    Versions.findOne({ 'department_id': req.params.department_id, 'default': true }, function (err, version) {
      if (err) {
        return res.send(err);
      }
      if (!version) {
        return res.send({
          state: 'failure',
          message: "Versions not found"
        }, 400);
      }
      if (version) {
        console.log(version, "version data");
        // return res.send({
        //   state: 'success',
        //   data: versions
        // },200);
        SetupChecklist.find({ version_id: version._id, setup_department_id: req.params.department_id }, function (err, checklist) {
          if (err) {
            return res.send({
              state: 'error',
              message: err
            }, 500);
          }
          if (!checklist) {
            return res.send({
              state: 'failure',
              message: 'No checklist found'
            }, 200)
          }
          if (checklist) {
            return res.send({
              state: 'success',
              data: checklist
            })
          }
        })
      } //end if

    })

  }
  catch (err) {
    return res.send({
      state: 'error',
      message: err
    })
  }
})

// To get setup checklist by version id
router.get('/get_setup_checklist_version_id/:version_id', function (req, res) {
  SetupChecklist.find({ 'version_id': req.params.version_id }, function (err, checklist) {
    if (err) {
      return res.send(err);
    }
    if (checklist.length == 0) {
      return res.send({
        state: 'failure',
        message: "Versions not found"
      }, 400);
    }
    if (checklist.length > 0) {
      return res.send({
        state: 'success',
        data: checklist
      }, 200);
    }
  })
})


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
        }, 201);
      }
      else {
        console.log(checklist, "216");
        SetupDepartment.findById({ _id: checklist.setup_department_id }, function (err, department) {
          console.log(department, "218");
          department.tasks_length = department.tasks_length - 1;
          department.save(function (err, department) {
            console.log(department, "221");
          })
        })
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

router.delete('/delete_checklists', function (req, res) {
  try {
    SetupChecklist.remove({}, function (err, checklist) {
      if (err) {
        return res.send(500, err);
      }
      if (!checklist) {
        res.send({
          status: 400,
          message: "Failed to delete",
          data: "checklist"
        }, 400);
      }
      else {
        res.send({
          message: "Checklists deleted sucessfully",
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
        }, 200);
      }
      else {
        // console.log(task);
        task = new SetupTask();
        task.task_name = checklistTaskForm.task_name_EN;
        task.task_name_EN = checklistTaskForm.task_name_EN;
        task.task_radio_options = checklistTaskForm.task_radio_options;
        task.task_type = checklistTaskForm.task_type;
        task.task_due_date = checklistTaskForm.task_due_date;
        task.franchisee_file_upload_required = checklistTaskForm.franchisee_file_upload_required;
        task.setup_checklist_id = checklistTaskForm.setup_checklist_id;
        if (req.file) {
          // console.log(req.file);
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
            SetupChecklist.findById({ _id: checklistTaskForm.setup_checklist_id }, function (err, checklist) {
              console.log(checklist, "295");
              checklist.tasks_length = checklist.tasks_length + 1;
              checklist.save(function (err, checklist) {
                console.log(checklist, "298");
              })
            })
            res.send({
              state: "success",
              message: "Task created successfully",
              data: task
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
        console.log(task, "361");
        SetupChecklist.findById({ _id: task.setup_checklist_id }, function (err, checklist) {
          console.log(checklist, "295");
          checklist.tasks_length = checklist.tasks_length - 1;
          checklist.save(function (err, checklist) {
            console.log(checklist, "298");
          })
        })
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
router.put('/edit_setup_checklist', function (req, res) {
  try {
    SetupChecklist.findById({ _id: req.body._id }, function (err, checklist) {
      if (err) {
        return res.send({
          state: "err",
          message: "Something went wrong. We are looking into it."
        }, 500);
      }
      if (!checklist) {
        res.send({
          state: "failure",
          message: "No checklists found"
        }, 201);
      }
      if (checklist) {
        if (checklist.setup_checklist_name_EN == req.body.setup_checklist_name_EN) {
          checklist.setup_checklist_name = req.body.setup_checklist_name_EN;
          checklist.setup_checklist_name_EN = req.body.setup_checklist_name_EN;
          checklist.visible_to = req.body.visible_to;
          checklist.setup_department_id = req.body.setup_department_id;
          checklist.created_at = Date.now();
          checklist.save(function (err, checklist) {
            res.send({
              state: "success",
              message: "Setup checklist updated"
            }, 200);
          })

        }
        else {
          SetupChecklist.find({ setup_checklist_name_EN: { $regex: new RegExp(req.body.setup_checklist_name_EN, 'i') } }, function (err, check_name) {
            if (err) {
              return res.send({
                state: "err",
                message: "Something went wrong. We are looking into it."
              }, 500);
            }
            if (check_name.length != 0) {
              res.send({
                state: "failure",
                message: "Name already  exists"
              }, 201);
            }
            else {
              checklist.setup_checklist_name = req.body.setup_checklist_name_EN;
              checklist.setup_checklist_name_EN = req.body.setup_checklist_name_EN;
              checklist.visible_to = req.body.visible_to;
              checklist.setup_department_id = req.body.setup_department_id;
              checklist.created_at = Date.now();
              checklist.save(function (err, checklist) {
                res.send({
                  state: "success",
                  message: "Setup checklist updated"
                }, 200);
              })
            }
          })

        }

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


router.put('/edit_setup_checklists_tasks', upload.single('checklist_task_img'), function (req, res) {
  var checklistTaskEditForm = JSON.parse(req.body.task);
  console.log(checklistTaskEditForm);
  try {
    SetupTask.findById({ _id: checklistTaskEditForm.task_id }, function (err, task) {
      if (err) {
        return res.send({
          state: "err",
          message: "Something went wrong.We are looking into it."
        }, 500);
      }
      if (task) {
        task.task_name = checklistTaskEditForm.task_name_EN;
        task.task_name_EN = checklistTaskEditForm.task_name_EN;
        task.task_radio_options = checklistTaskEditForm.task_radio_options;
        task.task_type = checklistTaskEditForm.task_type;
        task.task_due_date = checklistTaskEditForm.task_due_date;
        task.franchisee_file_upload_required = checklistTaskEditForm.franchisee_file_upload_required;
        task.setup_checklist_id = checklistTaskEditForm.setup_checklist_id;
        if (req.file) {
          console.log(req.file);
          var checklist_task_img = {};
          task.franchisor_task_file_attachment_file_url = req.file.location;
          task.franchisor_task_file_attachment_file_name = req.file.key;
          task.franchisor_task_file_attachment_file_type = req.file.contentType;
        }
        task.save(function (err, task) {
          if (err) {
            res.send({
              state: "err",
              message: "Something went wrong."
            }, 500);
          }
          else {
            res.send({
              state: "success",
              message: "Task Updated."
            }, 200);
          }
        });
      }
      if (!task) {
        res.send({
          state: "failure",
          message: "Failed to update"
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
})

var fileupload = upload.fields([{
  name: 'file_upload',
  maxCount: 50
}, {
  name: 'imgFields',
  maxCount: 20
}])

// To upload files
router.post('/upload_setup_checklist_task_file', fileupload, function (req, res) {
  var file_details = JSON.parse(req.body.file_details);
  console.log(req.body.file_details);
  var files = [];
  SetupTask.find({}, function (err, setupTask) {
    if (err) {
      return res.send(err);
    }
    else {
      var file = [];
      var getNumber = 0;
      var length = req.files.file_upload.length;
      file = req.files.file_upload;
      for (var i = 0; i < file.length; i++) {
        var document = new SetupTask();
        document.link = file[i].location;
        document.key = file[i].key;
        document.file_name = file[i].originalname;
        // document.files_type = "doc";
        if (file[i].mimetype == "application/pdf") {
          document.file_type = "pdf";
        }
        if (file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i] == "image/jpeg") {
          files.file_type = "image";
        }
        document.date_uploaded = Date.now();
        document.checklist_id = file_details.checklist_id;
        files.push(document);
      }
      for (var i = 0; i < files.length; i++) {
        getNumber = getNumber + 1;
        files[i].save(function (err, files) {
          if (err) {
            return res.send(err);
          }
          else {
            if (parseInt(length) == parseInt(getNumber)) {
              res.send({
                status: "success",
                message: "File uploaded"
              }, 200);
            }
          }
        })
      }
    }
  });
});

router.get('/get_setup_checklist_task_file/:id', function (req, res) {
  SetupTask.find({ task_id: req.params.id }, function (err, file) {
    if (err) {
      return res.send(err);
    }
    if (file.length == 0) {
      return res.send({
        status: 'failure',
        message: "file not found!"
      }, 400);
    }
    if (file.length > 0) {
      return res.send({
        status: 'success',
        files: file
      }, 200);
    }
  })
})

router.post('/complete_task_checklist', upload.single('task_file'), function (req, res) {
  console.log(req.body.task);
  var completeTask = JSON.parse(req.body.task);
  UserAnswersOfTask.findOne({ 'task_id': completeTask.task_id }, function (err, task) {
    console.log('completeTask', completeTask);
    if (!task) {
      task = new UserAnswersOfTask();
    }

    task.task_id = completeTask.task_id;
    task.task_status = completeTask.task_status;
    task.task_answer = completeTask.task_answer;
    task.setup_checklist_id = completeTask.setup_checklist_id;
    task.franchisee_id = completeTask.franchisee_id;
    task.setup_department_id = completeTask.setup_department_id;
    task.completed_at = new Date();
    if (req.file) {
      var task_file = {};
      task.task_franchisee_submitted_file_url = req.file.location;
      task.task_franchisee_submitted_file_name = req.file.key;
      task.task_franchisee_submitted_file_type = req.file.contentType;
    }
    console.log('task', task);
    task.save(function (err, task) {
      console.log('task651', task);
      if (err) {
        return res.send({
          status: 'error',
          data: data
        }, 400);
      }

      else {
        console.log('task652', task);
        if (task.task_status == true) {
          console.log(req.body);
          saveUserSpecifiedChecklist(task);


        }
        return res.send({
          status: 'success',
          message: 'Task completed successfully',
          data: task
        }, 200);
      }
    })

  })
});
function saveUserSpecifiedChecklist(data) {
  UserSpecificChecklist.findOne({ setup_checklist_id: data.setup_checklist_id, franchisee_id: data.franchisee_id, setup_department_id: data.setup_department_id }, function (err, checklist) {
    if (!checklist) {
      userSpecificChecklist = new UserSpecificChecklist();
      console.log(data, "667");
      userSpecificChecklist.completed_task_length = 1;
      userSpecificChecklist.setup_checklist_id = data.setup_checklist_id;
      userSpecificChecklist.franchisee_id = data.franchisee_id;
      userSpecificChecklist.setup_department_id = data.setup_department_id;
      console.log(data.task, "672");
      userSpecificChecklist.save(function (err, userSpecificChecklist23) {
        console.log(userSpecificChecklist23);
      })
    }
    if (checklist) {
      checklist.completed_task_length = checklist.completed_task_length + 1;
      checklist.setup_checklist_id = data.setup_checklist_id;
      checklist.franchisee_id = data.franchisee_id;
      checklist.setup_department_id = data.setup_department_id;

      checklist.save(function (err, userSpecificChecklist23) {
        console.log(userSpecificChecklist23);
      })
    }
  })

}
router.get('/get_completed_tasks/:checklist_id/:franchisee_id', function (req, res) {
  UserAnswersOfTask.find({ setup_checklist_id: req.params.checklist_id, franchisee_id: req.params.franchisee_id }, function (err, tasks) {
    if (err) {
      return res.send(err);
    }
    if (tasks.length == 0) {
      return res.send({
        status: 'failure',
        message: "No tasks are completed!"
      }, 400);
    }
    if (tasks.length > 0) {
      return res.send({
        status: 'success',
        data: tasks
      }, 200);
    }
  })
})
router.delete('/delete_completed_tasks', function (req, res) {
  UserAnswersOfTask.remove({}, function (err, tasks) {
    return res.send({
      status: 'success',
      message: 'Tasks deleted successfully!'
    }, 200);
  })
})

router.get('/get_user_updated_checklist_list/:setup_department_id/:franchisee_id', function (req, res) {
  UserSpecificChecklist.find({ setup_department_id: req.params.setup_department_id, franchisee_id: req.params.franchisee_id }, function (err, userSpecificChecklist) {
    if (err) {
      return res.send(err);
    }
    console.log(userSpecificChecklist, "726");
    if (!userSpecificChecklist) {
      return res.send({
        status: 'failure',
        message: "Checklist not found"
      }, 400);
    }
    if (userSpecificChecklist.length > 0) {
      return res.send({
        status: 'success',
        data: userSpecificChecklist
      }, 200);
    }
  })
})

// To create versions by department
router.post('/create_version_by_department_id', function (req, res) {
  try {
    Versions.findOne({
      version_name: { $regex: new RegExp(req.body.version_name, 'i') }, 'franchisor_id': req.body.franchisor_id, 'version_type': req.body.version_type,
      'department_id': req.body.department_id
    }, function (err, version) {
      if (err) {
        return res.send({
          state: "error",
          message: err
        }, 500);
      }
      if (version) {
        return res.send({
          state: "failure",
          message: "This version already exists!"
        }, 200);
      }
      else {
        var version = new Versions();
        version.version_name = req.body.version_name;
        version.version_description = req.body.version_description;
        version.version_type = req.body.version_type;
        version.franchisor_id = req.body.franchisor_id;
        version.department_id = req.body.department_id;
        version.released_on = new Date();
        version.default = req.body.default;
        version.save(function (err, version) {
          if (version) {
            console.log(version.version_type)
            Versions.aggregate([
              { $match: { version_type: version.version_type } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ]).exec()
              .then((count) => {
                console.log(count, '////////////3323333')
                if (count[0].count === 1) {
                  Versions.findOneAndUpdate({ version_type: version.version_type }, { $set: { default: true } }, { new: true }).sort({ field: 'asc', _id: -1 }).exec((err, versions) => {
                    if (err) {
                      console.log(err, 'verions_err');
                    }
                    if (versions) {
                      console.log(versions, 'setup versions');
                    }
                  })
                }
                return res.send({
                  state: "success",
                  message: "Version created successfully!"
                }, 200);
              })
          }
        })
      }
    })
  } catch (err) {
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})

// get versions by department id
router.get('/get_versions_by_department_id/:department_id', function (req, res) {
  Versions.find({ 'department_id': req.params.department_id }, function (err, versions) {
    if (err) {
      return res.send(err);
    }
    if (versions.length == 0) {
      return res.send({
        state: 'failure',
        message: "Versions not found"
      }, 400);
    }
    if (versions.length > 0) {
      return res.send({
        state: 'success',
        data: versions
      }, 200);
    }
  })
})

// To edit versions
router.put('/edit_version', function (req, res) {
  try {
    Versions.findOne({ _id: req.body._id }, function (err, version) {
      if (err) {
        return res.send({
          state: "failure",
          message: err
        }, 500);
      }
      console.log(req.body, '+++++++++++++++++++++++++++')
      console.log(version, "=====");
      if (version) {
        return res.send({
          state: "failure",
          message: "This version already exists!"
        }, 200);
      }
      if (!version) {

        let data = {};

        data.version_name = req.body.version_name;
        data.version_description = req.body.version_description;
        data.version_type = req.body.version_type;
        data.franchisor_id = req.body.franchisor_id;
        data.default = req.body.default;
        console.log("----" + version);

        Versions.findByIdAndUpdate(req.body._id, data, { new: true }, function (err, ver) {
          if (ver) {
            return res.send({
              state: "success",
              message: "Version updated succssfully!"
            }, 200);
          }
        })

      }

    })
  } catch (err) {
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})


// delete version by department id
router.delete('/delete_version_by_department_id/:department_id', function (req, res) {
  Versions.findByIdAndRemove({ 'department_id': req.params.department_id }, function (err, versions) {
    if (err) {
      return res.send({
        state: 'error',
        message: 'Something went wrong'
      }, 500)
    }
    if (!versions) {
      res.send({
        state: 'failure',
        message: 'No version found'
      }, 400)
    }
    if (versions) {
      res.send({
        state: 'success',
        message: 'Version  deleted!'
      }, 200)
    }
  })
})
module.exports = router;
