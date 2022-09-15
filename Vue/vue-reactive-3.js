/* eslint-disable no-console */
// 存储副作用函数
const bucket = new WeakMap() // 用WeakMap防止内存溢出
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
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数activeEffect存储
    track(target, key)

    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 取出副作用函数并执行
    trigger(target, key)
  },
})

// 在get拦截函数内调用track函数追踪变化
function track(target, key) {
  // 没有activeEffect, 直接return
  if (!activeEffect)
    return
  let depsMap = bucket.get(target)
  if (!depsMap)
    bucket.set(target, (depsMap = new Map()))

  let deps = depsMap.get(key)
  if (!deps)
    depsMap.set(key, (deps = new Set()))

  deps.add(activeEffect)
}

// 在set拦截函数内调用trigger函数触发变化
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap)
    return
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => fn())
}

// 当前的副作用函数跟Key->text相关
effect(
  // 一个匿名的副作用函数
  () => {
    console.log('effect run')
    document.body.innerHTML = obj.text
  },
)

setTimeout(() => {
  // 副作用函数中并没有读取noExist属性的值
  obj.noExist = 'hello vue3' // 这里不再执行副作用函数了，因为在effect中，没有相关的副作用搜集
  obj.text = 'zack zheng'
}, 1000)

// 升级版2:这一版我们追踪了相应的key和effect函数之间的关系
// 问题是：如果存在分支代码，比如如下代码
/**
  * const data = {ok: true, text: 'hello world'}
  * const obj = new Proxy(data, {....})
  *
  * effect(function effectFn() {
  *   document.body.innerText = obj.ok ? obj.text : 'not'
  * })
  *
  */
// 如上代码，当ok为true时我们在effect里访问了ok和text，导致副作用函数同时搜集到了ok和text中
// 如果ok为false时，text永远为‘not’，但是如果此时你修改了text，依然会触发副作用函数的执行（这是不必要的）
// 本质就是副作用函数随着每次执行，随着内部的数据变化而变化，有时是依赖某个key1，有时是依赖另一些key2
// 如果不依赖key1了，key1就不需要保存这个副作用函数了（不依赖了，执行没必要，没有任何效果）
