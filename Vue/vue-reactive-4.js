/* eslint-disable no-console */
// 为了解决第3版的问题
// 我们需要更新相应key的副作用函数
// 解决办法：1.在副作用函数执行前，先把这个副作用函数从所有包含它的key中删除（因为它的依赖可能变了）
//         2.副作用函数执行时，会访问相应的key，则会将自己（副作用函数）与相关的key绑定

// 存储副作用函数
const bucket = new WeakMap() // 用WeakMap防止内存溢出
// 用一个全局变量存储被注册的副作用函数
let activeEffect
// effect函数用于注册副作用函数
function effect(fn) {
  const effectFn = () => {
    // 调用cleanup函数完成清除工作
    cleanup(effectFn)
    // 当effectFn执行时，将其设置为当前激活的副作用函数
    activeEffect = effectFn
    fn()
  }
  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  effectFn()
}

// 原始数据
const data = { ok: true, text: 'hello world' }
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

  const effectsToRun = new Set(effects)
  effectsToRun.forEach(effectFn => effectFn())
  // effects && effects.forEach(fn => fn())
  // 原上面这一行代码，调用副作用函数执行，副作用函数执行时，会先cleanup
  // cleanup会把自己（副作用函数）从Set里面删除掉
  // 之后会调用自定义的副作用函数，又会把自己添加到Set中
  // 在语言规范中，如果Set里的值被访问过，删除再添加会再次访问，所以这行代码会导致无限循环
  // 解决办法就是new Set
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
    console.log('effect run')
    document.body.innerHTML = obj.ok ? obj.text : 'not'
  },
)

setTimeout(() => {
  obj.ok = false
  obj.text = 'zack zheng' // 这一行现在是没用的，不会调用副作用函数
}, 1000)

// 升级版3:我们现在避免了额外不需要的副作用函数的执行
// 缺点是：现在不支持嵌套effect
