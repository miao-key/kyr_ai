import { useRef, useCallback, useEffect } from 'react'

/**
 * 节流Hook - 在指定时间间隔内最多执行一次回调函数
 * @param {Function} callback - 要执行的回调函数
 * @param {number} delay - 节流间隔时间（毫秒）
 * @param {Array} deps - 依赖数组
 * @returns {Function} 节流后的函数
 */
export const useThrottle = (callback, delay, deps = []) => {
  const callbackRef = useRef(callback)
  const lastCallTimeRef = useRef(0)
  const timeoutRef = useRef(null)

  // 更新callback引用
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const throttledCallback = useCallback((...args) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTimeRef.current

    if (timeSinceLastCall >= delay) {
      // 如果距离上次调用已经超过延迟时间，立即执行
      lastCallTimeRef.current = now
      callbackRef.current(...args)
    } else {
      // 否则设置定时器在剩余时间后执行
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallTimeRef.current = Date.now()
        callbackRef.current(...args)
      }, delay - timeSinceLastCall)
    }
  }, [delay, ...deps])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}

/**
 * 简单节流Hook - 只保证在指定时间间隔内最多执行一次
 * @param {Function} callback - 要执行的回调函数
 * @param {number} delay - 节流间隔时间（毫秒）
 * @param {Array} deps - 依赖数组
 * @returns {Function} 节流后的函数
 */
export const useSimpleThrottle = (callback, delay, deps = []) => {
  const callbackRef = useRef(callback)
  const lastCallTimeRef = useRef(0)

  // 更新callback引用
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const throttledCallback = useCallback((...args) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTimeRef.current

    if (timeSinceLastCall >= delay) {
      lastCallTimeRef.current = now
      callbackRef.current(...args)
    }
  }, [delay, ...deps])

  return throttledCallback
}

export default useThrottle