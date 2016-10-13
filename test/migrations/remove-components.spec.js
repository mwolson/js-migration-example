var config = require('../../config');
var path = require('path');
var Promise = require('bluebird');
var rewire = require('rewire');
var unwin = require('unwin');

require('jasmine-pit').install(global);

describe('migration: remove components from JS filenames', function() {
  var git, inContents, migration, renameFiles, rewriteByPattern, rmdir, srcFiles, transformedContents;

  beforeEach(function() {
    config.reset();
    config.set('webapp.js.src.basePath', '/top/js');
    config.set('webapp.js.testOld.basePath', '/top/test');
    srcFiles = ['/top/js/jsx/refund/refund.js'];
    transformedContents = [];
    migration = rewire('../../migrations/1441997224892-remove-components.js');

    git = jasmine.createSpy('git').andCallFake(function(cmd) {
      return Promise.resolve();
    });
    migration.__set__('git', git);

    renameFiles = {
      byPattern: jasmine.createSpy('renameFiles.byPattern').andCallFake(function() {
        return Promise.resolve();
      })
    };
    migration.__set__('renameFiles', renameFiles);

    var toRewrite = srcFiles;
    rewriteByPattern = jasmine.createSpy('rewriteByPattern').andCallFake(function(basePath, relativePattern, transform) {
      var promise = Promise.all(
        toRewrite.map(function(file) {
          return Promise.fromNode(function(callback) {
            transform(file, inContents, callback);
          });
        })
      ).then(function(transformed) {
        transformedContents.push(transformed);
      });
      toRewrite = [];
      return promise;
    });
    migration.__set__('rewriteByPattern', rewriteByPattern);

    rmdir = jasmine.createSpy('rmdir').andCallFake(function(basePath, relPart) {
      return Promise.resolve();
    });
    migration.__set__('rmdir', rmdir);
  });

  function migrate() {
    return Promise.fromNode(function(callback) {
      migration.up(callback);
    });
  }

  pit('should use other libraries as expected', function() {
    inContents = [
      "var lib0 = require('actions/components/dir0/file0');",
      "var lib1 = require('jsx/components/dir1/file1');",
      "var lib2 = require('stores/components/dir2/file2');",
      "var lib3 = require('actions/components/checkout/dir3/file3');",
      "var lib4 = require('actions/components/refund/dir4/file4');",
      "var lib5 = require('stores/components/refund/dir5/file5');",
      "var lib6 = require('actions/components/ticket/dir6/file6');",
      "var lib7 = require('stores/components/ticket/dir7/file7');",
      "var lib8 = require('jsx/components/refund/subcomponents/file8');",
      "var lib9 = require('./subcomponents/refund-file9');"
    ].join("\n");
    var expectedContents = [
      "var lib0 = require('actions/dir0/file0');",
      "var lib1 = require('jsx/dir1/file1');",
      "var lib2 = require('stores/dir2/file2');",
      "var lib3 = require('actions/dir3/file3');",
      "var lib4 = require('actions/dir4/file4');",
      "var lib5 = require('stores/dir5/file5');",
      "var lib6 = require('actions/dir6/file6');",
      "var lib7 = require('stores/dir7/file7');",
      "var lib8 = require('jsx/refund/file8');",
      "var lib9 = require('./refund-file9');"
    ].join("\n");

    return migrate().then(function() {
      expect(renameFiles.byPattern).toHaveBeenCalled();
      expect(renameFiles.byPattern.calls[0].args).toEqual(['/top/js', 'actions/components/*', 'actions/']);
      expect(renameFiles.byPattern.calls[1].args).toEqual(['/top/js', 'jsx/components/*', 'jsx/']);
      expect(renameFiles.byPattern.calls[2].args).toEqual(['/top/js', 'stores/components/*', 'stores/']);
      expect(renameFiles.byPattern.calls[3].args).toEqual(['/top/js', 'actions/checkout/*', 'actions/']);
      expect(renameFiles.byPattern.calls[4].args).toEqual(['/top/js', 'actions/refund/*', 'actions/']);
      expect(renameFiles.byPattern.calls[5].args).toEqual(['/top/js', 'stores/refund/*', 'stores/']);
      expect(renameFiles.byPattern.calls[6].args).toEqual(['/top/js', 'actions/ticket/*', 'actions/']);
      expect(renameFiles.byPattern.calls[7].args).toEqual(['/top/js', 'stores/ticket/*', 'stores/']);
      expect(renameFiles.byPattern.calls[8].args).toEqual(['/top/js', 'jsx/refund/subcomponents/*', 'jsx/refund/']);

      expect(rmdir).toHaveBeenCalled();
      expect(rmdir.calls[0].args).toEqual(['/top/js', 'actions/components']);
      expect(rmdir.calls[1].args).toEqual(['/top/js', 'jsx/components']);
      expect(rmdir.calls[2].args).toEqual(['/top/js', 'stores/components']);
      expect(rmdir.calls[3].args).toEqual(['/top/js', 'actions/checkout']);
      expect(rmdir.calls[4].args).toEqual(['/top/js', 'actions/refund']);
      expect(rmdir.calls[5].args).toEqual(['/top/js', 'stores/refund']);
      expect(rmdir.calls[6].args).toEqual(['/top/js', 'actions/ticket']);
      expect(rmdir.calls[7].args).toEqual(['/top/js', 'stores/ticket']);
      expect(rmdir.calls[8].args).toEqual(['/top/js', 'jsx/refund/subcomponents']);

      expect(git).toHaveBeenCalled();
      expect(git.calls[0].args[0]).toEqual('add /top/js');
      expect(git.calls[1].args[0]).toEqual('add -u /top/js /top/test');

      expect(transformedContents[0][0]).toEqual(expectedContents);
    });
  });
});
