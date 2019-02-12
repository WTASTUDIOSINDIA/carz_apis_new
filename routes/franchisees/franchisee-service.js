'use strict';

var mongoose = require('mongoose');
var Franchisee = mongoose.model('Franchisee');

const findandCount = (query) => {
  //return Franchisee.findOneAndUpdate(query, data, { new: true }).exec();
  return Franchisee.aggregate([
    { "$match":query},
    
     { "$group": {
          "_id": {
            
            "key": "$lead_type",
            
          },
    "count": { "$sum": 1 }
  }}
]).exec();
}

module.exports = {
  
  findandCount
};
