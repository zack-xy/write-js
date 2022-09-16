/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-use-before-define */
// 用户可以定义一个getter函数，指定具体watch哪一个属性

// watch函数接收两个参数，source是响应式数据，cb是回调函数
function watch(source, cb, options = {}) {
  // 定义getter
  let getter
  // 如果source是函数，说明用户传递的是getter,所以直接把source赋值给getter
  if (typeof source === 'function') {
    getter = source
  }
  else {
    // 否则按照原来的实现调用traverse递归地读取
    getter = () => traverse(source)
  }
  // 定义旧值与新值
  let oldValue, newValue

  // cleanup用来存储用户注册的过期回调
  let cleanup
  // 定义onInvalidate函数
  function onInvalidate(fn) {
    // 将过期回调存储到cleanup中
    cleanup = fn
  }

  // 提取scheduler调度函数为一个独立的job函数
  const job = () => {
    // 在scheduler中重新执行副作用函数，得到的是新值
    newValue = effectFn()
    // 在调用回调函数cb之前，先调用过期回调
    if (cleanup)
      cleanup()

    // 将旧值和新值作为回调函数的参数,将onInvalidate作为回调函数的第三个参数
    cb(newValue, oldValue, onInvalidate)
    // 更新旧值，不然下一次会得到错误的旧值
    oldValue = newValue
  }

  // 使用effect注册副作用函数时，开启lazy选项，并把返回值存储到effectFn中以便后续手动调用
  const effectFn = effect(
    // 执行getter
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        // 在调度函数中判断flush是否为'post',如果是，将其放到微任务队列中执行
        if (options.flush === 'post') {
          const p = Promise.resolve()
          p.then(job)
        }
        else {
          job()
        }
      },
    },
  )

  if (options.immediate) {
    // 当immediate为true时立即执行job，从而触发回调执行
    job()
  }
  else {
    // 手动调用副作用函数，拿到的值就是旧值
    oldValue = effectFn()
  }
}

function traverse(value, seen = new Set()) {
  // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
  if (typeof value !== 'object' || value === null || seen.has(value))
    return
  // 将数据添加到seen中，代表遍历地读取过了，避免循环引用引起的死循环
  seen.add(value)
  // 暂时不考虑数组等其他结构
  // 假设value就是一个对象，使用for...in读取对象的每一个值，并低谷地调用traverse进行处理
  for (const k in value)
    traverse(value[k], seen)

  return value
}

const data = { foo: 1 }
const obj = new Proxy(data, {/** ... */})

watch(obj, async (newValue, oldValue, onInvalidate) => {
  // 定义一个标志，代表当前副作用函数是否过期，默认为false， 代表没有过期
  let expired = false
  // 调用onInvalidate() 函数注册一个过期回调
  onInvalidate(() => {
    // 当过期时，将expired设置为true
    expired = true
  })

  // 发送网络请求
  const res = await fetch('/path/to/request')

  // 只有当该副作用函数的执行没有过期时,才会执行后续操作
  if (!expired)
    finalData = res
})

obj.foo++
