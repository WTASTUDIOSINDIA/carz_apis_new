var mongoose = require('mongoose');
var Franchisor = mongoose.model('Franchisor');
var Franchisee = mongoose.model('Franchisee');
var Admin = mongoose.model('Admin');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var Franchisee = mongoose.model('Franchisee');
module.exports = function(passport){
//  console.log(passport);

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
    //  console.log("serrializing user",user);
        done(null, {id:user._id, user_role:user.user_role});
    });
    console.log('Testinggg');
    passport.deserializeUser(function(user, done) {
      //if user role is admin
      console.log("deserrializing uses r",user);
      if(user.user_role === "admin"){
        Admin.findById(user.id, function(err, admin) {
            done(err, admin);
        });
      }

      //if user role is franchisor
      if(user.user_role === "franchisor"){
        Franchisor.findById(user.id, function(err, franchisor) {
            done(err, franchisor);
        });
      };

      //if user role is franchisee
      if(user.user_role === "franchisee"){
        Franchisee.findById(user.id, function(err, franchisee) {
            done(err, franchisee);
        });
      };
    });

    // passport config
//  passport.use(new LocalStrategy(user.authenticate()));
    passport.use('franchisor-login', new LocalStrategy({
            usernameField : 'user_mail',
            passwordField : 'user_pass',
            passReqToCallback : true
        },
        function(req, username, password, done) {

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
    passport.use('franchisee-login', new LocalStrategy({
            usernameField : 'franchisee_email',
            passwordField : 'franchisee_pass',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            try{
                // check in mongo if a user with username exists or not
                Franchisee.findOne({ 'franchisee_email' :  username},
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
                        if (!isValidPasswordOfFranchisee(franchisee, password)){

                            return done(null, false, { message: 'Invalid UserName Or Password' });
                        }
                        // User and password both match, return user from done method
                        // which will be treated like success
                        //console.log(franchisee);
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
    passport.use('admin-login', new LocalStrategy({
            usernameField : 'user_mail',
            passwordField : 'user_pass',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            try{
                // check in mongo if a user with username exists or not
                Admin.findOne({ 'user_mail' :  username},
                    function(err, admin) {
                        // In case of any error, return using the done method
                        if (err){

                            return done(err+"Error data");
                        }
                        // Username does not exist, log the error and redirect back
                        if (!admin){

                            return done(null, false, { message: 'User Not Found with username' });
                        }
                        // User exists but wrong password, log the error
                        if (!isValidPasswordOfAdmin(admin, password)){

                            return done(null, false, { message: 'Invalid UserName Or Password' });
                        }
                        // User and password both match, return user from done method
                        // which will be treated like success

                        return done(null, admin);
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

    passport.use('franchisor-register', new LocalStrategy({
            usernameField : 'user_mail',
            passwordField : 'user_pass',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
          console.log("Hellsdsdo");
            //var email = req.body.user_mail;
            // find a user in mongo with provided username
            try{
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
                        // if(req.body.user_mail=="admin@carz.com"){
                        //     franchisor.user_role = req.body;
                        // }
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
    var isValidPasswordOfFranchisee = function(franchisee, password){
        return bCrypt.compareSync(password, franchisee.franchisee_pass);
    };
    var isValidPasswordOfAdmin = function(franchisee, password){
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
