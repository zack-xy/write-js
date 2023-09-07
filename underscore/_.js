/**
 * 主要功能
 *  
 * 支持两种使用
    // 1. _.unique([1,2,3,4,4]).map(fn)
    // 2. _([1,2,3,4,4]).unique(fn).map(fn)
 * 
 * 支持流式编程，也就是链式调用
 * 
 * 
 */

(function(root) {
  var _ = function(data) {
    if(!(this instanceof _)) {
      return new _(data)
    }
    this.wrapper = data
  }

  // 支持静态调用
  // 数组去重
  _.unique = function(source, callback) {
    const ref = []
    for(var i=0;i<source.length;i++) {
      var target = callback ? callback(source[i]) : source[i]
      if(ref.indexOf(target) === -1) {
        ref.push(target)
      }
    }
    return ref
  }

  // 没有实际实现
  _.filters = function(source) {
    return source
  }

  _.process = function(target) {
    var res = []
    for (const key in target) {
      res.push(key)
    }
    return res
  }

  _.chain = function(source) {
    var instance = _(source)
    instance._chain = true
    return instance
  }

  var model = function(instance, outcome) {
    if(instance._chain) {
      instance.wrapper = outcome
      return instance
    }
    return outcome
  }

  // 支持实例调用
  // 通过mixin进行扩展
  // _.prototype.unique = function() {
  //   console.log(2)
  // }

  // 流式编程结束标志
  _.prototype.ending = function() {
    return this.wrapper
  }

  _.extend = function() {
    var target = arguments[0]
    var length = arguments.length
    var i = 1
    var options
    for(;i<length;i++) {
      if((options=arguments[i])!=null) {
        for(key in options) {
          target[key] = options[key]
        }
      }
    }
    return target
  }

  _.isObject = function(obj) {
    return toString.call(obj) === '[object Object]'
  }

  var createReduce = function(dir) {
    var reduce = function(obj, func, memo, init) {
      var keys = !Array.isArray(obj) && Object.keys(obj)
      var length = (keys || obj).length
      var index = dir > 0 ? 0 : length - 1
      if(!init) {
        memo = obj[keys ? keys[index] : index]
        index+=dir
      }
      for(;index>=0&&index<length;index+=dir) {
        var currentKey = keys ? keys[index] : index
        memo = func(memo, obj[currentKey], currentKey, obj)
      }
      return memo
    } 
    
    return function(obj, func, memo) {
      var init = arguments.length >= 3
      return reduce(obj, func, memo, init)
    }
  }

  _.reduce = createReduce(1)

  // 浅拷贝
  _.clone = function(obj) {
    if(typeof obj !== 'object') return obj
    return Array.isArray(obj) ? obj.slice() : _.extend({}, obj)
  }

  // 深拷贝
  _.deepClone = function(obj) {
    if(Array.isArray(obj)) {
      return obj.map(function(item) {
        return Array.isArray(item) || _.isObject(item) ? _.deepClone(item) : item
      })
    } else if(_.isObject(obj)) {
      return _.reduce(obj, function(memo, value, key, target) {
        memo[key] = Array.isArray(value) || _.isObject(value) ? _.deepClone(value) : value
        return memo
      }, {})
    } else {
      return obj
    }
  }

  var beforeHook = function(arr, callback) {
    for(var i=0;i<arr.length;i++) {
      callback(arr[i])
    }
  }

  _.mixin = function(target) {
    beforeHook(_.process(target), function(key) {
      var func = target[key]
      _.prototype[key] = function() {
        var decon = [this.wrapper]
        Array.prototype.push.apply(decon, arguments)
        return model(this, func.apply(this, decon))
      }
    })
  }

  _.mixin(_)

  root._ = _
})(this)
