var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multer = require('multer');
var AuditChecklist = mongoose.model('AuditChecklist');
var AuditChecklistType = mongoose.model('AuditChecklistType');
var AuditTask = mongoose.model('AuditTask');
var utils = require('../../common/utils');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
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
    maxCount:20
  }])

//   To create checklist type
router.post('/create_audit_checklist_type', utils.authenticated, function (req, res) {
    try {
      AuditChecklistType.findOne({ audit_checklist_type_name: {$regex: new RegExp(req.body.audit_checklist_type_name, 'i')}, franchisor_id: req.body.franchisor_id }, function (err, checklist_type) {
        if (err) {
          res.send({
            state: "failure",
            message: "Something went wrong."
          }, 500);
        }
        if (checklist_type) {
          res.send({
            state: "failure",
            message: "This checklist type name already exists."
          }, 201);
        }
        else {
          console.log(checklist_type);
          checklist_type = new AuditChecklistType();
          checklist_type.audit_checklist_type_name = req.body.audit_checklist_type_name;
          checklist_type.franchisor_id = req.body.franchisor_id;
          checklist_type.save(function (err, checklist_type) {
            if (err) {
              res.send({
                state: "failure",
                message: "Something went wrong."
              }, 500);
            }
            else {
              res.send({
                state: "success",
                message: "Checklist Type created successfully",
                data:checklist_type
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

//   to update checklist type name
router.put('/update_audit_checklist_type', function(req, res) {
  try {
    AuditChecklistType.findById({_id: req.body._id}, function (err,checklist_type) {
      if(err) {
        return res.send({
            state:"err",
            message:"Something went wrong. We are looking into it."
        },500);
      }
      if(!checklist_type){
        res.send({
          state:"failure",
          message:"No versions found"
        },201);
      }
      if(checklist_type){
       if(checklist_type.audit_checklist_type_name == req.body.audit_checklist_type_name){
        checklist_type.audit_checklist_type_name = req.body.audit_checklist_type_name;
        checklist_type.franchisor_id = req.body.franchisor_id;
            checklist_type.save(function (err, checklist_type){
            res.send({
              state:"success",
              message:"Checklist Type updated"
            },200);
          })
         
      }
      else{
        AuditChecklistType.find({audit_checklist_type_name: {$regex: new RegExp(req.body.audit_checklist_type_name, 'i')}}, function (err,audit_check_name) {
          if(err) {
            return res.send({
                state:"err",
                message:"Something went wrong. We are looking into it."
            },500);
          }
          if(audit_check_name == null || audit_check_name.length != 0){
            res.send({
              state:"failure",
              message:"Name already exists"
            },201);
          }
       else{
        checklist_type.audit_checklist_type_name = req.body.audit_checklist_type_name;
        checklist_type.franchisor_id = req.body.franchisor_id;
            checklist_type.save(function (err, checklist_type){
            res.send({
              state:"success",
              message:"Checklist Type updated"
            },200);
          })
        }
        })
       
      }
     
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
// to get checklist type by id
router.get('/get_audit_checklist_type_by_id/:checklist_type_id', function (req, res) {
    try {
      AuditChecklistType.find({ _id: req.params.checklist_type_id}, function (err, checklist_type) {
        if (err) {
          return res.send(500, err);
        }
        if (!checklist_type) {
          res.send({
            message: "Checklist type not found",
            state: "failure",
          }, 201);
        }
        else {
          res.send({
            state: "success",
            data: checklist_type
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

// To get all checklists types
router.get('/get_audit_all_checklist_types/:franchisor_id', function (req, res) {
    try {
      AuditChecklistType.find({ franchisor_id:req.params.franchisor_id}, function (err, audit_checklist) {
        if (err) {
          return res.send(500, err);
        }
        if (!audit_checklist) {
          res.send({
            message: "Checklists not found",
            state: "failure",
          }, 201);
        }
        else {
          res.send({
            state: "success",
            data: audit_checklist
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

//   TO delete checklist by id
router.delete('/delete_checklist_type/:checklist_type_id/:franchisor_id', function(req,res){
    try{
      AuditChecklistType.findByIdAndRemove({ _id:req.params.checklist_type_id, franchisor_id: req.params.franchisor_id}, function(err, checklist_type){
        if(err){
          return res.send(500, err);
        }
        if(!checklist_type){
          res.send({
            state:'failure',
            message:'No checkilist type found'
          },400)
        }
        else{
          res.send({
            state:'success',
            message:'Checklist type deleted'
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

//To delete all checklists
router.delete('/delete_all_checklists_types', function(req,res){
    try{
      AuditChecklistType.remove({ }, function(err, checklist_type){
        if(err){
          return res.send(500, err);
        }
        if(!checklist_type){
          res.send({
            state:'failure',
            message:'No checkilist type found'
          },400)
        }
        else{
          res.send({
            state:'success',
            message:'Checklist types deleted'
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

  router.get('/get_audit_checklist', function (req,res){
    try{
        AuditChecklist.find({}, function (err, auditChecklist){
            if(err){
               return res.send(500, err)
            }
            if(auditChecklist){
                res.send({
                    state:'success',
                    message:'Checklist exists!',
                    data:auditChecklist
                },200);
            }
            
        })
    }
    catch (err){
        return res.send({
            state:'error',
            message:err
        })
    }
})

// to crete audit checklist
router.post('/create_audit_checklist', utils.authenticated, function (req,res){
    try{
        AuditChecklist.findOne({audit_checklist_title: {$regex: new RegExp(req.body.audit_checklist_title, 'i')}, checklist_type_id: req.body.checklist_type_id}, function (err, auditChecklist){
            if(err){
               return res.send(500, err)
            }
            if(auditChecklist){
                res.send({
                    state:'failure',
                    message:'Checklist name already exists!'
                },200);
            }
            else{
                auditChecklist = new AuditChecklist();
                auditChecklist.audit_checklist_title = req.body.audit_checklist_title;
                auditChecklist.audit_checklist_type = req.body.audit_checklist_type;
                auditChecklist.audit_visible_to = req.body.audit_visible_to;
                auditChecklist.audit_description = req.body.audit_description;
                auditChecklist.created_at =req.body.created_at;
                auditChecklist.checklist_type_id = req.body.checklist_type_id;
                auditChecklist.franchisor_id = req.body.franchisor_id;
                auditChecklist.save(function (err, auditChecklist){
                    if(err){
                        res.send({
                            state:'failure',
                            message:'Something went wrong. We are looking into it.'
                        },500);
                    }
                    else{
                        res.send({
                            state:'success',
                            message:'Checklist created!',
                            data:auditChecklist
                        })
                    }
                })
            }
        })
    }
    catch (err){
        return res.send({
            state:'error',
            message:err
        })
    }
})

// To update checklist
router.put('/update_audit_checklist', function(req, res) {
  try {
    AuditChecklist.findById({_id:req.body._id}, function(err, audit_checklist){
      if(err) {
        return res.send({
            state:"err",
            message:"Something went wrong. We are looking into it."
        },500);
      }
      if(!audit_checklist){
        res.send({
          state:"failure",
          message:"No Checklists found"
        },201);
      }
      if(audit_checklist){
       if(audit_checklist.audit_checklist_title == req.body.audit_checklist_title){
        audit_checklist.audit_checklist_title = req.body.audit_checklist_title;
        // audit_checklist.audit_checklist_type = req.body.audit_checklist_type;
         audit_checklist.audit_visible_to = req.body.audit_visible_to;
         audit_checklist.created_at = req.body.created_at;
         audit_checklist.audit_description = req.body.audit_description;
         //audit_checklist.checklist_type_id = req.body.checklist_type_id;
         audit_checklist.save(function(err, audit_checklist){
            res.send({
              state:"success",
              message:"Checklist updated"
            },200);
          })
         
      }
      else{
        AuditChecklist.find({audit_checklist_title: {$regex: new RegExp(req.body.audit_checklist_title, 'i')}}, function (err,check_name) {
          if(err) {
            return res.send({
                state:"err",
                message:"Something went wrong. We are looking into it."
            },500);
          }
          if(check_name == null || check_name.length != 0){
            res.send({
              state:"failure",
              message:"Name already exists"
            },201);
          }
       else{
        audit_checklist.audit_checklist_title = req.body.audit_checklist_title;
        // audit_checklist.audit_checklist_type = req.body.audit_checklist_type;
         audit_checklist.audit_visible_to = req.body.audit_visible_to;
         audit_checklist.created_at = req.body.created_at;
         audit_checklist.audit_description = req.body.audit_description;
         //audit_checklist.checklist_type_id = req.body.checklist_type_id;
         audit_checklist.save(function (err, audit_checklist){
            res.send({
              state:"success",
              message:"Checklist updated"
            },200);
          })
        }
        })
       
      }
     
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

// to get checklist by id
router.get('/get_audit_checklist_by_id/:checklist_type_id', function (req, res) {
    try {
      AuditChecklist.find({ checklist_type_id: req.params.checklist_type_id }, function (err, audit_checklist) {
        if (err) {
          return res.send(500, err);
        }
        if (!audit_checklist) {
          res.send({
            message: "Checklist not found",
            state: "failure",
          }, 201);
        }
        else {
          res.send({
            state: "success",
            data: audit_checklist
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

// To get all checklists
router.get('/get_audit_all_checklists', utils.authenticated, function (req, res) {
    try {
      AuditChecklist.find({ }, function (err, audit_checklist) {
        if (err) {
          return res.send(500, err);
        }
        if (!audit_checklist) {
          res.send({
            message: "Checklists not found",
            state: "failure",
          }, 201);
        }
        else {
          res.send({
            state: "success",
            data: audit_checklist
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

//   TO delete checklist by id
router.delete('/delete_checklist/:checklist_id', function(req,res){
    try{
      AuditChecklist.findByIdAndRemove({ _id:req.params.checklist_id}, function(err, audit_checklist){
        if(err){
          return res.send(500, err);
        }
        if(!audit_checklist){
          res.send({
            state:'failure',
            message:'No checkilist found'
          },400)
        }
        else{
          res.send({
            state:'success',
            message:'Checklist deleted'
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

//To delete all checklists
router.delete('/delete_all_checklists', function(req,res){
    try{
      AuditChecklist.remove({ }, function(err, audit_checklist){
        if(err){
          return res.send(500, err);
        }
        if(!audit_checklist){
          res.send({
            state:'failure',
            message:'No checkilists found'
          },400)
        }
        else{
          res.send({
            state:'success',
            message:'Checklists deleted'
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

// To create task
router.post('/create_audit_checklist_task', upload.single('audit_checklist_task_img'),utils.authenticated, function (req, res) {
    var auditChecklistTaskForm = JSON.parse(req.body.task);
    
    try {
      AuditChecklist.findOne({_id:auditChecklistTaskForm.checklist_id}, function (err, checklist) {
        if (err) {
          res.send({
            state: "failure",
            message: "Something went wrong."
          }, 500);
        }
        if (checklist) {
          AuditTask.findOne({ audit_task_name: auditChecklistTaskForm.audit_task_name, checklist_id: auditChecklistTaskForm.checklist_id }, function (err, task) {
            if (err) {
              res.send({
                state: "failure",
                message: "Something went wrong."
              }, 500);
            }
            if (task) {
              res.send({
                state: "failure",
                message: "Task name already exists."
              }, 200);
            }
            else {
              task = new AuditTask();
              task.audit_task_name = auditChecklistTaskForm.audit_task_name;
              task.checklist_type = checklist.audit_checklist_type;
              task.audit_task_type = auditChecklistTaskForm.audit_task_type;
              task.audit_task_radio_options = auditChecklistTaskForm.audit_task_radio_options;
              task.audit_file_upload_required = auditChecklistTaskForm.audit_file_upload_required;
              task.checklist_id = auditChecklistTaskForm.checklist_id;
              if (req.file) {
                  var audit_checklist_task_img = {};
                task.audit_task_file_attachment_file_url = req.file.location;
                task.audit_task_file_attachment_file_name = req.file.key;
                task.audit_task_file_attachment_file_type = req.file.contentType;
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
                    message: "Task created!",
                    data: task
                  }, 200);
                }
              });
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

//  To update task
router.put('/update_audit_checklist_tasks', upload.single('audit_checklist_task_img'), function(req, res){
    var auditChecklistTaskEditForm = JSON.parse(req.body.task);
    console.log(auditChecklistTaskEditForm);
    try{
      AuditTask.findById({_id: auditChecklistTaskEditForm._id},function(err,task){
    if(err){
      return res.send({
        state:"err",
        message:"Something went wrong.We are looking into it."
      },500);
    }
    if (task){
        task.audit_task_name = auditChecklistTaskEditForm.audit_task_name;
        task.audit_task_type = auditChecklistTaskEditForm.audit_task_type;
        task.audit_task_radio_options = auditChecklistTaskEditForm.audit_task_radio_options;
        task.audit_file_upload_required = auditChecklistTaskEditForm.audit_file_upload_required;
        task.checklist_id = auditChecklistTaskEditForm.checklist_id;
      if (req.file) {
        console.log(req.file);
        var audit_checklist_task_img = {};
        task.audit_task_file_attachment_file_url = req.file.location;
        task.audit_task_file_attachment_file_name = req.file.key;
        task.audit_task_file_attachment_file_type = req.file.contentType;
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

// to get checklist tasks by checklist id
router.get('/get_audit_checklist_tasks/:checklist_id', function (req, res) {
    try {
      AuditTask.find({ checklist_id: req.params.checklist_id }, function (err, task) {
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

//   to get all tasks
router.get('/get_audit_checklist_tasks', function (req, res) {
    try {
      AuditTask.find({}, function (err, task) {
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

//   to delete task
router.delete('/delete_checklist_task/:task_id', function (req, res) {
    try {
      AuditTask.findByIdAndRemove({ _id: req.params.task_id }, function (err, task) {
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


module.exports = router;