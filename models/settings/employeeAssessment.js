var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
var employeeAssessmentSchema = new mongoose.Schema({
    'question_EN': String,
    'question_type': String,
    'options': Array,
    'franchisee_id':{type: Schema.Types.ObjectId, ref: 'Franchisee'},
    'isRequire':{type:Boolean, default:false},
    'order':{type:Number, default:0}
})

var employeeAssementSubmittedSchema = new mongoose.Schema({
    'answers': Array,
    'franchisee_id' : {type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "employee_assessment_status":{type:String,default:'Submitted'}
});
mongoose.model('EmployeeAssessment', employeeAssessmentSchema);
mongoose.model('EmployeeAssessmentSubmitted', employeeAssementSubmittedSchema);
