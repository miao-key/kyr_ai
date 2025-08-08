module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 37.5, // 与 lib-flexible 配合，375 设计稿
      unitPrecision: 5,
      propList: ['*'],
      selectorBlackList: ['.no-rem'],
      replace: true,
      mediaQuery: false,
      minPixelValue: 2
    }
  }
}

