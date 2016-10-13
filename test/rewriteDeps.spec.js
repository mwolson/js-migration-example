var config = require('../config');
var Promise = require('bluebird');
var rewire = require('rewire');
var unwin = require('unwin');

require('jasmine-pit').install(global);

describe('rewriteDeps lib', function() {
  var contents, fileName, rewriteDeps, transformDeps, transforms;

  beforeEach(function() {
    config.reset();
    config.set('webapp.js.src.basePath', '/top/js');

    contents = "require ('foo');";
    fileName = '/top/js/file1.js';
    rewriteDeps = rewire('../lib/rewriteDeps');
    transforms = [];
  });

  function test() {
    return Promise.fromNode(function(callback) {
      rewriteDeps(transforms)(fileName, contents, callback);
    });
  }

  pit('does not modify source if transforms is empty array', function() {
    return test().then(function(actual) {
      expect(actual).toEqual(contents);
    });
  });

  pit('does simple regexp replacement once per dependency', function() {
    transforms = [
      { from: new RegExp('[fo]'), to: 'bar' }
    ];
    var expected = "require ('baroo');";
    return test().then(function(actual) {
      expect(actual).toEqual(expected);
    });
  });

  pit('expands dependency paths before attempting match', function() {
    contents = "require ('./foo');";
    transforms = [
      { from: new RegExp('^foo'), to: 'bar' }
    ];
    var expected = "require ('./bar');";
    return test().then(function(actual) {
      expect(actual).toEqual(expected);
    });
  });

  pit('translates dependency to chopped version if it moves to parent dir after transform', function() {
    fileName = "/top/js/sub1/sub2/file1.js";
    contents = "require ('./file2');";
    transforms = [
      { from: new RegExp('^sub1/sub2/'), to: 'sub1/' }
    ];
    var expected = "require ('sub1/file2');";
    return test().then(function(actual) {
      expect(actual).toEqual(expected);
    });
  });
});
