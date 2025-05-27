nums=[1,2,3,4,5];
const C = new Set();
let left = 0;
for(let i = 0;i < nums.length;i++){
    C.add(nums[i]);
}
while(C.has(4)){
    C.delete(nums[left]);
    left++;
}
console.log(C.values());