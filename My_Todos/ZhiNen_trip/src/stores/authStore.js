/**
 * 认证状态管理 - Zustand实现
 * 替换原有的React Context状态管理
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getRandomAvatar } from '../api/pexels'
import { generateTravelAvatar } from '../api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      /**
       * 初始化认证状态
       */
      initializeAuth: () => {
        set({ isLoading: true })
        
        try {
          const storedUser = localStorage.getItem('zhilvUser')
          const storedToken = localStorage.getItem('zhilvToken')
          
          if (storedUser && storedToken) {
            const userData = JSON.parse(storedUser)
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('初始化认证状态失败:', error)
          // 清除可能损坏的数据
          localStorage.removeItem('zhilvUser')
          localStorage.removeItem('zhilvToken')
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
        }
      },

      /**
       * 登录
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
            
            const token = `zhilv_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            // 保存到localStorage
            localStorage.setItem('zhilvUser', JSON.stringify(userData))
            localStorage.setItem('zhilvToken', token)
            
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false
            })
            
            return { success: true, user: userData }
          } else {
            throw new Error('用户名和密码不能为空')
          }
        } catch (error) {
          console.error('登录失败:', error)
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      /**
       * 注册
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
          
          // 检查是否已存在用户
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
          
          const token = `zhilv_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          localStorage.setItem('zhilvUser', JSON.stringify(userData))
          localStorage.setItem('zhilvToken', token)
          
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false
          })
          
          return { success: true, user: userData }
        } catch (error) {
          console.error('注册失败:', error)
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      /**
       * 登出
       */
      logout: () => {
        console.log('🔄 AuthStore: 开始执行logout')
        
        // 清除localStorage数据
        localStorage.removeItem('zhilvUser')
        localStorage.removeItem('zhilvToken')
        localStorage.removeItem('userExtendedInfo')
        
        // 重置状态
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        console.log('✅ AuthStore: logout完成，状态已重置')
      },

      /**
       * 更新用户信息
       * @param {Object} updatedData - 更新的用户数据
       * @returns {Object} 更新结果
       */
      updateUser: (updatedData) => {
        const { user } = get()
        
        if (user) {
          const updatedUser = { ...user, ...updatedData }
          localStorage.setItem('zhilvUser', JSON.stringify(updatedUser))
          
          set({ user: updatedUser })
          
          return { success: true, user: updatedUser }
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
      }
    }),
    {
      name: 'auth-storage', // 本地存储的key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }) // 只持久化用户信息和认证状态
    }
  )
)

export default useAuthStore