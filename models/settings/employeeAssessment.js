var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
var employeeAssessmentSchema = new mongoose.Schema({
    'question_EN': String,
    'question_type': String,
    'options': Array,
    'employee_answers': String,
    'order': { type: Number, default: 0 },
    'assessment_type_id': {type: Schema.Types.ObjectId, ref: 'EmployeeAssessmentType'},
    'franchisee_id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    'employee_assessment_file_attachment_file_url': String,
    'employee_assessment_file_attachment_file_name': String,
    'employee_assessment_file_attachment_file_type': String
})

var employeeAssementSubmittedSchema = new mongoose.Schema({
    'employee_assessment_list': Array,
    'correct_answer': String,
    'total_questions': Number,
    'assessment_type_id': {type: Schema.Types.ObjectId, ref: 'EmployeeAssessmentType'},
    'franchisee_id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    'employee_assessment_status': { type: String, default: 'Pending' }
});

var employeeAssessmentTypeSchema = new mongoose.Schema({
    'assessment_type_name': String,
    'franchisor_id':  {type: Schema.Types.ObjectId, ref: 'Franchisor'}
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
    'employee_vertical': String,
    'employee_days_experience': String,
    'created_on' : { type: Date, default: Date.now },
    'franchisee_id': { type: Schema.Types.ObjectId, ref: 'Franchisee' },
    'employee_id': { type: Schema.Types.ObjectId, ref: 'Employee' }
})

mongoose.model('EmployeeAssessmentType', employeeAssessmentTypeSchema);
mongoose.model('EmployeeDetails', employeeDetailsSchema);
mongoose.model('EmployeeAssessment', employeeAssessmentSchema);
mongoose.model('EmployeeAssessmentSubmitted', employeeAssementSubmittedSchema);