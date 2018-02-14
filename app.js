var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
require('./models/franchisees/franchisee');
require('./models/authenticate/authenticate');
var franchisee = require('./routes/franchisees/franchisee');
var authenticate = require('./routes/authenticate/authenticate')(passport);
var library = require('./routes/digital_library/library');
//var auth = require('./routes/authenticate/auth-service');
//initialize mongoose schemas\

var mongoose = require('mongoose');      //add for Mongo support
//console.log(mongoose.connection.readyState);
mongoose.connect('mongodb://heroku_m6bl4944:heroku_m6bl4944@ds149905.mlab.com:49905/heroku_m6bl4944');
//mongoose.connect("mongodb://localhost/carz");
var app = express();
var http = require('http').Server(app);
// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://carzapi.herokuapp.com/");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(logger('dev'));
app.use(session({
  secret: '128013A7-5B9F-4CC0-BD9E-4480B2D3EFE9'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(__dirname + '/public'));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/franchisee', franchisee);
app.use('/authenticate',authenticate);
app.use('/library',library);
var authService = require('./routes/authenticate/auth-service');
authService(passport);
app.get('/*', function(req, res, next) {
    res.sendFile('public/index.html', { root: __dirname });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

process.on('uncaughtException', (err) => {
  console.log(err);
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
http.listen(process.env.PORT || 3000, function(){
});
module.exports = app;
