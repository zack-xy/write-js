/* eslint-disable @typescript-eslint/no-this-alias */
// 数组迭代器的模拟实现

const arr = [1, 2, 3, 4, 5]

arr[Symbol.interator] = function () {
  const target = this
  const len = target.length
  let index = 0

  return {
    next() {
      return {
        value: index < len ? target[index] : undefined,
        done: index++ >= len,
      }
    },
  }
}
