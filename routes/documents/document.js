var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var path = require('path');
var FranchiseeType = mongoose.model('FranchiseeType');

router.get('/get_type',function(req,res){
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
});

router.post('/set_type',function(req,res){
    FranchiseeType.findOne({type_name:req.body.type_name},function(err,type){
        if(err){
            return res.send({
                state:"err",
                message:"Something went wrong.We are looking into it."
            },500);
        }
        console.log("type",type);
        if(type){
            return res.send({
                state:"failure",
                message:"Franchisee type with this name exist."
            },400);
        }
        else{
            var document_list = new FranchiseeType();
            document_list.type_name=req.body.type_name;
            document_list.type_files=req.body.type_files;
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
    })
});

module.exports = router;