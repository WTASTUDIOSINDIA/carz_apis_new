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
    "stage_profile": {type: Schema.Types.ObjectId, ref: 'Franchisee', status: "completed"},
    "stage_discussion":  {
      "status": Boolean,
      "payment_value": {type: Number, default: 100000},
      "payment_file": String,
      "payment_file_name": String,
      "payment_file_uploaded":Date,
      "payment_file_type":{type:String,default:'docs'},
      "nda_file": String,
      "nda_file_name": String,
      "nda_file_uploaded":Date,
      "nda_file_type":{type:String,default:'docs'},
      "franchisee_id": String
    },
    "stage_kycupload":{"status": Boolean,
    "franchisee_id": String},
    "stage_assessment": {"status": Boolean,
      "franchisee_id": String},
    "stage_agreenent":  {
      "status": Boolean,
      "agreement_value": {type: Number, default: 400000},
      "agreement_file": String,
      "agreement_file_name": String,
      "agreement_file_uploaded":Date,
      "agreement_file_type":{type:String,default:'docs'},
      "final_agreement_file_name":String,
      "final_agreement_file":String,
      "franchisee_id": {type: Schema.Types.ObjectId, ref: 'Franchisee'}
    }
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
