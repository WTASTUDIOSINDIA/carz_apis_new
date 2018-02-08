var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var franchiseeSchema = new mongoose.Schema({
    "franchisee_name":String,
    "franchisee_occupation":String,
    "franchisee_email":String,
    "franchisee_pic":{type: Schema.Types.Mixed, default : {}},
    "franchisee_city":String,
    "franchisee_state":String,
    "franchisee_address":String,
    "franchisee_mobile_number":Number,
    "franchisee_age":Number,
    "franchisee_lead_source":String,
    "franchisee_investment":String,
    "franchisee_preferred_date":Date,
    "franchisee_preferred_time":String,
    "franchisee_how_soon_to_start":String,
    "franchisee_franchise_model":String,
    "franchisee_remarks":String,
    "role":String
});

mongoose.model('Franchisee', franchiseeSchema);