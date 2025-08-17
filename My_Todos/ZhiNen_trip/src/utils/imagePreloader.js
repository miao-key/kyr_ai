/**
 * 智能图片预加载工具
 * 功能特性:
 * - 基于视口距离的智能预加载
 * - 网络状态感知
 * - 内存优化和缓存管理
 * - 优先级队列
 * - 错误处理和重试
 */

class ImagePreloader {
  constructor(options = {}) {
    this.options = {
      // 预加载距离（像素）
      preloadDistance: 500,
      
      // 最大并发预加载数
      maxConcurrent: 3,
      
      // 缓存大小限制
      maxCacheSize: 50,
      
      // 网络状态检测
      respectSaveData: true,
      minConnectionSpeed: '3g',
      
      // 重试配置
      maxRetries: 2,
      retryDelay: 1000,
      
      ...options
    }
    
    this.cache = new Map()
    this.loadingQueue = new Set()
    this.priorityQueue = []
    this.networkInfo = this.getNetworkInfo()
    
    this.initializeIntersectionObserver()
  }

  /**
   * 获取网络连接信息
   */
  getNetworkInfo() {
    if (!navigator.connection) {
      return { effectiveType: '4g', saveData: false }
    }
    return {
      effectiveType: navigator.connection.effectiveType,
      saveData: navigator.connection.saveData
    }
  }

  /**
   * 检查是否应该预加载
   */
  shouldPreload() {
    if (this.options.respectSaveData && this.networkInfo.saveData) {
      return false
    }
    
    const speedOrder = ['slow-2g', '2g', '3g', '4g']
    const currentIndex = speedOrder.indexOf(this.networkInfo.effectiveType)
    const minIndex = speedOrder.indexOf(this.options.minConnectionSpeed)
    
    return currentIndex >= minIndex
  }

  /**
   * 初始化 IntersectionObserver
   */
  initializeIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            const src = img.dataset.preloadSrc
            if (src) {
              this.preloadImage(src, 'high')
            }
          }
        })
      },
      {
        rootMargin: `${this.options.preloadDistance}px`,
        threshold: 0
      }
    )
  }

  /**
   * 观察图片元素
   */
  observe(element, src) {
    element.dataset.preloadSrc = src
    this.observer.observe(element)
  }

  /**
   * 停止观察图片元素
   */
  unobserve(element) {
    this.observer.unobserve(element)
    delete element.dataset.preloadSrc
  }

  /**
   * 预加载图片
   */
  async preloadImage(src, priority = 'normal') {
    if (!this.shouldPreload() || this.cache.has(src) || this.loadingQueue.has(src)) {
      return this.cache.get(src)
    }

    // 添加到队列
    this.priorityQueue.push({ src, priority, timestamp: Date.now() })
    this.priorityQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    return this.processQueue()
  }

  /**
   * 处理预加载队列
   */
  async processQueue() {
    if (this.loadingQueue.size >= this.options.maxConcurrent) {
      return
    }

    const item = this.priorityQueue.shift()
    if (!item) return

    const { src } = item
    this.loadingQueue.add(src)

    try {
      const img = await this.loadImageWithRetry(src)
      this.cache.set(src, img)
      this.cleanupCache()
      
      console.log(`✅ 图片预加载成功: ${src}`)
      return img
    } catch (error) {
      console.error(`❌ 图片预加载失败: ${src}`, error)
      return null
    } finally {
      this.loadingQueue.delete(src)
      // 继续处理队列
      if (this.priorityQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100)
      }
    }
  }

  /**
   * 带重试的图片加载
   */
  async loadImageWithRetry(src, retries = 0) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => resolve(img)
      img.onerror = () => {
        if (retries < this.options.maxRetries) {
          setTimeout(() => {
            this.loadImageWithRetry(src, retries + 1)
              .then(resolve)
              .catch(reject)
          }, this.options.retryDelay * (retries + 1))
        } else {
          reject(new Error(`图片加载失败: ${src}`))
        }
      }
      
      img.src = src
    })
  }

  /**
   * 清理缓存
   */
  cleanupCache() {
    if (this.cache.size <= this.options.maxCacheSize) {
      return
    }

    // 删除最旧的缓存项
    const entries = Array.from(this.cache.entries())
    const toDelete = entries.slice(0, entries.length - this.options.maxCacheSize)
    toDelete.forEach(([key]) => this.cache.delete(key))
  }

  /**
   * 批量预加载图片
   */
  async preloadBatch(urls, priority = 'normal') {
    const promises = urls.map(url => this.preloadImage(url, priority))
    return Promise.allSettled(promises)
  }

  /**
   * 获取缓存的图片
   */
  getCachedImage(src) {
    return this.cache.get(src)
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.cache.clear()
    this.loadingQueue.clear()
    this.priorityQueue = []
  }

  /**
   * 销毁预加载器
   */
  destroy() {
    this.observer.disconnect()
    this.clearCache()
  }
}

// 创建全局实例
const imagePreloader = new ImagePreloader()

export default imagePreloader
export { ImagePreloader }