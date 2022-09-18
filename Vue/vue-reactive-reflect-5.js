/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-self-compare */
// 代理数组
// 通过索引读取或者设置数组元素的值时，代理对象的get/set拦截函数也会执行，因此不需要做额外的工作

/** 数组的“读取”操作
 * 1. 通过索引访问数组元素值:arr[0]
 * 2. 访问数组长度: arr.length
 * 3. 把数组作为对象，使用for...in循环遍历
 * 4. 使用for...of迭代遍历数组
 * 5. 数组的原型方法: concat/join/every/some/find/findIndex/includes等及其他不改变原数组的原型方法
 *
 */

/** 数组的“设置”操作
 * 1. 通过索引修改数组元素值: arr[1] = 3
 * 2. 修改数组长度: arr.length = 0
 * 3. 数组的栈方法: push/pop/shift/unshift
 * 4. 修改原数组的原型方法：splice/fill/sort等
 *
 */

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    // 拦截读取操作
    get(target, key, receiver) {
      console.log('get:', key)
      if (key === 'raw')
        return target
      // 添加判断，如果key的类型是symbol，则不进行追踪
      if (!isReadonly && typeof key !== 'symbol')
        track(target, key)
      const res = Reflect.get(target, key, receiver)
      if (isShallow)
        return res

      if (typeof res === 'object' && res !== null)
        return isReadonly ? readonly(res) : reactive(res)

      return res
    },
    // 拦截设置操作
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性${key}是只读的`)
        return true
      }
      const oldVal = target[key]
      // 如果属性不存在，则说明是在添加新的属性，否则是设置已有属性
      const type = Array.isArray(target)
      // 如果代理目标是数组，则检测被设置的索引值是否是小于数组长度
      // 如果是，则视作SET操作，否则是ADD操作
        ? Number(key) < target.length ? 'SET' : 'ADD'
        : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newVal, receiver)
      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal))
          trigger(target, key, type, newVal) // 增加第四个参数newVal
      }
      return res
    },
    // 拦截数组for..in
    ownKeys(target) {
      // 如果操作目标是数组，则使用length属性作为key并建立响应联系
      track(target, Array.isArray(target) ? 'length' : IRERATE_KEY)
      return Reflect.ownKeys(target)
    },
  })
}

function trigger(target, key, type, newVal) {
  const depsMap = bucket.get(target)

  if (!depsMap)
    return
  // 省略部分代码

  // 当操作类型为ADD并且目标对象是数组时，应该取出并执行那些与length属性相关联的副作用函数
  if (type === 'ADD' && Array.isArray(target)) {
    // 取出与length相关联的副作用函数
    const lengthEffects = depsMap.get('length')
    // 将这些副作用函数添加到effectsToRun中，待执行
    lengthEffects && lengthEffects.forEach((effectFn) => {
      if (effectFn !== activeEffect)
        effectsToRun.add(effectFn)
    })
  }

  // 如果操作目标是数组，并且修改了数组的length属性
  if (Array.isArray(target) && key === 'length') {
    // 对于索引大于或等于新的length值的元素
    // 需要把所有相关联的副作用函数取出并添加到effectsToRun中待执行
    depsMap.forEach((effects, key) => {
      if (key >= newVal) {
        effects.forEach((effectFn) => {
          if (effectFn !== activeEffect)
            effectsToRun.add(effectFn)
        })
      }
    })
  }

  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler)
      effectFn.options.scheduler(effectFn)

    else
      effectFn()
  })
}
