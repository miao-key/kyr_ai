// Cannot access 'a' before initialization
// TDZ 暂时性死区（不能提前访问） 变量申明前调用就报错
console.log(a);
let a = 1;
