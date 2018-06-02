var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var Franchisee = mongoose.model('Franchisee');
var Franchisor = mongoose.model('Franchisor');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
var setupTaskSchema = new mongoose.Schema({
  setup_checklist_id: {type: Schema.Types.ObjectId, ref: 'SetupTask'},
  task_name_EN: String,
  task_name: String,
  // task_status: {type:Boolean,default:false},
  task_type: String,
  task_due_date: String,
  franchisee_file_upload_required: {type:Boolean,default:false},
  franchisor_task_file_attachment_file_name: String,
  franchisor_task_file_attachment_file_url: String,
  franchisor_task_file_attachment_file_type: String,
  task_serial_number: Number,
  task_radio_options: Array,
  doc_name: String,
  link: {type: Schema.Types.Mixed, default : {}},  "file_type": String,
  date_uploaded:Date,
  key:String
})

var setupDepartmentSchema = new mongoose.Schema({

  setup_department_name_EN: String, //Language specific
  franchisor_id:  {type: Schema.Types.ObjectId, ref: 'Franchisor'}
})

var setupChecklistSchema = new mongoose.Schema({
  setup_department_id: {type: Schema.Types.ObjectId, ref: 'SetupDepartment'},
  visible_to : String,
  setup_checklist_name: String,
  setup_checklist_name_EN: String,

  created_at: String,
  tasks_length: {type:Number,default:0}

})
 var userSpecificChecklistSchema = new mongoose.Schema({
   completed_task_length: {type:Number, default:0},
   franchisee_id: String,
   setup_checklist_id:  String,
   setup_department_id: String
 })

var userAnswersOfTaskSchema = new mongoose.Schema({
  task_id: {type: Schema.Types.ObjectId, ref: 'SetupTask'},
  task_status: {type:Boolean,default:false},
  task_franchisee_submitted_file_name: String,
  task_franchisee_submitted_file_type: String,
  task_franchisee_submitted_file_url: String,
  task_answer:String,
  completed_at: Date,
  setup_department_id: String,
  setup_checklist_id:  {type: Schema.Types.ObjectId, ref: 'SetupChecklist'},
  franchisee_id:  {type: Schema.Types.ObjectId, ref: 'Franchisee'}
})

mongoose.model('SetupTask', setupTaskSchema);
mongoose.model('SetupDepartment', setupDepartmentSchema);
mongoose.model('SetupChecklist', setupChecklistSchema);

mongoose.model('UserAnswersOfTask', userAnswersOfTaskSchema);
mongoose.model('UserSpecificChecklist', userSpecificChecklistSchema);
//mongoose.model('')
