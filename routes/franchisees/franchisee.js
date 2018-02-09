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
        Franchisee.find(function(err,user){
            if(err){
                return res.send(500, err);
            }
            console.log("franchisees",user);
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
      console.log("req.body",req.body);
      let Franchisee = new Franchisee({
        franchisee_name:req.body.franchisee_name,
        franchisee_occupation:req.body.franchisee_occupation,
        franchisee_email:req.body.franchisee_email,
        franchisee_city:req.body.franchisee_city,
        franchisee_state:req.body.franchisee_state,
        franchisee_address:req.body.franchisee_address,
        franchisee_mobile_number:req.body.franchisee_mobile_number,
        franchisee_age:req.body.franchisee_age,
        franchisee_lead_source:req.body.franchisee_lead_source,
        franchisee_investment:req.body.franchisee_investment,
        franchisee_preferred_date:req.body.franchisee_preferred_date,
        franchisee_preferred_time:req.body.franchisee_preferred_time,
        franchisee_how_soon_to_start:req.body.franchisee_how_soon_to_start,
        franchisee_franchise_model:req.body.franchisee_franchise_model,
        franchisee_remarks:req.body.franchisee_remarks
      });
      Franchisee.save(function(err, franchisee){
          if(err)
          {
              res.json({msg: 'Failed to create'});
          }
          else{
              res.json({msg: 'created sucessfully'});
          }
      });
  });

 //update franchisee
 router.put('/edit_franchisee', function(req, res) {
    console.log("req.body",req.body);
    let Franchisee = Franchisee({
      franchisee_name:req.body.franchisee_name,
      franchisee_occupation:req.body.franchisee_occupation,
      franchisee_email:req.body.franchisee_email,
      franchisee_city:req.body.franchisee_city,
      franchisee_state:req.body.franchisee_state,
      franchisee_address:req.body.franchisee_address,
      franchisee_mobile_number:req.body.franchisee_mobile_number,
      franchisee_age:req.body.franchisee_age,
      franchisee_lead_source:req.body.franchisee_lead_source,
      franchisee_investment:req.body.franchisee_investment,
      franchisee_preferred_date:req.body.franchisee_preferred_date,
      franchisee_preferred_time:req.body.franchisee_preferred_time,
      franchisee_how_soon_to_start:req.body.franchisee_how_soon_to_start,
      franchisee_franchise_model:req.body.franchisee_franchise_model,
      franchisee_remarks:req.body.franchisee_remarks,
      role:req.body.role,
    });
  Franchisee.findByIdAndUpdate(function(err, franchisee){
        if(err)
        {
            res.json({msg: 'Failed to update'});
        }
        else{
            res.json({msg: 'Updated sucessfully'});
        }
    });
});
  
  //delete franchisee
  router.delete('/delete_franchisee/:id',function(req,res){
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