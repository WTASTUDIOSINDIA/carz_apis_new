const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Franchisor = mongoose.model('Franchisor');

var auditChecklistCategorySchema = new mongoose.Schema({
    'audit_checklist_title':String,
    'audit_checklist_type':String,
    'audit_visible_to':String,
    'audit_description':String,
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
    'audit_date_uploaded': Date,
})

var auditChecklistTypeSchema = new mongoose.Schema({
    'audit_checklist_type_name': String,
    'franchisor_id':  {type: Schema.Types.ObjectId, ref: 'Franchisor'}
})

mongoose.model('AuditChecklistCategory', auditChecklistCategorySchema);
mongoose.model('AuditChecklistType', auditChecklistTypeSchema);

