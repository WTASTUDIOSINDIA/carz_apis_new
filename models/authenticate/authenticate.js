var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authenticateSchema = new mongoose.Schema({
    "user_mail":String,
    "user_pass":String,
    "user_name":String,
    "user_pic":{type: Schema.Types.Mixed, default : {}},
    "user_status":String,
    "role":{type:String, enum: ['superAdmin', 'franchisor', 'franchisee', 'masterFranchisee'], default:'superAdmin'}
});
var adminSchema = new mongoose.Schema({
  "user_mail": String,
  "user_pass": String,
  "user_role": {type: String, default: 'superAdmin'}
})
var forgotPasswordSchema = new mongoose.Schema({
    "franchisee_mail":String,
    "unique_code":String
});

mongoose.model('Auth', authenticateSchema);
mongoose.model('ForgotPassword', forgotPasswordSchema);
mongoose.model('Admin', adminSchema);
