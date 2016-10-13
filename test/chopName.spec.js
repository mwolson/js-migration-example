var config = require('../config');
var chopName = require('../lib/chopName');
var path = require('path');

require('jasmine-pit').install(global);

describe('chopName lib', function() {
  var basePath, newContents, requireText;
  var visitedFile = '/bogus/webapp/src/main/js/subdir/visited.js';

  beforeEach(function() {
    config.reset();
    basePath = '/bogus/webapp/src/main/js';
  });

  function test(transformSingleDot) {
    config.set('webapp.js.src.basePath', basePath);
    newContents = chopName(visitedFile, requireText, transformSingleDot);
  }

  describe('resolves relative JS paths', function() {
    beforeEach(function() {
      requireText = '../dependency/dep';
    });

    it('with no trailing / in basePath', function() {
      test();
      expect(newContents).toEqual('dependency/dep');
    });

    it('with a trailing / in basePath', function() {
      basePath = '/bogus/webapp/src/main/js/';
      test();
      expect(newContents).toEqual('dependency/dep');
    });

    it('with a trailing /./ in basePath', function() {
      basePath = '/bogus/webapp/src/main/js/./';
      test();
      expect(newContents).toEqual('dependency/dep');
    });

    it('and removes .jsx file extension', function() {
      requireText = '../dependency/dep.jsx';
      test();
      expect(newContents).toEqual('dependency/dep');
    });

    it('./ style paths, with transformSingleDot=true', function() {
      requireText = './dep.js';
      test(true);
      expect(newContents).toEqual('subdir/dep');
    });
  });

  describe('does not resolve', function() {
    it('unqualified require paths', function() {
      requireText = 'lodash';
      test();
      expect(newContents).toEqual(requireText);
    });

    it('./ style paths with transformSingleDot=false by default', function() {
      requireText = './dep.js';
      test();
      expect(newContents).toEqual('./dep');
    });

    it('../ paths outside of main src directory', function() {
      requireText = '../../../resources/test.json';
      test();
      expect(newContents).toEqual(requireText);
    });
  });
});
