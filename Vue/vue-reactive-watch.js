/* eslint-disable no-undef */
/* eslint-disable no-console */
// watch函数接收两个参数，source是响应式数据，cb是回调函数
function watch(source, cb) {
  effect(
    // 触发读取操作，从而建立联系
    () => traverse(source),
    {
      scheduler() {
        // 当数据变化时，调用回调函数cb
        cb()
      },
    },
  )
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

watch(obj, () => {
  console.log('数据变化了')
})

obj.foo++
