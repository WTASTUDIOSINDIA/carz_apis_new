var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
var employeeAssessmentSchema = new mongoose.Schema({
    'question_EN': String,
    'question_type': String,
    'options': Array,
    'employee_answer': String,
    'correct_answer':String,
    'order': { type: Number, default: 0 },
    'assessment_type': {id: String, status: {type: Boolean, default: false}},
    'assessment_type_id': {type: Schema.Types.ObjectId, ref: 'EmployeeAssessmentType'},
    'franchisee_id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    'employee_assessment_file_attachment_file_url': String,
    'employee_assessment_file_attachment_file_name': String,
    'employee_assessment_file_attachment_file_type': String,
    'question_duration': String,
    'question_percentage': String,
    'version_id': String,
    'franchisor_id':{type: Schema.Types.ObjectId, ref: 'Franchisor'}
})

var employeeAssementSubmittedSchema = new mongoose.Schema({
   // 'employee_assessment_list': Array,
    'correct_answer': String,
    'employee_answer': String,
    'is_answer_correct': {type: Boolean, default: false},
    'total_questions': Number,
    'assessment_type': {id: String, status: {type: Boolean, default: false}},
    'assessment_type_id': {type: Schema.Types.ObjectId, ref: 'EmployeeAssessmentType'},
    'franchisee_id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    // 'employee_assessment_status': { type: String, default: 'Pending' },
    'employee_id': {type: Schema.Types.ObjectId, ref: 'EmployeeDetails'},
    'version_id': String,
    'question_id': {type: Schema.Types.ObjectId, ref: 'EmployeeAssessment'},
    'franchisor_id': {type: Schema.Types.ObjectId, ref: 'Franchisor'}
});

var employeeAssessmentTypeSchema = new mongoose.Schema({
    'assessment_type_name': String,
    'description' : String,
    'franchisor_id':  {type: Schema.Types.ObjectId, ref: 'Franchisor'},
    'version_id': String,
    'model_id': String,
    'model_name': String,
    'createdAt': Date,
    'pass_percentage': Number,
    'assessment_duration': Number

});

var employeeAssessmentTypeOfFranchiseeSchema = new mongoose.Schema({
    'assessment_type_id': {type: Schema.Types.ObjectId, ref: 'EmployeeAssessmentType'},
    'assessment_type_name': String,
    'model_id': String,
    'model_name': String,
    'createdAt': Date,
    'employee_id': {type: Schema.Types.ObjectId, ref: 'EmployeeDetails'},
    'assessment_status': {type: Boolean, default: false},    
    'assessment_qualified': {type: Boolean, default: false},    
    'employee_percentage': Number,
    'pass_percentage': Number,
    'total_questions_count': Number,
    'answered_questions_count': Number

});

var employeeDetailsSchema = new mongoose.Schema({
    'employee_name': String,
    'employee_occupation': String,
    'employee_email': String,
    'employee_city': String,
    'employee_state': String,
    'employee_address': String,
    'employee_mobile_number': String,
    'employee_age': String,
    'employee_company_of_experience': String,
    'employee_experience_in': String,
    'employee_gender': String,
    'employee_department':String,
    'employee_languages':String,
    'employee_previous_experience_details': String,
    'model_id': String,
    'model_name': String,
    'employee_vertical': String,
    'employee_days_experience': String,
    'evaluated_employee': {type: Boolean, default: false},
    'created_on' : { type: Date, default: Date.now },
    'franchisee_id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    'employee_id': { type: Schema.Types.ObjectId, ref: 'Employee' },
    'pass_percentage': Number
})
var sectionsSchema = new mongoose.Schema({
    "section_name":String,
    "franchisor_id": String
});

var carModelSchema = new mongoose.Schema({
    "model_name": String,
    "version_id": String,
    "franchisor_id": String
})


mongoose.model('EmployeeAssessmentTypeOfFranchisee', employeeAssessmentTypeOfFranchiseeSchema);
mongoose.model('EmployeeAssessmentType', employeeAssessmentTypeSchema);
mongoose.model('EmployeeDetails', employeeDetailsSchema);
mongoose.model('EmployeeAssessment', employeeAssessmentSchema);
mongoose.model('EmployeeAssessmentSubmitted', employeeAssementSubmittedSchema);
mongoose.model('Sections', sectionsSchema);
mongoose.model('CarModels', carModelSchema);
