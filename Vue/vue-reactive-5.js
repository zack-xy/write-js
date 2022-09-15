/* eslint-disable no-console */
// 上一版的问题
// 问题1: 不支持嵌套effect
// 为什么要支持，因为组件的render就是在effect内执行的，如果有父子嵌套组件，则就是嵌套的effect
// 现在的代码为什么不支持，因为现在的代码注册副作用函数是用activeEffect这个全局变量做的
// 同一时刻，activeEffect只能有一个，嵌套会导致外部的副作用函数绑定成嵌套内部的
// 解决办法：需要一个副作用函数栈effectStack,副作用函数执行时入栈，执行完毕，弹栈
// activeEffect始终指向栈顶副作用函数

// 问题2: 下面这种代码会导致栈溢出
/**
 * const data = {foo: 1}
 * const obj = new Proxy(data, {...})
 * effect(() => obj.foo++)
 */
// foo++相当于foo=foo+1，代码既访问了foo，也设置了foo，会无限递归调用自己
// 解决办法：如果trigger触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行

// 问题3:副作用函数可调度执行（用户可以决定副作用函数执行的时机、次数和方式）
// 定义一个任务队列
const jobQueue = new Set() // 使用Set的去重能力
// 使用Promise.resolve()创建一个promise实例，我们用它将一个任务添加到微任务队列
const p = Promise.resolve()

// 一个标志代表是否正在刷新队列
let isFlushing = false
function flushJob() {
  // 如果队列正在刷新，则什么都不做
  if (isFlushing)
    return
  // 设置为true，代表正在刷新
  isFlushing = true
  // 在微任务队列中刷新jobQueue队列
  p.then(() => {
    jobQueue.forEach(job => job())
  }).finally(() => {
    // 结束后重置isFlushing
    isFlushing = false
  })
}

/** 以上是调度函数 */

// 存储副作用函数
const bucket = new WeakMap() // 用WeakMap防止内存溢出
// 用一个全局变量存储被注册的副作用函数
let activeEffect
// effect栈
const effectSatck = []
// effect函数用于注册副作用函数
function effect(fn, options = {}) {
  const effectFn = () => {
    // 调用cleanup函数完成清除工作
    cleanup(effectFn)
    // 当effectFn执行时，将其设置为当前激活的副作用函数
    activeEffect = effectFn
    // 在调用副作用函数之前将当前副作用函数压入栈中
    effectSatck.push(effectFn)
    fn()
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把activeEffect还原为之前的值
    effectSatck.pop()
    activeEffect = effectSatck[effectSatck.length - 1]
  }
  // 将options挂载到effectFn上
  effectFn.options = options
  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  effectFn()
}

// 原始数据
const data = { foo: 1, ok: true, text: 'hello world' }
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

  // 把当前激活的副作用函数添加到依赖集合deps中
  deps.add(activeEffect)
  // deps就是一个与当前副作用函数存在联系的依赖集合
  // 将其添加到activeEffect.deps数组中
  activeEffect.deps.push(deps)
}

// 在set拦截函数内调用trigger函数触发变化
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap)
    return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach((effectFn) => {
    // 如果trigger触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
    if (effectFn !== activeEffect)
      effectsToRun.add(effectFn)
  })

  effectsToRun.forEach((effectFn) => {
    // 如果一个副作用函数存在调度器，则调用该调度器，并将副作用函数作为参数传递
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    }
    else {
      // 否则执行副作用函数（之前的默认行为）
      effectFn()
    }
  })
}

function cleanup(effectFn) {
  // 遍历effectFn.deps数组
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps是依赖集合
    const deps = effectFn.deps[i]
    // 将effectFn从依赖集合中移除
    deps.delete(effectFn)
  }
  // 最后需要重置effectFn.deps数组
  effectFn.deps.length = 0
}

// 当前的副作用函数跟Key->text相关
effect(
  // 一个匿名的副作用函数
  () => {
    console.log(obj.foo)
    document.body.innerHTML = obj.ok ? obj.text : 'not'
  },
  // options 提供一个options，用来实现可调度性
  {
    // 调度器scheduler 是一个函数
    scheduler(fn) {
      // 将副作用函数放到宏任务队列中执行
      // setTimeout(fn)

      // 每次调度时，将副作用函数添加到jobQueue队列中
      jobQueue.add(fn)
      // 调用flushJob刷新队列
      flushJob()
    },
  },
)

setTimeout(() => {
  obj.ok = false
  obj.text = 'zack zheng' // 这一行现在是没用的，不会调用副作用函数
  obj.foo++
  obj.foo++ // foo会执行3次副作用函数，但是我们知道，中间的一次是过渡状态，不需要执行，那么需要自定义调度器
}, 1000)

