function longestCommonSubstring(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    // dp[i][j]：以s1[i-1]、s2[j-1]结尾的最长公共子串长度
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    let maxLength = 0; // 记录最长子串长度
    let endIndex = 0;  // 记录最长子串在s1中的结束索引
  
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        // 若当前字符匹配，继承前一位的公共长度并+1
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          // 更新最大长度和结束索引
          if (dp[i][j] > maxLength) {
            maxLength = dp[i][j];
            endIndex = i; // 子串在s1中结束于第i个字符（对应索引i-1）
          }
        } else {
          // 字符不匹配，当前公共长度重置为0
          dp[i][j] = 0;
        }
      }
    }
  
    // 从结束索引向前截取maxLength长度的子串
    return s1.slice(endIndex - maxLength, endIndex);
  }
  
  // 测试示例
  console.log(longestCommonSubstring("abcde", "abfce")); // 输出 "cde"
  console.log(longestCommonSubstring("12345", "34567")); // 输出 "345"