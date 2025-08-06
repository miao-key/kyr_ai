/**
 * API 缓存工具类 - 高性能缓存实现
 * 功能特性:
 * - 基于 Map 的内存缓存
 * - TTL (Time To Live) 过期机制
 * - 自动清理过期缓存
 * - 支持缓存统计
 * - 内存使用优化
 */

class APICache {
  constructor(options = {}) {
    this.cache = new Map()
    this.ttl = options.ttl || 5 * 60 * 1000 // 默认5分钟缓存
    this.maxSize = options.maxSize || 100 // 最大缓存条目数
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    }
    
    // 定期清理过期缓存
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000) // 每分钟清理一次
  }

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存的数据或null
   */
  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return null
    }
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      this.stats.deletes++
      this.stats.misses++
      return null
    }
    
    // 更新访问时间（LRU策略的基础）
    item.lastAccess = Date.now()
    this.stats.hits++
    
    console.log(`🎯 缓存命中: ${key}`)
    return item.data
  }

  /**
   * 设置缓存数据
   * @param {string} key - 缓存键
   * @param {any} data - 要缓存的数据
   */
  set(key, data) {
    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      lastAccess: Date.now()
    })
    
    this.stats.sets++
    console.log(`💾 数据已缓存: ${key}`)
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   * @returns {boolean} 是否删除成功
   */
  delete(key) {
    const result = this.cache.delete(key)
    if (result) {
      this.stats.deletes++
      console.log(`🗑️ 缓存已删除: ${key}`)
    }
    return result
  }

  /**
   * 清空所有缓存
   */
  clear() {
    const size = this.cache.size
    this.cache.clear()
    this.stats.deletes += size
    console.log(`🧹 已清空所有缓存 (${size} 条)`)
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now()
    let deletedCount = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key)
        deletedCount++
      }
    }
    
    if (deletedCount > 0) {
      this.stats.deletes += deletedCount
      console.log(`🧹 清理过期缓存: ${deletedCount} 条`)
    }
  }

  /**
   * LRU 驱逐策略 - 删除最久未访问的缓存
   */
  evictLRU() {
    let oldestKey = null
    let oldestTime = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < oldestTime) {
        oldestTime = item.lastAccess
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.deletes++
      console.log(`📤 LRU驱逐缓存: ${oldestKey}`)
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计数据
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0
    
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: `${hitRate}%`,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * 估算内存使用量
   * @returns {string} 内存使用量（KB）
   */
  estimateMemoryUsage() {
    let totalSize = 0
    
    for (const [key, item] of this.cache.entries()) {
      // 粗略估算：字符串长度 + 对象开销
      totalSize += key.length * 2 // UTF-16
      totalSize += JSON.stringify(item.data).length * 2
      totalSize += 64 // 对象开销估算
    }
    
    return `${(totalSize / 1024).toFixed(2)} KB`
  }

  /**
   * 销毁缓存实例
   */
  destroy() {
    clearInterval(this.cleanupInterval)
    this.clear()
    console.log('💥 缓存实例已销毁')
  }
}

// 创建默认缓存实例
const defaultCache = new APICache({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 50
})

// 创建专用的头像缓存实例
const avatarCache = new APICache({
  ttl: 30 * 60 * 1000, // 30分钟，头像可以缓存更久
  maxSize: 20
})

// 创建图片缓存实例
const imageCache = new APICache({
  ttl: 60 * 60 * 1000, // 1小时
  maxSize: 30
})

export { APICache, defaultCache, avatarCache, imageCache }
export default defaultCache