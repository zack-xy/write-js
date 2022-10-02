// 初次挂载
renderer.render(vnode, document.querySelector('#app'))
// 再次挂载新vnode，将触发更新
renderer.render(newVNode, document.querySelector('#app'))
// 新vnode为null意味着卸载之前渲染的内容
renderer.render(null, document.querySelector('#app'))
// 卸载操作

// 初次挂载
renderer.render(vnode, document.querySelector('#app'))
// 再次挂载新vnode，将触发更新
renderer.render(newVNode, document.querySelector('#app'))
// 新vnode为null，意味着卸载之前的渲染内容
renderer.render(null, document.querySelector('#app'))

// 之前的卸载通过innerHTML=''实现，有以下几点问题
/**
 * 1. 容器的内容可能是由某个或多个组件渲染的，当卸载操作发生时，应该正确地调用这些组件的beforeUnmount、unmounted等生命周期函数
 * 2. 即使内容不是由组件渲染的，有的元素存在自定义指令，我们应该在卸载操作发生时正确执行对应的指令钩子函数
 * 3. 使用innerHTML清空容器元素内容的另一个缺陷是，它不会移除绑定在DOM元素上的事件处理函数
 *
 * 正确的卸载方式：根据vnode对象获取与其相关联的真实DOM元素，然后使用原生DOM操作方法将该DOM元素移除
 */

function mountElement(vnode, container) {
  // 让vnode.el引用真实DOM元素
  const el = vnode.el = createElement(vnode.type)
  if (typeof vnode.children === 'string') {
    setElementText(el, vnode.children)
  }
  else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => {
      patch(null, child, el)
    })
  }

  if (vnode.props) {
    for (const key in vnode.props)
      patchProps(el, key, null, vnode.props[key])
  }

  insert(el, container)
}

function render(vnode, container) {
  if (vnode) {
    patch(container._vnode, vnode, container)
  }
  else {
    if (container._vnode) {
      // 调用unmount函数卸载vnode
      unmount(container._vnode)
    }
  }
  container._vnode = vnode
}

// 封装卸载操作
// 好处：有机会调用绑定在DOM元素上的指令钩子函数，有机会检测虚拟节点vnode类型（有机会调用组件相关的生命周期函数）
function unmount(vnode) {
  const parent = vnode.el.parentNode
  if (parent)
    parent.removeChild(vnode.el)
}

// 如果两个vnode的类型不同，说明是不同的DOM，需要先卸载再挂载
function patch(n1, n2, container) {
  // 如果n1 存在，则对比n1和n2的类型
  if (n1 && n1.type !== n2.type) {
    // 如果新旧vnode的类型不同，则直接将旧vnode卸载
    unmount(n1)
    n1 = null
  }
  // 代码运行到这里，证明n1和n2所描述的内容相同
  const { type } = n2
  // 如果n2.type的值是字符串类型，则它描述的是普通标签元素
  if (typeof type === 'string') {
    if (!n1)
      mountElement(n2, container)
    else
      patchElement(n1, n2)
  }
  else if (typeof type === 'object') {
    // 如果n2.type的值的类型是对象，则它描述的是组件
  }
  else if (type === 'xxx') {
    // 处理其他类型的vnode
  }

  if (!n1) {
    mountElement(n2, container)
  }
  else {
    // 更新
  }
}

// 事件的处理
patchProps(el, key, prevValue, nextValue) {
  if(/^on/.test(key)) {
    // 获取为该元素伪造的事件处理函数invoker
    // 定义el._vei为一个对象，存在事件名称到事件处理函数的映射
    // let invoker = el._vei
    const invokers = el._vei || (el._vei = {})
    // 根据事件名称获取invoker
    let invoker = invokers[key]
    const name = key.slice(2).toLowerCase()
    if(nextValue) {
      if(!invoker) {
        //如果没有 invoker，则将一个伪造的invoker缓存到el._vei中
        // vei是vue event invoker的首字母缩写
        // 将事件处理函数缓存到el._vei[key]下，避免覆盖
        invoker = el._vei[key] = (e) => {
          // 如果invoker.value是数组，则遍历它并逐个调用事件处理函数
          if(Array.isArray(invoker.value)) {
            invoker.value.forEach(fn => fn(e))
          } else {
            // 当伪造的事件处理函数执行时，会执行真正的事件处理函数
            invoker.value(e)
          }
        }
        // 将真正的事件处理函数赋值给invoker.value
        invoker.value = nextValue
        // 绑定invoker作为事件处理函数
        el.addEventListener(name, invoker)
      } else {
        // 如果invoker存在，意味着更新，并且只需要更新invoker.value的值即可
        invoker.value = nextValue
      }
    } else if(invoker) {
      // 新的事件绑定函数不存在，且之前绑定的invoker存在，则移除绑定
      el.removeEventListener(name, invoker)
    }
  } else if(key === 'class') {
    // ...
  } else if(shouldSetAsProps(el, key, nextValue)) {
    // ...
  } else {
    // ...
  }
}
