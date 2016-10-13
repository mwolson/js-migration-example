'use strict'

var _ = require('lodash');
var config = require('../config');
var git = require('../lib/git');
var Promise = require('bluebird');
var renameFiles = require('../lib/renameFiles');
var rewriteByPattern = require('../lib/rewriteByPattern');
var rewriteDeps = require('../lib/rewriteDeps');
var rmdir = require('../lib/rmdir');

var transforms = [
  { from: new RegExp('^actions/components/'), to: 'actions/' },
  { from: new RegExp('^jsx/components/'), to: 'jsx/' },
  { from: new RegExp('^stores/components/'), to: 'stores/' },
  { from: new RegExp('^actions/checkout/'), to: 'actions/' },
  { from: new RegExp('^actions/refund/'), to: 'actions/' },
  { from: new RegExp('^stores/refund/'), to: 'stores/' },
  { from: new RegExp('^actions/ticket/'), to: 'actions/' },
  { from: new RegExp('^stores/ticket/'), to: 'stores/' },
  { from: new RegExp('^jsx/refund/subcomponents/'), to: 'jsx/refund/' }
];

exports.up = function(next) {
  return Promise.all([
    renameFiles.byPattern(config.get('webapp.js.src.basePath'), 'actions/components/*', 'actions/'),
    renameFiles.byPattern(config.get('webapp.js.src.basePath'), 'jsx/components/*', 'jsx/'),
    renameFiles.byPattern(config.get('webapp.js.src.basePath'), 'stores/components/*', 'stores/')
  ])
  .then(function() {
    return Promise.all([
      renameFiles.byPattern(config.get('webapp.js.src.basePath'), 'actions/checkout/*', 'actions/'),
      renameFiles.byPattern(config.get('webapp.js.src.basePath'), 'actions/refund/*', 'actions/'),
      renameFiles.byPattern(config.get('webapp.js.src.basePath'), 'stores/refund/*', 'stores/'),
      renameFiles.byPattern(config.get('webapp.js.src.basePath'), 'actions/ticket/*', 'actions/'),
      renameFiles.byPattern(config.get('webapp.js.src.basePath'), 'stores/ticket/*', 'stores/'),
      renameFiles.byPattern(config.get('webapp.js.src.basePath'), 'jsx/refund/subcomponents/*', 'jsx/refund/')
    ]);
  })
  .then(function() {
    return Promise.all([
      rewriteByPattern(config.get('webapp.js.src.basePath'), '**/*.js', rewriteDeps(transforms)),
      rewriteByPattern(config.get('webapp.js.src.basePath'), '**/*.jsx', rewriteDeps(transforms)),
      rewriteByPattern(config.get('webapp.js.testOld.basePath'), '**/*.spec.js', rewriteDeps(transforms))
    ]);
  })
  .then(function() {
    return Promise.all([
      rmdir(config.get('webapp.js.src.basePath'), 'actions/components'),
      rmdir(config.get('webapp.js.src.basePath'), 'jsx/components'),
      rmdir(config.get('webapp.js.src.basePath'), 'stores/components'),
      rmdir(config.get('webapp.js.src.basePath'), 'actions/checkout'),
      rmdir(config.get('webapp.js.src.basePath'), 'actions/refund'),
      rmdir(config.get('webapp.js.src.basePath'), 'stores/refund'),
      rmdir(config.get('webapp.js.src.basePath'), 'actions/ticket'),
      rmdir(config.get('webapp.js.src.basePath'), 'stores/ticket'),
      rmdir(config.get('webapp.js.src.basePath'), 'jsx/refund/subcomponents')
    ]);
  })
  .then(function() {
    return git('add ' + config.get('webapp.js.src.basePath'));
  })
  .then(function() {
    return git('add -u ' + [
      config.get('webapp.js.src.basePath'),
      config.get('webapp.js.testOld.basePath')
    ].join(' '));
  })
  .nodeify(next);
};

exports.down = function(next) {
  next();
};
