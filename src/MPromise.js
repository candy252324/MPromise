const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {  //  promise2 和 x 指向同一对象，以 TypeError 为拒因拒绝 promise2
    reject(new TypeError('Chaining cycle detected for promise'));
  } else if (typeof x === 'function' || (typeof x === 'object' && x !== null)) {  // 如果 x 是一个对象或者函数（如果 x 为 Promise，由于 Promise 也是一个对象，所以不用单独处理了）
    let called = false;   // 是否被调用，用于处理当 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，仅首次调用并忽略剩下的调用
    try {
      const then = x.then;
      if (typeof then === 'function') {   // then 为函数
        then.call(x, y => {  // then 函数执行并接收两个回调函数
          if (called) return;
          called = true;
          resolvePromise(promise, y, resolve, reject);
        }, r => {
          if (called) return;
          called = true;
          reject(r);
        });
      } else {
        resolve(x);   //  then 不是函数，以 x 为参数解决 promise2
      };
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);  // 如果 x 不为对象或者函数，以 x 为参数解决 promise2
  }
};


class MPromise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.fulfilledCallbacks = []
    this.rejectedCallbacks = []

    const mResolve = value => {
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
        this.fulfilledCallbacks && this.fulfilledCallbacks.forEach(onFulfilled => onFulfilled(value))
      }
    }
    const mReject = reason => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        this.rejectedCallbacks && this.rejectedCallbacks.forEach(onRejected => onRejected(reason))
      }
    }
    try {
      executor(mResolve, mReject)
    } catch (error) {
      throw error
    }
  }
  then(onFulfilled, onRejected) {
    // 同步情况， .then 的时候 status 已经变成 fulfilled ，异步执行 onFulfilled 回调即可
    const promise2 = new MPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        if (typeof onFulfilled === "function") {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value)
              // 如果 x 只是一个简单值，这里直接 resolve(x) 就好了，但是实际上 x 还可能是函数或者新的promise
              // 所以这里再写一个 resolvePromise，来处理所有这些情况
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        } else {
          resolve(this.value)
        }
      } else if (this.status === REJECTED) {
        if (typeof onRejected === "function") {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        } else {
          reject(this.reason)
        }
      } else {
        // 异步情况， .then 的时候 status 还是 pending 状态 ，将 onFulfilled 回调函数存起来，等 resolve 执行的时候再执行
        this.fulfilledCallbacks.push(value => setTimeout(() => {
          if (typeof onFulfilled === "function") {
            try {
              const x = onFulfilled(value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          } else {
            resolve(value)
          }
        }))
        this.rejectedCallbacks.push(reason => setTimeout(() => {
          if (typeof onRejected === "function") {
            try {
              const x = onRejected(reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          } else {
            reject(reason)
          }
        }))
      }
    })
    return promise2
  }
}

module.exports = MPromise;