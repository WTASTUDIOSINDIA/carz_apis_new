var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Versions = mongoose.model('Versions');
router.post('/create_version', function(req, res){
  try {
    Versions.findOne({'franchisor_id': req.body.franchisor_id,
      'version_type': req.body.version_type,
      'version_name': req.body.version_name
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
router.get('/get_versions', function(req, res){
  try {
    Versions.find({}, function(err, versions){
      if(err){
        return res.send({
            state: "failure",
            message: err
        }, 500);
      }
      if(versions){
        return res.send({
            state: "failure",
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
router.get('/get_version_by_id:version_id', function(req, res){
  try {
    Versions.find({}, function(err, versions){
      if(err){
        return res.send({
            state: "failure",
            message: err
        }, 500);
      }
      if(versions){
        return res.send({
            state: "failure",
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
module.exports = router;
