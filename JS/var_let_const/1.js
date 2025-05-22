// 代码 编译阶段 
    // 一刹那，语法检测，做点准备
// 执行阶段
// 当前作用域的顶部
// 变量提升是面试官喜欢的，js开发者设计的
// 不好，代码的执行结果和代码阅读顺序不一致，有歧义
// 糟粕 避开
// 使用let，不使用var
showName() // 驼峰式命名
console.log(myName);

var myName = '真心'
function showName() {
    let b = 2;
    console.log(myName);
    console.log('函数执行了');
}
