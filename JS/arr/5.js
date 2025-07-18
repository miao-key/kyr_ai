// 消灭数组，留下一个
// reduce 函数负责在繁重的case 下只有唯一的状态产生
// 新的状态基于上一个状态
console.log([1,2,3,4,5,6].reduce((prev,curr)=>{
    return prev + curr;
},0))
