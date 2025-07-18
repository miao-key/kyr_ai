const arr = new Array(5);
// console.log(arr[0]);
let obj = {
    name: '迪迦',
}
let obj2 = {
    skill: '迪拉修姆光流',
}
obj.__proto__ = obj2;
console.log(obj.skill);
for(let key in obj){
    console.log(obj[key]);
}
console.log(obj.hasOwnProperty('name'));
console.log(obj.hasOwnProperty('skill'));
console.log(arr.hasOwnProperty(0));