var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var utils = require('../../common/utils');
var moment = require('moment');
var aws = require('aws-sdk');
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

router.post('/create', function (req,res){
                  let data = req.body;
    if(data.user_name && data.user_mail && data.user_website && data.description && data.country_code && data.phone_number) {
        franchisorservice.findFranchisor({user_mail: data.user_mail}, '')
      .then((response) => {
        if(response){
          throw {
            reason: "Exists"
          }
        }else { 
        return franchisorservice.findUser({user_mail: data.user_mail}, '')
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
            var prof_pic_url = "";
            let fileExt = "";
            if(data.user_img){
                    if(data.user_img != ""){
                        
                     
                      if (data.user_img.indexOf("image/png") != -1)
                          fileExt = "png";
                      else if (data.user_img.indexOf("image/jpeg") != -1)
                          fileExt = "jpeg";
                      else if (data.user_img.indexOf("image/jpg") != -1)
                          fileExt = "jpg";
                      else if (data.user_img.indexOf("video/mp4") != -1)
                          fileExt = "mp4";
                      else
                          fileExt = "png";
                    
                      let imageKey = "user_img/img_" + moment().unix();

                      if (data.user_img){
                    
                      utils.uploadToS3(imageKey, fileExt, data.user_img);
                      
                    }
                      prof_pic_url = utils.awsFileUrl()+imageKey + "." + fileExt;
                   
                        }
                      //   else{
                      // prof_pic_url = utils.awsFileUrl() + "franchisee_img/fallout.png";
                       
                      // }
                    }
                      // else{
                      // prof_pic_url = utils.awsFileUrl() + "franchisee_img/fallout.png";
                        
                      // }
      
          data.profile_pic = {
              "image_url" : prof_pic_url,
              "image_type" : fileExt,
              "created_on" : new Date()
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
    if(data.id && data.password) {
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
        res.status(203).json({error:'2',message:"Id and password is required."});
      }
  
  })
  router.put('/change_franchisor_status', function(req, res){
  try {
    let query = {_id: req.body.franchisor_id};
    franchisorservice.findOneFranchisor(query)
    .then((franchisor) => {
      console.log(franchisor);
      if(franchisor){
        franchisor.status = req.body.status;
        franchisor.save(function(err, saved_franchisor){
          res.status(200).json({error: "0", message: "Succesfully updated"});
        });
        
      }
    })  
  }
  catch (err) {
      return res.send({
          state: "error",
          message: err
      });
  }

  })

/*
  router.post('/update_franchisor',function (req,res){
    let data = req.body;
    if(data.id) {
    if(data.id.length == 24) {
    
    let id = objectId(data.id);

    let query = {_id:id};
    franchisorservice.findOneFranchisor(query)
    .then((response) => {
      if(response){
        var prof_pic_url = "";
         let fileExt = "";
            if(data.user_img){
                    if(data.user_img != ""){
                        
                     
                      if (data.user_img.indexOf("image/png") != -1)
                          fileExt = "png";
                      else if (data.user_img.indexOf("image/jpeg") != -1)
                          fileExt = "jpeg";
                      else if (data.user_img.indexOf("image/jpg") != -1)
                          fileExt = "jpg";
                      else if (data.user_img.indexOf("video/mp4") != -1)
                          fileExt = "mp4";
                      else
                          fileExt = "png";
                    
                      let imageKey = "user_img/img_" + moment().unix();

                      if (data.user_img){
                    
                      utils.uploadToS3(imageKey, fileExt, data.user_img);
                      
                    }
                      prof_pic_url = utils.awsFileUrl()+imageKey + "." + fileExt;
                   
                        }else{
                       prof_pic_url = "carz_pic.jpg";
                      }}else{
                        prof_pic_url = "carz_pic.jpg";
                      }
      
          response.profile_pic = {
              "image_url" : prof_pic_url,
              "image_type" : fileExt,
              "created_on" : new Date()
          }

          
      
        if(response.user_mail == data.user_mail){
          response.description =  data.description;
          response.user_website = data.user_website;
          response.country_code = data.country_code;
          response.user_name = data.user_name;
          response.phone_number = data.phone_number;
          response.save();
          res.status(200).json({ error: "0", message: "Succesfully updated"});
        }else{
          return franchisorservice.findFranchisor({user_mail: data.user_mail}, '')
         
        }
      }else{
        throw {
          reason: "notExists"
        }
      }
      
    })

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
        return franchisorservice.findOneFranchisor(query);
      }
    })
    
    .then((response) => {
      if(response){

        utils.send_franchisor_change_mail_to_old(response.user_mail);  
        response.user_mail = data.user_mail;
        response.description =  data.description;
        response.user_website = data.user_website;
        response.country_code = data.country_code;
        response.user_name = data.user_name;
        response.phone_number = data.phone_number;
        if(response.user_pass != ""){
          response.old_pass = response.user_pass;
        }
        response.user_pass = "";
        response.status = "inactive";

        utils.send_franchisor_change_mail_to_new(response);
        
        return response.save();

      }else{
        throw {
          reason: "notExists"
        }
      }
    })

    .then((response) => {
      if(response){
        response.user_pass = undefined;
       res.status(200).json({ error: "0", message: "Succesfully updated"});
      }else{
        res.status(203).json({ error: "1", message: "Uncaught error!"});
      }
    })

    .catch((error) => {
      if(error.reason == "notExists"){
        res.status(203).json({ error: "1", message: "User not found"});
      }else if(error.reason == "Exists"){
        res.status(203).json({ error: "1", message: "Email already existed."});
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
  */

 router.post('/update_franchisor', utils.upload.single('profile_pic'),function (req,res){

  //let data = JSON.parse(req.body.user);
  let data = req.body;
  if(data.id) {
  if(data.id.length == 24) {
  
  let id = objectId(data.id);

  let query = {_id:id};
  var existed_response = "";
  var prof_pic_url = "";
  franchisorservice.findOneFranchisor(query)
  .then((response) => {
    if(response){
      let fileExt = "";
            if(data.user_img){
                    if(data.user_img != ""){
                        
                     
                      if (data.user_img.indexOf("image/png") != -1)
                          fileExt = "png";
                      else if (data.user_img.indexOf("image/jpeg") != -1)
                          fileExt = "jpeg";
                      else if (data.user_img.indexOf("image/jpg") != -1)
                          fileExt = "jpg";
                      else if (data.user_img.indexOf("video/mp4") != -1)
                          fileExt = "mp4";
                      else
                          fileExt = "png";
                    
                      let imageKey = "user_img/img_" + moment().unix();

                      if (data.user_img){
                    
                      utils.uploadToS3(imageKey, fileExt, data.user_img);
                      
                    }
                      prof_pic_url = utils.awsFileUrl()+imageKey + "." + fileExt;
                   
                        }
                      //   else{
                      // //  prof_pic_url = "franchisee_img/fallout.png";
                      // prof_pic_url = utils.awsFileUrl() + "franchisee_img/fallout.png";

                      // }
                    }
                    // else{
                    //   prof_pic_url = utils.awsFileUrl() + "franchisee_img/fallout.png";                        
                    //   }
      
          response.profile_pic = {
              "image_url" : prof_pic_url,
              "image_type" : fileExt,
              "created_on" : new Date()
          }
      if(response.user_mail == data.user_mail){
        response.description =  data.description;
        response.user_website = data.user_website;
        response.country_code = data.country_code;
        response.user_name = data.user_name;
        response.phone_number = data.phone_number;
        existed_response = response;
        //res.status(200).json({ error: "0", message: "Succesfully updated"});
      }else{
        return franchisorservice.findFranchisor({user_mail: data.user_mail}, '')
       
      }
    }else{
      throw {
        reason: "notExists"
      }
    }
    
  })

  .then((response) => {
    console.log(response);
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
      return franchisorservice.findOneFranchisor(query);
    }
  })
  
  .then((response) => {
    if(response){
      if(response.user_mail == data.user_mail){
        return existed_response.save();
      }else{
      utils.send_franchisor_change_mail_to_old(response.user_mail);  
      response.profile_pic = {
        "image_url" : prof_pic_url,
        "image_type" : fileExt,
        "created_on" : new Date()
      }
      response.user_mail = data.user_mail;
      response.description =  data.description;
      response.user_website = data.user_website;
      response.country_code = data.country_code;
      response.user_name = data.user_name;
      response.phone_number = data.phone_number;
      if(response.user_pass != ""){
        response.old_pass = response.user_pass;
      }
      response.user_pass = "";
      response.status = "inactive";

      utils.send_franchisor_change_mail_to_new(response);
      
      return response.save();
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
     res.status(200).json({ error: "0", message: "Succesfully updated"});
    }else{
      res.status(203).json({ error: "1", message: "Uncaught error!"});
    }
  })

  .catch((error) => {
    if(error.reason == "notExists"){
      res.status(203).json({ error: "1", message: "User not found"});
    }else if(error.reason == "Exists"){
      res.status(203).json({ error: "1", message: "Email already existed."});
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



  router.post('/confirm_mail', function (req,res){

    let data = req.body;
    if(data.id) {
    if(data.id.length == 24) {
    
    let id = objectId(data.id);

    let query = {_id:id};
    franchisorservice.findOneFranchisor(query)
    .then((response) => {
      if(response){
        if(!response.user_pass || response.user_pass == ""){
          response.status = "active";
            response.user_pass = response.old_pass;//req.body.user_pass;
            response.old_pass = "";
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
       res.status(200).json({ error: "0", message: "Succesfully verified",data:response});
      }else{
        res.status(203).json({ error: "1", message: "Uncaught error!"});
      }
    })

    .catch((error) => {
      if(error.reason == "notExists"){
        res.status(203).json({ error: "1", message: "User not found"});
      }else if(error.reason == "alreadySet"){
        res.status(203).json({ error: "1", message: "Mail has been already verified"});
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