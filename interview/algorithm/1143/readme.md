# 最长公共字序列

- 最值问题用动态规划
- dp 特点
  - 先以递归自顶向下发现子问题之间的树状结构 状态转移方程
  - dp 自底向上去迭代问题
  - 局部最优与全局最优一致的
  dp[i][j]
- 动态规划五步曲
  - 确定dp数组的含义
    dp[i][j] 表示字符串 text1 的前i个字符（即text1[0..i-1]）与字符串text2
    (即 text2[0..j-1])的最长公共子序列的长度。
  - 确定dp数组的递推公式
  状态转移方程根据 text1[i-1]和text2[j-1]是否相等来决定
    dp[i][j] = dp[i-1][j-1] + 1
    dp[i][j] = max(dp[i-1][j],dp[i][j-1])
  - 确定dp数组的初始化
    const m = s1.length;
    const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  - 确定dp数组的遍历顺序
  - 确定dp数组的结果