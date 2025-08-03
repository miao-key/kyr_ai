/**
 * UI组件库统一导出
 */

// 基础组件
export { default as LoadingSpinner } from './LoadingSpinner'
export { default as LazyImage } from './LazyImage'
export { default as EmptyState } from './EmptyState'

// 组件类型定义
export const UIComponentTypes = {
  LoadingSpinner: {
    types: ['ball', 'spinner', 'circular'],
    sizes: ['small', 'medium', 'large']
  },
  EmptyState: {
    types: ['noData', 'noNetwork', 'error', 'noResults']
  }
}