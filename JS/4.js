// 全局的 js 代码在执行之前会有一个编译
// 变量提升了
console.log(vaule,'-----');
//var vaule;
if (false) {
    var vaule = 1;// 申明变量 
    // value = 1;
}

// undefined 有
console.log(vaule);
