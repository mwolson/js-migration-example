var os = require('os');
var path = require('path');

var binDir = (os.platform() == 'win32' ? '' : './') + 'node_modules/.bin';
var migrateCmd = path.join(binDir, 'migrate') + ' --state-file ../.migration-state.json';
var jasmineCmd = path.join(binDir, 'jasmine-node') + ' --captureExceptions --color';

module.exports = function(grunt) {

  function createMigration() {
    var name = grunt.option('name');

    if (!name) {
      throw new Error('Missing required argument --name.');
    }

    return migrateCmd + ' create ' + name;
  }

  grunt.initConfig({
    shell: {
      git: {
        command: function(param) {
          if (param == 'resetFiles') {
            return 'git reset -q HEAD ../webapp ../.migration-state.json && '
              + 'git checkout ../webapp ../.migration-state.json && '
              + 'git clean -d -f -q ../webapp';
          } else if (param == 'addState') {
            return 'git add ../.migration-state.json && git add -u ../.migration-state.json';
          } else {
            throw new Error('unsupported git command');
          }
        }
      },
      jasmine: {
        command: function() {
          return jasmineCmd + ' ' + (grunt.option('test') || 'test/');
        }
      },
      migrate: {
        command: function(param) {
          if (param == 'create') {
            return createMigration();
          } else {
            return migrateCmd;
          }
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt, { pattern: ['grunt-*', '!grunt-lib-*'] });

  grunt.registerTask('create', ['shell:migrate:create']);
  grunt.registerTask('reset', ['shell:git:resetFiles']);
  grunt.registerTask('test', ['shell:jasmine']);
  grunt.registerTask('up', ['shell:migrate:up', 'shell:git:addState']);
  grunt.registerTask('default', ['up']);
};
