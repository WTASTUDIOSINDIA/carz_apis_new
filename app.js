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
require('./models/franchisors/franchisor');
require('./models/setup/setup');
require('./models/crm/stages');
require('./models/discussion/discussion');
require('./models/settings/franchiseeAssessment');
require('./models/settings/employeeAssessment');
var franchisee = require('./routes/franchisees/franchisee');
var authenticate = require('./routes/authenticate/authenticate')(passport);
var assessment = require('./routes/assessment/assessment');
var library = require('./routes/digital_library/library');
var partner = require('./routes/partner/partner');
var meeting = require('./routes/meetings/meeting');
var saveMeetingNotification = meeting.saveMeetingNotification;
var setup = require('./routes/setup/setup');
var document = require('./routes/documents/document');
var application = require('./routes/application/application');
var marketing = require('./routes/marketing/marketing');
var discussion = require('./routes/discussion/discussion');
var settings = require('./routes/settings/franchiseeAssessment');
var settings = require('./routes/settings/employeeAssessment');

//var auth = require('./routes/authenticate/auth-service');
//initialize mongoose schemas\

var mongoose = require('mongoose');      //add for Mongo support
//console.log(mongoose.connection.readyState);
//mongoose.connect('mongodb://localhost/carz-api');
mongoose.connect('mongodb://swamy:swamy123@ds123728.mlab.com:23728/heroku_0bdbxrrk');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var connectedSocketUsers = [];
io.on('connection', function(socket) {
  console.log("stwa");
    socket.emit('news', {hello: 'world'});
    socket.on('add-user', function(data, response){
      connectedSocketUsers.push(data);
      console.log(data, "57");
      for (var i = 0; i < connectedSocketUsers.length; i++) {
        if (connectedSocketUsers[i].user_id === data.user_id) { // modify whatever property you need
          return;
        //  connectedSocketUsers.push(data);
        }
        else {
          connectedSocketUsers.push(data);
        }
  }
    //  if (connectedUsers.indexOf(data.user_id) == -1) {
  //  connectedSocketUsers.push(data);


    })
  //   socket.on('disconnect', function() {
  //   connectedSocketUsers = [];
  // });
    socket.on('message', function (data, response) {
         console.log(data, "42");
         for(var i=0; i<connectedSocketUsers.length; i++){
           if(connectedSocketUsers[i].user_id == data.franchisee_id){
             var socketId = connectedSocketUsers[i].socket_id;
             console.log(socketId, "60");
      //       connectedUsers[socketId].socket.emit('message', { type: 'new-message', text: data });
             socket.broadcast.to(socketId).emit('message', { type: 'new-message', text: data });
            // io.emit('message', { type: 'new-message', text: data });
          socket.to(socketId).emit('message', { type: 'new-message', text: data });
          io.to(socketId).emit('message', { type: 'new-message', text: data });
          }
         }
        var meeting_data = saveMeetingNotification(data);
        console.log(meeting_data, "44");
      //  io.emit('message', { type: 'new-message', text: data });


    });

    console.log(connectedSocketUsers, "59");

    socket.on('join', (params, callback) => {


        socket.join(params.room);
        socket.emit('newNotification'. generateMessage('You have a new notification'));
        socket.broadcast.to(params.room).emit('newNotification');
        io.emit('newNotification', {type: 'new-notification', text: meeting_data});
    })
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(function(req, res, next) {
  var allowedOrigins = ['http://localhost:4200', 'https://carz-web.herokuapp.com'];
  //var origin = req.headers.origin;
  //res.setHeader('Access-Control-Allow-Origin', origin);
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.header("Access-Control-Allow-Origin", "https://carz-api.herokuapp.com/");
  //res.header("Access-Control-Allow-Origin", "http://localhost:4200");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, OPTIONS');
  next();
});
app.use(require('express-session')({
    secret: 'crackalackin',
    resave: true,
    saveUninitialized: true,
    cookie : { secure : false, maxAge : (4 * 60 * 60 * 1000) }, // 4 hours
}));
app.use(logger('dev'));
app.use(session({
  secret: '128013A7-5B9F-4CC0-BD9E-4480B2D3EFE9',
  cookie: {
        secure: true
    }

}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(__dirname + '/public'));


app.use(flash());

app.use('/franchisee', franchisee);
app.use('/authenticate',authenticate);
app.use('/library',library);
app.use('/partner', partner);
app.use('/meeting', meeting);
app.use('/document', document);
app.use('/assessment', assessment);
app.use('/application', application);
app.use('/setup', setup);
app.use('/marketing', marketing);
app.use('/discussion', discussion);
app.use('/settings',settings);
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
