function renderer(vnode, container) {
  if (typeof vnode.tag === 'string') {
    // 说明vnode描述的是标签元素
    mountElement(vnode, container)
  }
  else if (typeof vnode.tag === 'function') {
    // 说明vnode描述的是组件,组件也可以是一个对象等等，具体的实现都是雷同的
    mountComponent(vnode, container)
  }
}

function mountElement(vnode, container) {
  // 使用vnode.tag作为标签名称创建DOM元素
  const el = document.createElement(vnode.tag)
  // 遍历vnode.props,将属性、事件添加到DOM元素
  for (const key in vnode.props) {
    if (key.startsWith('on')) {
      // 如果key以字符串on开头，说明它是事件
      el.addEventListener(
        key.substr(2).toLowerCase(), // 事件名称onClick ---> click
        vnode.props[key], // 事件处理函数

      )
    }
  }

  // 处理children
  if (typeof vnode.children === 'string') {
    // 如果children是字符串，说明它是元素的文本子节点
    el.appendChild(document.createTextNode(vnode.children))
  }
  else if (Array.isArray(vnode.children)) {
    // 递归地调用renderer 函数渲染子节点，使用当前元素el作为挂载点
    vnode.children.forEach(child => renderer(child, el))
  }
  // 将元素添加到挂载点下
  container.appendChild(el)
}

function mountComponent(vnode, container) {
  // 调用组件函数，获取组件要渲染的内容(虚拟DOM)
  const subtree = vnode.tag()
  // 递归地调用renderer渲染subtree
  renderer(subtree, container)
}
