/* eslint-disable no-console */
// 存储副作用函数
const bucket = new Set()

// 用一个全局变量存储被注册的副作用函数
let activeEffect
// effect函数用于注册副作用函数
function effect(fn) {
  // 当调用effect注册副作用函数时，将副作用函数fn赋值给activeEffect
  activeEffect = fn
  // 执行副作用函数
  fn()
}

// 原始数据
const data = { text: 'hello world' }
const obj = new Proxy(data, {
  get(target, key) {
    // 将activeEffect中存储的副作用函数收集
    if (activeEffect)
      bucket.add(activeEffect)

    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    bucket.forEach(fn => fn())
    return true
  },
})

effect(
  // 一个匿名的副作用函数
  () => {
    console.log('effect run')
    document.body.innerHTML = obj.text
  },
)

setTimeout(() => {
  // 副作用函数中并没有读取noExist属性的值
  obj.noExist = 'hello vue3'
}, 1000)

// 升级版1，问题是，即使设置一个不存在的noExist属性，也会导致副作用函数执行
