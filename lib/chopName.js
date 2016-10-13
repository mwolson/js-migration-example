var config = require('../config');
var path = require('path');
var unwin = require('unwin');

function chopAbsolute(fullName) {
  var basePath = unwin(path.join(config.get('webapp.js.src.basePath'), './'));
  if (fullName.indexOf(basePath) === 0) {
    return fullName.slice(basePath.length);
  } else {
    return null;
  }
}

function chopRelative(filename, dependency) {
  var fullName = unwin(path.join(path.dirname(filename), dependency));
  return chopAbsolute(fullName);
}

function chopName(filename, dependency, transformSingleDot) {
  transformSingleDot = (transformSingleDot === undefined) ? false : transformSingleDot;

  var replacement;
  if (transformSingleDot && dependency.slice(0, 2) == './') {
    replacement = chopRelative(filename, dependency);
  } else if (dependency.slice(0, 2) == '..') {
    replacement = chopRelative(filename, dependency);
  } else if (dependency.slice(0, 1) == '/') {
    replacement = chopAbsolute(dependency);
  }
  if (replacement) {
    dependency = replacement;
  }
  dependency = dependency.replace(/\.(js|jsx)$/, '');
  return dependency;
}

module.exports = chopName;
