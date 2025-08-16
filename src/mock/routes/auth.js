import express from 'express'
import bcrypt from 'bcryptjs'
import { authenticateToken, generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.js'
import { logger } from '../middleware/logger.js'
import User from '../models/User.js'

const router = express.Router()

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, nickname } = req.body

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        error: '用户名、邮箱和密码为必填项',
        code: 'MISSING_REQUIRED_FIELDS'
      })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: '邮箱格式不正确',
        code: 'INVALID_EMAIL_FORMAT'
      })
    }

    // 验证密码强度
    if (password.length < 6) {
      return res.status(400).json({
        error: '密码长度至少6位',
        code: 'PASSWORD_TOO_SHORT'
      })
    }

    // 检查用户是否已存在
    const existingUser = User.findByEmail(email) || User.findByUsername(username)
    if (existingUser) {
      return res.status(409).json({
        error: '用户名或邮箱已存在',
        code: 'USER_ALREADY_EXISTS'
      })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建用户
    const newUser = User.create({
      username,
      email,
      password: hashedPassword,
      nickname: nickname || username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      role: 'user'
    })

    // 生成令牌
    const token = generateToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    })

    const refreshToken = generateRefreshToken({ id: newUser.id })

    logger.info('用户注册成功', { userId: newUser.id, username, email })

    res.status(201).json({
      message: '注册成功',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        nickname: newUser.nickname,
        avatar: newUser.avatar,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      token,
      refreshToken
    })
  } catch (error) {
    logger.error('用户注册失败', { error: error.message })
    res.status(500).json({
      error: '注册失败，请稍后重试',
      code: 'REGISTRATION_FAILED'
    })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({
        error: '邮箱和密码为必填项',
        code: 'MISSING_CREDENTIALS'
      })
    }

    // 查找用户
    const user = User.findByEmail(email)
    if (!user) {
      return res.status(401).json({
        error: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        error: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // 更新最后登录时间
    User.updateLastLogin(user.id)

    // 生成令牌
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    })

    const refreshToken = generateRefreshToken({ id: user.id })

    logger.info('用户登录成功', { userId: user.id, email })

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        lastLoginAt: new Date().toISOString()
      },
      token,
      refreshToken
    })
  } catch (error) {
    logger.error('用户登录失败', { error: error.message })
    res.status(500).json({
      error: '登录失败，请稍后重试',
      code: 'LOGIN_FAILED'
    })
  }
})

// 刷新令牌
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        error: '刷新令牌缺失',
        code: 'REFRESH_TOKEN_MISSING'
      })
    }

    // 验证刷新令牌
    const decoded = verifyRefreshToken(refreshToken)
    const user = User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        error: '用户不存在',
        code: 'USER_NOT_FOUND'
      })
    }

    // 生成新的访问令牌
    const newToken = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    })

    res.json({
      message: '令牌刷新成功',
      token: newToken
    })
  } catch (error) {
    logger.error('令牌刷新失败', { error: error.message })
    res.status(401).json({
      error: '刷新令牌无效或已过期',
      code: 'INVALID_REFRESH_TOKEN'
    })
  }
})

// 获取当前用户信息
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = User.findById(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        error: '用户不存在',
        code: 'USER_NOT_FOUND'
      })
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    })
  } catch (error) {
    logger.error('获取用户信息失败', { error: error.message, userId: req.user.id })
    res.status(500).json({
      error: '获取用户信息失败',
      code: 'GET_USER_FAILED'
    })
  }
})

// 更新用户信息
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { nickname, avatar } = req.body
    const userId = req.user.id

    const user = User.findById(userId)
    if (!user) {
      return res.status(404).json({
        error: '用户不存在',
        code: 'USER_NOT_FOUND'
      })
    }

    // 更新用户信息
    const updatedUser = User.update(userId, {
      nickname: nickname || user.nickname,
      avatar: avatar || user.avatar
    })

    logger.info('用户信息更新成功', { userId })

    res.json({
      message: '用户信息更新成功',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        avatar: updatedUser.avatar,
        role: updatedUser.role
      }
    })
  } catch (error) {
    logger.error('更新用户信息失败', { error: error.message, userId: req.user.id })
    res.status(500).json({
      error: '更新用户信息失败',
      code: 'UPDATE_PROFILE_FAILED'
    })
  }
})

// 修改密码
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: '当前密码和新密码为必填项',
        code: 'MISSING_PASSWORDS'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: '新密码长度至少6位',
        code: 'PASSWORD_TOO_SHORT'
      })
    }

    const user = User.findById(userId)
    if (!user) {
      return res.status(404).json({
        error: '用户不存在',
        code: 'USER_NOT_FOUND'
      })
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: '当前密码错误',
        code: 'INVALID_CURRENT_PASSWORD'
      })
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // 更新密码
    User.update(userId, { password: hashedNewPassword })

    logger.info('用户密码修改成功', { userId })

    res.json({
      message: '密码修改成功'
    })
  } catch (error) {
    logger.error('修改密码失败', { error: error.message, userId: req.user.id })
    res.status(500).json({
      error: '修改密码失败',
      code: 'CHANGE_PASSWORD_FAILED'
    })
  }
})

// 用户登出（可选，主要用于日志记录）
router.post('/logout', authenticateToken, (req, res) => {
  logger.info('用户登出', { userId: req.user.id })
  res.json({
    message: '登出成功'
  })
})

export default router