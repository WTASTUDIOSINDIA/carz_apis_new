'use strict';

var mongoose = require('mongoose');
var FranchiseeAuditTask = mongoose.model('FranchiseeAuditTask');
var AuditChecklist = mongoose.model('AuditChecklist');
var AuditChecklistType = mongoose.model('AuditChecklistType');
var AuditTask = mongoose.model('AuditTask');


const create = (data) => {
  return FranchiseeAuditTask.create(data);
}

const findOneUser = (query, selectable) => {
  return FranchiseeAuditTask.findOne(query).select(selectable).exec();
}

const findUser = (query) => {
  return FranchiseeAuditTask.findOne(query).select('username name email phone password verification verified').exec();
}

const findOne = (query) => {
  return FranchiseeAuditTask.findOne(query).exec();
}

const findFranchiseeTasksByDaily = (query) => {
  return FranchiseeAuditTask.find(query).exec();
}

const findcheckelist = (query) => {
    return AuditChecklist.find(query).exec();
  }

  const tasks = (query) => {
    return AuditTask.find().exec();
  }

const findlist = (query,second_query) => {
  return AuditChecklist.aggregate([
    { $match: {
      $and: [
            query
      ]
  } },
  {
    $lookup: {
        from: AuditTask.collection.name,
        localField: '_id',
        foreignField: 'checklist_id',
        as: 'TaskData'
    }
},

{
  $lookup: {
      from: FranchiseeAuditTask.collection.name,
      let: { id: "$_id"},
      pipeline: [
        { $match: {
          
          $and: [
            {$expr:{ $eq: [ "$checklist_id",  "$$id" ] }},
            second_query
            ] }
        },
        
      ],
    
    as: 'FranchiseeTaskData'
  }
},

  
  ]).exec();
}  



const findtasks = (query,second_query) => {
  
  return AuditTask.aggregate([
    { $match: {
      $and: [
            query
      ]
  } },
  

{
  $lookup: {
      from: FranchiseeAuditTask.collection.name,
      let: { id: "$_id"},
      pipeline: [
        { $match: {
          
          $and: [
            {$expr:{ $eq: [ "$task_id",  "$$id" ] }},
            second_query
            ] }
        },
        
      ],
    
    as: 'FranchiseeTaskData'
  }
},

  
  ]).exec();
}  



const update = (query, data) => {
  return FranchiseeAuditTask.findOneAndUpdate(query, data, { new: true }).exec();
}

module.exports =  {
  findOne,
  findUser,
  findOneUser,
  create,
  update,
  findcheckelist,
  findlist,
  tasks,
  findtasks,
  findFranchiseeTasksByDaily
};
