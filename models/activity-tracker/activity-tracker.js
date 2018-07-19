var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;

var activityTrackerSchema = new mongoose.Schema({
    "activity_name": String,
    "activity_time": { type: Date, default: Date.now },
    "activity_source": String,
    "franchisor_id":{ type: Schema.Types.ObjectId, ref: 'Franchisor'},
    "franchisee_id":{ type: Schema.Types.ObjectId, ref: 'Franchisee'},
})

mongoose.model('ActivityTracker', activityTrackerSchema);