/**
 * 主题状态管理 - Zustand实现
 * 管理应用主题、颜色方案等
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      // 状态
      theme: 'light', // 'light' | 'dark' | 'auto'
      primaryColor: '#6FE164',
      secondaryColor: '#70E3DC',
      fontSize: 'medium', // 'small' | 'medium' | 'large'
      colorScheme: 'default', // 'default' | 'blue' | 'green' | 'purple'

      // Actions
      /**
       * 设置主题
       * @param {string} theme - 主题类型
       */
      setTheme: (theme) => {
        set({ theme })
        
        // 应用到document
        if (theme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark')
        } else if (theme === 'light') {
          document.documentElement.setAttribute('data-theme', 'light')
        } else {
          // auto - 根据系统主题
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
        }
      },

      /**
       * 设置主色调
       * @param {string} color - 主色调
       */
      setPrimaryColor: (color) => {
        set({ primaryColor: color })
        document.documentElement.style.setProperty('--primary-color', color)
      },

      /**
       * 设置次色调
       * @param {string} color - 次色调
       */
      setSecondaryColor: (color) => {
        set({ secondaryColor: color })
        document.documentElement.style.setProperty('--secondary-color', color)
      },

      /**
       * 设置字体大小
       * @param {string} size - 字体大小
       */
      setFontSize: (size) => {
        set({ fontSize: size })
        
        const sizeMap = {
          small: '14px',
          medium: '16px',
          large: '18px'
        }
        
        document.documentElement.style.setProperty('--base-font-size', sizeMap[size])
      },

      /**
       * 设置配色方案
       * @param {string} scheme - 配色方案
       */
      setColorScheme: (scheme) => {
        set({ colorScheme: scheme })
        
        const colorSchemes = {
          default: {
            primary: '#6FE164',
            secondary: '#70E3DC'
          },
          blue: {
            primary: '#1976D2',
            secondary: '#42A5F5'
          },
          green: {
            primary: '#388E3C',
            secondary: '#66BB6A'
          },
          purple: {
            primary: '#7B1FA2',
            secondary: '#AB47BC'
          }
        }
        
        const colors = colorSchemes[scheme] || colorSchemes.default
        get().setPrimaryColor(colors.primary)
        get().setSecondaryColor(colors.secondary)
      },

      /**
       * 重置主题设置
       */
      resetTheme: () => {
        set({
          theme: 'light',
          primaryColor: '#6FE164',
          secondaryColor: '#70E3DC',
          fontSize: 'medium',
          colorScheme: 'default'
        })
        
        // 重置CSS变量
        document.documentElement.setAttribute('data-theme', 'light')
        document.documentElement.style.setProperty('--primary-color', '#6FE164')
        document.documentElement.style.setProperty('--secondary-color', '#70E3DC')
        document.documentElement.style.setProperty('--base-font-size', '16px')
      },

      /**
       * 初始化主题
       */
      initTheme: () => {
        const { theme, primaryColor, secondaryColor, fontSize } = get()
        
        // 应用保存的主题设置
        get().setTheme(theme)
        get().setPrimaryColor(primaryColor)
        get().setSecondaryColor(secondaryColor)
        get().setFontSize(fontSize)
      },

      /**
       * 切换暗色模式
       */
      toggleDarkMode: () => {
        const { theme } = get()
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useThemeStore