var config = require('../config');
var expectSpyPath = require('./lib/expectSpyPath');
var Promise = require('bluebird');
var rewire = require('rewire');
var unwin = require('unwin');

require('jasmine-pit').install(global);

describe('renameFiles lib', function() {
  var basePath, fs, pglob, renameFiles;

  beforeEach(function() {
    basePath = '/top/js';
    renameFiles = rewire('../lib/renameFiles');

    fs = {
      rename: jasmine.createSpy('rename').andCallFake(function(src, dest, callback) {
        callback();
      })
    };
    renameFiles.__set__('fs', fs);

    var globMappings = {
      '/top/js/actions/components/*': ['/top/js/actions/components/dir0']
    };
    pglob = jasmine.createSpy('pglob').andCallFake(function(pattern, options) {
      pattern = unwin(pattern);
      var files = globMappings[pattern];
      if (!files) {
        return Promise.reject(new Error('Unmocked glob pattern: "' + pattern + '"'));
      } else {
        return Promise.resolve(files);
      }
    });
    renameFiles.__set__('pglob', pglob);
  });

  pit('calls rename with a promise interface on each match', function() {
    return renameFiles.byPattern(basePath, 'actions/components/*', 'actions/')
    .then(function() {
      expect(pglob).toBeCalled;
      expectSpyPath(pglob, 0, 0).toEqual('/top/js/actions/components/*');

      expect(fs.rename).toBeCalled;
      expectSpyPath(fs.rename, 0, 0).toEqual('/top/js/actions/components/dir0');
      expectSpyPath(fs.rename, 0, 1).toEqual('/top/js/actions/dir0');
    });
  });
});
