/**
 * @func 反转字符串
 * @param {string} str 需要反转的字符串
 * @returns {string} 反转后的字符串
 * 
 * 
 * 
 */
// 函数表达式
// // es5 函数表达式

// function reverseString(str){
//     // str 是什么类型? 字符串 简单数据类型 primitive
//     return str.split('').reverse().join('');
// }

// es6 箭头函数 简洁 function 不要了 用简单的=> 代替
// {} 也省了 只有一句话的时候
// 他是返回值的时候，连return 都能省略
const reverseString = (str) => str.split('').reverse().join('')

console.log(reverseString("hello"));
