// 原始值的响应方案
// 基本类型是不能使用Proxy的
// 如果我们要实现基本类型的响应式，则需要把这个基本类型放到对象里面

// 封装一个ref函数
function ref(val) {
  // 在ref函数内部创建包裹对象
  const wrapper = {
    value: val,
  }
  // 将包裹对象变成响应式数据
  return reactive(wrapper)
}

// 问题：我们如何区分一个值是被包裹后基本类型还是原始对象呢？

function ref(val) {
  const wrapper = {
    value: val,
  }
  // 使用Object.defineProperty在wrapper对象上定义一个不可枚举的属性__v_isRef,并且值为true
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true,
  })

  return reactive(wrapper)
}

// 解决响应丢失的问题
// obj是响应式数据
const obj = reactive({ foo: 1, bar: 2 })

// newObj对象下具有与obj对象同名的属性，并且每一个属性值都是对象
// 该对象具有一个访问器属性value，当读取value的值时，其实读取的是obj对象下相应的属性值
const newObj = {
  foo: {
    get value() {
      return obj.foo
    },
  },
  bar: {
    get value() {
      return obj.bar
    },
  },
}

effect(() => {
  // 在副作用函数内通过新的对象newObj读取foo属性值
  console.log(newObj.foo.value)
})

// 这时能够触发响应了
obj.foo = 100

// 对上述代码get进行封装
function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key]
    },
  }

  return wrapper
}

// 封装toRefs
function toRefs(obj) {
  const ret = {}
  // 使用for...in循环遍历对象
  for (const key in obj) {
    // 逐个调用toRef完成转换
    ret[key] = toRef(obj, key)
  }
  return ret
}

// 经过封装后解决响应丢失的问题
const newObj = { ...toRefs(obj) }

// 为了统一原始值的响应式和对象展开的响应式丢失，则toRef应该如下定义
function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key]
    },
  }

  // 定义__v_isRef属性
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true,
  })

  return wrapper
}

// toRef的setter的实现
function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key]
    },
    set value(val) {
      obj[key] = val
    },
  }

  Object.defineProperty(wrapper, '__v_isRef', {
    value: true,
  })

  return wrapper
}

// 以上，我们实现了toRef的功能，但是访问数据的时候必须要写.value
// 比如{{foo.value}}，但是我们需要的是{{foo}}
// 实现这个功能就叫自动脱ref,就是如果你访问的是一个ref，直接将ref对应的value属性值返回

function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const vlaue = Reflect.get(target, key, receiver)
      // 自动脱ref实现：如果读取的值是ref，则返回它的value属性值
      return value.__v_isRef ? value.value : value
    },
    set(target, key, newValue, receiver) {
      // 通过target读取真实值
      const value = target[key]
      // 如果值是Ref，则设置其对应的value属性值
      if (value.__v_isRef) {
        value.value = newValue
        return true
      }
      return Reflect.set(target, key, newValue, receiver)
    },
  })
}

// 调用proxyRefs函数创建代理
const newObj = proxyRefs({ ...toRefs(obj) })
