var _ = require('lodash');
var path = require('path');

exports.get = function(configKey) {
  return _.get(config, configKey);
};

exports.set = function(configKey, value) {
  return _.set(config, configKey, value);
};

exports.reset = function(configKey) {
  return config = _.cloneDeep(original);
};

var config = {
  webapp: {
    js: {
      src: {
        basePath: path.resolve(__dirname, '../webapp/src/main/js')
      },
      test: {
        basePath: path.resolve(__dirname, '../webapp/src/test/js')
      },
      testOld: {
        basePath: path.resolve(__dirname, '../webapp/src/test/javascript')
      }
    }
  }
};

var original = _.cloneDeep(config);
