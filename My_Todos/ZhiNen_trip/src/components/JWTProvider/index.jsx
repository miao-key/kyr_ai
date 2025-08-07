/**
 * JWT认证提供者组件
 * 负责初始化JWT认证状态和监听token事件
 */

import { useEffect } from 'react'
import { useAuthStore } from '@/stores'
import { tokenManager } from '@/utils/jwt'

const JWTProvider = ({ children }) => {
  const { initializeAuth, logout, refreshToken } = useAuthStore()

  useEffect(() => {
    // 初始化认证状态
    initializeAuth()

    // 监听token过期事件
    const handleTokenExpired = () => {
      console.warn('🔔 JWT Token已过期，自动登出')
      logout()
      
      // 可以在这里显示过期提示
      if (window.location.pathname !== '/login') {
        // 显示提示信息（可选）
        const notification = document.createElement('div')
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ff4757;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
        `
        notification.textContent = '登录已过期，请重新登录'
        document.body.appendChild(notification)
        
        // 3秒后移除提示
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
        
        // 延迟跳转到登录页
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
      }
    }

    // 监听token刷新事件
    const handleTokenRefreshed = (event) => {
      console.log('🔔 JWT Token已自动刷新')
      
      // 更新store中的token状态
      const { newToken, user } = event.detail
      const { getTokenStatus } = useAuthStore.getState()
      
      // 可以在这里做一些UI提示
      if (import.meta.env.DEV) {
        console.log('🎫 新Token状态:', getTokenStatus())
      }
    }

    // 添加事件监听器
    window.addEventListener('tokenExpired', handleTokenExpired)
    window.addEventListener('tokenRefreshed', handleTokenRefreshed)

    // 清理函数
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired)
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed)
    }
  }, [initializeAuth, logout])

  // 监听页面可见性变化，页面重新聚焦时验证token
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 页面重新可见时验证认证状态
        const { validateAuth } = useAuthStore.getState()
        const isValid = validateAuth()
        
        if (!isValid) {
          console.warn('🔍 页面聚焦时发现token无效')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // 添加全局快捷键（开发环境）
  useEffect(() => {
    if (import.meta.env.DEV) {
      const handleKeyPress = (event) => {
        // Ctrl + Shift + J = 打印JWT状态
        if (event.ctrlKey && event.shiftKey && event.key === 'J') {
          const { getTokenStatus, user, token } = useAuthStore.getState()
          const status = getTokenStatus()
          
          console.group('🔍 JWT认证状态调试信息')
          console.log('👤 用户信息:', user)
          console.log('🎫 Token状态:', status)
          console.log('📝 完整Token:', token)
          console.groupEnd()
        }
        
        // Ctrl + Shift + R = 手动刷新Token
        if (event.ctrlKey && event.shiftKey && event.key === 'R') {
          console.log('🔄 手动刷新JWT Token...')
          const success = refreshToken()
          
          if (success) {
            console.log('✅ Token刷新成功')
          } else {
            console.warn('❌ Token刷新失败')
          }
        }
      }

      document.addEventListener('keydown', handleKeyPress)
      
      return () => {
        document.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [refreshToken])

  return children
}

export default JWTProvider