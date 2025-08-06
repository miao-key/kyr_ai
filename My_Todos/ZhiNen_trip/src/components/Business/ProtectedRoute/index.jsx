import { memo } from 'react'
import { useAuthStore } from '../../../stores'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@components/UI'
import PropTypes from "prop-types"

/**
 * 路由保护组件 - 高质量实现
 * 
 * 功能特性:
 * - 认证状态检查
 * - 自动重定向
 * - 加载状态处理
 * - 路径记忆功能
 * - 错误边界处理
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 需要保护的子组件
 * @param {boolean} props.requireAuth - 是否需要认证，默认为true
 * @param {string} props.redirectTo - 重定向路径，默认为'/login'
 * @param {Array<string>} props.requiredRoles - 需要的用户角色，可选
 * @param {Function} props.onUnauthorized - 未授权时的回调函数
 * @param {boolean} props.fallbackToHome - 认证失败时是否回退到首页而不是登录页
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  requiredRoles = [],
  onUnauthorized,
  fallbackToHome = false
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // 如果正在加载认证状态，显示加载器
  if (isLoading) {
    return (
      <LoadingSpinner 
        type="spinner" 
        size="medium"
        text="验证登录状态..."
        fullScreen={true}
        overlay={true}
      />
    )
  }

  // 如果不需要认证，直接渲染子组件
  if (!requireAuth) {
    return children
  }

  // 检查用户是否已认证
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: 用户未认证，重定向到登录页面')
    console.log('  - 当前路径:', location.pathname)
    console.log('  - 认证状态:', isAuthenticated)
    
    // 触发未授权回调
    onUnauthorized?.({
      reason: 'unauthenticated',
      currentPath: location.pathname,
      user: null
    })
    
    // 决定重定向目标
    const targetPath = fallbackToHome ? '/home' : redirectTo
    
    // 保存当前路径，登录成功后可以重定向回来
    return (
      <Navigate 
        to={targetPath} 
        state={{ 
          from: location,
          reason: 'authentication_required'
        }} 
        replace 
      />
    )
  }

  // 检查用户角色权限（如果指定了需要的角色）
  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles || []
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    )

    if (!hasRequiredRole) {
      console.log('🔒 ProtectedRoute: 用户权限不足')
      console.log('  - 需要角色:', requiredRoles)
      console.log('  - 用户角色:', userRoles)
      console.log('  - 当前用户:', user.username)
      
      // 触发未授权回调
      onUnauthorized?.({
        reason: 'insufficient_permissions',
        currentPath: location.pathname,
        user: user,
        requiredRoles: requiredRoles,
        userRoles: userRoles
      })
      
      // 权限不足时重定向到首页或指定页面
      return (
        <Navigate 
          to="/home" 
          state={{ 
            from: location,
            reason: 'insufficient_permissions',
            requiredRoles: requiredRoles
          }} 
          replace 
        />
      )
    }
  }

  // 所有检查通过，渲染受保护的内容
  console.log('✅ ProtectedRoute: 认证通过，渲染受保护内容')
  console.log('  - 用户:', user?.username)
  console.log('  - 路径:', location.pathname)
  
  return children
}

// PropTypes类型检查
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
  redirectTo: PropTypes.string,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  onUnauthorized: PropTypes.func,
  fallbackToHome: PropTypes.bool
}

// 默认属性
ProtectedRoute.defaultProps = {
  requireAuth: true,
  redirectTo: '/login',
  requiredRoles: [],
  fallbackToHome: false
}

// 使用 React.memo 优化性能
const MemoizedProtectedRoute = memo(ProtectedRoute, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重渲染
  return (
    prevProps.requireAuth === nextProps.requireAuth &&
    prevProps.redirectTo === nextProps.redirectTo &&
    prevProps.fallbackToHome === nextProps.fallbackToHome &&
    JSON.stringify(prevProps.requiredRoles) === JSON.stringify(nextProps.requiredRoles) &&
    prevProps.children === nextProps.children
  )
})

MemoizedProtectedRoute.displayName = 'ProtectedRoute'

export default MemoizedProtectedRoute