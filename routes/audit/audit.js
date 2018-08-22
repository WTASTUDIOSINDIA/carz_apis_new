var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multer = require('multer');
var AuditChecklist = mongoose.model('AuditChecklist');
var AuditChecklistType = mongoose.model('AuditChecklistType')
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


//   To create checklist type
router.post('/create_audit_checklist_type', function (req, res) {
    try {
      AuditChecklistType.findOne({ audit_checklist_type_name: req.body.audit_checklist_type_name, franchisor_id: req.body.franchisor_id }, function (err, checklist_type) {
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
          }, 200);
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
router.put('/update_audit_checklist_type', function (req,res){
    try{
        AuditChecklistType.findById({_id:req.body._id}, function(err, checklist_type){
            if(err){
                res.send(500);
            }
            if(checklist_type){
                checklist_type.audit_checklist_type_name = req.body.audit_checklist_type_name;
                checklist_type.franchisor_id = req.body.franchisor_id;
                checklist_type.save(function(err, checklist_type){
                    if(err){
                        res.send({
                            state:'err',
                            message:'Something went wrong. We are looking into it.'
                        },500);
                    }
                    else{
                        res.send({
                            state:'success',
                            message:'Checklist Type updated!',
                            data: checklist_type
                        },200);
                    }
                })
            }
            if(!checklist_type){
                res.send({
                    state:'failure',
                    message:'Failed to update!'
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

router.post('/create_audit_checklist', function (req,res){
    try{
        AuditChecklist.findOne({audit_checklist_title: req.body.audit_checklist_title, franchisor_id:req.body.franchisor_id}, function (err, auditChecklist){
            if(err){
                res.send(500)
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
router.put('/update_audit_checklist', function (req,res){
    try{
        AuditChecklist.findById({_id:req.body._id}, function(err, audit_checklist){
            if(err){
                res.send(500);
            }
            if(audit_checklist){
                audit_checklist.audit_checklist_title = req.body.audit_checklist_title;
                audit_checklist.audit_checklist_type = req.body.audit_checklist_type;
                audit_checklist.audit_visible_to = req.body.audit_visible_to;
                audit_checklist.audit_description = req.body.audit_description;
                audit_checklist.save(function(err, audit_checklist){
                    if(err){
                        res.send({
                            state:'err',
                            message:'Something went wrong. We are looking into it.'
                        },500);
                    }
                    else{
                        res.send({
                            state:'success',
                            message:'Checklist updated!',
                            data: audit_checklist
                        },200);
                    }
                })
            }
            if(!audit_checklist){
                res.send({
                    state:'failure',
                    message:'Failed to update!'
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

// to get checklist by id
router.get('/get_audit_checklist_by_id/:checklist_id', function (req, res) {
    try {
      AuditChecklist.find({ _id: req.params.checklist_id }, function (err, audit_checklist) {
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
router.get('/get_audit_all_checklists', function (req, res) {
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
router.delete('/delete_checklist/:checklist_id/:franchisor_id', function(req,res){
    try{
      AuditChecklist.findByIdAndRemove({ _id:req.params.checklist_id, franchisor_id: req.params.franchisor_id,}, function(err, audit_checklist){
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



module.exports = router;