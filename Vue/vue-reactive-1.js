// 存储副作用函数
const bucket = new Set()

// 原始数据
const data = { text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 副作用函数effect添加到存储副作用函数
    bucket.add(effect)
    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用函数取出来执行
    bucket.forEach(fn => fn())
    // 返回true代表设置操作成功
    return true
  },
})

// 副作用函数
function effect() {
  document.body.innerText = obj.text
}

// 执行副作用函数，触发读取
effect()
// 1秒后修改响应式数据
setTimeout(() => {
  obj.text = 'hello vue3'
}, 1000)

