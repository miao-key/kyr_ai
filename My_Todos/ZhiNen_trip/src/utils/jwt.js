/**
 * JWT 认证工具函数
 * 提供JWT token的生成、验证、解析和管理功能
 */

// 简单的Base64编码/解码（用于模拟JWT签名，生产环境应使用真实的密钥签名）
const SECRET_KEY = 'zhilv-travel-app-secret-key-2025'

/**
 * 将对象转换为Base64字符串
 */
const encodeBase64 = (obj) => {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * 将Base64字符串转换为对象
 */
const decodeBase64 = (str) => {
  // 还原Base64字符串
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
  
  try {
    return JSON.parse(atob(padded))
  } catch (error) {
    throw new Error('Invalid token format')
  }
}

/**
 * 生成简单的签名（模拟JWT签名）
 */
const generateSignature = (header, payload) => {
  const data = `${header}.${payload}.${SECRET_KEY}`
  // 使用简单的哈希算法模拟签名
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return encodeBase64({ signature: Math.abs(hash).toString(16) })
}

/**
 * 生成JWT Token
 * @param {Object} payload - 用户信息载荷
 * @param {string} payload.id - 用户ID
 * @param {string} payload.username - 用户名
 * @param {string} payload.email - 用户邮箱
 * @param {number} expiresIn - Token过期时间（秒），默认24小时
 * @returns {string} JWT Token
 */
export const generateJWT = (payload, expiresIn = 24 * 60 * 60) => {
  const now = Math.floor(Date.now() / 1000)
  
  // JWT Header
  const header = {
    typ: 'JWT',
    alg: 'HS256' // 模拟签名算法
  }
  
  // JWT Payload
  const jwtPayload = {
    ...payload,
    iat: now, // 签发时间
    exp: now + expiresIn, // 过期时间
    iss: 'zhilv-travel-app', // 签发者
    sub: payload.id.toString() // 主题（用户ID）
  }
  
  const encodedHeader = encodeBase64(header)
  const encodedPayload = encodeBase64(jwtPayload)
  const signature = generateSignature(encodedHeader, encodedPayload)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * 验证JWT Token是否有效
 * @param {string} token - JWT Token
 * @returns {boolean} 是否有效
 */
export const verifyJWT = (token) => {
  try {
    const [header, payload, signature] = token.split('.')
    
    if (!header || !payload || !signature) {
      return false
    }
    
    // 验证签名
    const expectedSignature = generateSignature(header, payload)
    if (signature !== expectedSignature) {
      console.warn('JWT: 签名验证失败')
      return false
    }
    
    // 验证过期时间
    const decodedPayload = decodeBase64(payload)
    const now = Math.floor(Date.now() / 1000)
    
    if (decodedPayload.exp && decodedPayload.exp < now) {
      console.warn('JWT: Token已过期')
      return false
    }
    
    return true
  } catch (error) {
    console.error('JWT验证失败:', error)
    return false
  }
}

/**
 * 解析JWT Token获取载荷信息
 * @param {string} token - JWT Token
 * @returns {Object|null} 载荷信息，解析失败返回null
 */
export const parseJWT = (token) => {
  try {
    if (!verifyJWT(token)) {
      return null
    }
    
    const [, payload] = token.split('.')
    return decodeBase64(payload)
  } catch (error) {
    console.error('JWT解析失败:', error)
    return null
  }
}

/**
 * 检查Token是否即将过期（15分钟内）
 * @param {string} token - JWT Token
 * @returns {boolean} 是否即将过期
 */
export const isTokenExpiringSoon = (token) => {
  try {
    const payload = parseJWT(token)
    if (!payload) return true
    
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = payload.exp - now
    
    // 如果剩余时间少于15分钟（900秒），则认为即将过期
    return timeUntilExpiry < 900
  } catch (error) {
    return true
  }
}

/**
 * 获取Token的剩余有效时间（秒）
 * @param {string} token - JWT Token
 * @returns {number} 剩余秒数，无效token返回0
 */
export const getTokenRemainingTime = (token) => {
  try {
    const payload = parseJWT(token)
    if (!payload) return 0
    
    const now = Math.floor(Date.now() / 1000)
    return Math.max(0, payload.exp - now)
  } catch (error) {
    return 0
  }
}

/**
 * 刷新Token（生成新的Token）
 * @param {string} oldToken - 旧的JWT Token
 * @param {number} expiresIn - 新Token过期时间（秒）
 * @returns {string|null} 新的JWT Token，刷新失败返回null
 */
export const refreshJWT = (oldToken, expiresIn = 24 * 60 * 60) => {
  try {
    const payload = parseJWT(oldToken)
    if (!payload) return null
    
    // 移除JWT标准字段，只保留用户信息
    const { iat, exp, iss, sub, ...userPayload } = payload
    
    // 生成新的Token
    return generateJWT(userPayload, expiresIn)
  } catch (error) {
    console.error('Token刷新失败:', error)
    return null
  }
}

/**
 * 从Token中提取用户信息
 * @param {string} token - JWT Token
 * @returns {Object|null} 用户信息对象
 */
export const getUserFromToken = (token) => {
  try {
    const payload = parseJWT(token)
    if (!payload) return null
    
    // 返回用户相关信息，过滤掉JWT标准字段
    const { iat, exp, iss, sub, ...userInfo } = payload
    return userInfo
  } catch (error) {
    console.error('提取用户信息失败:', error)
    return null
  }
}

/**
 * Token管理类
 */
export class TokenManager {
  constructor() {
    this.TOKEN_KEY = 'zhilvJwtToken'
    this.refreshTimer = null
  }
  
  /**
   * 保存Token到localStorage
   */
  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token)
    this.startAutoRefresh(token)
  }
  
  /**
   * 从localStorage获取Token
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY)
  }
  
  /**
   * 移除Token
   */
  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY)
    this.stopAutoRefresh()
  }
  
  /**
   * 验证当前Token
   */
  isValidToken() {
    const token = this.getToken()
    return token ? verifyJWT(token) : false
  }
  
  /**
   * 获取当前用户信息
   */
  getCurrentUser() {
    const token = this.getToken()
    return token ? getUserFromToken(token) : null
  }
  
  /**
   * 启动自动刷新机制
   */
  startAutoRefresh(token) {
    this.stopAutoRefresh() // 先清除之前的定时器
    
    const refreshInterval = setInterval(() => {
      const currentToken = this.getToken()
      if (!currentToken) {
        this.stopAutoRefresh()
        return
      }
      
      if (isTokenExpiringSoon(currentToken)) {
        console.log('🔄 Token即将过期，尝试自动刷新...')
        const newToken = refreshJWT(currentToken)
        
        if (newToken) {
          this.setToken(newToken)
          console.log('✅ Token自动刷新成功')
          
          // 触发自定义事件通知应用Token已更新
          window.dispatchEvent(new CustomEvent('tokenRefreshed', {
            detail: { newToken, user: getUserFromToken(newToken) }
          }))
        } else {
          console.warn('❌ Token自动刷新失败，需要重新登录')
          this.removeToken()
          
          // 触发登录过期事件
          window.dispatchEvent(new CustomEvent('tokenExpired'))
        }
      }
    }, 60000) // 每分钟检查一次
    
    this.refreshTimer = refreshInterval
  }
  
  /**
   * 停止自动刷新
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }
}

// 导出单例实例
export const tokenManager = new TokenManager()

export default {
  generateJWT,
  verifyJWT,
  parseJWT,
  isTokenExpiringSoon,
  getTokenRemainingTime,
  refreshJWT,
  getUserFromToken,
  tokenManager
}