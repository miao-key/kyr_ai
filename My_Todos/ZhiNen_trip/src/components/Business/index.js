/**
 * 业务组件统一导出
 * 包含应用特定的业务逻辑组件
 */

export { default as ProtectedRoute } from './ProtectedRoute'

// 业务组件配置
export const BusinessConfig = {
  ProtectedRoute: {
    type: 'authentication',
    features: ['role-based-access', 'redirect-handling', 'loading-states'],
    supportedRoles: ['admin', 'user', 'guest', 'vip'],
    defaultRedirect: '/login'
  }
}

// 业务组件类型定义
export const BusinessTypes = {
  ProtectedRoute: {
    authModes: ['required', 'optional', 'forbidden'],
    redirectStrategies: ['login', 'home', 'previous', 'custom'],
    roleCheckModes: ['any', 'all', 'exact']
  }
}