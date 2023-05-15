// 手写push
Array.prototype.push = function(...items) {
  let O = Object(this)  // 先转换为对象
  let len = this.length >>> 0
  let argCount = items.length >>> 0
  // 2^53 - 1为js能表示的最大整数
  if(len + argCount > 2 ** 53 - 1) {
    throw new TypeError('The number of array is over the max value')
  }
  for(let i=0;i<argCount;i++) {
     [len+i] = items[i]
  }
  let newLength = len + argCount
  O.length = newLength
  return newLength
}
