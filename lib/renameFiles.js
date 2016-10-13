var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');
var pglob = require('./pglob');

function renameFile(src, dest) {
  return Promise.fromNode(function(callback) {
    fs.rename(src, dest, callback);
  });
}

function renameFilesByPattern(basePath, relativePattern, relativeDestDir) {
  var pattern = path.join(basePath, relativePattern);
  var destDir = path.join(basePath, relativeDestDir);
  return pglob(pattern).then(function(files) {
    return Promise.all(
      files.map(function(src) {
        var dest = path.join(destDir, path.basename(src));
        return renameFile(src, dest);
      })
    );
  });
}

exports.byPattern = renameFilesByPattern;
