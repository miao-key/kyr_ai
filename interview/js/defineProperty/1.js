// Object.defineProperty
var obj = {}; // 对象
// es5 就提供的api 兼容性更好
// react 和Vue 最新版 对浏览器有要
Object.defineProperty(obj, "num", {
    // 属性描述
    value: 1,
    configurable: true,
    writable: false,
    enumerable: true,
    get: function () {
        console.log("读取了num属性")
        return 1
    }
})
obj.num = 2;
console.log(obj.num);
for (let key in obj) {
    console.log(key + ':' + obj[key]);
}

console.log(Object.getOwnPropertyDescriptor(obj, 'num'));
Object.defineProperty(obj, 'name', {
    writable: false,
})
obj.name = '张三';
console.log(obj.name);
console.log(Object.getOwnPropertyDescriptor(obj, 'name'));

for (let key in obj) {
    console.log(key , obj[key]);
}

