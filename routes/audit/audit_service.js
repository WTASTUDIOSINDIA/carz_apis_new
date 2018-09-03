'use strict';

var mongoose = require('mongoose');
var FranchiseeAuditTask = mongoose.model('FranchiseeAuditTask');
var AuditChecklist = mongoose.model('AuditChecklist');
var AuditChecklistType = mongoose.model('AuditChecklistType');
var AuditTask = mongoose.model('AuditTask');
var NonWorkingDay = mongoose.model('NonWorkingDay');


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

const findlist = (query,second_query,nonworking_query) => {
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


const findtasks = (query,second_query,nonworking_query) => {
  
  return AuditChecklist.aggregate([
    { $match: {
      $and: [
            query
      ]
  } },
 
{
  $lookup: {
      from: NonWorkingDay.collection.name,
      let: { id: "$_id"},
      pipeline: [
        { $match: {
          
          $and: [
            {$expr:{ $eq: [ "$checklist_id",  "$$id" ] }},
            nonworking_query
            ] }
        },
        
      ],
    
    as: 'NonWorkingDayData'
  }
},
{
  $lookup: {
      from: AuditTask.collection.name,
      let: { id: "$_id"},
      pipeline: [
        { $match: {
          
          $and: [
            {$expr:{ $eq: [ "$checklist_id",  "$$id" ] }}
            ] }
        },
        {
          $lookup: {
              from: FranchiseeAuditTask.collection.name,
              let: { taskid: "$_id"},
              pipeline: [
                { $match: {
                  
                  $and: [
                    {$expr:{ $eq: [ "$task_id",  "$$taskid" ] }},
                    second_query
                    ] }
                },
                
              ],
            
            as: 'FranchiseeTaskData'
          }
        },
        
      ],
    
    as: 'TaskData'
  }
  
},
  
  ]).exec();
}  

const findTasksList = (type) => {
  return AuditTask.aggregate([
    { $match: {
      $and: [
            {checklist_type:type}
      ]
  } },
]).exec();
}


const findCalenderList = (query) => {

  return FranchiseeAuditTask.aggregate([
    { $match: {
      $and: [
        query
      ]
  } },
  

  ]).exec();
}  


const findNonWorkList = (query) => {

  return NonWorkingDay.findOne(query).exec();
}  

const findNonWorkingDay = (query) => {
  return NonWorkingDay.findOne(query).exec();
}

const createNonWorkingDay = (data) => {
  return NonWorkingDay.create(data);
}

const removeNonWorkingDay = (query) => {
  return NonWorkingDay.remove(query).exec();
}

const update = (query, data) => {
  return FranchiseeAuditTask.findOneAndUpdate(query, data, { new: true }).exec();
}

const updateNonWorkingDay = (query, data) => {
  return NonWorkingDay.findOneAndUpdate(query, data, { new: true }).exec();
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
  findFranchiseeTasksByDaily,
  findNonWorkingDay,
  createNonWorkingDay,
  removeNonWorkingDay,
  updateNonWorkingDay,
  findCalenderList,
  findTasksList,
  findNonWorkList
};
