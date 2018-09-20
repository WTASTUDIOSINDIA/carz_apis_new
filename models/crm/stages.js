var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var Franchisee = mongoose.model('Franchisee');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
// var stagesSchema = new mongoose.Schema({
//     "franchisee_id": String,
//     "stage_profile": [{type: Schema.Types.ObjectId, ref: 'Franchisee', status: "completed"}],
//     "stage_discussion":  [{type: Schema.Types.ObjectId, ref: 'Discussion', status: "inprogress"}],
//     "stage_kycupload": [{type: Schema.Types.ObjectId, ref: 'Kyc', status: "pending"}],
//     "stage_assessment": [{type: Schema.Types.ObjectId, ref: 'Assessment', status: false}],
//     "stage_agreenent":  [{type: Schema.Types.ObjectId, ref: 'Agreement', status: false}]
// });
var stagesSchema = new mongoose.Schema({
    "franchisee_id": String,
    "folder_id": String,
    "stage_profile": {type: Schema.Types.ObjectId, ref: 'Franchisee', status: "completed"},
    "stage_discussion":  {
      "status":  {type:Boolean,default:false},
      "payment_value": {type: Number, default: 100000},
      "payment_file": String,
      "payment_file_name": String,
      "first_payment_library_file_id": String,
      "one_lac_payment_uploaded_date":Date,
      "payment_file_type":{type:String,default:'docs'},
      "payment_status": {type: String, default: 'pending'}, //pending, rejected, approveds
      "nda_file": String,
      "nda_status": {type: String, default: 'pending'}, //pending, rejected, approved
      "application_status": {type: String, default:'pending'},
      "nda_file_name": String,
      "nda_library_file_id": String,
      "nda_file_uploaded":Date,
      "nda_file_type":{type:String,default:'docs'},
      "franchisee_id": String,
      "application_status": {type: String, default: 'pending'}, //pending, rejected, approved
    },
    "stage_kycupload":{
      "status":  {type:Boolean,default:false},
      "bgverification_file_name": String,
      "bgverification_file_link": String,
      "bgverificatio_file_uploaded": Date,
      "bgverification_file_type":{type:String,default:'docs'},
      "franchisee_id": String
    },
    "stage_assessment": {
      "status": {type:Boolean,default:false},
      "franchisee_id": String
    },
    "stage_agreenent":  {
      "status":  {type:Boolean,default:false},
      "agreement_value": {type: Number, default: 400000},
      "agreement_file": String,
      "agreement_file_name": String,
      "four_lac_payment_uploaded_date":Date,
      "second_payment_library_file_id": String,
      "agreement_file_type":{type:String,default:'docs'},
      "final_agreement_file_name":String,
      "final_agreement_file":String,
      "final_agreement_library_file_id": String,
      "final_agreement_status": {type: Boolean, default: false},
      "franchisee_id": {type: Schema.Types.ObjectId, ref: 'Franchisee'},
      "4lac_payment_status": {type: String, default: 'pending'}, //pending, rejected, approved
    },
    "stage_setup": {
      "status": {type: Boolean, default: false},
      "franchisee_id": String
    },
});
// var discussionSchema = new mongoose.Schema({
//   "status": Boolean,
//   "payment_value": {type: Number, default: 100000},
//   "payment_file": String,
//   "nda_file": String,
//   "franchisee_id": String
// });
// var kycUploadSchema = new mongoose.Schema({
//   "status": Boolean,
//   "franchisee_id": String
// })
// var assessmentSchema = new mongoose.Schema({
//   "status": Boolean,
//   "franchisee_id": String
// })
// var agreementSchema = new mongoose.Schema({
//   "status": Boolean,
//   "franchisee_id": String
// })

mongoose.model('Stages', stagesSchema);
// mongoose.model('Discussion', discussionSchema);
// mongoose.model('Kyc', kycUploadSchema);
// mongoose.model('Assessment', assessmentSchema);
// mongoose.model('Agreement', agreementSchema);
