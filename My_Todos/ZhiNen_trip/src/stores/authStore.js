/**
 * 认证状态管理 - Zustand实现 + JWT集成
 * 替换原有的React Context状态管理，集成JWT认证
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getRandomAvatar } from '../api/pexels'
import { generateTravelAvatar } from '../api'
import { 
  generateJWT, 
  verifyJWT, 
  parseJWT, 
  tokenManager, 
  getUserFromToken,
  getTokenRemainingTime 
} from '../utils/jwt'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      tokenExpiresIn: 0,

      // Actions
      /**
       * 初始化认证状态 - JWT版本
       */
      initializeAuth: () => {
        set({ isLoading: true })
        
        try {
          // 优先使用JWT token
          const jwtToken = tokenManager.getToken()
          
          if (jwtToken && verifyJWT(jwtToken)) {
            // JWT token有效，从token中提取用户信息
            const userData = getUserFromToken(jwtToken)
            const remainingTime = getTokenRemainingTime(jwtToken)
            
            console.log('✅ JWT认证初始化成功:', userData)
            console.log('🕐 Token剩余时间:', Math.floor(remainingTime / 60), '分钟')
            
            set({
              user: userData,
              token: jwtToken,
              tokenExpiresIn: remainingTime,
              isAuthenticated: true,
              isLoading: false
            })
            
            // 启动自动刷新机制
            tokenManager.startAutoRefresh(jwtToken)
          } else {
            // JWT token无效，尝试从旧的localStorage读取并迁移
            const storedUser = localStorage.getItem('zhilvUser')
            const oldToken = localStorage.getItem('zhilvToken')
            
            if (storedUser && oldToken) {
              console.log('🔄 检测到旧版token，正在迁移到JWT...')
              const userData = JSON.parse(storedUser)
              
              // 生成新的JWT token
              const newJwtToken = generateJWT({
                id: userData.id,
                username: userData.username,
                email: userData.email,
                nickname: userData.nickname,
                avatar: userData.avatar,
                phone: userData.phone,
                preferences: userData.preferences
              })
              
              // 保存新的JWT token
              tokenManager.setToken(newJwtToken)
              
              // 清除旧的存储
              localStorage.removeItem('zhilvUser')
              localStorage.removeItem('zhilvToken')
              
              set({
                user: userData,
                token: newJwtToken,
                tokenExpiresIn: getTokenRemainingTime(newJwtToken),
                isAuthenticated: true,
                isLoading: false
              })
              
              console.log('✅ 成功迁移到JWT认证')
            } else {
              // 没有任何有效的认证信息
              set({ 
                user: null,
                token: null,
                tokenExpiresIn: 0,
                isAuthenticated: false, 
                isLoading: false 
              })
            }
          }
        } catch (error) {
          console.error('初始化认证状态失败:', error)
          // 清除所有认证数据
          tokenManager.removeToken()
          localStorage.removeItem('zhilvUser')
          localStorage.removeItem('zhilvToken')
          
          set({ 
            user: null,
            token: null,
            tokenExpiresIn: 0,
            isAuthenticated: false, 
            isLoading: false 
          })
        }
      },

      /**
       * 登录 - JWT版本
       * @param {Object} credentials - 登录凭据
       * @returns {Promise<Object>} 登录结果
       */
      login: async (credentials) => {
        set({ isLoading: true })
        
        try {
          const { username, password } = credentials
          
          if (username && password) {
            // 生成随机头像
            const avatar = await getRandomAvatar()
            
            const userData = {
              id: Date.now(),
              username: username,
              email: username.includes('@') ? username : `${username}@zhilv.com`,
              avatar: avatar,
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
            
            // 生成JWT token（24小时有效期）
            const jwtToken = generateJWT(userData, 24 * 60 * 60)
            const tokenExpiresIn = getTokenRemainingTime(jwtToken)
            
            // 使用JWT token管理器保存
            tokenManager.setToken(jwtToken)
            
            console.log('✅ JWT登录成功:', userData)
            console.log('🎫 生成的JWT Token长度:', jwtToken.length)
            console.log('🕐 Token有效期:', Math.floor(tokenExpiresIn / 3600), '小时')
            
            set({
              user: userData,
              token: jwtToken,
              tokenExpiresIn: tokenExpiresIn,
              isAuthenticated: true,
              isLoading: false
            })
            
            return { success: true, user: userData, token: jwtToken }
          } else {
            throw new Error('用户名和密码不能为空')
          }
        } catch (error) {
          console.error('登录失败:', error)
          set({ 
            isLoading: false,
            token: null,
            tokenExpiresIn: 0
          })
          return { success: false, error: error.message }
        }
      },

      /**
       * 注册 - JWT版本
       * @param {Object} registrationData - 注册数据
       * @returns {Promise<Object>} 注册结果
       */
      register: async (registrationData) => {
        set({ isLoading: true })
        
        try {
          const { username, password, phone } = registrationData
          
          if (!username || !password) {
            throw new Error('用户名和密码不能为空')
          }
          
          // 检查是否已存在用户（简化版本，实际项目应该调用后端API）
          const existingToken = tokenManager.getToken()
          if (existingToken && verifyJWT(existingToken)) {
            const existingUser = getUserFromToken(existingToken)
            if (existingUser && existingUser.username === username) {
              throw new Error('用户名已存在')
            }
          }
          
          // 生成随机头像
          const avatar = await getRandomAvatar()
          
          const userData = {
            id: Date.now(),
            username: username,
            email: `${username}@zhilv.com`,
            phone: phone || '',
            avatar: avatar,
            nickname: username,
            createTime: new Date().toISOString(),
            lastLoginTime: new Date().toISOString(),
            preferences: {
              favoriteDestinations: [],
              interests: [],
              travelStyle: ''
            }
          }
          
          // 生成JWT token（24小时有效期）
          const jwtToken = generateJWT(userData, 24 * 60 * 60)
          const tokenExpiresIn = getTokenRemainingTime(jwtToken)
          
          // 使用JWT token管理器保存
          tokenManager.setToken(jwtToken)
          
          console.log('✅ JWT注册成功:', userData)
          console.log('🎫 生成的JWT Token长度:', jwtToken.length)
          
          set({
            user: userData,
            token: jwtToken,
            tokenExpiresIn: tokenExpiresIn,
            isAuthenticated: true,
            isLoading: false
          })
          
          return { success: true, user: userData, token: jwtToken }
        } catch (error) {
          console.error('注册失败:', error)
          set({ 
            isLoading: false,
            token: null,
            tokenExpiresIn: 0
          })
          return { success: false, error: error.message }
        }
      },

      /**
       * 登出 - JWT版本
       */
      logout: () => {
        console.log('🔄 AuthStore: 开始执行JWT logout')
        
        // 使用JWT token管理器清除
        tokenManager.removeToken()
        
        // 清除旧版localStorage数据（兼容性）
        localStorage.removeItem('zhilvUser')
        localStorage.removeItem('zhilvToken')
        localStorage.removeItem('userExtendedInfo')
        
        // 重置状态
        set({
          user: null,
          token: null,
          tokenExpiresIn: 0,
          isAuthenticated: false,
          isLoading: false
        })
        
        console.log('✅ AuthStore: JWT logout完成，状态已重置')
      },

      /**
       * 更新用户信息 - JWT版本
       * @param {Object} updatedData - 更新的用户数据
       * @returns {Object} 更新结果
       */
      updateUser: (updatedData) => {
        const { user, token } = get()
        
        if (user && token) {
          const updatedUser = { ...user, ...updatedData }
          
          // 生成新的JWT token包含更新后的用户信息
          const newJwtToken = generateJWT(updatedUser, 24 * 60 * 60)
          const tokenExpiresIn = getTokenRemainingTime(newJwtToken)
          
          // 更新token管理器
          tokenManager.setToken(newJwtToken)
          
          set({ 
            user: updatedUser,
            token: newJwtToken,
            tokenExpiresIn: tokenExpiresIn
          })
          
          console.log('✅ 用户信息已更新，JWT token已刷新')
          
          return { success: true, user: updatedUser, token: newJwtToken }
        }
        
        return { success: false, error: '用户未登录' }
      },

      /**
       * 生成AI头像
       * @returns {Promise<Object>} 生成结果
       */
      generateAvatar: async () => {
        const { user } = get()
        
        if (!user) return { success: false, error: '用户未登录' }
        
        try {
          // 基于用户信息生成个性化提示词
          const userPrompt = `friendly ${user.nickname || user.username}, travel enthusiast, outdoor adventurer`
          
          // 使用豆包API生成AI旅行头像
          const result = await generateTravelAvatar(userPrompt)
          
          if (result.success) {
            const updatedUser = { ...user, avatar: result.url }
            localStorage.setItem('zhilvUser', JSON.stringify(updatedUser))
            
            set({ user: updatedUser })
            
            return { 
              success: true, 
              avatar: result.url,
              prompt: result.prompt,
              isAI: true 
            }
          } else {
            // 降级使用Pexels随机头像
            console.warn('豆包AI生成失败，使用Pexels随机头像')
            const fallbackUrl = await getRandomAvatar()
            
            const updatedUser = { ...user, avatar: fallbackUrl }
            localStorage.setItem('zhilvUser', JSON.stringify(updatedUser))
            
            set({ user: updatedUser })
            
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
            
            set({ user: updatedUser })
            
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
      },

      /**
       * 设置加载状态
       * @param {boolean} loading - 加载状态
       */
      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      /**
       * 刷新JWT Token
       * @returns {boolean} 刷新是否成功
       */
      refreshToken: () => {
        const { token } = get()
        
        if (token && verifyJWT(token)) {
          const newToken = refreshJWT(token)
          
          if (newToken) {
            const userData = getUserFromToken(newToken)
            const tokenExpiresIn = getTokenRemainingTime(newToken)
            
            tokenManager.setToken(newToken)
            
            set({
              user: userData,
              token: newToken,
              tokenExpiresIn: tokenExpiresIn
            })
            
            console.log('✅ JWT Token手动刷新成功')
            return true
          }
        }
        
        console.warn('❌ JWT Token手动刷新失败')
        return false
      },

      /**
       * 获取Token状态信息
       * @returns {Object} Token状态
       */
      getTokenStatus: () => {
        const { token, tokenExpiresIn } = get()
        
        if (!token) {
          return { hasToken: false, isValid: false, remainingTime: 0 }
        }
        
        const isValid = verifyJWT(token)
        const remainingTime = getTokenRemainingTime(token)
        
        return {
          hasToken: true,
          isValid,
          remainingTime,
          expiresAt: new Date(Date.now() + remainingTime * 1000).toLocaleString(),
          isExpiringSoon: remainingTime < 900 // 15分钟内过期
        }
      },

      /**
       * 验证当前认证状态
       * @returns {boolean} 是否有效认证
       */
      validateAuth: () => {
        const { token, isAuthenticated } = get()
        
        if (!isAuthenticated || !token) {
          return false
        }
        
        if (!verifyJWT(token)) {
          // Token无效，清除认证状态
          get().logout()
          return false
        }
        
        return true
      }
    }),
    {
      name: 'auth-storage', // 本地存储的key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 注意：JWT token由tokenManager单独管理，不在这里持久化
        // 只持久化必要的状态信息
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export default useAuthStore