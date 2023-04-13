import { deepClone } from './common-version';

test('deep clone primitive type', () => {
  let a = 1
  let b = 'abcd'
  let c = null
  let d = undefined
  let e = false
  let f = true
  let g = Symbol('测试')
  expect(deepClone(a)).toBe(1)
  expect(deepClone(b)).toBe('abcd')
  expect(deepClone(c)).toBeNull()
  expect(deepClone(d)).toBeUndefined()
  expect(deepClone(e)).toBeFalsy()
  expect(deepClone(f)).toBeTruthy()
  expect(deepClone(g)).toBe(g)
});

test('deep clone reference type', () => {
  let obj = {name:'zack'}
  expect(deepClone(obj)).toStrictEqual(obj)
  expect(deepClone(obj)).not.toBe(obj)

  let arr = [1,2,3,4,5]
  expect(deepClone(arr)).toStrictEqual(arr)
  expect(deepClone(arr)).not.toBe(arr)

  let arr2 = [{names: ['zack1','zack2'], ages: [10,23]}]
  expect(deepClone(arr2)).toStrictEqual(arr2)
  expect(deepClone(arr2)).not.toBe(arr2)

  // 对象里不能有Date
  let obj2 = {
    name: 'zack',
    tests: [12,3,4,5],
    jump() {
      console.log('I can jump')
    },
    // date: new Date(),
    sym: Symbol('ceshi')
  }
  expect(deepClone(obj2)).toStrictEqual(obj2)
  expect(deepClone(obj2)).not.toBe(obj2)


  // 无法拷贝对象的循环引用
  // let obj3 = {
  //   name: 'haha obj'
  // }
  // obj3['obj'] = obj3

  // expect(deepClone(obj3)).toStrictEqual(obj3)
  // expect(deepClone(obj3)).not.toBe(obj3)

  // 不能拷贝一个map
  // let map1 = new Map()
  // map1.set('test', {name:'aaa'})
  // expect(deepClone(map1)).toStrictEqual(map1)
  // expect(deepClone(map1)).not.toBe(map1)

  // 不能拷贝一个函数
  // let fn = () => {console.log('aaa')}
  // expect(deepClone(fn)).toStrictEqual(fn)
  // expect(deepClone(fn)).not.toBe(fn)


})
