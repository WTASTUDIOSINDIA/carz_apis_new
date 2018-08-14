var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;

var activityTrackerSchema = new mongoose.Schema({
    "activity_name": String,
    "activity_time": { type: Date, default: Date.now },
    "activity_source": String, //Meeting, NDA, Payment, Application, KYC Files, agreements, Assessments, Setup
    "activity_of": String, //Roles
    "franchisor_id":{ type: Schema.Types.ObjectId, ref: 'Franchisor'},
    "franchisee_id":{ type: Schema.Types.ObjectId, ref: 'Franchisee'},
})

mongoose.model('ActivityTracker', activityTrackerSchema);
