var mongoose = require('mongoose');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
var franchiseeSchema = new mongoose.Schema({
    "franchisee_code":{ type: Schema.Types.ObjectId, ref: 'Auth'},
    "franchisee_name":String,
    "franchisee_occupation":String,
    "franchisee_email":String,
    "franchisee_pic":{type: Schema.Types.Mixed, default : {}},
    "franchisee_city":String,
    "franchisee_state":String,
    "franchisee_address":String,
    "franchisee_mobile_number":Number,
    "franchisee_age":Number,
    "franchisee_lead_source":String,
    "franchisee_investment":String,
    "franchisee_preferred_date":Date,
    "franchisee_preferred_time":String,
    "franchisee_how_soon_to_start":String,
    "franchisee_franchise_model":String,
    "franchisee_remarks":String,
    "role":String
});

var librarySchema = new mongoose.Schema({
    "common_files":{type: Schema.Types.Mixed, default : {}},
    "uploaded_status":{type:'Number',default:0}//0 or 1
});

var UserlibrarySchema = new mongoose.Schema({
    "personal_files":{type: Schema.Types.Mixed, default : {}},
    "uploaded_status":{type:'Number',default:0},//0 or 1
    "franchisee_Id":{ type: Schema.Types.ObjectId, ref: 'Franchisee'}
});

mongoose.model('Franchisee', franchiseeSchema);
mongoose.model('Library', librarySchema);
mongoose.model('UserLibrary', UserlibrarySchema);
mongoose.model('Auth').Schema;