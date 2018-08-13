var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var franchisorSchema = new mongoose.Schema({
    // "franchisee_code":{ type: Schema.Types.ObjectId, ref: 'Auth'},
    "user_name":String,
    "user_pass":String,
    "user_mail":String,
    "seen_notifications": {type: Boolean, default: false},
    "user_role":{type:String, default:'franchisor'}
});


mongoose.model('Franchisor', franchisorSchema);
