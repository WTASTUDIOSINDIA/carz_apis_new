var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;

var activityTrackerSchema = new mongoose.Schema({
    "activity_name": String,
    "activity_time": { type: Date, default: Date.now },
    "activity_name": String,
    "activity_source": String
})

mongoose.model('ActivityTracker', activityTrackerSchema);