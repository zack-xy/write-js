// 这个代码兼容了基本类型
// 简单版本

export function deepClone(source) {
  // 兼容基本类型
  if(source === null) return source
  if(typeof source !== 'object' && typeof source !== 'function') return source
  const targetObj = source.constructor === Array ? [] : {}
  for(let key in source) {
    if(source.hasOwnProperty(key)) {
       if(source[key] && typeof source[key] === 'object') {
        // 维护层提示代码，下面这一行去掉不影响功能
        targetObj[key] = source[key].constructor === Array ? [] : {}
        targetObj[key] = deepClone(source[key])
       } else {
        // 基本数据类型
        targetObj[key] = source[key]
       }
    }
  }
  return targetObj
 }
