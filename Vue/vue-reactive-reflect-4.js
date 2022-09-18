/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
// 增加readonly

function _reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw')
        return target
      track(target, key)
      // 得到原始值结果
      const res = Reflect.get(target, key, receiver)
      if (typeof res === 'object' && res !== null) {
        // 调用reactive将结果包装成响应式数据并返回
        return _reactive(res)
      }
      // 返回res
      return res
    },
  })
}

// 封装
// 接收一个isShallow代表是否为浅响应，默认为false，非浅响应
// 增加第三个参数isReadonly，代表是否只读，默认为false
function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    // 拦截读取操作
    get(target, key, receiver) {
      if (key === 'raw')
        return target

      // 只有非只读的时候才建立联系
      if (!isReadonly)
        track(target, key)

      const res = Reflect.get(target, key, receiver)

      // 如果是浅响应，则直接返回原始值
      if (isShallow)
        return res

      if (typeof res === 'object' && res !== null)
        // 如果数据为只读，则调用readonly对值进行包装
        return isReadonly ? readonly(res) : _reactive(res)
      return res
    },
    // 拦截设置操作
    set(target, key, newVal, receiver) {
      // 如果是只读的，则打印警告信息并返回
      if (isReadonly) {
        console.warn(`属性${key}是只读的`)
        return ture
      }
      const oldVal = target[key]
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newVal, receiver)
      if (target === receiver.raw) {
        // eslint-disable-next-line no-self-compare
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal))
          trigger(target, key, type)
      }
      return res
    },
    deleteProperty(target, key) {
      // 如果是只读的，则打印警告信息并返回
      if (isReadonly) {
        console.warn(`属性${key}是只读的`)
        return true
      }
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const res = Reflect.deleteProperty(target, key)
      if (res && hadKey)
        trigger(target, key, 'DELETE')

      return res
    },
  })
}

function reactive(obj) {
  return createReactive(obj)
}

function shallowReactive(obj) {
  return createReactive(obj, true)
}

function readonly(obj) {
  return createReactive(obj, false, true)
}

function shallowReadonly(obj) {
  return createReactive(obj, true, true)
}
