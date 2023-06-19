// 在main.js中创建一个全局的Vue实例作为事件总线
Vue.prototype.$bus = new Vue()

// 在需要使用事件总线的组件中，通过this.$bus访问
this.$bus.$emit('eventName', data)
this.$bus.$on('eventName', handler)
this.$bus.$off('eventName', handler)



// 原生js实现方式
class EventBus {
  constructor() {
    this.events = {}
  }

  $emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(handler => {
        handler(...args)
      });
    }
  }

  $on(event, handler) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler)
  }

  $off(event, handler) {
    if (this.events[event]) {
      const index = this.events[event].indexOf(handler);
      if (index > -1) {
        this.events[event].splice(index, 1);
      }
    }
  }
}

// 使用示例
const bus = new EventBus()
bus.$on('eventName', (data) => {
  console.log(data)
})
bus.$emit('eventName', 'Hello, World!')
