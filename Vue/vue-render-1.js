/* eslint-disable @typescript-eslint/no-unused-vars */
// 最简单的渲染函数
function Render(obj, root) {
  const el = document.createElement(obj.tag)
  if (typeof obj.children === 'string') {
    const text = document.createTextNode(obj.children)
    el.appendChild(text)
  }
  else if (obj.children) {
    obj.children.forEach(child => Render(child, el))
  }
  root.appendChild(el)
}
