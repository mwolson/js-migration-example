var chopName = require('../lib/chopName');
var config = require('../config');
var path = require('path');
var transformDeps = require('transform-jest-deps');

function rewriteSingleDot(basePath, fileName, transform, name) {
  var chopped = chopName(fileName, name, true);
  if (chopped.match(transform.from)) {
    chopped = chopped.replace(transform.from, transform.to);
    var relative = path.relative(path.dirname(fileName), path.join(basePath, chopped));
    if (relative.slice(0, 2) !== '..') {
      name = './' + relative;
    } else {
      name = chopped;
    }
  }
  return name;
}

function rewriteDeps(transforms) {
  var basePath = config.get('webapp.js.src.basePath');
  return function(fileName, contents, callback) {
    var newContents = transformDeps(contents, function(name) {
      if (!name) {
        console.error('Bad require statement or jest statement in ' + fileName + ', please rewrite');
      } else {
        name = transforms.reduce(function(name, transform) {
          if (name.slice(0, 2) == './') {
            name = rewriteSingleDot(basePath, fileName, transform, name);
          } else {
            name = name.replace(transform.from, transform.to);
          }
          return name;
        }, name);
      }
      return name;
    });
    callback(null, newContents);
  };
}

module.exports = rewriteDeps;
