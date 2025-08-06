/**
 * 组件统一导出 - 高质量组件架构
 * 按功能和层级分类，便于维护和使用
 */

// ============= 布局组件 =============
export { default as MainLayout } from './Layout/MainLayout'
export { default as WaterfallLayout } from './Layout/WaterfallLayout'

// ============= UI基础组件 =============
export { default as LoadingSpinner } from './UI/LoadingSpinner'
export { default as LazyImage } from './UI/LazyImage'
export { default as EmptyState } from './UI/EmptyState'

// ============= 业务组件 =============
export { default as ProtectedRoute } from './Business/ProtectedRoute'

// ============= 组件分类映射 =============
export const ComponentCategories = {
  // 布局组件
  layout: [
    'MainLayout',      // 主布局
    'WaterfallLayout', // 瀑布流布局
  ],
  
  // UI基础组件
  ui: [
    'LoadingSpinner',  // 加载动画
    'LazyImage',      // 懒加载图片
    'EmptyState',     // 空状态
  ],
  
  // 业务组件
  business: [
    'ProtectedRoute', // 路由保护
  ]
}

// ============= 组件类型定义 =============
export const ComponentTypes = {
  // UI组件配置
  LoadingSpinner: {
    types: ['ball', 'spinner', 'circular', 'dots'],
    sizes: ['small', 'medium', 'large'],
    colors: ['primary', 'secondary', 'success', 'warning', 'danger']
  },
  
  LazyImage: {
    modes: ['cover', 'contain', 'fill', 'scale-down'],
    placeholders: ['blur', 'skeleton', 'spinner']
  },
  
  EmptyState: {
    types: ['noData', 'noNetwork', 'error', 'noResults', 'noPermission'],
    themes: ['light', 'dark', 'auto']
  }
}

// ============= 快速导入映射 =============
export const QuickImports = {
  // 常用组合
  common: ['LoadingSpinner', 'EmptyState', 'LazyImage'],
  
  // 布局相关
  layout: ['MainLayout', 'WaterfallLayout'],
  
  // 路由相关
  routing: ['ProtectedRoute'],
}