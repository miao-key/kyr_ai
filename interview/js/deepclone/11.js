const arr = [1,2,3];
const newArr = [...arr];

let arr2 = arr.slice();
console.log(arr2);

const arr3 = [[1,2],[3,4],[5,[6,7]]];
let arr4 = arr3.slice();
arr4[2][1][1]=8;
console.log(arr3);
console.log(arr4);
let arr5 = arr3.concat();