/**
 * 工具函数库
 */

// 防抖函数
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 格式化价格
export const formatPrice = (price) => {
  if (!price) return '面议'
  return `¥${price.toLocaleString()}`
}

// 截断文本
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 生成随机ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 本地存储工具
export const storage = {
  get: (key) => {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  }
}

// 图片相关工具
export const imageUtils = {
  // 预加载图片
  preload: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  },
  
  // 获取图片尺寸
  getDimensions: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = reject
      img.src = src
    })
  },
  
  // 生成本地占位图URL
  placeholder: (width = 400, height = 300, text = '精彩内容', bg = '667eea', color = 'white') => {
    // 创建美观的本地SVG占位符
    const isSmall = width <= 100 && height <= 100
    
    const svgContent = isSmall ? 
      // 小尺寸图片（如头像）
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="smallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#smallGrad)" rx="8"/>
        <text x="50%" y="60%" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="white" text-anchor="middle" font-weight="500">📷</text>
      </svg>` :
      // 大尺寸图片
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="largeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.7" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#largeGrad)"/>
        <circle cx="50%" cy="35%" r="25" fill="white" opacity="0.2"/>
        <text x="50%" y="70%" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="500">${text}</text>
      </svg>`
    
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
  }
}

// URL工具
export const urlUtils = {
  // 获取URL参数
  getParams: (url = window.location.href) => {
    try {
      const urlObj = new URL(url)
      const params = {}
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value
      })
      return params
    } catch {
      return {}
    }
  },
  
  // 构建URL
  build: (base, params = {}) => {
    try {
      const url = new URL(base)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.set(key, value)
        }
      })
      return url.toString()
    } catch {
      return base
    }
  }
}

// 设备检测
export const device = {
  isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTablet: () => /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768,
  isDesktop: () => !device.isMobile() && !device.isTablet(),
  getViewport: () => ({
    width: window.innerWidth,
    height: window.innerHeight
  })
}