var mongoose = require('mongoose');
var Schema = mongoose.Shema;


var userManagementSchema = new mongoose.Schema({
  "user_name": String,
  "user_email": String,
  "user_role": String,
  "created_on": Date,
  "user_phone_number": String,
  "franchisor_id": String,
  "user_status": {type: String, default: 'active'},
  "user_file_name": String,
  "user_file_link": String,
  "user_file_type": String,
})


mongoose.model('UserManagement', userManagementSchema);
