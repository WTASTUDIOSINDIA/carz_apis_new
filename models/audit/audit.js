const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Franchisor = mongoose.model('Franchisor');

var auditChecklistSchema = new mongoose.Schema({
    'audit_checklist_title':String,
    'audit_checklist_type':String,
    'audit_visible_to':String,
    'audit_description':String,
    'created_at': Date,
    'checklist_type_id': {type: Schema.Types.ObjectId, ref:'AuditChecklistType'},
    'franchisor_id':  {type: Schema.Types.ObjectId, ref: 'Franchisor'},

})

var auditTaskSchema = new mongoose.Schema({
    'audit_task_name': String,
    'audit_task_type': String,
    'audit_file_upload_required': {type:Boolean,default:false},
    'audit_task_file_attachment_file_name': String,
    'audit_task_file_attachment_file_url': String,
    'audit_task_file_attachment_file_type': String,
    'audit_task_radio_options': Array,
    'created_at': Date,
    'checklist_id': {type: Schema.Types.ObjectId, ref:'AuditChecklist'}
})

var auditChecklistTypeSchema = new mongoose.Schema({
    'audit_checklist_type_name': String,
    'franchisor_id':  {type: Schema.Types.ObjectId, ref: 'Franchisor'}
})

var FranchiseeAuditTaskSchema = new mongoose.Schema({
    'checklist_id': {type: Schema.Types.ObjectId, ref:'AuditChecklist'},
    'task_id': {type: Schema.Types.ObjectId, ref: 'AuditTask'},
    'task_type': String,
    'franchisee_id':  {type: Schema.Types.ObjectId, ref: 'Franchisee'},
    'task_status' : {type:Boolean,default:false},
    'file_name' : String,
    'file_url' : String, 
    'file_type' : String,
    'created_on': { type: Date, default: Date.now }
})

mongoose.model('AuditChecklist', auditChecklistSchema);
mongoose.model('AuditChecklistType', auditChecklistTypeSchema);
mongoose.model('AuditTask', auditTaskSchema);
mongoose.model('FranchiseeAuditTask', FranchiseeAuditTaskSchema);


