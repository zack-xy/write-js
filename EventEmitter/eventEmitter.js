// 手动实现一个简版的EventEmitter

function EventEmitter() {
  this.__events = {}
}



EventEmitter.prototype.on = function(eventName, listener) {
  if(!eventName || !listener) return
  // 判断listener是否为函数
  if(!isValidListener(listener)) {
    throw new TypeError('listener must be a function')
  }

  var events = this.__events
  var listeners = events[eventName] = events[eventName] || []
  var listenerlsWrapped = typeof listener === 'object'
  // 不重复添加事件，判断是否有一样的
  if(indexOf(listeners, listener) === -1) {
    listeners.push(listenerlsWrapped ? listener : {
      listener: listener,
      once: false
    })
  }
  return this
}

EventEmitter.prototype.emit = function(eventName, args) {
  // 直接通过内部对象获取对应自定义事件的回调函数
  var listeners = this.__events[eventName]
  if(!listeners) return
  // 考虑多个listeners情况
  for(var i=0;i<listeners.length;i++) {
    var listener = listeners[i]
    if(listener) {
      listener.listener.apply(this, args || [])
      // 给listener中once进行特殊处理
      if(listener.once) {
        this.off(eventName, listener.listener)
      }
    }
  }
  return this
}

EventEmitter.prototype.off = function(eventName, listener) {
  var listeners = this.__events[eventName]
  if(!listeners) return

  var index
  for(var i=0,len=listeners.length;i<len;i++) {
    if(listeners[i] && listeners[i].listener === listener) {
      index = i
      break
    }
  }
  
  // off
  if(typeof index !== 'undefined') {
    listeners.splice(index, 1, null)
  }

  return this
}

EventEmitter.prototype.once = function(eventName, listener) {
  return this.on(eventName, {
    listener: listener,
    once: true
  })
}

EventEmitter.prototype.allOff = function(eventName) {
  if(eventName && this.__events[eventName]) {
    this.__events[eventName] = []
  } else {
    this.__events = {}
  }
}


// 判断是否是合法的listener
function isValidListener(listener) {
  if(typeof listener === 'function') {
    return true 
  } else if(listener && typeof listener === 'object') {
    return isValidListener(listener.listener)
  } else {
    return false
  }
}

// 判断自定义事件是否存在
function indexOf(array, item) {
  var result = -1
  item = typeof item === 'object' ? item.listener : item

  for(var i=0,len=array.length;i<len;i++) {
    if(array[i].listener === item) {
      result = i
      break
    }
  }
  return result
}


EventEmitter.VERSION = '1.0.0 '
