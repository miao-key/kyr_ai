/**
 * 
 * @param {number} total 总金额
 * @param {number} num 红包个数
 * @returns {number[]} 红包金额数组
 */
function hongbao(total, num) {
    const arr = [];
    let restAmount = total;// 剩余金额
    let restNum = num;// 剩余个数
    for(let i = 0; i < num - 1; i++) {
        // Math
        // 包装类
        let amount = ((restAmount / restNum * 1.5) * Math.random()).toFixed(2);
        //console.log(amount);
        arr.push(amount);
        restAmount -= amount;
        restNum--;
    }
    arr.push(restAmount.toFixed(2));
    return arr;
    //- 公平性
    // 平均值
    // 随机性
    
}

console.log(hongbao(50, 31));
