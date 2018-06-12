var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;
var franchiseeAssessmentSchema = new mongoose.Schema({
    'question_EN': String,
    'question_type': String,
    'options': Array,
    'franchisee_id':{type: Schema.Types.ObjectId, ref: 'Franchisee'},
    'isRequire':{type:Boolean, default:false},
    'order':{type:Number, default:0}
});

var franchiseeAssessmentSubmittedSchema = new mongoose.Schema({
    'answers': Array,
    'franchisee_id' : {type: Schema.Types.ObjectId, ref: 'Franchisee'},
    "franchisee_assessment_status":{type:String,default:'Submitted'}
});

mongoose.model('FranchiseeAssessment', franchiseeAssessmentSchema);
mongoose.model('FranchiseeAssessmentSubmitted', franchiseeAssessmentSubmittedSchema);