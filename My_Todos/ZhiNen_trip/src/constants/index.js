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

// 瀑布流配置
export const WATERFALL_CONFIG = {
  COLUMNS: 2,
  GAP: 16,
  ITEMS_PER_PAGE: 15,
  DELAYS: {
    INITIAL_LOAD: 50,      // 初始加载延迟
    SCROLL_LOAD: 300,      // 滚动加载延迟
    RESIZE: 100,           // 窗口调整延迟
    IMAGE_TIMEOUT: 10000   // 图片加载超时
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