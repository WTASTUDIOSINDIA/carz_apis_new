var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var Franchisee = mongoose.model('Franchisee');
var Franchisor = mongoose.model('Franchisor');
require('../authenticate/authenticate.js');
var Schema = mongoose.Schema;

var DiscussionQuestionSchema = new mongoose.Schema({
    discussion_question : String,
    created_by: String,	
    created_at: {type: Date, default: Date.now},
    //0 = unapproved; 1 = approved, 2 = declined
    status: {type: String, default: 0},
	votes: {type: Number, default: 0},
    votedBy:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Franchisee'}],
    commentsCount: {type: Number, default: 0},
    discussion_comments: [{'franchisee_id':String,
     'franchisee_name':String, 
     'franchisee_city': String,
      'franchisee_profile_pic':{type: Schema.Types.Mixed, default : {}},
       'comment_text' :String,
       'comment_file_attachment_file_name': String,
       'comment_file_attachment_file_url': String,
       'comment_file_attachment_file_type': String,}],
    isVoted:{type:Boolean,default:false},
    franchisor_question_file_attachment_file_name: String,
    franchisor_question_file_attachment_file_url: String,
    franchisor_question_file_attachment_file_type: String,

    user_id: String,
    user_name: String,
    franchisee_name: String,
    franchisee_address: String,
    franchisee_profile_pic:{type: Schema.Types.Mixed, default : {}},
    user_profile_pic:{type: Schema.Types.Mixed, default : {}},

});
// var questionSchema = new mongoose.Schema({
// 	created_by: String,		//should be changed to ObjectId, ref "User"
// 	participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Audience'},
// 	created_at: {type: Date, default: Date.now},
// 	text: String,
// 	status: {type: String, default: 'InQueue'},
// 	votes: {type: Number, default: 0},
// 	votedBy:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Audience'}],
// 	commentsCount: {type: Number, default: 0},
// 	comments: [{'commentedBy':String,'commentText':String,'count':Number}],
// 	session:  { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
// 	isVoted:{type:Boolean,default:false}
// });

mongoose.model('DiscussionQuestion', DiscussionQuestionSchema);