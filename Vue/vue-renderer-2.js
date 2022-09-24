// 描述元素节点
const vnode = {
  type: 'div',
  // 使用props描述一个元素的属性
  props: {
    id: 'foo',
  },
  children: [
    {
      type: 'p',
      children: 'hello',
    },
  ],
}

function mountElement(vnode, container) {
  const el = createElement(vnode.type)
  if (typeof vnode.children === 'string') {
    setElementText(el, vnode.children)
  }
  else if (Array.isArray(vnode.children)) {
    // 如果children是数组，则遍历每一个子节点，并调用patch函数挂载它
    vnode.children.forEach((child) => {
      patch(null, child, el)
    })
  }
  // 如果vnode.props存在才处理它
  if (vnode.props) {
    // 遍历vnode.props
    for (const key in vnode.props) {
      // 调用setAttribute将属性设置到元素上
      el.setAttribute(key, vnode.props[key])
      // 直接设置
      // el[key] = vnode.props[key]
    }
  }
  insert(el, container)
}

// 无论是setAttribute还是直接设置都有有缺陷的
// 为什么有缺陷，因为不是所有的HTML Attribute都有同名对应的DOM Properties
// 也不是所有的DOM Properties都有都有对应的HTML Attribute
// HTML Attribute是设置与之对应的DOM Properties的初始值
// 应该优先设置DOM Properties，如果值是空字符串需要矫正为true
function mountElement(vnode, container) {
  const el = createElement(vnode.type)
  if (typeof vnode.children === 'string') {
    setElementText(el, vnode.children)
  }
  else if (Array.isArray(vnode.children)) {
    // 如果children是数组，则遍历每一个子节点，并调用patch函数挂载它
    vnode.children.forEach((child) => {
      patch(null, child, el)
    })
  }
  // 如果vnode.props存在才处理它
  if (vnode.props) {
    for (const key in vnode.props) {
      // 用in操作符判断key是否存在对应的DOM Properties
      if (key in el) {
        // 获取该DOM Properties的类型
        const type = typeof el[key]
        const value = vnode.props[key]
        // 如果是布尔类型，并且value是空字符串，则将值矫正为true
        if (type === 'boolean' && value === '')
          el[key] = true
        else
          el[key] = value
      }
      else {
        // 如果要设置的属性没有对应的DOM Properties，则使用setAttribute函数设置属性
        el.setAttribute(key, vnode.props[key])
      }
    }
  }
  insert(el, container)
}

// 以上还有问题，因为有些DOM Properties是只读的
// 对于DOM Properties只读的属性，我们只能使用setAttribute设置
function shouldSetAsProps(el, key, value) {
  // 特殊处理
  if (key === 'form' && el.tagName === 'INPUT')
    return false
  // 兜底
  return key in el
}
function mountElement(vnode, container) {
  const el = createElement(vnode.type)
  if (typeof vnode.children === 'string') {
    setElementText(el, vnode.children)
  }
  else if (Array.isArray(vnode.children)) {
    // 如果children是数组，则遍历每一个子节点，并调用patch函数挂载它
    vnode.children.forEach((child) => {
      patch(null, child, el)
    })
  }
  // 如果vnode.props存在才处理它
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key]
      // 使用shouldSetAsProps函数判断是否应该作为DOM Properties设置
      if (shouldSetAsProps(el, key, value)) {
        const type = typeof el[key]
        if (type === 'boolean' && value === '')
          el[key] = true
        else
          el[key] = value
      }
      else {
        el.setAttribute(key, value)
      }
    }
  }
  insert(el, container)
}

// 把属性设置也变成与平台无关，需要把属性设置相关操作也提取到渲染器选项中
const renderer = createRenderer({
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  // 将属性设置相关操作封装到patchProps函数中，并作为渲染器选项传递
  patchProps(el, key, prevValue, nextValue) {
    if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key]
      if (type === 'boolean' && nextValue === '')
        el[key] = true

      else
        el[key] = nextValue
    }
    else {
      el.setAttribute(key, nextValue)
    }
  },
})

function mountElement(vnode, container) {
  const el = createElement(vnode.type)
  if (typeof vnode.children === 'string') {
    setElementText(el, vnode.children)
  }
  else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => {
      patch(null, child, el)
    })
  }
  if (vnode.props) {
    for (const key in vnode.props) {
      // 调用patchProps函数即可
      patchProps(el, key, null, vnode.props[key])
    }
  }
  insert(el, container)
}
