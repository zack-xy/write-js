// 手工实现JSON.stringify
// 循环引用没实现，2，3参数没有实现
function jsonStringify(data) {
  let type = typeof data

  if(type!=='object') {
    let result = data

    // data是基础类型的情况
    if(Number.isNaN(data) || data === Infinity) {
      // NaN和Infinity，返回“null”
      result = 'null' 
    } else if(type === 'function' || type === 'undefined' || type === 'symbol') {
      return undefined
    } else if(type === 'string') {
      result = '"' + data + '"'
    }
    return String(result)
  } else if(type === 'object') {
    if(data === null) {
      return "null"
    } else if(data.toJSON && typeof data.toJSON === 'function') {
      return jsonStringify(data.toJSON())
    } else if(data instanceof Array) {
      let result = []
      data.forEach((item, index) => {
        if(typeof item === 'undefined' || typeof item === 'function' || typeof item === 'symbol') {
          result[index] = "null"
        } else {
          result[index] = jsonStringify(item)
        }
      })
      result = "[" + result + "]"
      return result.replace(/'/g,'"') 
    } else {
      // 处理普通对象
      let result = []
      Object.keys(data).forEach((item, index) => {
        if(typeof item !== 'symbol') {
          // 如果key是symbol对象，忽略
          if(data[item]!==undefined && typeof data[item] !== 'function' && typeof data[item] !== 'symbol') {
            // 键值如果是undefined、function、symbol为属性值，忽略
            result.push('"'+item+'"'+':'+jsonStringify(data[item]))
          }
        }
      })
      return ("{" + result + "}").replace(/'/g,'"') 
    }
  }
}














///////////////// 我是分隔线，跟上面代码实现没有关系

// 其他知识点
// JSON.parse接收2个参数，第1个是字符串，第2个是函数，用来在返回前对对象进行操作
JSON.parse('{"p":5}', (k,v) => {
  if(k === '') return v
  return v * 2  // 将属性值变为原来的2倍返回
})


// JOSN.stringify，接受3个参数，1:对象，2:replacer函数，3:控制字符串间距 

function replacer(key, value) {  // 过滤掉字符串的value 
  if(typeof value === 'string') return undefined
  return value
}

var obj = {name:"zack",age: 18}
console.log(JOSN.stringify(obj, replacer));  // "{age: 18}"
console.log(JOSN.stringify(obj, replacer, " "));  
// {
//   "age": 18
//  }
