/**
 * 路由预加载工具 - 智能预加载机制
 * 功能特性:
 * - 智能预加载策略
 * - 基于用户行为的预测加载
 * - 网络状态感知
 * - 内存和带宽优化
 * - 错误处理和重试
 * - 预加载统计和监控
 */

class RoutePreloader {
  constructor(options = {}) {
    this.options = {
      // 预加载策略
      strategy: 'aggressive', // 'conservative', 'balanced', 'aggressive'
      
      // 网络状态检测
      respectSaveData: true,
      minConnectionSpeed: '3g',
      
      // 缓存设置
      maxPreloadedRoutes: 5,
      preloadTimeout: 10000,
      
      // 用户行为预测
      hoverDelay: 100,
      idleTime: 2000,
      
      // 优先级路由（总是预加载）
      priorityRoutes: ['/home', '/article'],
      
      // 排除路由（不预加载）
      excludeRoutes: ['/login'],
      
      ...options
    }
    
    this.preloadedRoutes = new Map()
    this.preloadingPromises = new Map()
    this.userBehaviorData = {
      visitHistory: [],
      navigationPatterns: {},
      averageTimeOnPage: 0
    }
    
    this.networkInfo = this.getNetworkInfo()
    this.isIdle = false
    
    this.initializeEventListeners()
    this.initializeIdleDetection()
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
      saveData: navigator.connection.saveData,
      downlink: navigator.connection.downlink
    }
  }

  /**
   * 检查是否应该预加载
   */
  shouldPreload() {
    // 检查用户设置的省流量模式
    if (this.options.respectSaveData && this.networkInfo.saveData) {
      console.log('🚫 预加载已跳过：省流量模式已启用')
      return false
    }

    // 检查网络连接速度
    const connectionSpeed = this.networkInfo.effectiveType
    const minSpeed = this.options.minConnectionSpeed
    
    const speedOrder = ['slow-2g', '2g', '3g', '4g']
    const currentIndex = speedOrder.indexOf(connectionSpeed)
    const minIndex = speedOrder.indexOf(minSpeed)
    
    if (currentIndex < minIndex) {
      console.log(`🚫 预加载已跳过：网络速度过慢 (${connectionSpeed})`)
      return false
    }

    // 检查内存压力
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
      if (memoryUsage > 0.8) {
        console.log('🚫 预加载已跳过：内存压力过高')
        return false
      }
    }

    return true
  }

  /**
   * 预加载路由组件
   */
  async preloadRoute(path, priority = 'normal') {
    if (!this.shouldPreload()) return false
    
    // 检查是否已经预加载
    if (this.preloadedRoutes.has(path)) {
      console.log(`✅ 路由已缓存: ${path}`)
      return true
    }

    // 检查是否正在预加载
    if (this.preloadingPromises.has(path)) {
      console.log(`⏳ 路由正在预加载: ${path}`)
      return this.preloadingPromises.get(path)
    }

    // 检查是否在排除列表中
    if (this.options.excludeRoutes.includes(path)) {
      console.log(`🚫 路由在排除列表中: ${path}`)
      return false
    }

    console.log(`🚀 开始预加载路由: ${path} (优先级: ${priority})`)

    const preloadPromise = this.performPreload(path, priority)
    this.preloadingPromises.set(path, preloadPromise)

    try {
      const result = await preloadPromise
      this.preloadedRoutes.set(path, {
        component: result,
        timestamp: Date.now(),
        priority: priority
      })
      
      // 清理内存（保持最大预加载数量限制）
      this.cleanupPreloadedRoutes()
      
      console.log(`✅ 路由预加载成功: ${path}`)
      return true
    } catch (error) {
      console.error(`❌ 路由预加载失败: ${path}`, error)
      return false
    } finally {
      this.preloadingPromises.delete(path)
    }
  }

  /**
   * 执行实际的预加载
   */
  async performPreload(path, priority) {
    const routeMap = {
      '/home': () => import('@pages/Home'),
      '/article': () => import('@pages/Article'),
      '/write-article': () => import('@pages/WriteArticle'),
      '/trip': () => import('@pages/Trip'),
      '/account': () => import('@pages/Account'),
      '/search': () => import('@pages/Search'),
      '/hotel': () => import('@pages/Hotel'),
      '/flight': () => import('@pages/Flight'),
      '/train': () => import('@pages/Train'),
      '/taxi': () => import('@pages/Taxi'),
      '/tourism': () => import('@pages/Tourism'),
      '/coze': () => import('@pages/AI_chat/coze')
    }

    const importFunction = routeMap[path]
    if (!importFunction) {
      throw new Error(`未知路由: ${path}`)
    }

    // 设置超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('预加载超时')), this.options.preloadTimeout)
    })

    return Promise.race([importFunction(), timeoutPromise])
  }

  /**
   * 清理过期的预加载路由
   */
  cleanupPreloadedRoutes() {
    if (this.preloadedRoutes.size <= this.options.maxPreloadedRoutes) {
      return
    }

    // 按时间戳排序，移除最旧的路由
    const entries = Array.from(this.preloadedRoutes.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

    const toRemove = entries.slice(0, entries.length - this.options.maxPreloadedRoutes)
    toRemove.forEach(([path]) => {
      this.preloadedRoutes.delete(path)
      console.log(`🧹 清理预加载路由: ${path}`)
    })
  }

  /**
   * 预加载优先级路由
   */
  async preloadPriorityRoutes() {
    const promises = this.options.priorityRoutes.map(route => 
      this.preloadRoute(route, 'high')
    )
    
    await Promise.allSettled(promises)
  }

  /**
   * 基于用户行为预测下一个路由
   */
  predictNextRoute(currentPath) {
    const patterns = this.userBehaviorData.navigationPatterns[currentPath]
    if (!patterns || Object.keys(patterns).length === 0) {
      return null
    }

    // 找到访问频率最高的下一个路由
    const mostVisited = Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])[0]

    return mostVisited ? mostVisited[0] : null
  }

  /**
   * 记录用户导航行为
   */
  recordNavigation(fromPath, toPath) {
    // 更新访问历史
    this.userBehaviorData.visitHistory.push({
      from: fromPath,
      to: toPath,
      timestamp: Date.now()
    })

    // 保持历史记录在合理范围内
    if (this.userBehaviorData.visitHistory.length > 100) {
      this.userBehaviorData.visitHistory.shift()
    }

    // 更新导航模式
    if (!this.userBehaviorData.navigationPatterns[fromPath]) {
      this.userBehaviorData.navigationPatterns[fromPath] = {}
    }
    
    const patterns = this.userBehaviorData.navigationPatterns[fromPath]
    patterns[toPath] = (patterns[toPath] || 0) + 1

    // 预测并预加载下一个可能的路由
    const predictedRoute = this.predictNextRoute(toPath)
    if (predictedRoute && predictedRoute !== toPath) {
      this.preloadRoute(predictedRoute, 'predicted')
    }
  }

  /**
   * 初始化事件监听器
   */
  initializeEventListeners() {
    // 鼠标悬停预加载
    document.addEventListener('mouseover', (event) => {
      if (event.target.tagName === 'A' || event.target.closest('a')) {
        const link = event.target.closest('a')
        const href = link.getAttribute('href')
        
        if (href && href.startsWith('/')) {
          setTimeout(() => {
            this.preloadRoute(href, 'hover')
          }, this.options.hoverDelay)
        }
      }
    })

    // 网络状态变化监听
    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => {
        this.networkInfo = this.getNetworkInfo()
        console.log('📶 网络状态变化:', this.networkInfo)
      })
    }

    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时，预加载优先级路由
        this.preloadPriorityRoutes()
      }
    })
  }

  /**
   * 初始化空闲检测
   */
  initializeIdleDetection() {
    let idleTimer = null

    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      this.isIdle = false
      
      idleTimer = setTimeout(() => {
        this.isIdle = true
        this.onIdle()
      }, this.options.idleTime)
    }

    // 监听用户活动
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdleTimer, true)
    })

    resetIdleTimer()
  }

  /**
   * 用户空闲时的预加载策略
   */
  async onIdle() {
    if (!this.shouldPreload()) return

    console.log('😴 用户空闲，开始预加载...')

    // 根据策略预加载不同数量的路由
    const strategy = this.options.strategy
    let routesToPreload = []

    switch (strategy) {
      case 'conservative':
        routesToPreload = this.options.priorityRoutes.slice(0, 2)
        break
      case 'balanced':
        routesToPreload = this.options.priorityRoutes.slice(0, 3)
        break
      case 'aggressive':
        routesToPreload = this.options.priorityRoutes
        break
    }

    const promises = routesToPreload.map(route => 
      this.preloadRoute(route, 'idle')
    )

    await Promise.allSettled(promises)
  }

  /**
   * 获取预加载统计信息
   */
  getStats() {
    return {
      preloadedRoutes: this.preloadedRoutes.size,
      preloadingInProgress: this.preloadingPromises.size,
      navigationPatterns: Object.keys(this.userBehaviorData.navigationPatterns).length,
      visitHistory: this.userBehaviorData.visitHistory.length,
      networkInfo: this.networkInfo,
      isIdle: this.isIdle
    }
  }

  /**
   * 清除所有预加载的路由
   */
  clearPreloadedRoutes() {
    this.preloadedRoutes.clear()
    this.preloadingPromises.clear()
    console.log('🧹 所有预加载路由已清除')
  }

  /**
   * 销毁预加载器
   */
  destroy() {
    this.clearPreloadedRoutes()
    // 这里可以添加事件监听器的清理代码
    console.log('💥 路由预加载器已销毁')
  }
}

// 创建全局预加载器实例 - 性能优化配置
export const routePreloader = new RoutePreloader({
  strategy: 'conservative',  // 优化：改为保守策略，减少带宽占用
  priorityRoutes: ['/article'],  // 优化：只预加载关键页面，减少干扰
  excludeRoutes: ['/login', '/home'], // 优化：排除首页，避免干扰瀑布流加载
  maxPreloadedRoutes: 2,     // 优化：减少最大预加载数量
  preloadTimeout: 5000,      // 优化：减少预加载超时时间
  idleTime: 3000            // 优化：增加空闲时间，降低预加载频率
})

// 在开发环境暴露到全局
if (import.meta.env.DEV) {
  window.routePreloader = routePreloader
}

export default RoutePreloader