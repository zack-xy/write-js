/* eslint-disable no-undef */
// 响应式数据的读取分三种
// 1. 点读取：obj.foo
// 2. 判断对象或原型上是否存在给定的key：key in obj
// 3. 使用for...in循环遍历对象：for(const key in obj) {}

const obj = { foo: 1 }
// eslint-disable-next-line symbol-description
const ITERATE_KEY = Symbol()

const p = new Proxy(obj, {
  get(target, key, receiver) {
    // 建立联系
    track(target, key)
    // 返回属性值
    return Reflect.get(target, key, receiver)
  },
  // 拦截器设置操作
  set(target, key, newVal, receiver) {
    // 如果属性不存在，则说明是在添加新属性，否则是设置已有属性
    const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
    // 设置属性值
    const res = Reflect.set(target, key, newVal, receiver)
    // 取出副作用函数并执行,将type传入
    trigger(target, key, type)
    return res
  },
  // [[HasProperty]]拦截(key in obj)
  has(target, key) {
    track(target, key)
    return Reflect.has(target, key)
  },
  // for(const key in obj) {}
  ownKeys(target) {
    // 将副作用函数与ITERATE_KEY关联
    // 为什么与ITERATE_KEY关联，因为循环拿不到具体的key
    track(target, ITERATE_KEY)
    return Reflect.ownKeys(target)
  },
  deleteProperty(target, key) {
    // 检查被操作的属性是否是对象自己的属性
    const hadKey = Object.prototype.hasOwnProperty.call(target, key)
    // 使用Reflect.deleteProperty完成属性删除
    const res = Reflect.deleteProperty(target, key)
    if (res && hadKey) {
      // 只有当被删除的属性是对象自己的属性并且成功删除时，才触发更新
      trigger(target, key, 'DELETE')
    }
    return res
  },
})

function trigger(target, key, type) {
  const depsMap = bucket.get(target)
  if (!depsMap)
    return
  // 取得与key相关联的副作用函数
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  // 将与key相关联的副作用函数添加到effectsToRun
  effects && effects.forEach((effectFn) => {
    if (effectFn !== activeEffect)
      effectsToRun.add(effectFn)
  })

  // 新增和删除都会影响属性数量的变化，所以循环的副作用需要重新执行
  if (type === 'ADD' || type === 'DELETE') {
    // 取得与ITERATE_KEY相关联的副作用函数
    const interateEffects = depsMap.get(ITERATE_KEY)
    // 将与ITERATE_KEY相关联的副作用函数也添加到effectsToRun
    interateEffects && interateEffects.forEach((effectFn) => {
      if (effectFn !== activeEffect)
        effectsToRun.add(effectFn)
    })
  }

  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler)
      effectFn.options.scheduler(effectFn)

    else
      effectFn()
  })
}
