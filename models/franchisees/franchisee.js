var mongoose = require('mongoose');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
var franchiseeSchema = new mongoose.Schema({
    // "franchisee_code":{ type: Schema.Types.ObjectId, ref: 'Auth'},
    "franchisee_name":String,
    "franchisee_occupation":String,
    "franchisee_email":String,
    "franchisee_profile_pic":{type: Schema.Types.Mixed, default : {}},
    "franchisee_city":String,
    "franchisee_state":String,
    "franchisee_address":String,
    "franchisee_mobile_number":Number,
    "franchisee_investment":String,
    "franchisee_preferred_date":String,
    "franchisee_preferred_time":String,
    "franchisee_how_soon_to_start":String,
    "franchisee_franchise_model":String,
    "franchisee_remarks":String,
    "lead_age":Number,
    "lead_source":String
});

var librarySchema = new mongoose.Schema({
    "files":[{file_name:String,path:String,key:String,date_uploaded:Date}],
    "uploaded_status":{type:Number,default:0},//0 or 1
    "franchisee_Id":{ type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "folder_Id":{ type: Schema.Types.ObjectId, ref: 'Folder'}
});

// var UserlibrarySchema = new mongoose.Schema({
//     "personal_files":[{path:String,key:String}],
//     "uploaded_status":{type:'Number',default:0},//0 or 1
    
//     "date_uploaded":Date
// });

var FolderSchema = new mongoose.Schema({
    "folder_name":String,
    "franchisee_Id":{ type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "create_date":Date
});

mongoose.model('Franchisee', franchiseeSchema);
mongoose.model('Library', librarySchema);
mongoose.model('Folder', FolderSchema);
mongoose.model('Auth').Schema;
