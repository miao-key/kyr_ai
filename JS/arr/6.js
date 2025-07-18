const arr = [1,2,3];
// 可迭代对象 比技术循环可读性更好
for(let item of arr){
    console.log(item);
}
// for of item 还要拿到index?
for(const item of arr.entries()){
    // 每一项都是数组,第一项是属性键，第二项是属性值
    console.log(item);
}
for(const [index,item] of arr.entries()){
    console.log(index,item);
}
console.log(arr.entries());