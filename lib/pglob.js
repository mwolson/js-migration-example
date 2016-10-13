var Promise = require('bluebird');
var glob = require('glob');

function pglob(pattern, options) {
  return Promise.fromNode(function(callback) {
    glob(pattern, options, callback);
  });
}

module.exports = pglob;
