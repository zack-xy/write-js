// 手写new
function _new(ctor, ...args) {
  if(typeof ctor !== 'function') {
    throw 'ctor must be a function'
  }

  let obj = new Object()
  obj.__proto__ = Object.create(ctor.prototype)
  let res = ctor.apply(obj, ...args)

  let isObject = typeof res === 'object' && typeof res !== null
  let isFunction = typeof res === 'function'
  return isObject || isFunction ? res : obj

}


////////// 测试------代码

function Parent(name, age) {
  this.name = name;
  this.age = age;
}

Parent.prototype.sayName = function () {
  console.log(this.name);
};

var str = "";

// 失败测试
var a = _new(str);
// ctor must be a function

// 成功
var b = _new(Parent, "frank", 18);
b.sayName(); // frank
b instanceof Parent; // true
b.hasOwnProperty("name"); // true
b.hasOwnProperty("age"); // true
b.hasOwnProperty("sayName"); // false
