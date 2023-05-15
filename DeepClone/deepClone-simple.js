// 深拷贝基础版本递归实现

function deepClone(obj) {
  let cloneObj = {}
  for(let key in obj) {
    if(typeof obj[key] === 'object') {
      cloneObj[key] = deepClone(obj[key])
    } else {
      cloneObj[key] = obj[key]
    }
  }
}
