/**
 * 大数相加 - 用于处理超出JavaScript数值范围的大数字相加
 * @param {string} num1 - 第一个大数字（字符串形式）
 * @param {string} num2 - 第二个大数字（字符串形式）
 * @returns {string} - 返回相加后的结果（字符串形式）
 */
function addLargeNumber(num1, num2) {
    let result = '';  // 存储计算结果的字符串
    let carry = 0;    // 存储进位值，初始为0
    let i = num1.length - 1;  // 指向第一个数字的末位（从右往左处理）
    let j = num2.length - 1;  // 指向第二个数字的末位（从右往左处理）
    
    // 当两个数字都处理完且没有进位时，循环结束
    while(i >= 0 || j >= 0 || carry > 0){
        // 获取当前位的数字，如果已经超出数字长度则用0补位
        const digit1 = i >= 0 ? parseInt(num1[i]) : 0;  // 第一个数字当前位的值
        const digit2 = j >= 0 ? parseInt(num2[j]) : 0;  // 第二个数字当前位的值
        
        // 计算当前位的和（包括上一位的进位）
        const sum = digit1 + digit2 + carry;
        
        // 当前位的结果为sum对10取余，并添加到结果字符串的前面
        result = sum % 10 + result;
        
        // 计算进位值，为sum除以10的整数部分
        carry = Math.floor(sum / 10);
        
        // 移动指针，处理下一位
        i--;
        j--;
    }
    
    return result;  // 返回最终的大数相加结果
}

