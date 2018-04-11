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
    "franchisee_mobile_number":Number,
    "franchisee_investment":String,
    "franchisee_preferred_date":String,
    "franchisee_preferred_time":String,
    "franchisee_how_soon_to_start":String,
    "franchisee_franchise_model":String,
    "franchisee_franchise_type": String,
    "franchisee_stage_completed": {type:Number, default:1},
    "franchisee_remarks":String,
    "master_franchisee_id": String,
    "franchisee_country": String,
    "franchisee_pincode": String,
    "franchisee_area": String,
    "partners_list":Number,
    "lead_age":Number,
    "lead_source":String,
    "sub_stage":String,
    "user_role": {type:String, default:'franchisee'},
    "bussiness_type": String
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
    "partner_mobile_number": Number,
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
    "test_completed":{type:Boolean,default:false}
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
   "stage_id": String

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

var BussinessTypeSchema = new mongoose.Schema({
    "bussiness_type_name": String,
});

var BussinessTypeListSchema = new mongoose.Schema({
    "businessType_id": {type: Schema.Types.ObjectId, ref: 'FranchiseeType'},
    "doc_name":String,
    "doc_status":{type:String, default:'Pending'},
    "doc_link":String,
    "doc_type":{type:String,default:'docs'}
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
    'question_type_name':String
});

var InterviewQuestionSchema = new mongoose.Schema({
    'question_EN':String,
    'options':[{option:String,correct_answer:{type:Number,default:0}}],
    'correct_answer':String,
    'question_type_id':{type: Schema.Types.ObjectId, ref: 'QuestionType'},
    'question_type':String
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
    'question_EN':String,
    'question_type':String,
    'options': Array,
    'franchisee_Id' : {type: Schema.Types.ObjectId, ref: 'Franchisee'},
   })


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

