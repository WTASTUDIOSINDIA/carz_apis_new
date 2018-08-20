var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );;
var multer  = require('multer');
var Franchisor = mongoose.model('Franchisor');
var bCrypt = require('bcrypt-nodejs');
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};
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


module.exports = router;