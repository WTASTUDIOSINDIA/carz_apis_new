// var env = require('./env.json');

// exports.config = function() {
//   var node_env = process.env.NODE_ENV || 'dev';
//   return env[node_env];
// };

var env = require('./env.json');

// exports.config = function() {
//   var node_env = process.env.NODE_ENV || 'dev';
//   return env[node_env];
// };
console.log(process.env.NODE_ENV, 'process.env.process.env.NODE_ENV');
var config = function() {
    var node_env = process.env.NODE_ENV || 'prod';
    return env[node_env];
  };

module.exports = {
 config 
};