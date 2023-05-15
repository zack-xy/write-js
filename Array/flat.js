// 普通递归实现
function flatten(arr) {
  let result = []

  for(let i=0;i<arr.length;i++) {
    if(Array.isArray(arr[i])) { 
      result = result.concat(flatten(arr[i]))
    } else {
      result.push(arr[i])
    }
  }

  return result
}


// 使用reduce实现 
function flatten2(arr) {
  return arr.reduce((prev, next) => {
    return prev.concat(Array.isArray(next) ? flatten2(next) : next )
  },[])
}


// 扩展运算符的实现
function flatten3(arr) {
  while(arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr)
  }
  return arr 
}


// split和toString
function flatten4(arr) {
  return arr.toString().split(',')
}

// 正则和JSON
function flatten5(arr) {
  let str = JSON.stringify(arr)
  str = str.replace(/\[|\]/g,'')
  str = '[' + str + ']'
  return JSON.parse(str)
}
