var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Versions = mongoose.model('Versions');
router.post('/create_version', function(req, res){
  try {
    Versions.findOne({'franchisor_id':req.body.franchisor_id,
      'version_type': req.body.version_type,
      'version_name': {$regex: new RegExp(req.body.version_name,'i')}
    }, function(err, version){
      if(err){
        return res.send({
            state: "failure",
            message: err
        }, 500);
      }
      if(version){
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
        version.bussiness_type_id = req.body.bussiness_type_id;
        version.released_on = new Date();
        version.default = req.body.default;
        version.save(function(err, version){
          if(version){
            return res.send({
                state: "success",
                message: "Version created succssfully!"
            }, 200);
          }
        })

      }
    })
  } catch (err){
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})
router.get('/get_versions/:version_type/:franchisor_id', function(req, res){
  try {
    Versions.find({version_type: req.params.version_type, franchisor_id: req.params.franchisor_id}, function(err, versions){
      if(err){
        return res.send({
            state: "failure",
            message: err
        }, 500);
      }
      if(versions){
        return res.send({
            state: "success",
            data: versions
        }, 200);
      }

    })
  } catch (err){
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})
//to get the versions of KYC files based on businesss type id and version type
router.get('/get_versions_of_kyc_files/:bussiness_type_id/:franchisor_id', function(req, res){
  try {
    Versions.find({bussiness_type_id: req.params.bussiness_type_id, franchisor_id: req.params.franchisor_id}, function(err, versions){
      if(err){
        return res.send({
            state: "failure",
            message: err
        }, 500);
      }
      if(versions){
        return res.send({
            state: "success",
            data: versions
        }, 200);
      }

    })
  } catch (err){
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})
router.put('/make_version_default/:version_id/:version_type', function(req, res){
  try{
    Versions.updateMany({version_type: req.params.version_type}, {$set: {'default': false}},{'multi':true}, function(err, versions){
      if(err){
          return res.send({
              state: "failure",
              message: err
          }, 500);
        }
        if(versions){
          Versions.update({_id: req.params.version_id}, {$set: {'default': true}}, function(err, version){
            if(err){
                return res.send({
                    state: "failure",
                    message: err
                }, 500);
              }
              if(version){
                return res.send({
                    state: "success",
                    message: "Success!"
                }, 200);
              }
        })
      }
    })
} catch (err){
  return res.send({
    state: "failure",
    message: err
  }, 500);
}
})
router.put('/make_version_default_for_setup/:version_id/:department_id/:version_type', function(req, res){
  try{
    Versions.updateMany({department_id: req.params.department_id}, {$set: {'default': false}},{'multi':true}, function(err, versions){
      if(err){
          return res.send({
              state: "failure",
              message: err
          }, 500);
        }
        console.log(versions);
        if(versions){
          Versions.update({_id: req.params.version_id}, {$set: {'default': true}}, function(err, version){
            if(err){
                return res.send({
                    state: "failure",
                    message: err
                }, 500);
              }
              if(version){
                return res.send({
                    state: "success",
                    message: "Success!"
                }, 200);
              }
        })
      }
    })
} catch (err){
  return res.send({
    state: "failure",
    message: err
  }, 500);
}
})
router.get('/get_version_by_id/:version_id', function(req, res){
  try {
    Versions.findById({_id: req.params.version_id}, function(err, version){
      if(err){
        return res.send({
            state: "failure",
            message: err
        }, 500);
      }
      if(version){
        return res.send({
            state: "success",
            data: version
        }, 200);
      }

    })
  } catch (err){
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})
router.delete('/delete_version/:version_id', function(req, res){
  try {
    Versions.findByIdAndRemove({_id: req.params.version_id}, function(err, version){
      if(err){
        return res.send({
            state: "failure",
            message: err
        }, 500);
      }
      else{
        return res.send({
            state: "success",
            message: "Version deleted successfully!"
        }, 200);
      }

    })
  } catch (err){
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})
router.delete('/delete_version/:version_id', function(req, res){
  try {
    Versions.findByIdAndRemove({_id: req.params.version_id}, function(err, version){
      if(err){
        return res.send({
            state: "failure",
            message: err
        }, 500);
      }
      else{
        return res.send({
            state: "success",
            message: "Version deleted successfully!"
        }, 200);
      }

    })
  } catch (err){
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})
router.put('/edit_version', function(req, res){
  try {
    Versions.findOne({version_name:{$regex: new RegExp (req.body.version_name,'i')}}, function(err, version){
      if(err){
        return res.send({
            state: "failure",
            message: err
        }, 500);
      }
      if(version){
        return res.send({
            state: "failure",
            message: "Name already exists!"
        }, 200);
      }
      if(!version){
        let data ={};
        data.version_name = req.body.version_name;
        data.version_description = req.body.version_description;
        data.version_type = req.body.version_type;
        data.franchisor_id = req.body.franchisor_id;
        data.default = req.body.default;
        Versions.findByIdAndUpdate(req.body._id, data, {new: true} ,function(err, version){
          if(err){
            return res.send({
                state: 'err',
                message: 'Something went wrong'
            }, 500);
          }
          else{
            return res.send({
                state: "success",
                message: "Version updated succssfully!",
                data: version
            }, 200);
          }
        })
      }

    })
  } catch (err){
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})
module.exports = router;
