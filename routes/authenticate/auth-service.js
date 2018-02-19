var mongoose = require('mongoose');
var Franchisor = mongoose.model('Franchisor');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
module.exports = function(passport){
  console.log(passport.user, 'testtt');
    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
      console.log("serializing " + user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
      console.log("serializing " + user);
        Franchisor.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            console.log("test");
            try{
                // check in mongo if a user with username exists or not
                Franchisor.findOne({ 'user_mail' :  username},
                    function(err, franchisor) {
                        // In case of any error, return using the done method
                        if (err){
                            return done(err+"Error data");
                        }
                        // Username does not exist, log the error and redirect back
                        if (!franchisor){
                            return done(null, false, { message: 'User Not Found with username' });
                        }
                        // User exists but wrong password, log the error
                        if (!isValidPassword(franchisor, password)){
                            return done(null, false, { message: 'Invalid UserName Or Password' });
                        }
                        // User and password both match, return user from done method
                        // which will be treated like success
                        return done(null, franchisor);
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
          console.log("Hellsdsdo");
            //var email = req.body.user_mail;
            // find a user in mongo with provided username
            try{
              console.log("Hellsdsdo");console.log("Hellsdsdo");
                Franchisor.findOne({ 'user_mail':username }, function(err, franchisor) {
                    // In case of any error, return using the done method
                    if (err){
                        return done(err, { message: 'Error in SignUp' });
                    }
                    // already exists
                    if (franchisor) {
                        return done(null, false, { message: 'User already exists with this username or email' });
                    }
                    // if there is no user, create the user
                    if (!franchisor) {
                        var franchisor = new Franchisor();
                        if(req.body.user_mail=="admin@carz.com"){
                            franchisor.user_role = "Franchisor";
                        }
                        franchisor.user_mail = username;
                        franchisor.user_pass = createHash(password);
                        franchisor.user_name = req.body.user_name;
                        franchisor.save(function(err,franchisor){
                            return done(null, franchisor);
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

    var isValidPassword = function(franchisor, password){
        return bCrypt.compareSync(password, franchisor.user_pass);
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
