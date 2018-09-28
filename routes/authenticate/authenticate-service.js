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

  module.exports = {
    findFranchisor,
    findUser,
    findSuperAdmin,
    findFranchisee
  };