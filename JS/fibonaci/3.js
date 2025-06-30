// 自顶向下 f(n) -> f(n-1) + f(n-2) -> 画树形结构 （方程不明显，有利于推导）
// -> 重复计算，函数入栈太多 -> 退出条件 递归
const cLibStarirs = function (n) {
   if (n == 1) return 1
   if (n == 2) return 2
   return cLibStarirs(n-1) + cLibStarirs(n-2)
}

console.log(cLibStarirs(100))