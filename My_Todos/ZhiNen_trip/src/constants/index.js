/**
 * 应用常量配置
 */

// 导航菜单配置
export const NAVIGATION_TABS = [
  { icon: 'HomeO', title: '首页', path: '/home' },
  { icon: 'CommentCircleO', title: '旅记', path: '/article' },
  { icon: 'GuideO', title: '行程', path: '/trip' },
  { icon: 'UserO', title: '我的', path: '/account' }
]

// 瀑布流配置 - 性能优化版本
export const WATERFALL_CONFIG = {
  COLUMNS: 2,
  GAP: 12,                 // 优化：减少间距，增加内容密度
  ITEMS_PER_PAGE: 12,      // 优化：调整每页数量，平衡加载速度和用户体验
  DELAYS: {
    INITIAL_LOAD: 30,      // 优化：减少初始加载延迟，从50ms到30ms
    SCROLL_LOAD: 200,      // 优化：减少滚动加载延迟，从300ms到200ms
    RESIZE: 80,            // 优化：减少窗口调整延迟，从100ms到80ms
    IMAGE_TIMEOUT: 6000    // 优化：减少图片加载超时，从10s到6s
  },
  PERFORMANCE: {
    BATCH_SIZE: 6,         // 批处理大小
    BATCH_DELAY: 150,      // 批次间延迟
    PRELOAD_THRESHOLD: 200 // 预加载阈值
  }
}

// 图片配置
export const IMAGE_CONFIG = {
  PLACEHOLDER: '/placeholder.jpg',
  LAZY_LOADING: true,
  QUALITY: {
    THUMBNAIL: 'medium',
    FULL: 'large'
  }
}

// API配置
export const API_CONFIG = {
  PEXELS: {
    BASE_URL: 'https://api.pexels.com/v1',
    PER_PAGE: 15,
    RETRY_ATTEMPTS: 3,
    TIMEOUT: 10000
  }
}

// 主题配置
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#6FE164',
    SECONDARY: '#70E3DC',
    GRADIENT: 'linear-gradient(135deg,rgb(110, 225, 100) 0%,rgb(112, 227, 220) 100%)'
  },
  ANIMATIONS: {
    TRANSITION_DURATION: '0.3s',
    EASING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
}

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络后重试',
  LOAD_FAILED: '加载失败，请刷新页面重试',
  IMAGE_LOAD_FAILED: '图片加载失败',
  NO_MORE_DATA: '没有更多数据了'
}

// 本地存储键名
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  THEME: 'app_theme',
  CACHE: 'app_cache'
}