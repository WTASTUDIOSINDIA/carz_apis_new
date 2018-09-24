var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var Franchisor = mongoose.model('Franchisor');
var bCrypt = require('bcrypt-nodejs');
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};
var franchisorservice = require('./franchisor-service');
var utils = require('../../common/utils');
const objectId = mongoose.Types.ObjectId;
//   edit  franchisor my profile
router.put('/edit_franchisor_profile', function (req,res){
    if(req.body.user_name){
    try{
        
        Franchisor.findById({_id:req.body.user_id}, function(err, user){
            if(err){
                return res.send(500, err);
            }
            if(user){
                user.user_name = req.body.user_name;
                if(req.body.user_pass){
                    user.user_pass = createHash(req.body.user_pass);//req.body.user_pass;
                }
                user.save(function(err,user){
                })
                if(err){
                    res.send({
                        state:"err",
                        message:"Something went wrong."
                    },500);

                }
                else {
                    res.send({
                        state:"success",
                        message:"Profile updated successfully!",
                        data: user
                    },200)
                }
            }
        });
    }
    catch(err){
        res.send({
            state:"error",
            message:"Something went wrong."
        },500);
    }
}else{
    
        res.send({
            state:"error",
            message:"Missing required parameters."
        },400);
    
}
})

router.post('/create', utils.upload.single('profile_pic'), function (req,res){

    let data = JSON.parse(req.body.user);
    //let data = req.body;
   console.log(data);
    if(data.user_name && data.user_mail && data.user_website && data.description && data.country_code && data.phone_number) {
        franchisorservice.findFranchisor({user_mail: data.user_mail}, '')
      .then((response) => {
        if(response){
          throw {
            reason: "Exists"
          }
        }else { 
        return franchisorservice.findUser({user_mail: data.user_mail}, '')
          //return franchisorservice.create(data);
        }
      })
      .then((response) => {
        if(response){
          throw {
            reason: "Exists"
          }
        }else { 
        return franchisorservice.findSuperAdmin({user_mail: data.user_mail}, '')
        }
      })

      .then((response) => {
        if(response){
          throw {
            reason: "Exists"
          }
        }else {
            console.log(req.file);  
            if(req.file){
                data.profile_pic = {
                    "image_url" : req.file.location,
                    "image_type" : req.file.mimetype,
                    "created_on" : new Date()
                }
            }
          return franchisorservice.create(data);
        }
      })
      .then((response) => {
        if(response) {
          utils.send_franchisor_registartion_mail(response);   
          response.user_pass = undefined;
          res.status(200).json({ error: "0", message: "User Registeration is Successful", data: response});
        } else {
          res.status(400).json({ error: "1", message: "User Registration Failed." });
        }
      })
      .catch((err) => {
      if(err.reason == "Exists")
        res.status(203).json({error:'3',message:"User Already Exists with same email"});
       else
        res.status(500).json({error:'4',message:"Internal Sever Error"});
      });
    } else {
      res.status(203).json({error:'2',message:"Please enter all details."});
    }
  
  })

  router.get('/get_franchisors', function (req,res){
    
    let query = {};
    franchisorservice.findFranchisors(query)
    .then((response) => {
      if(response)
      {
        response.user_pass = undefined;  
        res.status(200).json({ error: "0", message: "Succesfully fetched", data: response});
      }else{
        res.status(404).json({ error: "1", message: "Error in getting details"});
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "2", message: "Internal server error"});
    });
  })


  router.post('/get_franchisor', function (req,res){
   
    let data = req.body;
    if(data.id) {
    if(data.id.length == 24) {
    
    let id = objectId(data.id);

    let query = {_id:id};
    franchisorservice.findOneFranchisor(query)
    .then((response) => {
      if(response){
        response.user_pass = undefined;
        res.status(200).json({ error: "0", message: "Succesfully fetched", data: response});
      }else{
        res.status(404).json({ error: "1", message: "Error in fetching"});
      }
      
    })
    .catch((error) => {
      res.status(500).json({ error: "4", message: "Internal server error"});
    });
    }else{
        res.status(200).json({error:'3',message:"Please enter valid Franchisorid."});
      }}
      else{
        res.status(203).json({error:'2',message:"Id is required."});
      }
  })
  

  router.post('/update_franchisor_pass', function (req,res){

    let data = req.body;
    if(data.id) {
    if(data.id.length == 24) {
    
    let id = objectId(data.id);

    let query = {_id:id};
    franchisorservice.findOneFranchisor(query)
    .then((response) => {
      if(response){
        if(!response.user_pass){
          response.status = "active";
          if(req.body.password){
            response.user_pass = createHash(req.body.password);//req.body.user_pass;
          }
          return response.save();
        }else{
          throw {
            reason: "alreadySet"
          }
        }
        
      }else{
        throw {
          reason: "notExists"
        }
      }
      
    })

    .then((response) => {
      if(response){
        response.user_pass = undefined;
       res.status(200).json({ error: "0", message: "Succesfully Created passowrd"});
      }else{
        res.status(203).json({ error: "1", message: "Uncaught error!"});
      }
    })

    .catch((error) => {
      if(error.reason == "notExists"){
        res.status(203).json({ error: "1", message: "User not found"});
      }else if(error.reason == "alreadySet"){
        res.status(203).json({ error: "1", message: "Password has been already set"});
      }else{
        res.status(500).json({ error: "4", message: "Internal server error"});
      }
      
    });
    }else{
        res.status(200).json({error:'3',message:"Please enter valid Franchisorid."});
      }}
      else{
        res.status(203).json({error:'2',message:"Id is required."});
      }
  
  })

  


module.exports = router;