'use strict'

var chopName = require('../lib/chopName');
var config = require('../config');
var Promise = require('bluebird');
var rewriteByPattern = require('../lib/rewriteByPattern');
var transformDeps = require('transform-jest-deps');

function rewrite(fileName, contents, callback) {
  var newContents = transformDeps(contents, function(dependency) {
    if (!dependency) {
      console.error('Bad require statement or jest statement in ' + fileName + ', please rewrite');
    } else {
      dependency = chopName(fileName, dependency);
    }
    return dependency;
  });
  callback(null, newContents);
}

exports.rewrite = rewrite;

exports.up = function(next) {
  Promise.all([
    rewriteByPattern(config.get('webapp.js.src.basePath'), '**/*.js', rewrite),
    rewriteByPattern(config.get('webapp.js.src.basePath'), '**/*.jsx', rewrite),
    rewriteByPattern(config.get('webapp.js.testOld.basePath'), '**/*.spec.js', rewrite)
  ]).nodeify(next);
};

exports.down = function(next) {
  next();
};
