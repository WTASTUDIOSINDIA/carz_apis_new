var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var utils = require('../../common/utils');
var Versions = mongoose.model('Versions');
router.post('/create_version', utils.authenticated, function (req, res) {
  try {
    Versions.findOne({
      'franchisor_id': req.body.franchisor_id,
      'version_type': req.body.version_type,
      'version_name': { $regex: new RegExp(req.body.version_name, 'i') }
    }, function (err, version) {
      if (err) {
        return res.send({
          state: "failure",
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
        version.bussiness_type_id = req.body.bussiness_type_id;
        version.released_on = new Date();
        if (req.body.default !== "") {
          version.default = req.body.default;
        }
        version.save(function (err, version) {
          if (err) {
            console.log(err, 'Create version error');
          }
          if (version) {
            var version_count;
            Versions.aggregate([
              { $match: { version_type: version.version_type } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ]).exec()
              .then((count) => {
                console.log(count[0].count, '////////////3323')
                version_count = count[0].count;
                if (count[0].count === 1) {
                  Versions.findOneAndUpdate({ version_type: version.version_type }, { $set: { default: true } }, { new: true }).sort({ field: 'asc', _id: -1 }).exec((err, versions) => {
                    if (err) {
                      console.log(err, 'verions_err');
                    }
                    if (versions) {
                      console.log(versions);
                    }
                  })
                }
                return res.send({
                  state: "success",
                  message: "Version created succssfully!"
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
router.get('/get_versions/:version_type/:franchisor_id', function (req, res) {
  try {
    Versions.find({ version_type: req.params.version_type, franchisor_id: req.params.franchisor_id }, function (err, versions) {
      if (err) {
        return res.send({
          state: "failure",
          message: err
        }, 500);
      }
      if (versions) {
        return res.send({
          state: "success",
          data: versions
        }, 200);
      }

    })
  } catch (err) {
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})
//to get the versions of KYC files based on businesss type id and version type
router.get('/get_versions_of_kyc_files/:bussiness_type_id/:franchisor_id', function (req, res) {
  try {
    Versions.find({ bussiness_type_id: req.params.bussiness_type_id, franchisor_id: req.params.franchisor_id }, function (err, versions) {
      if (err) {
        return res.send({
          state: "failure",
          message: err
        }, 500);
      }
      if (versions) {
        return res.send({
          state: "success",
          data: versions
        }, 200);
      }

    })
  } catch (err) {
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})
router.put('/make_version_default/:version_id/:version_type', function (req, res) {
  try {
    Versions.updateMany({ version_type: req.params.version_type }, { $set: { 'default': false } }, { 'multi': true }, function (err, versions) {
      if (err) {
        return res.send({
          state: "failure",
          message: err
        }, 500);
      }
      if (versions) {
        Versions.update({ _id: req.params.version_id }, { $set: { 'default': true } }, function (err, version) {
          if (err) {
            return res.send({
              state: "failure",
              message: err
            }, 500);
          }
          if (version) {
            return res.send({
              state: "success",
              message: "Success!"
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
router.put('/make_version_default_for_setup/:version_id/:department_id/:version_type', function (req, res) {
  try {
    Versions.updateMany({ department_id: req.params.department_id }, { $set: { 'default': false } }, { 'multi': true }, function (err, versions) {
      if (err) {
        return res.send({
          state: "failure",
          message: err
        }, 500);
      }
      console.log(versions);
      if (versions) {
        Versions.update({ _id: req.params.version_id }, { $set: { 'default': true } }, function (err, version) {
          if (err) {
            return res.send({
              state: "failure",
              message: err
            }, 500);
          }
          if (version) {
            return res.send({
              state: "success",
              message: "Success!"
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
router.get('/get_version_by_id/:version_id', function (req, res) {
  try {
    Versions.findById({ _id: req.params.version_id }, function (err, version) {
      if (err) {
        return res.send({
          state: "failure",
          message: err
        }, 500);
      }
      if (version) {
        return res.send({
          state: "success",
          data: version
        }, 200);
      }

    })
  } catch (err) {
    return res.send({
      state: "failure",
      message: err
    }, 500);
  }
})
router.delete('/delete_version/:version_id', function (req, res) {
  var present_version;
  try {
    Versions.findByIdAndRemove({ _id: req.params.version_id }, function (err, version) {
      if (err) {
        return res.send({
          state: "failure",
          message: err
        }, 500);
      }
      if (version) {
        Versions.aggregate([
          { $match: { version_type: version.version_type, default: true } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]).exec()
          .then((count) => {
            console.log(count[0], '////////////3323')
            if (count[0] === undefined || count[0].count >0) {
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
          .catch((err) => {
            console.log(err)
            return res.json(500, err)
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
// router.delete('/delete_version/:version_id', function(req, res){
//   try {
//     Versions.findByIdAndRemove({_id: req.params.version_id}, function(err, version){
//       if(err){
//         return res.send({
//             state: "failure",
//             message: err
//         }, 500);
//       }
//       if (version) {
//         return res.send({
//             state: "success",
//             message: "Version deleted successfully!"
//         }, 200);
//       }

//     })
//   } catch (err){
//     return res.send({
//       state: "failure",
//       message: err
//     }, 500);
//   }
// })

router.put('/edit_version', function (req, res) {
  try {
    Versions.findById({ _id: req.body._id }, function (err, version) {
      if (err) {
        return res.send({
          state: "err",
          message: "Something went wrong. We are looking into it."
        }, 500);
      }
      if (!version) {
        res.send({
          state: "failure",
          message: "No versions found"
        }, 201);
      }
      if (version) {
        if (version.version_name == req.body.version_name) {
          version.version_name = req.body.version_name;
          version.version_description = req.body.version_description;
          version.version_type = req.body.version_type;
          version.franchisor_id = req.body.franchisor_id;
          version.default = req.body.default;
          version.save(function (err, version) {
            res.send({
              state: "success",
              message: "Version updated"
            }, 200);
          })

        }
        else {
          Versions.find({ version_name: { $regex: new RegExp(req.body.version_name, 'i') } }, function (err, version_name) {
            if (err) {
              return res.send({
                state: "err",
                message: "Something went wrong. We are looking into it."
              }, 500);
            }
            if (version_name == null || version_name.length != 0) {
              res.send({
                state: "failure",
                message: "Name already exists"
              }, 201);
            }
            else {
              version.version_name = req.body.version_name;
              version.version_description = req.body.version_description;
              version.version_type = req.body.version_type;
              version.franchisor_id = req.body.franchisor_id;
              version.default = req.body.default;
              version.save(function (err, version) {
                res.send({
                  state: "success",
                  message: "Version updated"
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
module.exports = router;
