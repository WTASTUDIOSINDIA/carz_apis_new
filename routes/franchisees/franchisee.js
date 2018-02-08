var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer')
var upload = multer({ dest: 'public/uploads/' });
var path = require('path');
var Franchisee = mongoose.model('Franchisee');

//get all franchisees
router.get('/get_franchisees',function(req,res){
    console.log("req.params",req.params.user_id);
    try{
        Franchisee.find({user_id:req.body.user_id},function(err,user){
            if(err){
                return res.send(500, err);
            }
            console.log("user",user);
            if(!user){
                res.send({
                    "status":"201",
                    "message":"User not found",
                    "franchisees_list":"failure"
                });
            }
            else{
                res.send({
                    "status":"200",
                    "user":user,
                    "franchisees_list":"success"
                });
            }
        })
    }
    catch(err){
		return res.send({
			state:"error",
			message:err
		});
	}
});

  
  //get franchisee by id
  router.get('/get_franchisee_by_id',function(req,res){
    console.log("req.params",req.params.franchisee_id);
    try{
        Franchisee.findById({franchisee_id:req.body.franchisee_id},function(err,franchisee_id){
            if(err){
                return res.send(500, err);
            }
            console.log("franchisee",franchisee_id);
            if(!franchisee_id){
                res.send({
                    "status":"201",
                    "message":"User not found",
                    "franchisees_data":"failure"
                });
            }
            else{
                res.send({
                    "status":"200",
                    "user":user,
                    "franchisees_data":"success"
                });
            }
        })
    }
    catch(err){
		return res.send({
			state:"error",
			message:err
		});
	}
});
  
//create franchisee
router.post('/create_franchisee', function(req, res) {
    Franchisee.create(req.params.id, 
        name,
        mail, 
        investment, 
        occupation, 
        mobile, 
        age, 
        model, 
        city, 
        state, 
        lead_name, 
        model, 
        address, 
        source, 
        pic, 
        setup_percentage, 
        req.body,
        role, 
        function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  });
  
  //update franchisee
  router.put('/edit_franchisee', function(req, res, next) {
    Franchisee.findByIdAndUpdate(req.params.id, 
        name,
        mail, 
        investment, 
        occupation, 
        mobile, 
        age, 
        model, 
        city, 
        state, 
        lead_name, 
        model, 
        address, 
        source, 
        pic, 
        setup_percentage, 
        req.body,
        role, 
        function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  });
  
  //delete franchisee
  router.delete('/delete_franchisee',function(req,res){
    console.log("req.params",req.params.franchisee_id);
    try{
        Franchisee.findByIdAndRemove({franchisee_id:req.body.franchisee_id},function(err,user){
            if(err){
                return res.send(500, err);
            }
            console.log("user",user);
            if(!user){
                res.send({
                    "status":"201",
                    "message":"Unsucessfull",
                    "franchisees_data":"failure"
                });
            }
            else{
                res.send({
                    "status":"200",
                    "message":"User deleted sucessfully",
                });
            }
        })
    }
    catch(err){
		return res.send({
			state:"error",
			message:err
		});
	}
});
  
  module.exports = router;