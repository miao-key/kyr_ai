/**
 * 路由预加载 Hook
 * 提供 React 组件中使用路由预加载的便捷方法
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { routePreloader } from '@utils/routePreloader'

export const useRoutePreloader = (options = {}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const previousLocation = useRef(location.pathname)

  // 记录路由变化
  useEffect(() => {
    const currentPath = location.pathname
    const previousPath = previousLocation.current

    if (currentPath !== previousPath) {
      // 记录导航行为
      routePreloader.recordNavigation(previousPath, currentPath)
      previousLocation.current = currentPath
    }
  }, [location.pathname])

  // 初始化时预加载优先级路由
  useEffect(() => {
    routePreloader.preloadPriorityRoutes()
  }, [])

  // 预加载指定路由
  const preloadRoute = useCallback((path, priority = 'normal') => {
    return routePreloader.preloadRoute(path, priority)
  }, [])

  // 预加载多个路由
  const preloadRoutes = useCallback((paths, priority = 'normal') => {
    return Promise.allSettled(
      paths.map(path => routePreloader.preloadRoute(path, priority))
    )
  }, [])

  // 获取预加载统计
  const getPreloadStats = useCallback(() => {
    return routePreloader.getStats()
  }, [])

  // 清除预加载缓存
  const clearPreloadCache = useCallback(() => {
    routePreloader.clearPreloadedRoutes()
  }, [])

  return {
    preloadRoute,
    preloadRoutes,
    getPreloadStats,
    clearPreloadCache,
    currentPath: location.pathname
  }
}

/**
 * 路由链接预加载 Hook
 * 为特定链接添加智能预加载行为
 */
export const useLinkPreloader = (href, options = {}) => {
  const { 
    preloadOnMount = false,
    preloadOnHover = true,
    hoverDelay = 100,
    priority = 'normal'
  } = options

  const isPreloaded = useRef(false)

  // 组件挂载时预加载
  useEffect(() => {
    if (preloadOnMount && href && !isPreloaded.current) {
      routePreloader.preloadRoute(href, priority)
      isPreloaded.current = true
    }
  }, [href, preloadOnMount, priority])

  // 悬停预加载处理器
  const handleMouseEnter = useCallback(() => {
    if (preloadOnHover && href && !isPreloaded.current) {
      setTimeout(() => {
        routePreloader.preloadRoute(href, 'hover')
        isPreloaded.current = true
      }, hoverDelay)
    }
  }, [href, preloadOnHover, hoverDelay])

  // 返回事件处理器
  return {
    onMouseEnter: handleMouseEnter,
    'data-preloaded': isPreloaded.current
  }
}

/**
 * 路由预加载状态监控 Hook
 */
export const usePreloadMonitor = (updateInterval = 2000) => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!import.meta.env.DEV) return

    const updateStats = () => {
      setStats(routePreloader.getStats())
    }

    updateStats()
    const interval = setInterval(updateStats, updateInterval)

    return () => clearInterval(interval)
  }, [updateInterval])

  return stats
}

export default useRoutePreloader