function patchKeyedChildren(n1, n2, container) {
  const newChildren = n2.children
  const oldChildren = n1.children
  // 处理相同的前置节点
  // 索引j指向新旧两组子节点的开头
  const j = 0
  let oldVNode = oldChildren[j]
  let newVNode = newChildren[j]
  // while循环向后遍历，直到遇到拥有不同key值的节点为止
  while (oldVNode.key === newVNode.key) {
    // 调用patch函数进行更新
    patch(oldVNode, newVNode, container)
    // 更新索引j，让其递增
    j++
    oldVNode = oldChildren[j]
    newVNode = newChildren[j]
  }

  // 更新相同的后置节点
  // 索引oldEnd指向旧的一组子节点的最后一个节点
  let oldEnd = oldChildren.length - 1
  // 索引newEnd指向新的一组子节点的最后一个节点
  let newEnd = newChildren.length - 1

  oldVNode = oldChildren[oldEnd]
  newVNode = newChildren[newEnd]
  // while循环从后向前遍历，直到遇到拥有不同key值的节点为止
  while (oldVNode.key === newVNode.key) {
    // 调用patch函数更新
    patch(oldVNode, newVNode, container)
    // 递减oldEnd和newEnd
    oldEnd--
    newEnd--
    oldVNode = oldChildren[oldEnd]
    newVNode = newChildren[newEnd]
  }

  // 前后都处理完毕了
  // 如果满足以下条件，则说明从j-->newEnd之间的节点应作为新节点插入
  if (j > oldEnd && j <= newEnd) {
    // 锚点的索引
    const anchorIndex = newEnd + 1
    // 锚点元素
    const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
    // 采用while循环，调用patch函数逐个挂载新增节点
    while (j <= newEnd)
      patch(null, newChildren[j++], container, anchor)
  }
  else if (j > oldEnd && j <= newEnd) {
    // j -> oldEnd之间的节点应该被卸载
    while (j <= oldEnd)
      unmount(oldChildren[j++])
  }
  else {
    // 处理非理想情况
    // 构造source数组
    // 新节点剩余节点数长度的数组，值为-1
    // source数组用来存储新的子节点在旧的子节点的位置索引，后面会使用它计算出一个最长递增子序列
    const count = newEnd - j + 1
    const source = new Array(count)
    source.fill(-1)

    // oldStart和newStart分别为起始索引，即j
    const oldStart = j
    const newStart = j
    // 遍历旧的一组子节点
    for (let i = oldStart; i <= oldEnd; i++) {
      const oldVNode = oldChildren[i]
      // 遍历新的一组子节点
      for (let k = newStart; k <= newEnd; k++) {
        const newVNode = newChildren[k]
        // 找到拥有相同key值的可复用节点
        if (oldVNode.key === newVNode.key) {
          // 调用patch进行更新
          patch(oldVNode, newVNode, container)
          // 最后填充source数组
          source[k - newStart] = i
        }
      }
    }
  }
}

function patchKeyedChildren(n1, n2, container) {
  const newChildren = n2.children
  const oldChildren = n1.children
  // 处理相同的前置节点
  // 索引j指向新旧两组子节点的开头
  const j = 0
  let oldVNode = oldChildren[j]
  let newVNode = newChildren[j]
  // while循环向后遍历，直到遇到拥有不同key值的节点为止
  while (oldVNode.key === newVNode.key) {
    // 调用patch函数进行更新
    patch(oldVNode, newVNode, container)
    // 更新索引j，让其递增
    j++
    oldVNode = oldChildren[j]
    newVNode = newChildren[j]
  }

  // 更新相同的后置节点
  // 索引oldEnd指向旧的一组子节点的最后一个节点
  let oldEnd = oldChildren.length - 1
  // 索引newEnd指向新的一组子节点的最后一个节点
  let newEnd = newChildren.length - 1

  oldVNode = oldChildren[oldEnd]
  newVNode = newChildren[newEnd]
  // while循环从后向前遍历，直到遇到拥有不同key值的节点为止
  while (oldVNode.key === newVNode.key) {
    // 调用patch函数更新
    patch(oldVNode, newVNode, container)
    // 递减oldEnd和newEnd
    oldEnd--
    newEnd--
    oldVNode = oldChildren[oldEnd]
    newVNode = newChildren[newEnd]
  }
  ////
  /// 改进
  // 以上双层循环会有性能问题，建立key和索引位置映射的索引表
  if (j > oldEnd && j <= newEnd) {
  // 旧的完毕，新的有剩下，需要将剩下的挂载上去
  }
  else if (j > newEnd && j <= oldEnd) {
  // 新的完毕，旧的有剩下，需要将剩下的旧的卸载
  }
  else {
  // 非理想情况
    const count = newEnd - j + 1
    const source = new Array(count)
    source.fill(-1)

    // oldStart和newStart分别为起始索引，即j
    const oldStart = j
    const newStart = j
    // 增加两个变量，moved和pos
    let moved = false
    let pos = 0
    // 构建索引表(新节点key，新节点索引)
    const keyIndex = {}
    for (let i = newStart; i <= newEnd; i++)
      keyIndex[newChildren[i].key] = i
    // 增加patched变量，代表更新过的节点数量
    let patched = 0
    // 遍历旧的一组子节点中剩余未处理的节点
    for (let i = oldStart; i <= oldEnd; i++) {
      oldVNode = oldChildren[i]
      // 如果更新过的节点数量小于等于需要更新的节点数量，则执行更新
      if (patched <= count) {
        // 通过索引表快速找到新的一组子节点中具有相同key值的节点位置
        const k = keyIndex[oldVNode.key]

        if (typeof k !== 'undefined') {
          newVNode = newChildren[k]
          // 调用patch函数完成更新
          patch(oldVNode, newVNode, container)
          // 每更新一个节点，都将patched变量+1
          patched++
          // 填充source数组
          source[k - newStart] = i
          // 判断节点是否需要移动
          if (k < pos)
            moved = true
          else
            pos = k
        }
        else {
        // 没找到
          unmount(oldVNode)
        }
      }
      else {
        // 如果更新过的节点数量大于需要更新的节点数量，则卸载多余节点
        unmount(oldVNode)
      }
    }

    if (moved) {
      // 如果moved为真，则需要进行DOM移动操作
      // 计算最长递增子序列
      const seq = lis(source) // [2,3,1,-1]  => [0,1]  // lis返回最长子序列的索引

      // s指向最长递增子序列的最后一个元素
      let s = seq.length - 1
      // i指向新的一组子节点的最后一个元素
      let i = count - 1
      // for循环使得i递减，即从后向前移动
      for (i; i > 0; i--) {
        if (source[i] === -1) {
          // 说明索引为i的节点是全新的节点，应该将其挂载
          // 该节点在新children中的真实位置索引
          const pos = i + newStart
          const newVNode = newChildren[pos]
          // 该节点下一个节点位置索引
          const nextPos = pos + 1
          // 锚点
          const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
          // 挂载
          patch(null, newVNode, container, anchor)
        }
        else if (i !== seq[s]) {
          // 如果节点的索引i不等于seq[i]的值，说明该节点需要移动
          // 该节点在新的一组子节点中的真实位置索引
          const pos = i + newStart
          const newVNode = newChildren[pos]
          // 该节点的下一个节点的位置索引
          const nextPos = pos + 1
          // 锚点
          const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
          // 移动
          insert(newVNode.el, container, anchor)
        }
        else {
          // 当i===seq[s]时，说明该位置的节点不需要移动
          // 只需让s指向下一个位置
          s--
        }
      }
    }
  }
}

// 求得最长自增子序列
function getSequence(arr) {
  const p = arr.slice() // 数组的副本，存的是数组arr索引对于结果最后一位索引的映射
  const result = [0] // 存储结果，结果是数组的索引位置
  let i, j, u, v, c
  const len = arr.length // 数组的长度
  for (i = 0; i < len; i++) {
    const arrI = arr[i] // 循环数组的每一项
    if (arrI !== 0) { // 如果当前项的值不为0
      j = result[result.length - 1] // 获得结果的最后一个，j是一个索引
      if (arr[j] < arrI) { // 如果数组中j位置的值小于当前的i位置的值，说明该值是递增的值
        p[i] = j // 数组的副本i位置设置为j索引
        result.push(i) // 结果数组增加一位
        continue
      }
      // 如果当前位置的值大于或者等于结果最后一位的值，那么该值不是递增的值
      u = 0 // u设置为0
      v = result.length - 1 // 获取结果的最后一位索引
      while (u < v) { // 开启循环，直到u值等于结果的数组长度
        c = ((u + v) / 2) | 0 // 二进制或，忽略小数取整，二分法
        if (arr[result[c]] < arrI) // 如果在结果中有值小于当前值
          u = c + 1 // 索引从中间向后加1
        else
          v = c // 如果在结果中有值大于等于当前值，前一半，终点索引为中间值
      }
      if (arrI < arr[result[u]]) { // 最终u的值是结果数组中比当前值小的后一位索引，如果当前值比这个值要小
        if (u > 0) // 当前的值需要插到u的位置
          p[i] = result[u - 1]
        result[u] = i
      }
    }
  }
  u = result.length // u是结果数组的长度
  v = result[u - 1] // v是结果数组最后一位
  while (u-- > 0) {
    result[u] = v
    v = p[v] // arr中索引为v时，result的最后一个
  }
  return result
}
