/**
 * Zustand状态管理初始化组件
 * 负责初始化所有Zustand stores
 */

import { useEffect } from 'react'
import { useAuthStore, useThemeStore, useAppStore } from '../../stores'

const ZustandProvider = ({ children }) => {
  const initializeAuth = useAuthStore(state => state.initializeAuth)
  const initTheme = useThemeStore(state => state.initTheme)
  const updateLastActiveTime = useAppStore(state => state.updateLastActiveTime)

  useEffect(() => {
    // 初始化认证状态
    initializeAuth()
    
    // 初始化主题
    initTheme()
    
    // 更新最后活跃时间
    updateLastActiveTime()
    
    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateLastActiveTime()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [initializeAuth, initTheme, updateLastActiveTime])

  return children
}

export default ZustandProvider