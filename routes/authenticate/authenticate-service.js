'use strict';

var mongoose = require('mongoose');
var Franchisor = mongoose.model('Franchisor');
var Franchisee = mongoose.model('Franchisee');
var Admin = mongoose.model('Admin');
var SuperAdmin = mongoose.model('SuperAdmin');

const findFranchisor = (query) => {
    return Franchisor.findOne(query).exec();
  }
const findUser = (query) => {
    return Admin.findOne(query).exec();
  }
const findSuperAdmin = (query) => {
    return SuperAdmin.findOne(query).exec();
  }  
const findFranchisee = (query) => {
  return Franchisee.findOne(query).exec();
}  
  // jwt tokens
  let isUser = {};
  isUser.authenticated = (req, res, next) => {
      const token = req.headers['x-access-code'];
      if (token) {
          utils.decodeJwtToken(token)
              .then(decoded => {
                  req.decoded = decoded.data;
                  next();
              })
              .catch((error) => {
                res.status(401).json({ success: false, error:"2", message: "Your Login Token Expired. Please Login." });
              });
      } else {
          res.status(401).json({ success: false, error:"1", message: "You are not authorised." });
      }
  };
  
  isUser.hasUserID = (req, res, next) => {
      const token = req.headers['x-access-code'];
      if (token) {
          utils.decodeJwtToken(token)
            .then(decoded => {
                req.userID = decoded.data.userID;
                next();
            })
            .catch((error) => {
                next();
            });
      } else {
          next();
      }
  };
  
  isUser.hasToken = (req, res, next) => {
    const token = req.headers['x-url-token'];
    if (token) {
      utils.decodeUrl(token)
        .then(decoded => {
          req.userID = decoded.data.userID;
          next();
        })
        .catch((error) => {
            next();
        });
    } else {
        next();
    }
  }
  
//   let requires = {};

// requires.body = (req, res, next) => {
//   if (!_.isEmpty(req.body)) next();
//   else res.json({ success: false, message: 'Request Body is Empty. Please Provide Data.' });
// };

  module.exports = {
    findFranchisor,
    findUser,
    findSuperAdmin,
    findFranchisee,
    isUser,
    // requires
  };