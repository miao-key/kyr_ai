import { useAuthStore } from '@/stores'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@components/UI'

/**
 * 路由保护组件
 * 用于保护需要登录才能访问的页面
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {boolean} props.requireAuth - 是否需要认证，默认为true
 * @param {string} props.redirectTo - 重定向路径，默认为'/login'
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // 如果正在加载认证状态，显示加载器
  if (isLoading) {
    return (
      <LoadingSpinner 
        type="ball" 
        size="medium"
        text="验证登录状态..."
        fullScreen={true}
      />
    )
  }

  // 如果需要认证但用户未登录，重定向到登录页面
  if (requireAuth && !isAuthenticated) {
    console.log('🔒 ProtectedRoute: 用户未认证，重定向到登录页面')
    console.log('  - 当前路径:', location.pathname)
    console.log('  - 认证状态:', isAuthenticated)
    
    // 保存当前路径，登录成功后可以重定向回来
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // 如果不需要认证或用户已登录，渲染子组件
  return children
}

export default ProtectedRoute