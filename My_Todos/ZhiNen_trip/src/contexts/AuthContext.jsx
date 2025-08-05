import { createContext, useContext, useState, useEffect } from 'react'
import { getRandomAvatar } from '@/api/pexels'
import { generateTravelAvatar } from '@/api'

// 创建认证上下文
const AuthContext = createContext()

// 自定义Hook用于使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用')
  }
  return context
}

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 从localStorage获取用户信息
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('zhilvUser')
        const storedToken = localStorage.getItem('zhilvToken')
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
        // 清除可能损坏的数据
        localStorage.removeItem('zhilvUser')
        localStorage.removeItem('zhilvToken')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // 登录函数
  const login = async (credentials) => {
    setIsLoading(true)
    try {
      // 这里是模拟登录 - 在实际项目中，这里应该是API调用
      const { username, password } = credentials
      
      // 简单的登录验证逻辑（实际项目中应该调用后端API）
      if (username && password) {
        // 生成随机头像
        const avatar = await getRandomAvatar()
        
        const userData = {
          id: Date.now(),
          username: username,
          email: username.includes('@') ? username : `${username}@zhilv.com`,
          avatar: avatar, // 使用Pexels API生成的随机头像
          phone: '',
          nickname: username,
          createTime: new Date().toISOString(),
          lastLoginTime: new Date().toISOString(),
          preferences: {
            favoriteDestinations: [],
            interests: [],
            travelStyle: ''
          }
        }
        
        // 生成简单的token（实际项目中应该由后端提供）
        const token = `zhilv_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // 保存到localStorage
        localStorage.setItem('zhilvUser', JSON.stringify(userData))
        localStorage.setItem('zhilvToken', token)
        
        setUser(userData)
        setIsAuthenticated(true)
        
        return { success: true, user: userData }
      } else {
        throw new Error('用户名和密码不能为空')
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // 注册函数
  const register = async (registrationData) => {
    setIsLoading(true)
    try {
      const { username, password, phone } = registrationData
      
      // 简单的注册验证
      if (!username || !password) {
        throw new Error('用户名和密码不能为空')
      }
      
      // 检查是否已存在用户（简单版本，实际应该通过后端验证）
      const existingUser = localStorage.getItem('zhilvUser')
      if (existingUser) {
        const userData = JSON.parse(existingUser)
        if (userData.username === username) {
          throw new Error('用户名已存在')
        }
      }
      
      // 生成随机头像
      const avatar = await getRandomAvatar()
      
      const userData = {
        id: Date.now(),
        username: username,
        email: `${username}@zhilv.com`, // 自动生成邮箱地址
        phone: phone || '',
        avatar: avatar, // 使用Pexels API生成的随机头像
        nickname: username,
        createTime: new Date().toISOString(),
        lastLoginTime: new Date().toISOString(),
        preferences: {
          favoriteDestinations: [],
          interests: [],
          travelStyle: ''
        }
      }
      
      const token = `zhilv_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      localStorage.setItem('zhilvUser', JSON.stringify(userData))
      localStorage.setItem('zhilvToken', token)
      
      setUser(userData)
      setIsAuthenticated(true)
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // 登出函数
  const logout = () => {
    console.log('🔄 AuthContext: 开始执行logout')
    console.log('🔄 AuthContext: 当前认证状态:', isAuthenticated)
    console.log('🔄 AuthContext: 当前用户:', user)
    
    // 清除所有认证相关的localStorage数据
    localStorage.removeItem('zhilvUser')
    localStorage.removeItem('zhilvToken')
    localStorage.removeItem('userExtendedInfo') // 清除扩展用户信息
    
    // 强制重置状态
    setIsLoading(false)
    setUser(null)
    setIsAuthenticated(false)
    
    // 使用setTimeout确保状态更新完成
    setTimeout(() => {
      console.log('✅ AuthContext: logout完成，状态已重置')
      console.log('✅ AuthContext: 最终认证状态:', false)
      console.log('✅ AuthContext: 最终用户状态:', null)
      
      // 强制重新检查认证状态
      const remainingUser = localStorage.getItem('zhilvUser')
      const remainingToken = localStorage.getItem('zhilvToken')
      if (!remainingUser && !remainingToken) {
        console.log('✅ AuthContext: 确认所有数据已清除')
      } else {
        console.warn('⚠️ AuthContext: 仍有残留数据，强制清除')
        localStorage.clear() // 清除所有localStorage数据
      }
    }, 50)
  }

  // 更新用户信息
  const updateUser = (updatedData) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData }
      localStorage.setItem('zhilvUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
      return { success: true, user: updatedUser }
    }
    return { success: false, error: '用户未登录' }
  }

  // 获取用户头像（使用豆包AI生成旅行头像）
  const generateAvatar = async () => {
    if (!user) return { success: false, error: '用户未登录' }
    
    try {
      // 基于用户信息生成个性化提示词
      const userPrompt = `friendly ${user.nickname || user.username}, travel enthusiast, outdoor adventurer`
      
      // 使用豆包API生成AI旅行头像
      const result = await generateTravelAvatar(userPrompt)
      
      if (result.success) {
        const updatedUser = { ...user, avatar: result.url }
        localStorage.setItem('zhilvUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
        
        return { 
          success: true, 
          avatar: result.url,
          prompt: result.prompt,
          isAI: true 
        }
      } else {
        // 如果豆包API失败，降级使用Pexels随机头像
        console.warn('豆包AI生成失败，使用Pexels随机头像')
        const fallbackUrl = await getRandomAvatar()
        
        const updatedUser = { ...user, avatar: fallbackUrl }
        localStorage.setItem('zhilvUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
        
        return { 
          success: true, 
          avatar: fallbackUrl,
          fallback: true,
          error: result.error 
        }
      }
    } catch (error) {
      console.error('生成头像失败:', error)
      
      // 最终降级方案
      try {
        const fallbackUrl = await getRandomAvatar()
        const updatedUser = { ...user, avatar: fallbackUrl }
        localStorage.setItem('zhilvUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
        
        return { 
          success: true, 
          avatar: fallbackUrl,
          fallback: true,
          error: error.message 
        }
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message }
      }
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    generateAvatar
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext