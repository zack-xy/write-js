/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
// 实现深响应

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
function createReactive(obj, isShallow = false) {
  return new Proxy(obj, {
    // 拦截读取操作
    get(target, key, receiver) {
      if (key === 'raw')
        return target

      const res = Reflect.get(target, key, receiver)

      track(target, key)

      // 如果是浅响应，则直接返回原始值
      if (isShallow)
        return res

      if (typeof res === 'object' && res !== null)
        return _reactive(res)

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
