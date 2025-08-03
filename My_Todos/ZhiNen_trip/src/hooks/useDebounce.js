import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * 防抖Hook - 延迟执行回调函数，在指定时间内只执行最后一次
 * @param {Function} callback - 要执行的回调函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {Array} deps - 依赖数组
 * @returns {Function} 防抖后的函数
 */
export const useDebounce = (callback, delay, deps = []) => {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef(null)

  // 更新callback引用
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useCallback((...args) => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }, [delay, ...deps])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * 防抖值Hook - 对值进行防抖处理
 * @param {any} value - 要防抖的值
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {any} 防抖后的值
 */
export const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce