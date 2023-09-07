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

  _.prototype.ending = function() {
    return this.wrapper
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
