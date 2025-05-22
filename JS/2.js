const arr = ['1','2','3'];
console.log(typeof arr);
const date = new Date();
console.log(typeof date);
//如何区分Object 的这些类型？
//[object Array]
// [object Date]
console.log(Object.prototype.toString.call(arr));
console.log(typeof Object.prototype.toString.call(date));

// 会在MDN 文档看一些资料
function getType(value){
    // string api 的选择
    // split + substring
    return Object.prototype.toString.call(arr).slice(8,-1);
    //从第八个字符开始，到倒数第一个字符结束
}

console.log(getType(arr));
