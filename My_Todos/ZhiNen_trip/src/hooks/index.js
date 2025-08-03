/**
 * Hooks统一导出
 */

// 性能优化hooks
export { useDebounce, useDebouncedValue } from './useDebounce'
export { useThrottle, useSimpleThrottle } from './useThrottle'

// 工具hooks
export { default as useTitle } from './useTitle'

// Hook类型定义
export const HookTypes = {
  performance: ['useDebounce', 'useThrottle', 'useDebouncedValue', 'useSimpleThrottle'],
  utils: ['useTitle']
}