export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 16, // 使用标准网页字体大小作为基准，更适合桌面端显示
      propList: ['*'], // 所有属性都转换
      selectorBlackList: [], // 不希望转换的选择器
      minPixelValue: 2, // 小于2px的不转换
      exclude: /node_modules/i // 排除第三方库
    }
  }
}