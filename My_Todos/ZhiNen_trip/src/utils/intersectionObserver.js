// 全局IntersectionObserver管理器
let globalObserver = null
const observerCallbacks = new Map()

/**
 * 获取全局IntersectionObserver实例
 * @param {number} threshold - 触发阈值
 * @param {string} rootMargin - 根边距
 * @returns {IntersectionObserver}
 */
export function getGlobalObserver(threshold = 0.1, rootMargin = '50px') {
  if (!globalObserver) {
    globalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const callback = observerCallbacks.get(entry.target)
          if (callback && entry.isIntersecting) {
            callback(entry)
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )
  }
  return globalObserver
}

/**
 * 观察器回调映射
 */
export { observerCallbacks }

/**
 * 清理全局观察器
 */
export function cleanupGlobalObserver() {
  if (globalObserver) {
    globalObserver.disconnect()
    globalObserver = null
    observerCallbacks.clear()
  }
}