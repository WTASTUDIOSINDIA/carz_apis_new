var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
var employeeAssessmentSchema = new mongoose.Schema({
    'question_EN': String,
    'question_type': String,
    'options': Array,
    'franchisee_id':{type: Schema.Types.ObjectId, ref: 'Franchisee'},
    'correct_answer':String,
    'order':{type:Number, default:0},
    'employee_assessment_file_attachment_file_url': String,
    'employee_assessment_file_attachment_file_name' : String,
    'employee_assessment_file_attachment_file_type': String
})

var employeeAssementSubmittedSchema = new mongoose.Schema({
    'employee_assessment_list': Array,
    'employee_answers': Number,
    'total_questions': Number,
    'franchisee_id' : {type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "employee_assessment_status":{type:String,default:'Pending'}
});

var createEmployeeSchema = new mongoose.Schema({
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
    'franchisee_id':{type: Schema.Types.ObjectId, ref: 'Franchisee'},
    'employee_id':{type: Schema.Types.ObjectId, ref: 'Employee'}
})
mongoose.model('CreateEmployee', createEmployeeSchema);
mongoose.model('EmployeeAssessment', employeeAssessmentSchema);
mongoose.model('EmployeeAssessmentSubmitted', employeeAssementSubmittedSchema);
