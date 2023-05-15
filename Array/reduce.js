// 手写reduce的实现
Array.prototype.reduce = function(callbackFn, initialValue) {
  // 异常处理
  if(this === null || this === undefined) {
    throw new TypeError("Cannot read property 'reduce' of null")
  }
  if(Object.prototype.toString.call(callbackFn)!="[object Function]") {
    throw new TypeError(callbackFn+'is not a function')
  }
  let O = Object(this)
  let len = O.length >>> 0
  let k = 0
  let accumulator = initialValue
  if(accumulator === undefined) {
    for(;k<len;k++) {
      if(k in O) {
        accumulator=O[k]
        k++
        break
      }
    }
    throw new Error('Each element of the array is empty')
  }
  for(;k<len;k++) {
    if(k in O) {
      accumulator = callbackFn.call(undefined, accumulator, O[k], O)
    }
  }
  return accumulator
}
