const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

class MPromise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.fulfilledCallback =
      this.rejectedCallback = undefined

    const mResolve = value => {
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
        this.fulfilledCallback && this.fulfilledCallback(value)
      }
    }
    const mReject = reason => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        this.rejectedCallback && this.rejectedCallback(reason)
      }
    }
    try {
      executor(mResolve, mReject)
    } catch (error) {
      throw error
    }
  }
  then(onFulfilled, onRejected) {
    console.log(this.status)
    // 同步情况
    if (this.status === FULFILLED) {
      typeof onFulfilled === "function" && setTimeout(() => onFulfilled(this.value))
      // 同步情况
    } else if (this.status === REJECTED) {
      typeof onRejected === "function" && setTimeout(() => onRejected(this.reason))
      // 异步情况
    } else {
      if (typeof onFulfilled === "function") {
        this.fulfilledCallback = value => setTimeout(() => onFulfilled(value))
      }
      if (typeof onRejected === "function") {
        this.rejectedCallback = reason => setTimeout(() => onRejected(reason))
      }

    }
    return this
  }
}



// ---------------  以下测试代码 -------------------
const p = new MPromise((resolve, reject) => {
  setTimeout(() => {
    console.log(111)
    resolve("成功")
    console.log(222)
  }, 2000)
})

p.then(res => {
  console.log("value：", res)
  console.log(333)
}, err => {
  console.log("err:", err)
  console.log(333)
})

p.then(res => {
  console.log("kkk", res)
})

