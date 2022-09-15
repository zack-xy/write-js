/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// 因为代码量较多，这里不再向上继承前面的代码
// 有了vue-reactive-5的代码，我们可以在vue-reactive-5的基础上实现computed
// 现在我们的effect函数会立即执行，有时候我们不希望立即执行，在需要的时候才执行
// 通过在options中添加lazy属性来实现

effect(
  // 指定了lazy选项，这个函数不会立即执行
  () => {
    console.log(obj.foo)
  },
  // options
  {
    lazy: true,
  },
)

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectSatck.push(effectFn)
    // 将fn的执行结果存储到res中
    const res = fn() // 新增
    effectSatck.pop()
    activeEffect = effectSatck[effectSatck.length - 1]
    // 将res做为effectFn的返回值
    return res // 新增
  }
  effectFn.options = options
  effectFn.deps = []
  // 只有非lazy的时候，才执行
  if (!options.lazy) { // 新增
    // 执行副作用函数
    effectFn()
  }
  // 将副作用函数作为返回值返回
  return effectFn // 新增
}

const effectFn = effect(() => {
  // getter返回obj.foo与obj.bar的和
  console.log(obj.foo)
  return obj.foo + obj.bar
}, { lazy: true })

// 手动执行副作用函数,可以获得值
const value = effectFn()

function computed(getter) {
  // value用来缓存上一次计算的值
  let value
  // dirty标志，用来标识是否需要重新计算值，为true则意味着“脏”，需要计算
  let dirty = true
  // 把getter作为副作用函数，创建一个lazy的effect
  const effectFn = effect(getter, {
    lazy: true,
    // 添加调度器，在调度器中将dirty重置为true
    scheduler() {
      if (!dirty) {
        dirty = true
        // 当计算属性依赖的响应式数据变化时，手动调用trigger函数触发响应
        trigger(obj, 'value')
      }
    },
  })

  const obj = {
    // 当读取value时才执行effectFn
    get value() {
      // 只有“脏”时才计算值，并将得到的值缓存到value中
      if (dirty) {
        value = effectFn()
        // 将dirty设置为false，下一次访问直接使用缓存到value中的值
        dirty = false
      }
      return value
    },
  }

  return obj
}

// 使用
const data = { foo: 1, bar: 2 }
const obj = new Proxy(data, {/** .... */})
const sumRes = computed(() => obj.foo + obj.bar)
console.log(sumRes.value)
