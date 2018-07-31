var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
var franchiseeSchema = new mongoose.Schema({
    "franchisee_code":{ type: Schema.Types.ObjectId, ref: 'Auth'},
    "franchisee_name":String,
    "franchisee_occupation":String,
    "franchisee_email":String,
    "franchisee_pass":String,
    "franchisee_profile_pic":{type: Schema.Types.Mixed, default : {}},
    "franchisee_city":String,
    "franchisee_state":String,
    "franchisee_address":String,
    "franchisee_mobile_number":String,
    "franchisee_investment":String,
    "franchisee_preferred_date":String,
    "franchisee_preferred_time":String,
    "franchisee_how_soon_to_start":String,
    "franchisee_franchise_model": String,
    "franchisee_franchise_type": String,
    "franchisee_stage_completed": {type:Number, default:1},
    "franchisee_remarks":String,
    "master_franchisee_id": String,
    "franchisee_country": String,
    "franchisee_pincode": String,
    "franchisee_area": String,
    "partners_list": {type:Number, default:0},
    "lead_age":Number,
    "lead_source":String,
    "sub_stage":String,
    "user_role": {type:String, default:'franchisee'},
    "bussiness_type": String,
    "first_lakh_payment":{type:String,default:'Pending'},
    "second_lakh_payment":{type:String,default:'Pending'},
    "lead_type": {type:String,default:'Unassigned'},
    "partner_name": String,
    "partner_occupation": String,
    "partner_mobile_number":String,
    "partner_age":String,
    "partner_address":String,
    "partner_city":String,
    "partner_state":String,
    "partner_pincode":String,
    "partner_country":String,
    "partner_house_number": String,
    "bussiness_type_id":String,
    "partner_occupation_others": String,
    "archieve_franchisee": {type:Boolean, default:false},
    "sub_franchisee_count":{type: Number, default:0},
    "show_kt_popup_first_time": {type: Boolean, default: true}
});

var librarySchema = new mongoose.Schema({
    "file_name":String,
    "path":String,
    "key":String,
    "date_uploaded":Date,
    "image_type":{type:String,default:'docs'},
    "uploaded_status":{type:Number,default:0},//0 or 1
    "franchisee_Id":{ type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "folder_Id":{ type: Schema.Types.ObjectId, ref: 'Folder'}

});
var partnerSchema = new mongoose.Schema({
    "partner_name": String,
    "partner_occupation": String,
    "partner_email": String,
    "partner_address": String,
    "partner_city": String,
    "partner_state": String,
    "partner_country": String,
    "partner_pincode": String,
    "partner_house_number": String,
    "partner_mobile_number": String,
    "partner_age": String,
    "main_partner": {type:Boolean,default:false},
    "partner_lead_source": String,
    "partner_investment": String,
    "partner_franchisee_type": String,
    "partner_how_soon_to_start": String,
    "partner_remarks": String,
    "partner_preferred_date": String,
    "partner_preferred_time": String,
    "franchisee_id": { type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "partner_profile_pic":{type: Schema.Types.Mixed, default : {}},
    "bussiness_type_id": String,
    "bussiness_type": String,
    "test_completed":{type:Boolean,default:false},
    "business_type": String,
    "partner_occupation_others": String,

});
var meetingSchema = new mongoose.Schema({
   "meeting_title" : String,
   "meeting_location": String,
   "meeting_date": String,
   "meeting_time": String,
   "meeting_assigned_people": Array,
   "meeting_additional_services": String,
   "meeting_remarks": String,
   "franchisor_id":{ type: Schema.Types.ObjectId, ref: 'Franchisor'},
   "franchisee_id":{ type: Schema.Types.ObjectId, ref: 'Franchisee'},
   "stage_id": String,
   "meeting_franchisor_remarks":String,
   "notification_to": String

});

var notificationSchema = new mongoose.Schema({
    "franchisor_id" : {type: Schema.Types.ObjectId, ref: 'Franchisor'},
    "franchisee_id" : { type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "created_at" : { type: Date, default: Date.now },
    "meeting_title" : String,
    "meeting_date" : String,
    "meeting_time" : String,
    "meeting_location" : String,
    "notification_type": String,
    "status" : Boolean,
    "notification_to": String,
    "discussion_notification": String
});
// var UserlibrarySchema = new mongoose.Schema({
//     "personal_files":[{path:String,key:String}],
//     "uploaded_status":{type:'Number',default:0},//0 or 1

//     "date_uploaded":Date
// });

var FolderSchema = new mongoose.Schema({
    "folder_name":String,
    "franchisee_Id":{ type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "create_date":Date,
    "parent_folder_id": String,
    "path": Array,
    "crm_folder": {
        type:Boolean,
        default:false
    }
});

var DocSchema = new mongoose.Schema({
    "doc_name": String,
    "status": {type: String, default: 'New'},
    "link": {type: Schema.Types.Mixed, default : {}},
    "franchisee_id": {type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "partner_id": {type: Schema.Types.ObjectId, ref: 'Partner'},
    "file_type": String,
    "stage_name": String,
    "date_uploaded":Date,
    "key":String,
    "franchisor_response": {type:String, default:'inProgress'}
});

var thirdPartyFileSchema =new mongoose.Schema({
    "doc_name": String,
    "link": {type: Schema.Types.Mixed, default : {}},
    "franchisee_id": {type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "file_type": String,
    "date_uploaded":Date,
    "key":String
});

var BussinessTypeSchema = new mongoose.Schema({
    "bussiness_type_name": String,
    "description": String,
    "version_id": String,
    "franchisor_id": { type: Schema.Types.ObjectId, ref: 'Franchisor'},
});

var BussinessTypeListSchema = new mongoose.Schema({
    "businessType_id": {type: Schema.Types.ObjectId, ref: 'FranchiseeType'},
    "doc_name":String,
    "doc_status":{type:String, default:'Pending'},
    "doc_link":String,
    "doc_type":{type:String,default:'docs'},
    "version_id": String,
    "franchisor_id": { type: Schema.Types.ObjectId, ref: 'Franchisor'},
});

var KycSchema = new mongoose.Schema({
    "franchisee_id": {type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "partner_id": {type: Schema.Types.ObjectId, ref: 'Partner'},
    "docs_types": Array
});

var ReasonSchema = new mongoose.Schema({
    'reason_listed': String,
    'reason_in_text': String,
    'status' : String,
    'doc_name' : String,
    'franchisee_Id' : {type: Schema.Types.ObjectId, ref: 'Franchisee'},
    'partner_Id' :{type: Schema.Types.ObjectId, ref: 'Partner'},
    'kyc_id' : {type: Schema.Types.ObjectId, ref: 'KycUploads'},
  });

var QuestionTypeSchema = new mongoose.Schema({
    'question_type_name':String,
    'version_id': String,
    'franchisor_id': { type: Schema.Types.ObjectId, ref: 'Franchisor'}
});

var InterviewQuestionSchema = new mongoose.Schema({
    'question_EN':String,
    'options':[{option:String,correct_answer:{type:Number,default:0}}],
    'correct_answer':String,
    'question_type_id':{type: Schema.Types.ObjectId, ref: 'QuestionType'},
    'question_type':String,
    'version_id': String,
    'franchisor_id': { type: Schema.Types.ObjectId, ref: 'Franchisor'}
});

var AssessmentSchema = new mongoose.Schema({
    'assessment_list':Array,
    'correct_answers':Number,
    'total_questions':Number,
    'franchisee_id':{type: Schema.Types.ObjectId, ref: 'Franchisee'},
    'partner_id':{type: Schema.Types.ObjectId, ref: 'Partner'},
    'status': {type:String,default:'Pending'}
});

var ApplicationSchema = new mongoose.Schema({
    'version_id': String,
    'question_EN':String,
    'question_type':String,
    'options': Array,
    'franchisee_Id' : {type: Schema.Types.ObjectId, ref: 'Franchisee'},
    'isRequire':{type:Boolean,default:false},
    'order': { type:Number, default:0 }
})

var ApplicationSubmittedSchema = new mongoose.Schema({
    'answers': Array,
    'franchisee_Id' : {type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "application_status":{type:String,default:'Submitted'}
});

var CampaignSchema = new mongoose.Schema({
    'title': String,
    'location': String,
    'start': String,
    'end': String,
    'type': String,
    'notes': String,
    'campaign_color':String,
    'medium':Array,
    'budget': String,
    'feedback': String,
    // 'campaign_file':{type: Schema.Types.Mixed, default : {}},
    'franchisor_id':{ type: Schema.Types.ObjectId, ref: 'Franchisor'},
    'franchisee_id':{ type: Schema.Types.ObjectId, ref: 'Franchisee'},
    'doc_name': String,
    'link': {type: Schema.Types.Mixed, default : {}},
    'file_type': String,
    'date_uploaded':Date,
    'created_by': {type: String, enum: ['franchisor', 'franchisee']},
    'key':String,
    'meta': Object,
    'campaign_file_attachment_file_name': String,
    'campaign_file_attachment_file_url': String,
    'campaign_file_attachment_file_type': String,
    'campaign_files': Array,
    'visible_to':String,
    'visible_to_franchisee_id':String
});


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
