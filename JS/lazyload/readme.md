# 图片懒加载
## 懒加载

























  自定义属性 data- 数据属性
  图片原地址是img 数据
  original 原来
- 性能问题
  - 解决了性能问题 首屏加载速度
  - onScroll 触发太频繁 JS
  - forEach imgs
  - getBoundingClientReact 触发回流
- 防抖 截流
- InterSectionObserver （它不是HTML5特性，而是独立浏览器 API）
  - observer 观察 异步的，不是同步 浏览器的后台
  - intersection rect 和可视区域交叉
  - 不再需要onscroll 不需要截流

