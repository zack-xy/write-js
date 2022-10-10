// 旧vnode
const oldVnode = {
  type: 'div',
  children: [
    { type: 'p', children: '1' },
    { type: 'p', children: '2' },
    { type: 'p', children: '3' },
  ],
}

// 新vnode
const newVNode = {
  type: 'div',
  children: [
    { type: 'p', children: '4' },
    { type: 'p', children: '5' },
    { type: 'p', children: '6' },
  ],
}

// 简单diff算法
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // ...
  }
  else if (Array.isArray(n2.children)) {
    // 重新实现两组子节点的更新方式
    // 新旧children
    const oldChildren = n1.children
    const newChildren = n2.children
    // 遍历旧的children
    // 旧的一组子节点的长度
    const oldLen = oldChildren.length
    // 新的一组子节点的长度
    const newLen = newChildren.length
    // 两组子节点的公共长度，即两者中较短的那一组子节点的长度
    const commonLength = Math.min(oldLen, newLen)
    // 遍历commonLength次
    for (let i = 0; i < commonLength; i++)
      patch(oldChildren[i], newChildren[i], container)
    // 如果newLen > oldLen，说明有新子节点需要挂载
    if (newLen > oldLen) {
      for (let i = commonLength; i < newLen; i++)
        patch(null, newChildren[i], container)
    }
    else if (oldLen > newLen) {
      // 如果oldLen > newLen，说明有旧子节点需要卸载
      for (let i = commonLength; i < oldLen; i++)
        unmount(oldChildren[i])
    }
  }
  else {
    // ...
  }
}

// key的作用
// 使得dom diff更加的高效率
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // ...
  }
  else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children
    const newChildren = n2.children

    // 遍历新的children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i]
      // 遍历旧的children
      for (let k = 0; j < oldChildren.length; j++) {
        const oldVnode = oldChildren[j]
        // 如果找到了具有相同key值的两个节点，说明可以复用，但仍然需要patch
        if (newVNode.key === oldVnode.key) {
          patch(oldVnode, newVNode, container)
          break
        }
      }
    }
  }
  else {
    // ...
  }
}

// 如何移动节点
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // ...
  }
  else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children
    const newChildren = n2.children

    // 用来存储寻找过程中遇到的最大索引值
    const lastIndex = 0
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i]
      let j = 0
      // 在第一层循环中定义变量find，代表是否在旧的一组子节点中找到可复用的节点
      // 初始值为false，代表没找到
      let find = false
      for (j; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j]
        if (newVNode.key === oldChildren.key) {
          // 一旦找到可复用的节点，则将变量find的值设为true
          find = true
          patch(oldVNode, newVNode, container)
          if (j < lastIndex) {
            // 如果当前找到的节点在旧children中的索引小于最大索引值lastIndex
            // 说明该节点对应的真实DOM需要移动
            // 先获取newVNode的前一个vnode，即prevVNode
            const prevVNode = newChildren[i - 1]
            // 如果prevVNode不存在，则说明当前newVNode是第一个子节点，不需要移动
            if (prevVNode) {
              // 由于我们要将newVNode对应的真实DOM移动到prevVNode所对应真实DOM后面
              // 所以我们需要获取prevVNode所对应真实DOM的下一个兄弟节点，并将其作为锚点
              const anchor = prevVNode.el.nextSibling
              // 调用insert方法将newVNode对应的真实DOM插入到锚点元素前面
              // 也就是prevVNode对应真实DOM的后面
              insert(newVNode.el, container, anchor)
            }
          }
          else {
            // 如果当前找到的节点在旧children中的索引不小于最大索引值
            // 则更新lastIndex的值
            lastIndex = j
          }
          break
        }
      }
      // 如果代码运行到这里，find仍然为false
      // 说明当前newVNode没有在旧的一组子节点中找到可复用的节点
      // 也就是说，当前newVNode是新增节点，需要挂载
      if (!find) {
        // 为了将节点挂载到正确位置，我们需要先获取锚点元素
        // 首先获取当前newVNode的前一个vnode节点
        const prevVNode = newChildren[i - 1]
        let anchor = null
        if (prevVNode) {
          // 如果有前一个vnode节点，则使用他的下一个兄弟节点作为锚点元素
          anchor = prevVNode.el.nextSibling
        }
        else {
          // 如果没有前一个vnode节点，说明即将挂载的新节点是第一个子节点
          // 这时我们使用容器元素的firstChild作为锚点
          anchor = container.firstChild
        }
        // 挂载newVNode
        patch(null, newVNode, container, anchor)
      }
    }

    // 上一步的更新操作完成后
    // 遍历旧的一组子节点
    for (let i = 0; i < oldChildren.length; i++) {
      const oldVNode = oldChildren[i]
      // 拿旧子节点oldVNode去新的一组子节点中寻找具有相同key值的节点
      const has = newChildren.find(vnode => vnode.key === oldVNode.key)
      if (!has) {
        // 如果没有找到具有相同key值的节点，则说明需要删除该节点
        // 调用unmount函数将其卸载
        unmount(oldVNode)
      }
    }
  }
  else {
    // ...
  }
}

// 需要修改patch函数接收第4个参数，即锚点元素
function patch(n1, n2, container, anchor) {
  // 省略部分代码
  if (typeof type === 'string') {
    if (!n1) {
      // 挂载时将锚点元素作为第三个参数传递给mountElement函数
      mountElement(n2, container, anchor)
    }
    else {
      patchElement(n1, n2)
    }
  }
  else if (type === Text) {
    // 省略部分代码
  }
  else if (type === Fragment) {
    // 省略部分代码
  }
}

// 需要修改mountElement函数需要增加第3个参数，即锚点元素
function mountElement(vnode, container, anchor) {
  // 省略部分代码

  // 在插入节点时，将锚点元素传递给insert函数
  insert(el, container, anchor)
}

