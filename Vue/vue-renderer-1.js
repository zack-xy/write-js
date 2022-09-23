// 最简单的渲染器
function renderer(domString, container) {
  container.innerHTML = domString
}

// 使用【最简单的渲染器】
renderer('<h1>Hello</h1>', document.getElementById('app'))

// 响应式系统和渲染器
const count = ref(1)
effect(() => {
  renderer(`<h1>${count.value}</h1>`, document.getElementById('app'))
})
count.value++

// 以下响应式数据将使用@vue/reactivity
// 使用IIFE模块格式
{ /* <script src="https://unpkg.com/@vue/reactivity@3.0.5/dist/reactivity.global.js"></script> */ }
const { effect, ref } = VueReactivity

function renderer(domString, container) {
  container.innerHTML = domString
}

const count = ref(1)
effect(() => {
  renderer(`<h1>${count.value}</h1>`, document.getElementById('app'))
})

count.value++

// 基本概念记录
// 渲染器，为什么需要渲染器，直接一个渲染函数不就好了么
// 因为渲染器包含渲染，渲染有时是浏览器，有时是服务器，目标平台不同，渲染也不同，且渲染器的任务其实不止渲染一项
// 挂载：挂载是由vnode编译为真实dom的过程，首次执行render是挂载，后续第二次执行render为更新patch
function createRenderer() {
  function render(vnode, container) {
    if (vnode) {
      // 新vnode存在，将其与旧vnode一起传递给patch函数，进行打补丁
      patch(container._vnode, vnode, container)
    }
    else {
      if (container._vnode) {
        // 旧vnode存在，且新vnode不存在，说明是卸载操作
        // 只需要将container内的Dom清空即可
        container.innerHTML = ''
      }
    }
    // 把vnode存储到container._vnode下，即后续渲染中的旧vnode
    container._vnode = vnode
  }
  return {
    render,
  }
}

// patch不仅可以打补丁，还可以进行挂载

// 自定义渲染器
const vnode = {
  type: 'h1',
  children: 'hello',
}
// 创建一个渲染器
const renderer = createRenderer()
// 调用render函数渲染该vnode
renderer.render(vnode, document.querySelector('#app'))

function createRenderer() {
  function patch(n1, n2, container) {
    // 如果n1不存在,意味着挂载，则调用mountElement函数完成挂载
    if (!n1) {
      mountElement(n2, container)
    }
    else {
      // n1存在，意味着打补丁，暂时忽略
    }
  }

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    }
    else {
      if (container._vnode)
        container.innerHTML = ''
    }
    container._vnode = vnode
  }

  function mountElement(vnode, container) {
    // 创建DOM元素
    const el = document.createElement(vnode.type)
    // 处理子节点，如果子节点是字符串，代表元素具有文本节点
    if (typeof vnode.children === 'string') {
      // 因此只需要设置元素的textContent属性即可
      el.textContent = vnode.children
    }
    // 将元素添加到容器中
    container.appendChild(el)
  }

  return {
    render,
  }
}

// 如果需要设计通用渲染器，需要将操作DOM的API作为配置项传入，如下

// 在创建renderer时传入配置项
const renderer = createRenderer({
  // 用于创建元素
  createElement(tag) {
    return document.createElement(tag)
  },
  // 用于设置元素的文本节点
  setElementText(el, text) {
    el.textContent = text
  },
  // 用于在给定的parent下添加指定元素
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
})
