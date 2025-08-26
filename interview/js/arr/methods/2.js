let arr = [3, 1, 2]; // 修改原数组
// console.log(arr.sort(), arr);
// console.log(arr.sort((a, b) => a - b), arr);
// >= 0 升序
// console.log(arr.sort((a, b) => a - b);
// console.log(arr.sort((a, b) => b - a);
// 默认字典排序
// console.log([10,1,20,3,5].sort());
// 为什么 [10,1,20,3,5].sort() 结果是 [1, 10, 20, 3, 5]？
// 根本原因：sort() 默认将元素转换为字符串进行比较
// 字符串比较：'1' < '10' < '20' < '3' < '5'（按字典序）
// 解决方案：使用比较函数 (a, b) => a - b 进行数字排序

// console.log(arr.reverse(), arr);
// es6
console.log(arr.fill(0, 1, 3), arr);


