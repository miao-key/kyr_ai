/**
 * 性能监控 Hook - 用于追踪组件渲染性能
 * 功能特性:
 * - 组件渲染时间监控
 * - 重渲染次数统计
 * - 内存使用情况监控
 * - 仅在开发环境启用
 */

import { useRef, useEffect, useState } from 'react'

export const usePerformance = (componentName = 'Unknown') => {
  const renderCount = useRef(0)
  const renderTimes = useRef([])
  const lastRenderTime = useRef(0)
  const [performanceData, setPerformanceData] = useState(null)

  useEffect(() => {
    // 只在开发环境监控性能
    if (!import.meta.env.DEV) return

    const startTime = performance.now()
    
    // 记录渲染开始时间
    lastRenderTime.current = startTime
    renderCount.current += 1

    return () => {
      // 记录渲染结束时间
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      renderTimes.current.push(renderTime)
      
      // 保留最近20次渲染时间
      if (renderTimes.current.length > 20) {
        renderTimes.current.shift()
      }

      // 计算平均渲染时间
      const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
      
      // 更新性能数据
      setPerformanceData({
        componentName,
        renderCount: renderCount.current,
        lastRenderTime: renderTime.toFixed(2),
        avgRenderTime: avgRenderTime.toFixed(2),
        totalRenders: renderCount.current
      })

      // 在控制台输出性能警告（渲染时间超过16ms）
      if (renderTime > 16) {
        console.warn(`⚠️ 性能警告: ${componentName} 渲染时间 ${renderTime.toFixed(2)}ms (超过16ms)`)
      }

      // 在控制台输出重渲染警告（渲染次数过多）
      if (renderCount.current > 10 && renderCount.current % 10 === 0) {
        console.warn(`🔄 重渲染警告: ${componentName} 已渲染 ${renderCount.current} 次`)
      }
    }
  })

  // 提供性能数据和控制方法
  const resetPerformanceData = () => {
    renderCount.current = 0
    renderTimes.current = []
    setPerformanceData(null)
  }

  const logPerformanceData = () => {
    if (performanceData) {
      console.log(`📊 ${componentName} 性能数据:`, performanceData)
    }
  }

  return {
    performanceData,
    resetPerformanceData,
    logPerformanceData,
    renderCount: renderCount.current
  }
}

/**
 * 内存使用监控 Hook
 */
export const useMemoryMonitor = (interval = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState(null)

  useEffect(() => {
    // 只在支持内存API的浏览器中运行
    if (!performance.memory || !import.meta.env.DEV) return

    const updateMemoryInfo = () => {
      const memory = performance.memory
      setMemoryInfo({
        used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
        total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
        limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
      })
    }

    updateMemoryInfo()
    const intervalId = setInterval(updateMemoryInfo, interval)

    return () => clearInterval(intervalId)
  }, [interval])

  return memoryInfo
}

/**
 * API 请求性能监控 Hook
 */
export const useAPIPerformance = () => {
  const apiCalls = useRef([])
  const [apiStats, setApiStats] = useState({
    totalCalls: 0,
    avgResponseTime: 0,
    slowCalls: 0
  })

  const trackAPICall = (apiName, startTime, endTime, success = true) => {
    if (!import.meta.env.DEV) return

    const responseTime = endTime - startTime
    
    apiCalls.current.push({
      name: apiName,
      responseTime,
      timestamp: Date.now(),
      success
    })

    // 保留最近50次API调用
    if (apiCalls.current.length > 50) {
      apiCalls.current.shift()
    }

    // 计算统计数据
    const totalCalls = apiCalls.current.length
    const avgResponseTime = apiCalls.current.reduce((sum, call) => sum + call.responseTime, 0) / totalCalls
    const slowCalls = apiCalls.current.filter(call => call.responseTime > 1000).length

    setApiStats({
      totalCalls,
      avgResponseTime: avgResponseTime.toFixed(2),
      slowCalls
    })

    // 慢请求警告
    if (responseTime > 2000) {
      console.warn(`🐌 慢API警告: ${apiName} 响应时间 ${responseTime.toFixed(2)}ms`)
    }
  }

  const getAPIStats = () => apiStats

  const resetAPIStats = () => {
    apiCalls.current = []
    setApiStats({
      totalCalls: 0,
      avgResponseTime: 0,
      slowCalls: 0
    })
  }

  return {
    trackAPICall,
    getAPIStats,
    resetAPIStats,
    apiStats
  }
}

export default usePerformance