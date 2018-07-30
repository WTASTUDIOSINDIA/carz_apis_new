var mongoose = require('mongoose');

// var Franchisor = mongoose.model('Franchisor');
var Schema = mongoose.Shema;


var versionsSchema = new mongoose.Schema({
  "version_name": String,
  "version_description": String,
  "released_on": Date,
  "version_type": { type: String,  enum: ['application_form', 'kyc_docs', 'f_assessments', 'e_assessments', 'checklists']},
  "franchisor_id": String,
  "default": {type: Boolean, default: false}
})


mongoose.model('Versions', versionsSchema);
