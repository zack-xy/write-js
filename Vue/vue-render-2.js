/* eslint-disable @typescript-eslint/no-unused-vars */
const vnode = {
  tag: 'div',
  props: {
    onClick: () => alert('hello'),
  },
  children: 'click me',
}

// 稍复杂的渲染函数 2.0
function renderer(vnode, container) {
  // 使用vnode.tag作为标签名称创建Dom元素
  const el = document.createElement(vnode.tag)
  // 遍历vnode.props，将属性、事件添加到DOM元素
  for (const key in vnode.props) {
    if (key.startsWith('on')) {
      // 如果key以on开头，说明它是事件
      el.addEventListener(
        key.substr(2).toLowerCase(), // 事件名称 onClick ---> click
        vnode.props[key], // 事件处理函数
      )
    }
  }

  // 处理children
  if (typeof vnode.children === 'string') {
    // 如果children是字符串，说明它是元素的文本节点
    el.appendChild(document.createTextNode(vnode.children))
  }
  else if (Array.isArray(vnode.children)) {
    // 递归调用renderer函数渲染子节点，使用当前元素el作为挂载点
    vnode.children.forEach((child) => {
      renderer(child, el)
    })
  }

  // 将元素添加到挂载点下
  container.appendChild(el)
}
