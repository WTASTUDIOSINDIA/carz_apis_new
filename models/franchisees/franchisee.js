var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
var franchiseeSchema = new mongoose.Schema({
    "franchisor_id": { type: Schema.Types.ObjectId, ref: 'Franchisor' },
    "franchisee_code": { type: Schema.Types.ObjectId, ref: 'Auth' },
    "franchisee_name": String,
    "franchisee_occupation": String,
    "franchisee_email": String,
    "franchisee_pass": String,
    "franchisee_comfirm_pass": String,
    "franchisee_profile_pic": String,
    "franchisee_city": String,
    "franchisee_state": String,
    "franchisee_address": String,
    "franchisee_mobile_number": String,
    "franchisee_investment": String,
    "franchisee_preferred_date": String,
    "franchisee_preferred_time": String,
    "franchisee_how_soon_to_start": String,
    "franchisee_franchise_model": String,
    "franchisee_franchise_type": String,
    "franchisee_stage_completed": { type: Number, default: 1 },
    "franchisee_remarks": String,
    "master_franchisee_id": { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    "franchisee_country": String,
    "franchisee_pincode": String,
    "franchisee_area": String,
    "country_code": String,
    "partners_list": { type: Number, default: 0 },
    "lead_age": Number,
    "lead_source": String,
    "sub_stage": String,
    "user_role": { type: String, default: 'franchisee' },
    "bussiness_type": String,
    "seen_notifications": { type: Boolean, default: false },
    "first_lakh_payment": { type: String, default: 'Pending' },
    "second_lakh_payment": { type: String, default: 'Pending' },
    "lead_type": { type: String, default: 'Unassigned' },
    "partner_name": String,
    "partner_occupation": String,
    "partner_mobile_number": String,
    "partner_age": String,
    "partner_address": String,
    "partner_city": String,
    "partner_state": String,
    "partner_pincode": String,
    "partner_country": String,
    "partner_house_number": String,
    "bussiness_type_id": String,
    "partner_occupation_others": String,
    "archieve_franchisee": { type: Boolean, default: false },
    "sub_franchisee_count": { type: Number, default: 0 },
    "show_kt_popup_first_time": { type: Boolean, default: true },
    "nda_uploaded": { type: String, default: 'NDA Pending' },
    "discussion_payment": { type: String, default: 'Payment Pending' },
    "agreement_file_uploaded": { type: String, default: 'Agreement Pending' },
    "application_form": { type: String, default: ' Application Form Pending' },
    "interview_status": { type: String, default: ' Interview Pending' },
    "seen_notification": { type: Number, default: 0 },
    "franchisee_id": { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    "franchisor_id": { type: Schema.Types.ObjectId, ref: 'Franchisor' },
    "rejected_franchisee_reason": String,
    "verified": { type: Boolean, default: false },
    "stage_profile": { type: String, default: 'completed' },
    "verification": {
        "otp": String,
        "status": { type: Boolean, default: false }, //verification status
        "verifiedDate": Date
    },
    "pass_verification": {
        "otp": String,
        "status": { type: Boolean, default: false } //verification status
    },
    "franchisee_created_on": Date,
    "franchisee_length": String
});

var librarySchema = new mongoose.Schema({
    "file_name": String,
    "path": String,
    "key": String,
    "date_uploaded": Date,
    "image_type": { type: String, default: 'docs' },
    "uploaded_status": { type: Number, default: 0 },//0 or 1
    "franchisee_Id": { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    "folder_Id": { type: Schema.Types.ObjectId, ref: 'Folder' },
    "is_campaign_file": { type: Boolean, default: false },
    "campaign_id": { type: Schema.Types.ObjectId, ref: 'Campaign' },
});
var partnerSchema = new mongoose.Schema({
    "partner_name": String,
    "partner_occupation": String,
    "partner_email": String,
    "partner_address": String,
    "partner_city": String,
    "partner_state": String,
    "partner_country": String,
    "country_code": String,
    "partner_pincode": String,
    "partner_house_number": String,
    "partner_mobile_number": String,
    "partner_age": String,
    "main_partner": { type: Boolean, default: false },
    "partner_lead_source": String,
    "partner_investment": String,
    "partner_franchisee_type": String,
    "partner_how_soon_to_start": String,
    "partner_remarks": String,
    "partner_preferred_date": String,
    "partner_preferred_time": String,
    "franchisee_id": { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    "partner_profile_pic": { type: Schema.Types.Mixed, default: {} },
    "bussiness_type_id": String,
    "bussiness_type": String,
    "test_completed": { type: Boolean, default: false },
    "business_type": String,
    "partner_occupation_others": String,

});
var meetingSchema = new mongoose.Schema({
    "meeting_title": String,
    "meeting_location": String,
    "meeting_date": Date,
    "meeting_time": String,
    "meeting_assigned_people": Array,
    "meeting_additional_services": String,
    "meeting_remarks": String,
    "franchisor_id": { type: Schema.Types.ObjectId, ref: 'Franchisor' },
    "franchisee_id": { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    "franchisee_name": String,
    "stage_id": String,
    "meeting_franchisor_remarks": String,
    "notification_to": String,
    "user_name": String,
    "meeting_status": { type: String, default: 'pending' }, //pending, rejected, approved
    "created_by": { type: String, enum: ['franchisor', 'franchisee'] },
    "meeting_reason": String,
    "approved_by": { type: String, enum: ['franchisor', 'franchisee'] },
    "franchisee_name": String,
    "partner_name": String,
    "notification_type": { type: String, default: 'meeting_request' }

});

var notificationSchema = new mongoose.Schema({
    "franchisor_id": { type: Schema.Types.ObjectId, ref: 'Franchisor' },
    "franchisee_id": { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    "created_at": { type: Date, default: Date.now },
    "meeting_title": String,
    "meeting_date": String,
    "meeting_time": String,
    "meeting_location": String,
    "notification_type": String,
    "notification_data": {

    },
    "notification_title": String,
    "status": Boolean,
    "notification_to": String,
    "discussion_notification": String,
    "read_status": { type: Boolean, default: false },
    "meeting_reason": String,
    "approved_by": { type: String, enum: ['franchisor', 'franchisee'] },
    "meeting_status": { type: String, default: 'pending' },
    "nda_status": { type: String, default: "pending" },
    "payment_status": { type: String, default: 'pending' }
    // "franchisor_id" : {type: Schema.Types.ObjectId, ref: 'Franchisor'},
    // "franchisee_id" : { type: Schema.Types.ObjectId, ref: 'Franchisee'},
    // "created_at" : { type: Date, default: Date.now },
    // "meeting_title" : String,
    // "meeting_date" : String,
    // "meeting_time" : String,
    // "meeting_location" : String,
    // "notification_type": String,
    // "notification_data": {

    // },
    // "status" : Boolean,
    // "notification_to": String,
    // "discussion_notification": String,
    // "read_status": { type: Boolean, default: false},
    // "meeting_reason":String,
    // "approved_by":{type: String, enum: ['franchisor', 'franchisee']},
    // "meeting_status": {type: String, default: 'pending'}
    // 'franchisor_id': { type: Schema.Types.ObjectId, ref: 'Franchisor' },
    // 'franchisee_id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    // 'created_at': { type: Date, default: Date.now },
    // 'notification_title': String,
    // 'notification_type': { type: String, enum: ['meeting', 'nda', 'one_lac', 'application_form', 'kyc_docs', 'backgroung_verification', 'franchisee_assessment', 'agreement', 'upload', 'four_lac', 'status_change'] },
    // 'read_status': { type: Boolean, default: false },
    // 'notification_to': { type: String, enum: ['franchisee', 'franchisor'] },
    // 'approved_by': { type: String, enum: ['franchisor', 'franchisee'] },
    // 'meeting_id': { type: Schema.Types.ObjectId, ref: 'Meeting' },
    // 'stages_id': { type: Schema.Types.ObjectId, ref: 'Stages' },
    // 'status': Boolean

});
// var UserlibrarySchema = new mongoose.Schema({
//     "personal_files":[{path:String,key:String}],
//     "uploaded_status":{type:'Number',default:0},//0 or 1

//     "date_uploaded":Date
// });


// duplicate notification schema
var notificationsSchema = new mongoose.Schema({
    'franshisor_id': { type: Schema.Types.ObjectId, ref: 'Franchisor' },
    'franchisee_id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    'created_at': { type: Date, default: Date.now },
    'notification_title': String,
    'notification_type': { type: String, enum: ['meeting', 'nda', 'one_lac', 'application_form', 'kyc_docs', 'backgroung_verification', 'franchisee_assessment', 'agreement', 'upload', 'four_lac', 'status_change'] },
    'read_status': { type: Boolean, default: false },
    'notification_to': { type: String, enum: ['franchisee', 'franchisor'] },
    'approved_by': { type: String, enum: ['franchisor', 'franchisee'] },
    'meeting_id': { type: Schema.Types.ObjectId, ref: 'Meeting' },
    'status': Boolean
})

var FolderSchema = new mongoose.Schema({
    "folder_name": String,
    "franchisee_Id": { type: Schema.Types.ObjectId, ref: 'Franchisor' },
    "create_date": Date,
    "parent_folder_id": String,
    "path": Array,
    "crm_folder": {
        type: Boolean,
        default: false
    },
    "marketing_folder": { type: Boolean, default: false },
    "campaign_id": { type: Schema.Types.ObjectId, ref: 'Campaign' },
});

var DocSchema = new mongoose.Schema({
    "doc_name": String,
    "status": { type: String, default: 'New' },
    "link": { type: Schema.Types.Mixed, default: {} },
    "franchisee_id": { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    "partner_id": { type: Schema.Types.ObjectId, ref: 'Partner' },
    "file_type": String,
    "stage_name": String,
    "date_uploaded": Date,
    "key": String,
    "franchisor_response": { type: String, default: 'inProgress' }
});

var thirdPartyFileSchema = new mongoose.Schema({
    "doc_name": String,
    "link": { type: Schema.Types.Mixed, default: {} },
    "franchisee_id": { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    "file_type": String,
    "date_uploaded": Date,
    "key": String
});

var BussinessTypeSchema = new mongoose.Schema({
    "bussiness_type_name": String,
    "description": String,
    "version_id": { type: Schema.Types.ObjectId, ref: 'Versions' },
    "franchisor_id": { type: Schema.Types.ObjectId, ref: 'Franchisor' },
});

var BussinessTypeListSchema = new mongoose.Schema({
    "businessType_id": { type: Schema.Types.ObjectId, ref: 'FranchiseeType' },
    "doc_name": String,
    "doc_status": { type: String, default: 'Pending' },
    "doc_link": String,
    "doc_type": { type: String, default: 'docs' },
    "version_id": String,
    "franchisor_id": { type: Schema.Types.ObjectId, ref: 'Franchisor' },
});

var KycSchema = new mongoose.Schema({
    "franchisee_id": { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    "partner_id": { type: Schema.Types.ObjectId, ref: 'Partner' },
    "docs_types": Array,
    "franchisee_email": String,
    "partner_email": String
});

var ReasonSchema = new mongoose.Schema({
    'reason_listed': String,
    'reason_in_text': String,
    'status': String,
    'doc_name': String,
    'franchisee_Id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    'partner_Id': { type: Schema.Types.ObjectId, ref: 'Partner' },
    'kyc_id': { type: Schema.Types.ObjectId, ref: 'KycUploads' },
    "franchisee_email": String,
    "partner_email": String
});

var QuestionTypeSchema = new mongoose.Schema({
    'question_type_name': String,
    'description': String,
    'version_id': String,
    'franchisor_id': { type: Schema.Types.ObjectId, ref: 'Franchisor' }
});

var InterviewQuestionSchema = new mongoose.Schema({
    'question_EN': String,
    'options': [{ option: String, correct_answer: { type: Number, default: 0 } }],
    'correct_answer': String,
    'question_type_id': { type: Schema.Types.ObjectId, ref: 'QuestionType' },
    'question_type': String,
    'version_id': String,
    'franchisor_id': { type: Schema.Types.ObjectId, ref: 'Franchisor' },
    'question_section_id': { type: Schema.Types.ObjectId, ref: 'QuestionType' }
});

var AssessmentSchema = new mongoose.Schema({
    'assessment_list': Array,
    'correct_answers': Number,
    'total_questions': Number,
    'franchisee_id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    'partner_id': { type: Schema.Types.ObjectId, ref: 'Partner' },
    'status': { type: String, default: 'Pending' }
});

var ApplicationSchema = new mongoose.Schema({
    'version_id': String,
    'question_EN': String,
    'question_type': String,
    'options': Array,
    'franchisee_Id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    'isRequire': { type: Boolean, default: false },
    'order': { type: Number, default: 0 },
    "file_type": String,
    "date_uploaded": Date,
    "key": String

})

var ApplicationSubmittedSchema = new mongoose.Schema({
    'answers': Array,
    'franchisee_Id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    "application_status": { type: String, default: 'Submitted' },
    'status': { type: String, default: 0 },
});

var CampaignSchema = new mongoose.Schema({
    'title': String,
    'location': String,
    'start': String,
    'end': String,
    'type': String,
    'notes': String,
    'campaign_color': String,
    'medium': Array,
    'budget': String,
    'feedback': String,
    // 'campaign_file':{type: Schema.Types.Mixed, default : {}},
    'franchisor_id': { type: Schema.Types.ObjectId, ref: 'Franchisor' },
    'franchisee_id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    'doc_name': String,
    'link': { type: Schema.Types.Mixed, default: {} },
    'file_type': String,
    'date_uploaded': Date,
    'created_by': { type: String, enum: ['franchisor', 'franchisee'] },
    'key': String,
    'meta': Object,
    "campaign_files": [{
        'campaign_file_attachment_file_name': String,
        'campaign_file_attachment_file_url': String,
        'campaign_file_attachment_file_type': String,
    }],

    'visible_to': String,
    'visible_to_franchisee_id': Array,
    'visible_to_franchisee_name': Array,
    'amount_spent': String,
    'franchisee_feedback': String,
    'franchisor_feedback': String,
    'leads_generated': String,
    'footfalls': String,
    'campaign_duration': String,
    'after_campaign_files': Array,
    'after_campaign_file_attachment_file_name': String,
    'after_campaign_file_attachment_file_url': String,
    'after_campaign_file_attachment_file_type': String,
    // 'campaign_id': String,
    'campaign_status': String
});

//franchiseeSchema.index({franchisee_name: 'text',partner_name:'text',franchisee_address:'text',franchisee_city:'text',franchisee_pincode:'text',franchisee_franchise_type:'text'}, {unique: true})
// franchiseeSchema.index({partner_name: 'text'})
// franchiseeSchema.index({franchisee_address: 'text'})
// franchiseeSchema.index({franchisee_city: 'text'})
// franchiseeSchema.index({franchisee_pincode: 'text'})
// franchiseeSchema.index({franchisee_franchise_type: 'text'})

//,partner_name:'text',franchisee_address:'text',franchisee_city:'text',franchisee_pincode:'text',franchisee_franchise_type:'text'
mongoose.model('Franchisee', franchiseeSchema);
mongoose.model('Library', librarySchema);
mongoose.model('Folder', FolderSchema);
mongoose.model('Auth').Schema;
mongoose.model('Partner', partnerSchema);
mongoose.model('Meeting', meetingSchema);
mongoose.model('Doc', DocSchema);
mongoose.model('FranchiseeType', BussinessTypeSchema);
mongoose.model('FranchiseeTypeList', BussinessTypeListSchema);
mongoose.model('KycUploads', KycSchema);
mongoose.model('Reasons', ReasonSchema);
mongoose.model('QuestionType', QuestionTypeSchema);
mongoose.model('Question', InterviewQuestionSchema);
mongoose.model('Assessment', AssessmentSchema);
mongoose.model('Application', ApplicationSchema);
mongoose.model('ApplicationSubmitted', ApplicationSubmittedSchema);
mongoose.model('ThirdPartyFiles', thirdPartyFileSchema);
mongoose.model('Campaign', CampaignSchema);
mongoose.model('Notification', notificationSchema);
