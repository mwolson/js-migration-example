var Promise = require('bluebird');
var path = require('path');
var rewriteFiles = require('rewrite-files');

function rewriteByPattern(basePath, relativePattern, transform) {
  var pattern = path.join(basePath, relativePattern);
  return Promise.fromNode(function(callback) {
    rewriteFiles.withPattern(pattern, transform, callback);
  });
}

module.exports = rewriteByPattern;
