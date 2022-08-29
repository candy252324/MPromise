const MPromise = require('../src/MPromise');
// 参照 promises-tests 仓库提供的方法
MPromise.defer = MPromise.deferred = function () {
  let dfd = {};
  dfd.promise = new MPromise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

module.exports = MPromise;  
