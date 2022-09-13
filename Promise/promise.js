/* eslint-disable @typescript-eslint/no-this-alias */
// 声明构造函数
function Promise(executor) {
  // 添加属性
  this.PromiseState = 'pending'
  this.PromiseResult = null
  // 保存回调函数
  this.callbacks = []
  const self = this
  // resolve函数
  function resolve(data) {
    if (self.PromiseState !== 'pending')
      return
    // 1.修改对象状态（promiseState）
    self.PromiseState = 'fullfilled'
    // 2.设置对象结果值(promiseResult)
    self.PromiseResult = data
    // then函数的执行需要异步
    setTimeout(() => {
      self.callbacks.forEach((item) => {
        item.onResolved(data)
      })
    })
  }
  // reject函数
  function reject(data) {
    if (self.PromiseState !== 'pending')
      return
    // 1.修改对象状态（promiseState）
    self.PromiseState = 'rejected'
    // 2.设置对象结果值(promiseResult)
    self.PromiseResult = data
    // then函数的执行需要异步
    setTimeout(() => {
      self.callbacks.forEach((item) => {
        item.onRejected(data)
      })
    })
  }

  try {
    // 同步调用[执行器函数]
    executor(resolve, reject)
  }
  catch (e) {
    reject(e)
  }
}

// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
  const self = this
  // 判断失败回调函数参数，实现异常穿透
  if (typeof onRejected !== 'function') {
    onRejected = (reason) => {
      throw reason
    }
  }
  if (typeof onResolved !== 'function')
    onResolved = value => value

  return new Promise((resolve, reject) => {
    // 封装then返回Promise函数
    function callback(type) {
      try {
        // 获取回调函数的执行结果
        const result = type(self.PromiseResult)
        if (result instanceof Promise) {
          result.then((v) => {
            resolve(v)
          }, (r) => {
            reject(r)
          })
        }
        else {
          resolve(result)
        }
      }
      catch (e) {
        // 如果在then的回调中抛出异常
        reject(e)
      }
    }
    if (this.PromiseState === 'fullfilled') {
      // then里面的函数需要异步执行
      setTimeout(() => {
        callback(onResolved)
      })
    }
    if (this.PromiseState === 'rejected') {
      // then里面的函数需要异步执行
      setTimeout(() => {
        callback(onRejected)
      })
    }
    if (this.PromiseState === 'pending') {
      // 保存回调函数，为了实现异步（then方法调用的时候，Promis状态是异步改变的）
      this.callbacks.push({
        onResolved() {
          callback(onResolved)
        },
        onRejected() {
          callback(onRejected)
        },
      })
    }
  })
}

// 添加catch方法
Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected)
}

Promise.resolve = function (value) {
  return new Promise((resolve, reject) => {
    if (value instanceof Promise) {
      value.then((v) => {
        resolve(v)
      }, (r) => {
        reject(r)
      })
    }
    else {
      resolve(value)
    }
  })
}

Promise.reject = function (reason) {
  return new Promise((resolve, reject) => {
    reject(reason)
  })
}

// Promise.all的实现
Promise.all = function (promises) {
  let count = 0
  const arr = []
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then((v) => {
        count++
        arr[i] = v // 保证结果的顺序
        if (count === promises.length)
          resolve(arr)
      }, (r) => {
        reject(r)
      })
    }
  })
}

// Promise.race的实现
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then((v) => {
        resolve(v)
      }, (r) => {
        reject(r)
      })
    }
  })
}

