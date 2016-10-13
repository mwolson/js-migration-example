var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');

function rmdir(basePath, src) {
  return Promise.fromNode(function(callback) {
    fs.rmdir(path.join(basePath, src), callback);
  });
}

module.exports = rmdir;
