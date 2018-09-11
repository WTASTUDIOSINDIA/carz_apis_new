'use strict';

var mongoose = require('mongoose');
var Franchisor = mongoose.model('Franchisor');
var Admin = mongoose.model('Admin');
var bCrypt = require('bcrypt-nodejs');

const findFranchisor = (query) => {
    return Franchisor.findOne(query).exec();
  }
  const findUser = (query) => {
    return Admin.findOne(query).exec();
  }

  module.exports = {
    findFranchisor,
    findUser
  };