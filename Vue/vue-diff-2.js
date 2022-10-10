// 双端diff算法
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // 省略部分代码
  }
  else if (Array.isArray(n2.children)) {
    // 封装patchKeyedChildren函数处理两组子节点
    patchKeyedChildren(n1, n2, container)
  }
  else {
    // 省略部分代码
  }
}

function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children
  const newChildren = n2.children
  // 4个索引值
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = newChildren.length - 1
  // 4个索引指向的vnode节点
  let oldStartVNode = oldChildren[oldStartIdx]
  let oldEndVNode = oldChildren[oldEndIdx]
  let newStartVNode = newChildren[newStartIdx]
  let newEndVNode = newChildren[newEndIdx]

  // 双端比较的方式
  // 在双端比较中，每一轮比较分为4个步骤（每一步比较key看看是不是DOM可以复用）
  // 第一步： 比较旧的一组子节点中的第一个子节点和新的一组子节点的第一个子节点
  // 第二步：比较旧的一组子节点的最后一个子节点和新的一组子节点中的最后一个子节点
  // 第三步：比较旧的一组子节点中的第一个子节点与新的一组子节点的最后一个子节点
  // 第四步：比较旧的一组子节点中的最后一个子节点与新的一组子节点中的第一个子节点
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode.key === newStartVNode.key) {
      // 第一步：oldStartVNode和newStartVNode比较
      patch(oldStartVNode, newStartVNode, container)
      oldStartVNode = oldChildren[++oldStartIdx]
      newStartVNode = newChildren[++newStartIdx]
    }
    else if (oldEndVNode.key === newEndVNode.key) {
      // 第二步：oldEndVNode和newEndVNode比较
      // 节点在新的顺序中仍然处于尾部，不需要移动，但需打补丁
      patch(oldEndVNode, newEndVNode, container)
      // 更新索引和头尾部节点变量
      oldEndVNode = oldChildren[--oldEndIdx]
      newEndVNode = newChildren[--newEndIdx]
    }
    else if (oldStartVNode.key === newEndVNode.key) {
      // 第三步：oldStartVNode和newEndVNode比较
      patch(oldStartVNode, newEndVNode, container)
      // 将旧的一组子节点的头部节点对应的真实DOM节点oldStartVNode.el移动到
      // 旧的一组子节点的尾部节点对应的真实DOM节点后面
      insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)
      // 更新相关索引到下一个位置
      oldStartVNode = oldChildren[++oldStartIdx]
      newEndVNode = newChildren[--newEndIdx]
    }
    else if (oldEndVNode.key === newStartVNode.key) {
      // 第四步：oldEndVNode和newStartVNode比较
      // 仍然需要调用patch函数进行打补丁
      patch(oldEndVNode, newStartVNode, container)
      // 移动DOM操作
      // oldEndVNode.el移动到oldStartVNode.el前面
      insert(oldEndVNode.el, container, oldStartVNode.el)

      // 移动DOM完成后，更新索引值，并指向下一个位置
      oldEndVNode = oldChildren[--oldEndIdx]
      newStartVNode = newChildren[++newStartIdx]
    }
  }
}

// 上面的双端diff是理想情况，假设旧节点在新节点的两头
// 非理想情况下，旧节点的两头在新节点两头都找寻不到
// 这时，我们假设新节点仍然可以复用，不在两头则需要在整个节点中寻找
function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children
  const newChildren = n2.children
  // 4个索引值
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = newChildren.length - 1
  // 4个索引指向的vnode节点
  let oldStartVNode = oldChildren[oldStartIdx]
  let oldEndVNode = oldChildren[oldEndIdx]
  let newStartVNode = newChildren[newStartIdx]
  let newEndVNode = newChildren[newEndIdx]

  // 双端比较的方式
  // 在双端比较中，每一轮比较分为4个步骤（每一步比较key看看是不是DOM可以复用）
  // 第一步： 比较旧的一组子节点中的第一个子节点和新的一组子节点的第一个子节点
  // 第二步：比较旧的一组子节点的最后一个子节点和新的一组子节点中的最后一个子节点
  // 第三步：比较旧的一组子节点中的第一个子节点与新的一组子节点的最后一个子节点
  // 第四步：比较旧的一组子节点中的最后一个子节点与新的一组子节点中的第一个子节点
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 补充逻辑，如果旧节点已经是undefined，说明已经处理过了
    if (!oldStartVNode) {
      oldStartVNode = oldChildren[++oldStartIdx]
    }
    else if (!oldEndVNode) {
      oldEndVNode = oldChildren[--oldEndIdx]
    }
    else if (oldStartVNode.key === newStartVNode.key) {
      // 第一步：oldStartVNode和newStartVNode比较
      patch(oldStartVNode, newStartVNode, container)
      oldStartVNode = oldChildren[++oldStartIdx]
      newStartVNode = newChildren[++newStartIdx]
    }
    else if (oldEndVNode.key === newEndVNode.key) {
      // 第二步：oldEndVNode和newEndVNode比较
      // 节点在新的顺序中仍然处于尾部，不需要移动，但需打补丁
      patch(oldEndVNode, newEndVNode, container)
      // 更新索引和头尾部节点变量
      oldEndVNode = oldChildren[--oldEndIdx]
      newEndVNode = newChildren[--newEndIdx]
    }
    else if (oldStartVNode.key === newEndVNode.key) {
      // 第三步：oldStartVNode和newEndVNode比较
      patch(oldStartVNode, newEndVNode, container)
      // 将旧的一组子节点的头部节点对应的真实DOM节点oldStartVNode.el移动到
      // 旧的一组子节点的尾部节点对应的真实DOM节点后面
      insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)
      // 更新相关索引到下一个位置
      oldStartVNode = oldChildren[++oldStartIdx]
      newEndVNode = newChildren[--newEndIdx]
    }
    else if (oldEndVNode.key === newStartVNode.key) {
      // 第四步：oldEndVNode和newStartVNode比较
      // 仍然需要调用patch函数进行打补丁
      patch(oldEndVNode, newStartVNode, container)
      // 移动DOM操作
      // oldEndVNode.el移动到oldStartVNode.el前面
      insert(oldEndVNode.el, container, oldStartVNode.el)

      // 移动DOM完成后，更新索引值，并指向下一个位置
      oldEndVNode = oldChildren[--oldEndIdx]
      newStartVNode = newChildren[++newStartIdx]
    }
    else {
      // 如果两头都没有找到可以复用的节点，假设依然可以复用，则需要到整个节点里去找
      // 遍历旧的一组子节点，试图寻找与newStartVNode拥有相同key值的节点
      // idxInOld就是新的一组子节点的头部节点在旧的一组子节点中的索引
      const idxInOld = oldChildren.findIndex(node => node.key === newStartVNode.key)
      // idxInOld大于0，说明找到了可复用的节点,并且需要将其对应的真实DOM移动到头部
      if (idxInOld > 0) {
        // idxInOld位置对应的vnode就是需要移动的节点
        const vnodeToMove = oldChildren[idxInOld]
        // 不要忘记除移动操作外还应该打补丁
        patch(vnodeToMove, newStartVNode, container)
        // 将vnodeToMove.el移动到头部节点oldStartVNode.el之前，因此使用后者作为锚点
        insert(vnodeToMove.el, container, oldStartVNode.el)
        // 由于位置idxInOld处的节点所对应的真实DOM已经移动到了别处，因此将其设置为undefined
        oldChildren[idxInOld] = undefined
        // 最后更新newStartIdx到下一个位置
      }
      else {
        // 将newStartVNode作为新节点挂载到头部，使用当前头部节点oldStartVNode.el作为锚点
        patch(null, newStartVNode, container, oldStartVNode.el)
      }
      newStartVNode = newChildren[++newStartIdx]
    }
  }

  // 循环结束后检查索引值的情况
  if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    // 如果满足条件，则说明有新节点遗留，需要挂载它们
    for (let i = newStartIdx; i <= newEndIdx; i++)
      patch(null, newChildren[i], container, oldStartVNode.el)
  }
  else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
    // 移除操作
    for (let i = oldStartIdx; i < oldEndIdx; i++)
      unmount(oldChildren[i])
  }
}

