let a = "abc";
let b = new String("abc");
console.log(a == b);//值
// js给所有的简单数据类型提供了 相应类型的类 包装类
console.log(a === b);// 类型不同
console.log(b.split(''));
// js 会自动将简单数据类型 包装成对象
// a -> new String(a);
// 之后会销毁对象，回归原来简单数据类型
console.log(a.split(''));