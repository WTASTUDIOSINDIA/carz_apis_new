var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    "user_mail":String,
    "user_pass":String,
    "user_name":String,
    "user_pic":{type: Schema.Types.Mixed, default : {}},
    "user_status":String,
    "role":String
});

mongoose.model('User', userSchema);