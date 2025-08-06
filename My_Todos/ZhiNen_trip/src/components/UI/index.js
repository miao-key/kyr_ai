/**
 * UI组件库统一导出 - 高质量组件架构
 * 提供一致的用户界面组件
 */

// ============= 基础组件 =============
export { default as LoadingSpinner } from './LoadingSpinner'
export { default as LazyImage } from './LazyImage'
export { default as EmptyState } from './EmptyState'
export { default as UserAvatar } from './UserAvatar'

// 新增优化组件
export { LazyImage as OptimizedImage } from './LazyImage'

// ============= 组件类型定义 =============
export const UIComponentTypes = {
  LoadingSpinner: {
    types: ['ball', 'spinner', 'circular', 'dots'],
    sizes: ['small', 'medium', 'large'],
    colors: ['primary', 'secondary', 'success', 'warning', 'danger'],
    modes: ['inline', 'fullscreen', 'overlay']
  },
  
  LazyImage: {
    modes: ['cover', 'contain', 'fill', 'scale-down'],
    placeholders: ['blur', 'skeleton', 'spinner', 'custom'],
    loadingStates: ['loading', 'loaded', 'error'],
    optimizations: ['webp', 'lazy-loading', 'progressive']
  },
  
  EmptyState: {
    types: ['noData', 'noNetwork', 'error', 'noResults', 'noPermission', 'maintenance'],
    themes: ['light', 'dark', 'auto'],
    actionTypes: ['retry', 'refresh', 'navigate', 'contact']
  }
}

// ============= 组件配置 =============
export const UIConfig = {
  LoadingSpinner: {
    defaultType: 'spinner',
    defaultSize: 'medium',
    defaultColor: 'primary',
    animationDuration: '1s',
    delayThreshold: 200 // ms
  },
  
  LazyImage: {
    defaultPlaceholder: '/images/placeholder.jpg',
    defaultTimeout: 10000, // ms
    defaultMode: 'cover',
    retryAttempts: 3
  },
  
  EmptyState: {
    defaultType: 'noData',
    defaultTheme: 'auto',
    showActions: true,
    iconSize: 64 // px
  }
}

// ============= 实用工具 =============
export const UIUtils = {
  // 获取响应式尺寸
  getResponsiveSize: (baseSize, viewport = 'desktop') => {
    const sizeMap = {
      mobile: { small: 12, medium: 16, large: 20 },
      tablet: { small: 14, medium: 20, large: 26 },
      desktop: { small: 16, medium: 24, large: 32 }
    }
    return sizeMap[viewport] || sizeMap.desktop
  },
  
  // 获取主题颜色
  getThemeColor: (colorName, theme = 'light') => {
    const colors = {
      light: {
        primary: '#6FE164',
        secondary: '#70E3DC',
        success: '#52c41a',
        warning: '#faad14',
        danger: '#f5222d'
      },
      dark: {
        primary: '#5fd157',
        secondary: '#5dd9d2',
        success: '#49b818',
        warning: '#e09c12',
        danger: '#dc4e4e'
      }
    }
    return colors[theme]?.[colorName] || colors.light[colorName]
  },
  
  // 检查是否支持WebP
  supportsWebP: () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }
}

// ============= 快速导入预设 =============
export const UIPresets = {
  // 常用加载组合
  loading: {
    small: { type: 'spinner', size: 'small', color: 'primary' },
    medium: { type: 'spinner', size: 'medium', color: 'primary' },
    large: { type: 'ball', size: 'large', color: 'primary' },
    fullscreen: { type: 'circular', size: 'large', fullScreen: true, overlay: true }
  },
  
  // 常用空状态组合
  empty: {
    noData: { type: 'noData', actionText: '刷新', showAction: true },
    noNetwork: { type: 'noNetwork', actionText: '重试', showAction: true },
    error: { type: 'error', actionText: '重新加载', showAction: true },
    noResults: { type: 'noResults', actionText: '清除筛选', showAction: true }
  }
}