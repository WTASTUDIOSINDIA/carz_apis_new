const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Franchisor = mongoose.model('Franchisor');

var auditChecklistSchema = new mongoose.Schema({
    'audit_checklist_title':String,
    'audit_checklist_type':String,
    'audit_visible_to':String,
    'audit_description':String,
    'created_at': Date,
    'checklist_type_id': {type: Schema.Types.ObjectId, ref:'AuditChecklist'},
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

var franchiseeSpecificAuditChecklistSchema = new mongoose.Schema({
    'checklist_type_id': String,
    'audit_checklist_type_name':String,
    'checklist_id': String,
    'audit_task_data': Array,
    'franchisee_id': String,
    'task_id': String,
    'audit_task_answer': String,
    'audit_task_status':{type:Boolean, default:false},
    'task_franchisee_submitted_file_name': String,
    'task_franchisee_submitted_file_type': String,
    'task_franchisee_submitted_file_url': String,
})

mongoose.model('AuditChecklist', auditChecklistSchema);
mongoose.model('AuditChecklistType', auditChecklistTypeSchema);
mongoose.model('AuditTask', auditTaskSchema);
mongoose.model('FranchiseeSpecificAuditChecklist',franchiseeSpecificAuditChecklistSchema);

