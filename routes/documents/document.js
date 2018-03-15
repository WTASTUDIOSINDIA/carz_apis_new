var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var path = require('path');
var FranchiseeType = mongoose.model('FranchiseeType');

router.get('/get_type',function(req,res){
    try{
        FranchiseeType.find({},function(err,type){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            else{
                return res.send({
                    state:"suces",
                    FranchiseeType:type
                },200);
            }
        })
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});

router.post('/set_type',function(req,res){
    try{
        FranchiseeType.findOne({type_name:req.body.type_name},function(err,type){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(type){
                return res.send({
                    state:"failure",
                    message:"Franchisee type with this name exist."
                },400);
            }
            else{
                var document_list = new FranchiseeType();
                document_list.types={
                    type_name:req.body.type_name,
                    type_files:req.body.type_files
                }
                document_list.save(function(err,document_list){
                    if(err){
                        return res.send({
                            state:"err",
                            message:"Something went wrong.We are looking into it."
                        },500);
                    }
                    else{
                        return res.send({
                            state:"success",
                            message:"Successfully added in the array."
                        },200);
                    }
                })
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
});

router.delete('/delete/franchiseeType/:id',function(req,res){
    try{
        FranchiseeType.findByIdAndRemove({_id:req.params.id},function(err,type){
            if(err){
                return res.send({
                    state:"err",
                    message:"Something went wrong.We are looking into it."
                },500);
            }
            if(!type){
                return res.send({
                    state:"err",
                    message:"Id is wrong."
                },500);
            }
            else{
                return res.send({
                    state:"success",
                    message:"Removed successfully"
                },200);
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:err
        },500);
    }
})

module.exports = router;