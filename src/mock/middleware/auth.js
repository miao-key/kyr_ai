import jwt from 'jsonwebtoken'
import config from '../config/index.js'

// JWT令牌验证中间件
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: '访问令牌缺失',
      code: 'TOKEN_MISSING'
    })
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      console.warn('JWT验证失败:', err.message)
      return res.status(403).json({
        error: '访问令牌无效或已过期',
        code: 'TOKEN_INVALID'
      })
    }

    req.user = user
    next()
  })
}

// 可选的JWT验证中间件（不强制要求token）
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      req.user = null
    } else {
      req.user = user
    }
    next()
  })
}

// 管理员权限验证中间件
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: '需要登录',
      code: 'LOGIN_REQUIRED'
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: '需要管理员权限',
      code: 'ADMIN_REQUIRED'
    })
  }

  next()
}

// 生成JWT令牌
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  })
}

// 生成刷新令牌
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn
  })
}

// 验证刷新令牌
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret)
  } catch (error) {
    throw new Error('刷新令牌无效')
  }
}

// 从令牌中提取用户信息（不验证过期）
export const decodeToken = (token) => {
  try {
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}

export default {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  decodeToken
}