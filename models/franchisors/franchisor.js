var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var franchisorSchema = new mongoose.Schema({
    // "franchisee_code":{ type: Schema.Types.ObjectId, ref: 'Auth'},
    "user_name":String,
    "user_pass":String,
    "old_pass" : String,
    "user_mail":String,
    "seen_notifications": {type: Boolean, default: false},
    "user_role":{type:String, default:'franchisor'},
    "user_website":String,
    "description" : String,
    "country_code" :String,
    "phone_number" : String,
    "profile_pic" : {
        "image_url" : String,
        "image_type" : String,
        "created_on" : Date
    },
    "status": {type: String, default: "inactive"},
    "createdDate": { type: Date, default: Date.now }

});


mongoose.model('Franchisor', franchisorSchema);
