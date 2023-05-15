// call的实现
Function.prototype.call = function(context, ...args) {
  var context = context || window
  context.fn = this
  var result = eval('conext.fn(...args)')
  delete context.fn
  return result
}
// apply的实现
Function.prototype.apply = function(context, args) {
  var context = context || window
  context.fn = this
  var result = eval('conext.fn(...args)')
  delete context.fn
  return result
}
// bind的实现
Function.prototype.bind = function(context, ...args) {
  if(typeof this !== 'function') {
    throw new Error('this must be a function')
  }
  var self = this
  var fbound = function() {
    self.apply(this instanceof self ? this : context)
    args.concat(Array.prototype.slice.call(arguments))
  }
  if(this.prototype) {
    fbound.prototype = Object.create(this.prototype)
  }
  return fbound
}
