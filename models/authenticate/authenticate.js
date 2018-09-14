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
    "role":{type:String, enum: ['admin', 'franchisor', 'franchisee', 'masterFranchisee'], default:'superAdmin'}
});
var adminSchema = new mongoose.Schema({
  "user_mail": String,
  "user_pass": String,
  "user_confirm_pass": String,
  "user_type_role":{
      'audit_management': {type:String, default:false},
      'crm':{type: String, default:false},
      'library':{type: String, default:false},
      'marketing':{type: String, default:false},
      'discussion_forum': {type: String, default:false},
      'ticketing_system': {type: String, default:false},
      'settings': {type: String, default: false},
      'assessment': {type: String, default: false}
  },
  "user_name": String,
  "created_on": Date,
  "user_country_code": String,
  "user_phone_number": String,
  "franchisor_id":{ type: Schema.Types.ObjectId, ref: 'Franchisor'},
  "user_status": {type: String, default: 'active'},
  "user_file_name": String,
  "user_file_link": String,
  "user_file_type": String,
  "seen_notification":{type: Number, default: 0},
  'user_role': {type: String, default:'user'}
})
var forgotPasswordSchema = new mongoose.Schema({
    "franchisee_mail":String,
    "unique_code":String
});

mongoose.model('Auth', authenticateSchema);
mongoose.model('ForgotPassword', forgotPasswordSchema);
mongoose.model('Admin', adminSchema);
