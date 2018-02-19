var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var franchisorSchema = new mongoose.Schema({
    // "franchisee_code":{ type: Schema.Types.ObjectId, ref: 'Auth'},
    "user_name":String,
    "user_pass":String,
    "user_mail":String,
    "user_role":{type:String, default:'franchisor'}
});


mongoose.model('Franchisor', franchisorSchema);
