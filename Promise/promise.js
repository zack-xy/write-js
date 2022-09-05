/* eslint-disable @typescript-eslint/no-this-alias */
// 声明构造函数
function Promise(executor) {
  // 添加属性
  this.PromiseState = 'pending'
  this.PromiseResult = null
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
    self.callbacks.forEach((item) => {
      item.onResolved(data)
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
    self.callbacks.forEach((item) => {
      item.onRejected(data)
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
  if (this.PromiseState === 'fullfilled')
    onResolved(this.PromiseResult)
  if (this.PromiseState === 'rejected')
    onRejected(this.PromiseResult)
  if (this.PromiseState === 'pending') {
    // 保存回调函数
    this.callbacks.push({
      onResolved,
      onRejected,
    })
  }
}
