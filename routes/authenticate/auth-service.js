var mongoose = require('mongoose');   
var Auth = mongoose.model('Auth');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
module.exports = function(passport){
    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        Auth.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            try{
                // check in mongo if a user with username exists or not
                Auth.findOne({ 'user_mail' :  username},
                    function(err, franchisee) {
                        // In case of any error, return using the done method
                        if (err){
                            return done(err+"Error data");
                        }
                        // Username does not exist, log the error and redirect back
                        if (!franchisee){
                            return done(null, false, { message: 'User Not Found with username' });
                        }
                        // User exists but wrong password, log the error 
                        if (!isValidPassword(franchisee, password)){
                            return done(null, false, { message: 'Invalid UserName Or Password' });
                        }
                        // User and password both match, return user from done method
                        // which will be treated like success
                        return done(null, franchisee);
                    }
                );
            }
            catch(err){
                res.send({
                    state:"error",
                    message:err
                });
            }
        }
    ));
	
    passport.use('register', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            //var email = req.body.user_mail;
            // find a user in mongo with provided username
            try{
                Auth.findOne({ 'user_mail':username }, function(err, franchisee) {
                    // In case of any error, return using the done method
                    if (err){
                        return done(err, { message: 'Error in SignUp' });
                    }
                    // already exists
                    if (franchisee) {
                        return done(null, false, { message: 'User already exists with this username or email' });
                    }
                    // if there is no user, create the user
                    if (!franchisee) {
                        var franchisee = new Auth();
                        if(req.body.user_mail=="admin@admin.com"){
                            franchisee.user_role = "Admin";
                        }
                        franchisee.user_mail = username;
                        franchisee.user_pass = createHash(password);
                        franchisee.user_name = req.body.user_name;
                        franchisee.save(function(err,franchisee){
                            return done(null, franchisee);
                        })                       
                    }
                });
            }
            catch(err){
                res.send({
                    state:"error",
                    message:"Something went wrong"
                });
            }
        })
    );
    
    var isValidPassword = function(franchisee, password){
        return bCrypt.compareSync(password, franchisee.user_pass);
    };
    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
    // Generates unique key bCrypt
    var createkey = function(key){
        return bCrypt.hashSync(key, bCrypt.genSaltSync(10), null);
    };

};
