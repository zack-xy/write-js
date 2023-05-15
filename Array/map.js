// 手写map
Array.prototype.map = function(callbackFn, thisArg) {
  if(this === null || this === undefined) {
    throw new TypeError("Cannot read property 'map' of null")
  }
  if(Object.prototype.toString.call(callbackFn) !== "[object Function]") {
    throw new TypeError(callbackFn+'is not a function')
  }
  let O = Object(this)
  let T = thisArg

  let len = O.length >>> 0
  let A = new Array(len)
  for(let k=0;k<len;k++) {
    if(k in O) {
       let kValue = O[k]
       // 依次传入this，当前项，当前索引，整个数组
       let mappedValue = callbackFn.call(T, kValue, k, O)
       A[k] = mappedValue
    }
  }
  return A
}
