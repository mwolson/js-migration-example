var config = require('../../config');
var migration = require('../../migrations/1441142456287-rewrite-relative-require');
var path = require('path');
var Promise = require('bluebird');

require('jasmine-pit').install(global);

describe('migration: rewrite relative require paths', function() {
  function genRequire(lib) {
    return "var dep = require('" + lib + "');\n";
  }

  beforeEach(function() {
    config.reset();
  });

  describe('- require statements', function() {
    var basePath, requireText;
    var visitedFile = '/bogus/webapp/src/main/js/subdir/visited.js';

    beforeEach(function() {
      basePath = '/bogus/webapp/src/main/js';
      requireText = '../dependency/dep';
    });

    function test() {
      var origContents = genRequire(requireText);
      config.set('webapp.js.src.basePath', basePath);

      return Promise.fromNode(function(callback) {
        migration.rewrite(visitedFile, origContents, callback);
      });
    }

    describe('handles JSX syntax', function() {
      function genJSXRequire(lib) {
        return [
          "require ('" + lib + "');",
          "var foo = (<Thing />);"
        ].join("\n");
      }

      function test() {
        var origContents = genJSXRequire(requireText);
        config.set('webapp.js.src.basePath', basePath);

        return Promise.fromNode(function(callback) {
          migration.rewrite(visitedFile, origContents, callback);
        });
      }

      pit('with empty JSX node', function() {
        return test().then(function(newContents) {
          expect(newContents).toEqual(genJSXRequire('dependency/dep'));
        });
      });
    });

    describe('handles ES6 syntax', function() {
      function genJSXRequire(lib) {
        return [
          "require ('" + lib + "');",
          "function Thing() {};",
          "var properties = { prop: '1' };",
          "var foo = (<Thing {...properties}/>);"
        ].join("\n");
      }

      function test() {
        var origContents = genJSXRequire(requireText);
        config.set('webapp.js.src.basePath', basePath);

        return Promise.fromNode(function(callback) {
          migration.rewrite(visitedFile, origContents, callback);
        });
      }

      pit('with spread operator', function() {
        return test().then(function(newContents) {
          expect(newContents).toEqual(genJSXRequire('dependency/dep'));
        });
      });
    });
  });
});
