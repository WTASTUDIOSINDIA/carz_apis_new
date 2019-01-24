var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var authenticateSchema = new mongoose.Schema({
    "user_mail":String,
    "user_pass":String,
    "user_confirm_pass": String,
    "user_name":String,
    "user_pic":{type: Schema.Types.Mixed, default : {}},
    "user_status":String,
    "role":{type:String, enum: ['admin', 'franchisor', 'franchisee', 'master_franchisee'], default:'superAdmin'}
});
var superAdminSchema = new mongoose.Schema({
    "user_mail":String,
    "user_role":String,
    "user_pass":String,
    "user_name":String,
    "mobile_number" : String,
    "verification": {
        "otp": String,
        "status": { type: Boolean, default: false } //verification status
      }
});
var adminSchema = new mongoose.Schema({
  "user_mail": String,
  "user_pass": String,
  "user_confirm_pass": String,
  "user_type_role":{
      'audit_management': {type:Boolean, default:false},
      'crm':{type: Boolean, default:false},
      'library':{type: Boolean, default:false},
      'marketing':{type: Boolean, default:false},
      'discussion_forum': {type: Boolean, default:false},
      'ticketing_system': {type: Boolean, default:false},
      'settings': {type: Boolean, default: false},
      'assessment': {type: Boolean, default: false}
  },
  "user_name": String,
  "created_on": Date,
  "user_country_code": String,
  "user_phone_number": String,
  "franchisor_id":{ type: Schema.Types.ObjectId, ref: 'Franchisor'},
  "user_status": {type: String, default: 'active'},
  "profile_pic" : {
        "image_url" : String,
        "image_type" : String,
        "created_on" : Date
    },
    "user_profile_pic":{type: Schema.Types.Mixed, default : {}},
    "user_department": String,

  "seen_notification":{type: Number, default: 0},
  "verification": {
    "otp": String,
    "status": { type: Boolean, default: false } //verification status
  },
  'user_role': {type: String, default:'user'}
})
var forgotPasswordSchema = new mongoose.Schema({
    "franchisee_mail":String,
    "unique_code":String
});

mongoose.model('Auth', authenticateSchema);
mongoose.model('ForgotPassword', forgotPasswordSchema);
mongoose.model('Admin', adminSchema);
mongoose.model('SuperAdmin', superAdminSchema);

