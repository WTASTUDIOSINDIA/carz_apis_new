'use strict';

var mongoose = require('mongoose');
var Franchisor = mongoose.model('Franchisor');
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

const create = (data) => {
  return Franchisor.create(data);
}  

const findFranchisors = (query) => {
    return Franchisor.find(query).sort({'_id': -1}).exec();
  }
  

  module.exports = {
    findFranchisor,
    create,
    findUser,
    findSuperAdmin,
    findFranchisors
  }