# 大数相加

- 高精度
  js Number 类型，不分整数、浮点数、高精度...
  js 不太适合计算 python 适合
  表现力强
- 大数字
  边界问题
  Infinity
   - Tnfinity
   Number.MAX_VALUE
- 字符串化
  
- es6 bigInt 大数类型

- IEEE 754
  1位用于符号位（0表示正数，1表示负数）
  11位用于指数位（表示10的多少次方）
  52位用于尾数位（小数部分）

## BingInt
  安全 2^53 -1  9007199254740991
  es6 新增的第六种简单数据类型
  后面加 n 
  BigInt("123456"),不能new
  无限大，无益处问题
  不能混合Number 和 BigInt 运算
  js 适合大型语言开发