var unwin = require('unwin');

function expectSpyPath(spy, callIdx, argIdx, expected) {
  if (!spy.calls[callIdx]) {
    throw new Error(spy.identity + ' call #' + callIdx + ' not present');
  }
  return expect(unwin(spy.calls[callIdx].args[argIdx]));
}

module.exports = expectSpyPath;
