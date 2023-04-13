import deepClone from './other-version';

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


})
