var child_process = require('child_process');
var Promise = require('bluebird');

function git(cmd) {
  return Promise.fromNode(function(callback) {
    child_process.exec('git '+ cmd, callback);
  });
}

module.exports = git;
