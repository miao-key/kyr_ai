/**
 * 应用设置状态管理 - Zustand实现
 * 管理应用级别的配置和状态
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAppStore = create(
  persist(
    (set, get) => ({
      // 状态
      isFirstVisit: true,
      showWelcomeGuide: true,
      enableAnimations: true,
      enableNotifications: true,
      enableSoundEffects: false,
      dataUsageMode: 'normal', // 'normal' | 'saving'
      language: 'zh-CN',
      lastActiveTime: Date.now(),
      routeHistory: [],
      bookmarks: [],
      searchHistory: [],

      // 性能相关设置
      imageQuality: 'medium', // 'low' | 'medium' | 'high'
      enableLazyLoading: true,
      enableCaching: true,
      preloadImages: true,

      // Actions
      /**
       * 设置首次访问状态
       * @param {boolean} isFirst - 是否首次访问
       */
      setFirstVisit: (isFirst) => {
        set({ isFirstVisit: isFirst })
      },

      /**
       * 设置欢迎引导显示
       * @param {boolean} show - 是否显示
       */
      setShowWelcomeGuide: (show) => {
        set({ showWelcomeGuide: show })
      },

      /**
       * 切换动画效果
       */
      toggleAnimations: () => {
        set((state) => ({ enableAnimations: !state.enableAnimations }))
      },

      /**
       * 切换通知
       */
      toggleNotifications: () => {
        set((state) => ({ enableNotifications: !state.enableNotifications }))
      },

      /**
       * 切换音效
       */
      toggleSoundEffects: () => {
        set((state) => ({ enableSoundEffects: !state.enableSoundEffects }))
      },

      /**
       * 设置数据使用模式
       * @param {string} mode - 数据使用模式
       */
      setDataUsageMode: (mode) => {
        set({ dataUsageMode: mode })
      },

      /**
       * 设置语言
       * @param {string} lang - 语言代码
       */
      setLanguage: (lang) => {
        set({ language: lang })
      },

      /**
       * 更新最后活跃时间
       */
      updateLastActiveTime: () => {
        set({ lastActiveTime: Date.now() })
      },

      /**
       * 添加路由历史
       * @param {string} route - 路由路径
       */
      addRouteHistory: (route) => {
        set((state) => {
          const newHistory = [route, ...state.routeHistory.filter(r => r !== route)]
          return {
            routeHistory: newHistory.slice(0, 20) // 保留最近20条记录
          }
        })
      },

      /**
       * 添加书签
       * @param {Object} bookmark - 书签对象
       */
      addBookmark: (bookmark) => {
        set((state) => {
          const exists = state.bookmarks.some(b => b.id === bookmark.id)
          if (!exists) {
            return {
              bookmarks: [...state.bookmarks, { ...bookmark, createdAt: Date.now() }]
            }
          }
          return state
        })
      },

      /**
       * 移除书签
       * @param {string} bookmarkId - 书签ID
       */
      removeBookmark: (bookmarkId) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(b => b.id !== bookmarkId)
        }))
      },

      /**
       * 添加搜索历史
       * @param {string} query - 搜索查询
       */
      addSearchHistory: (query) => {
        if (!query || query.trim() === '') return
        
        set((state) => {
          const newHistory = [query, ...state.searchHistory.filter(q => q !== query)]
          return {
            searchHistory: newHistory.slice(0, 10) // 保留最近10条搜索记录
          }
        })
      },

      /**
       * 清除搜索历史
       */
      clearSearchHistory: () => {
        set({ searchHistory: [] })
      },

      /**
       * 设置图片质量
       * @param {string} quality - 图片质量
       */
      setImageQuality: (quality) => {
        set({ imageQuality: quality })
      },

      /**
       * 切换懒加载
       */
      toggleLazyLoading: () => {
        set((state) => ({ enableLazyLoading: !state.enableLazyLoading }))
      },

      /**
       * 切换缓存
       */
      toggleCaching: () => {
        set((state) => ({ enableCaching: !state.enableCaching }))
      },

      /**
       * 切换图片预加载
       */
      togglePreloadImages: () => {
        set((state) => ({ preloadImages: !state.preloadImages }))
      },

      /**
       * 获取性能设置
       * @returns {Object} 性能设置对象
       */
      getPerformanceSettings: () => {
        const { imageQuality, enableLazyLoading, enableCaching, preloadImages, dataUsageMode } = get()
        return {
          imageQuality,
          enableLazyLoading,
          enableCaching,
          preloadImages,
          dataUsageMode
        }
      },

      /**
       * 重置应用设置
       */
      resetAppSettings: () => {
        set({
          enableAnimations: true,
          enableNotifications: true,
          enableSoundEffects: false,
          dataUsageMode: 'normal',
          language: 'zh-CN',
          imageQuality: 'medium',
          enableLazyLoading: true,
          enableCaching: true,
          preloadImages: true
        })
      },

      /**
       * 清除用户数据（保留设置）
       */
      clearUserData: () => {
        set({
          routeHistory: [],
          bookmarks: [],
          searchHistory: [],
          lastActiveTime: Date.now()
        })
      },

      /**
       * 完全重置应用状态
       */
      fullReset: () => {
        set({
          isFirstVisit: true,
          showWelcomeGuide: true,
          enableAnimations: true,
          enableNotifications: true,
          enableSoundEffects: false,
          dataUsageMode: 'normal',
          language: 'zh-CN',
          lastActiveTime: Date.now(),
          routeHistory: [],
          bookmarks: [],
          searchHistory: [],
          imageQuality: 'medium',
          enableLazyLoading: true,
          enableCaching: true,
          preloadImages: true
        })
      }
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isFirstVisit: state.isFirstVisit,
        showWelcomeGuide: state.showWelcomeGuide,
        enableAnimations: state.enableAnimations,
        enableNotifications: state.enableNotifications,
        enableSoundEffects: state.enableSoundEffects,
        dataUsageMode: state.dataUsageMode,
        language: state.language,
        lastActiveTime: state.lastActiveTime,
        bookmarks: state.bookmarks,
        searchHistory: state.searchHistory,
        imageQuality: state.imageQuality,
        enableLazyLoading: state.enableLazyLoading,
        enableCaching: state.enableCaching,
        preloadImages: state.preloadImages
      })
    }
  )
)

export default useAppStore