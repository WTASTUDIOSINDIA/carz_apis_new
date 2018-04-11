var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var path = require('path');
var Application = mongoose.model('Application');
var _ = require('lodash');

router.post('/application_list',function(req,res){
    try{
        Application.findOne({franchisee_id:req.body.franchisee_id,question_EN:req.body.question_EN},function(err,ques){
            if(err){
                return res.send({
                    state:"error",
                    message:err
                },500);
            }
            if(ques){
                return res.send({
                    state:"failure",
                    message:"Application created already"
                },200);
            }
            else{
                var application = new Application();
                application.question_EN = req.body.question_EN;
                application.question_type = req.body.question_type;
                application.options = req.body.options;
                application.franchisee_id=req.body.franchisee_id,
                application.save(function(err,application){
                    if(err){
                        return res.send({
                            state:"error",
                            message:err
                        },500);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:"Application created",
                            data:application
                        },200);
                    }
                })
            }
        });
    }
    catch(err){
		return res.send({
			state:"error",
			message:err
		},500);
	}
});