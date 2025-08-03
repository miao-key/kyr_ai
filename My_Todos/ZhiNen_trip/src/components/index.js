/**
 * 组件统一导出
 */

// 布局组件
export { default as MainLayout } from './MainLayout'
export { default as WaterfallLayout } from './WaterfallLayout'

// UI组件
export * from './UI'

// 组件分类
export const ComponentCategories = {
  layout: ['MainLayout', 'WaterfallLayout'],
  ui: ['LoadingSpinner', 'LazyImage', 'EmptyState']
}