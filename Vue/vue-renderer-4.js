const { effect, ref } = VueReactivity

const bol = ref(false)

effect(() => {
  // 创建vnode
  const vnode = {
    type: 'div',
    props: bol.value
      ? {
          onClick: () => {
            alert('父元素 clicked')
          },
        }
      : {},
    children: [
      {
        type: 'p',
        props: {
          onClick: () => {
            bol.value = true
          },
        },
        children: 'text',
      },
    ],
  }
  // 渲染vnode
  renderer.render(vnode, document.querySelector('#app'))
})

// 初始化时，父元素上是没有绑定事件的
// 当子组件点击时，会发现触发了父组件的事件
// 是因为，子组件在点击时，修改了响应式数据，触发了副作用函数
// 副作用函数在执行时，将事件添加到父元素上
// 之后，子元素的事件冒泡到父元素上，导致父元素事件触发

// 解决办法：需要屏蔽所有绑定时间晚于事件触发时间的事件处理函数的执行
patchProps(el, key, prevValue,nextValue) {
  if(/^on/.test(key)) {
    const invokers = el._vei || (el._vei = {})
    let invoker = invokers[key]
    const name = key.slice(2).toLowerCase()
    if(nextValue) {
      if(!invoker) {
        invoker = el._vei[key] = (e) => {
          // e.timeStamp 是事件发生的时间
          // 如果事件发生的时间早于事件处理函数绑定的时间，则不执行事件处理函数
          if(e.timeStamp < invoker.attached) return
          if(Array.isArray(invoker.value)) {
            invoker.value.forEach(fn => fn(e))
          } else {
            invoker.value(e)
          }
        }
        invoker.value = nextValue
        // 添加invoker.attached属性，存储事件处理函数被绑定的时间
        invoker.attached = performance.now()
        el.addEventListener(name, invoker)
      } else {
        invoker.value = nextValue
      }
    } else if(invoker) {
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


// 更新子节点
function mountElement(vnode, container) {
  const el = vnode.el = createElement(vnode.type)

  // 挂载子节点,首先判断children的类型
  // 如果是字符串类型，说明是文本子节点
  if(typeof vnode.children === 'string') {
    setElementText(el, vnode.children)
  } else if(Array.isArray(vnode.children)) {
    // 如果是数组，说明是多个子节点
    vnode.children.forEach(child => {
      patch(null, child, el)
    })
  }

  if(vnode.props) {
    for(const key in vnode.props) {
      patchProps(el, key, null, vnode.props[key])
    }
  }

  insert(el, container)
}

function patchElement(n1, n2) {
  const el = n2.el = n1.el
  const oldProps = n1.props
  const newProps = n2.props
  // 第一步：更新props
  for(const key in newProps) {
    if(newProps[key] !== oldProps[key]) {
      patchProps(el, key, oldProps[key], newProps[key])
    }
  }
  for(const key in oldProps) {
    if(!(key in newProps)) {
      patchProps(el, key, oldProps[key], null)
    }
  }
  // 第二步： 更新children
  patchChildren(n1, n2, el)
}

function patchChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if(typeof n2.children === 'string') {
    // 旧节点的类型有三种可能：没有子节点、文本子节点、一组子节点
    // 只有当旧子节点为一组子节点时，才需要逐个卸载，其他情况什么都不需要做
    if(Array.isArray(n1.children)) {
      n1.children.forEach(c=> unmount(c))
    }
    // 最后将新的文本节点内容设置给容器元素
    setElementText(container, n2.children)
  } else if(Array.isArray(n2.children)) {
    // 如果新子节点是一组子节点
    // 判断旧子节点是否也是一组子节点
    if(Array.isArray(n1.children)) {
      // 代码运行到这里，则说明新旧子节点都是一组子节点，这里涉及Diff算法
      // 暂时的简单处理:1.先将旧的一组子节点全部卸载 2.再将新的一组子节点全部挂载到容器中
      n1.children.forEach(c => unmount(c))
      n2,children.forEach(c => patch(null, c, container))
    } else {
      // 此时：
      // 旧子节点要么是文本子节点，要么不存在
      // 需要将容器清空，然后将一组子节点逐个挂载
      setElementText(container, '')
      n2.children.forEach(c => patch(null, c, container))
    }
  } else {
    // 代码运行到这里，说明新子节点不存在
    // 旧子节点是一组子节点，只需逐个卸载即可
    if(Array.isArray(n1.children)) {
      n1.children.forEach(c=> unmount(c))
    } else if(typeof n1.children === 'string') {
      // 旧子节点是文本子节点，清空内容即可
      setElementText(container, '')
    }
    // 如果也没有旧子节点，什么都不需要做
  }
}
