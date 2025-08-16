import bcrypt from 'bcryptjs'
import { logger } from '../middleware/logger.js'
import config from '../config/index.js'

// 模拟用户数据存储
const users = new Map()
let userIdCounter = 1

// 初始化一些测试用户
const initUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', config.security.bcryptRounds),
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: '系统管理员',
    location: '北京',
    website: 'https://example.com',
    joinDate: new Date('2024-01-01'),
    lastLogin: new Date(),
    isActive: true,
    emailVerified: true,
    preferences: {
      language: 'zh-CN',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        marketing: false
      }
    },
    stats: {
      articlesCount: 5,
      photosCount: 20,
      followersCount: 150,
      followingCount: 80,
      likesReceived: 320,
      viewsReceived: 5600
    }
  },
  {
    id: '2',
    username: 'travel_expert',
    email: 'expert@travel.com',
    password: bcrypt.hashSync('travel123', config.security.bcryptRounds),
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: '资深旅行达人，足迹遍布全球50+国家',
    location: '上海',
    website: 'https://travelexpert.com',
    joinDate: new Date('2024-01-15'),
    lastLogin: new Date(),
    isActive: true,
    emailVerified: true,
    preferences: {
      language: 'zh-CN',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        marketing: true
      }
    },
    stats: {
      articlesCount: 25,
      photosCount: 180,
      followersCount: 2500,
      followingCount: 300,
      likesReceived: 8900,
      viewsReceived: 45000
    }
  },
  {
    id: '3',
    username: 'foodie_traveler',
    email: 'foodie@travel.com',
    password: bcrypt.hashSync('foodie123', config.security.bcryptRounds),
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    bio: '美食旅行家，专注发现世界各地美食',
    location: '广州',
    website: '',
    joinDate: new Date('2024-02-01'),
    lastLogin: new Date(),
    isActive: true,
    emailVerified: true,
    preferences: {
      language: 'zh-CN',
      theme: 'dark',
      notifications: {
        email: true,
        push: false,
        marketing: true
      }
    },
    stats: {
      articlesCount: 15,
      photosCount: 120,
      followersCount: 800,
      followingCount: 200,
      likesReceived: 3200,
      viewsReceived: 18000
    }
  }
]

// 初始化用户数据
initUsers.forEach(user => {
  users.set(user.id, user)
  userIdCounter = Math.max(userIdCounter, parseInt(user.id) + 1)
})

class User {
  // 创建新用户
  static create(userData) {
    try {
      const {
        username,
        email,
        password,
        role = 'user',
        avatar = '',
        bio = '',
        location = '',
        website = ''
      } = userData

      // 验证必填字段
      if (!username || !email || !password) {
        throw new Error('用户名、邮箱和密码为必填项')
      }

      // 检查用户名是否已存在
      if (this.findByUsername(username)) {
        throw new Error('用户名已存在')
      }

      // 检查邮箱是否已存在
      if (this.findByEmail(email)) {
        throw new Error('邮箱已存在')
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('邮箱格式不正确')
      }

      // 验证密码强度
      if (password.length < 6) {
        throw new Error('密码长度至少6位')
      }

      // 加密密码
      const hashedPassword = bcrypt.hashSync(password, config.security.bcryptRounds)

      const userId = userIdCounter.toString()
      userIdCounter++

      const newUser = {
        id: userId,
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        avatar,
        bio,
        location,
        website,
        joinDate: new Date(),
        lastLogin: null,
        isActive: true,
        emailVerified: false,
        preferences: {
          language: 'zh-CN',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            marketing: false
          }
        },
        stats: {
          articlesCount: 0,
          photosCount: 0,
          followersCount: 0,
          followingCount: 0,
          likesReceived: 0,
          viewsReceived: 0
        }
      }

      users.set(userId, newUser)

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = newUser
      return userWithoutPassword
    } catch (error) {
      logger.error('创建用户失败', { error: error.message, userData: { username: userData.username, email: userData.email } })
      throw error
    }
  }

  // 根据ID查找用户
  static findById(id) {
    const user = users.get(id)
    if (user) {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    return null
  }

  // 根据用户名查找用户
  static findByUsername(username) {
    for (const user of users.values()) {
      if (user.username === username) {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      }
    }
    return null
  }

  // 根据邮箱查找用户
  static findByEmail(email) {
    const normalizedEmail = email.toLowerCase()
    for (const user of users.values()) {
      if (user.email === normalizedEmail) {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      }
    }
    return null
  }

  // 验证用户登录（包含密码）
  static findForLogin(identifier) {
    // identifier 可以是用户名或邮箱
    const normalizedIdentifier = identifier.toLowerCase()
    
    for (const user of users.values()) {
      if (user.username === identifier || user.email === normalizedIdentifier) {
        return user // 返回完整用户信息（包含密码）
      }
    }
    return null
  }

  // 验证密码
  static verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword)
  }

  // 更新用户信息
  static update(id, updateData) {
    try {
      const user = users.get(id)
      if (!user) {
        throw new Error('用户不存在')
      }

      const {
        username,
        email,
        avatar,
        bio,
        location,
        website,
        preferences
      } = updateData

      // 如果更新用户名，检查是否已存在
      if (username && username !== user.username) {
        if (this.findByUsername(username)) {
          throw new Error('用户名已存在')
        }
        user.username = username
      }

      // 如果更新邮箱，检查格式和是否已存在
      if (email && email !== user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          throw new Error('邮箱格式不正确')
        }
        
        if (this.findByEmail(email)) {
          throw new Error('邮箱已存在')
        }
        
        user.email = email.toLowerCase()
        user.emailVerified = false // 更新邮箱后需要重新验证
      }

      // 更新其他字段
      if (avatar !== undefined) user.avatar = avatar
      if (bio !== undefined) user.bio = bio
      if (location !== undefined) user.location = location
      if (website !== undefined) user.website = website
      
      if (preferences) {
        user.preferences = { ...user.preferences, ...preferences }
      }

      user.updatedAt = new Date()
      users.set(id, user)

      // 返回更新后的用户信息（不包含密码）
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      logger.error('更新用户失败', { error: error.message, userId: id })
      throw error
    }
  }

  // 更新密码
  static updatePassword(id, currentPassword, newPassword) {
    try {
      const user = users.get(id)
      if (!user) {
        throw new Error('用户不存在')
      }

      // 验证当前密码
      if (!this.verifyPassword(currentPassword, user.password)) {
        throw new Error('当前密码不正确')
      }

      // 验证新密码强度
      if (newPassword.length < 6) {
        throw new Error('新密码长度至少6位')
      }

      // 更新密码
      user.password = bcrypt.hashSync(newPassword, config.security.bcryptRounds)
      user.updatedAt = new Date()
      users.set(id, user)

      return true
    } catch (error) {
      logger.error('更新密码失败', { error: error.message, userId: id })
      throw error
    }
  }

  // 更新最后登录时间
  static updateLastLogin(id) {
    const user = users.get(id)
    if (user) {
      user.lastLogin = new Date()
      users.set(id, user)
    }
  }

  // 激活/停用用户
  static setActive(id, isActive) {
    const user = users.get(id)
    if (user) {
      user.isActive = isActive
      user.updatedAt = new Date()
      users.set(id, user)
      
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    return null
  }

  // 验证邮箱
  static verifyEmail(id) {
    const user = users.get(id)
    if (user) {
      user.emailVerified = true
      user.updatedAt = new Date()
      users.set(id, user)
      
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    return null
  }

  // 更新用户统计信息
  static updateStats(id, statsUpdate) {
    const user = users.get(id)
    if (user) {
      user.stats = { ...user.stats, ...statsUpdate }
      user.updatedAt = new Date()
      users.set(id, user)
    }
  }

  // 删除用户
  static delete(id) {
    return users.delete(id)
  }

  // 获取用户列表（管理员功能）
  static findAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive,
      sortBy = 'joinDate',
      sortOrder = 'desc'
    } = options

    let userList = Array.from(users.values())

    // 过滤
    if (search) {
      const searchLower = search.toLowerCase()
      userList = userList.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.bio.toLowerCase().includes(searchLower)
      )
    }

    if (role) {
      userList = userList.filter(user => user.role === role)
    }

    if (isActive !== undefined) {
      userList = userList.filter(user => user.isActive === isActive)
    }

    // 排序
    userList.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'username' || sortBy === 'email') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    // 分页
    const total = userList.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = userList.slice(startIndex, endIndex)

    // 移除密码字段
    const usersWithoutPassword = paginatedUsers.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return {
      users: usersWithoutPassword,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  }

  // 获取用户统计信息
  static getStats() {
    const userList = Array.from(users.values())
    
    return {
      total: userList.length,
      active: userList.filter(user => user.isActive).length,
      verified: userList.filter(user => user.emailVerified).length,
      admins: userList.filter(user => user.role === 'admin').length,
      newThisMonth: userList.filter(user => {
        const now = new Date()
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
        return user.joinDate >= monthAgo
      }).length
    }
  }
}

export default User