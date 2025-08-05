/**
 * 认证相关工具函数
 */

// localStorage键名常量
export const AUTH_KEYS = {
  USER: 'zhilvUser',
  TOKEN: 'zhilvToken',
  REMEMBER: 'zhilvRemember'
}

/**
 * 获取存储的用户信息
 * @returns {Object|null} 用户信息对象或null
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem(AUTH_KEYS.USER)
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * 获取存储的认证token
 * @returns {string|null} token字符串或null
 */
export const getStoredToken = () => {
  try {
    return localStorage.getItem(AUTH_KEYS.TOKEN)
  } catch (error) {
    console.error('获取token失败:', error)
    return null
  }
}

/**
 * 保存用户信息到localStorage
 * @param {Object} user - 用户信息对象
 * @param {string} token - 认证token
 * @param {boolean} remember - 是否记住登录状态
 */
export const saveUserData = (user, token, remember = true) => {
  try {
    if (remember) {
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user))
      localStorage.setItem(AUTH_KEYS.TOKEN, token)
      localStorage.setItem(AUTH_KEYS.REMEMBER, 'true')
    } else {
      // 如果不记住登录状态，使用sessionStorage
      sessionStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user))
      sessionStorage.setItem(AUTH_KEYS.TOKEN, token)
    }
  } catch (error) {
    console.error('保存用户数据失败:', error)
  }
}

/**
 * 清除所有认证相关数据
 */
export const clearAuthData = () => {
  try {
    // 清除localStorage
    localStorage.removeItem(AUTH_KEYS.USER)
    localStorage.removeItem(AUTH_KEYS.TOKEN)
    localStorage.removeItem(AUTH_KEYS.REMEMBER)
    
    // 清除sessionStorage
    sessionStorage.removeItem(AUTH_KEYS.USER)
    sessionStorage.removeItem(AUTH_KEYS.TOKEN)
  } catch (error) {
    console.error('清除认证数据失败:', error)
  }
}

/**
 * 验证token是否有效
 * @param {string} token - 要验证的token
 * @returns {boolean} token是否有效
 */
export const isValidToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // 检查token格式（简单版本，实际项目中应该包含更复杂的验证）
  if (!token.startsWith('zhilv_token_')) {
    return false
  }
  
  // 检查token是否过期（这里是简单的时间检查）
  try {
    const parts = token.split('_')
    if (parts.length < 3) {
      return false
    }
    
    const timestamp = parseInt(parts[2])
    const now = Date.now()
    const oneWeek = 7 * 24 * 60 * 60 * 1000 // 一周毫秒数
    
    // 如果token创建时间超过一周，认为已过期
    return (now - timestamp) < oneWeek
  } catch (error) {
    console.error('验证token失败:', error)
    return false
  }
}

/**
 * 生成用户头像URL
 * @param {Object} user - 用户信息对象
 * @returns {string} 头像URL
 */
export const generateAvatarUrl = (user) => {
  if (user?.avatar) {
    return user.avatar
  }
  
  // 使用用户名生成默认头像
  const seed = user?.username || user?.email || 'default'
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}

/**
 * 格式化用户显示名称
 * @param {Object} user - 用户信息对象
 * @returns {string} 格式化的显示名称
 */
export const formatUserDisplayName = (user) => {
  if (!user) return '未登录用户'
  
  return user.nickname || user.username || user.email?.split('@')[0] || '用户'
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {Object} 验证结果 {isValid: boolean, message: string}
 */
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, message: '用户名不能为空' }
  }
  
  if (username.length < 2) {
    return { isValid: false, message: '用户名至少2个字符' }
  }
  
  if (username.length > 20) {
    return { isValid: false, message: '用户名不能超过20个字符' }
  }
  
  // 只允许字母、数字、中文和下划线
  const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/
  if (!validPattern.test(username)) {
    return { isValid: false, message: '用户名只能包含中文、字母、数字和下划线' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} 验证结果 {isValid: boolean, message: string, strength: string}
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: '密码不能为空', strength: 'none' }
  }
  
  if (password.length < 6) {
    return { isValid: false, message: '密码至少6个字符', strength: 'weak' }
  }
  
  if (password.length > 50) {
    return { isValid: false, message: '密码不能超过50个字符', strength: 'weak' }
  }
  
  // 计算密码强度
  let strength = 'weak'
  let strengthScore = 0
  
  // 包含小写字母
  if (/[a-z]/.test(password)) strengthScore++
  // 包含大写字母
  if (/[A-Z]/.test(password)) strengthScore++
  // 包含数字
  if (/\d/.test(password)) strengthScore++
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strengthScore++
  // 长度超过8
  if (password.length >= 8) strengthScore++
  
  if (strengthScore >= 4) {
    strength = 'strong'
  } else if (strengthScore >= 2) {
    strength = 'medium'
  }
  
  return { 
    isValid: true, 
    message: '', 
    strength,
    score: strengthScore
  }
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {Object} 验证结果 {isValid: boolean, message: string}
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: '邮箱不能为空' }
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return { isValid: false, message: '请输入有效的邮箱地址' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {Object} 验证结果 {isValid: boolean, message: string}
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: '手机号不能为空' }
  }
  
  const phonePattern = /^1[3-9]\d{9}$/
  if (!phonePattern.test(phone)) {
    return { isValid: false, message: '请输入有效的手机号' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * 检查是否记住登录状态
 * @returns {boolean} 是否记住登录状态
 */
export const isRememberLogin = () => {
  return localStorage.getItem(AUTH_KEYS.REMEMBER) === 'true'
}

/**
 * 获取登录状态过期时间
 * @returns {Date|null} 过期时间
 */
export const getLoginExpireTime = () => {
  const token = getStoredToken()
  if (!token) return null
  
  try {
    const parts = token.split('_')
    if (parts.length < 3) return null
    
    const timestamp = parseInt(parts[2])
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    
    return new Date(timestamp + oneWeek)
  } catch (error) {
    console.error('获取登录过期时间失败:', error)
    return null
  }
}

/**
 * 防抖函数 - 用于登录相关操作
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounceAuth = (func, delay = 300) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * 模拟API调用延迟
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise} Promise对象
 */
export const mockApiDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}