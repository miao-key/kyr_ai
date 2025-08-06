/**
 * 布局组件统一导出
 */

export { default as MainLayout } from './MainLayout'
export { default as WaterfallLayout } from './WaterfallLayout'

// 布局组件配置
export const LayoutConfig = {
  MainLayout: {
    type: 'mobile-app',
    features: ['tabbar', 'navigation', 'scroll-to-top'],
    responsive: true
  },
  
  WaterfallLayout: {
    type: 'masonry',
    features: ['lazy-loading', 'infinite-scroll', 'responsive-columns'],
    defaultColumns: 2,
    breakpoints: {
      sm: 1,
      md: 2, 
      lg: 3,
      xl: 4
    }
  }
}