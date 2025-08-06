/**
 * 瀑布流状态管理 - Zustand实现
 * 管理瀑布流数据、加载状态等
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { getGuidePhotos } from '../services/pexelsApi'

const useWaterfallStore = create(
  devtools(
    (set, get) => ({
      // 状态
      items: [],
      loading: false,
      initialLoading: true,
      hasMore: true,
      page: 1,
      error: null,

      // 批处理相关状态
      batchQueue: [],
      batchProcessing: false,
      lastLoadTime: 0,
      loadingLock: false,

      // Actions
      /**
       * 设置项目数据
       * @param {Array} items - 项目数组
       */
      setItems: (items) => {
        set({ items }, false, 'setItems')
      },

      /**
       * 添加项目到列表
       * @param {Array} newItems - 新项目数组
       */
      addItems: (newItems) => {
        set((state) => ({
          items: [...state.items, ...newItems]
        }), false, 'addItems')
      },

      /**
       * 设置加载状态
       * @param {boolean} loading - 加载状态
       */
      setLoading: (loading) => {
        set({ loading }, false, 'setLoading')
      },

      /**
       * 设置初始加载状态
       * @param {boolean} initialLoading - 初始加载状态
       */
      setInitialLoading: (initialLoading) => {
        set({ initialLoading }, false, 'setInitialLoading')
      },

      /**
       * 设置是否有更多数据
       * @param {boolean} hasMore - 是否有更多数据
       */
      setHasMore: (hasMore) => {
        set({ hasMore }, false, 'setHasMore')
      },

      /**
       * 设置当前页码
       * @param {number} page - 页码
       */
      setPage: (page) => {
        set({ page }, false, 'setPage')
      },

      /**
       * 设置错误信息
       * @param {string|null} error - 错误信息
       */
      setError: (error) => {
        set({ error }, false, 'setError')
      },

      /**
       * 设置加载锁
       * @param {boolean} locked - 是否锁定
       */
      setLoadingLock: (locked) => {
        set({ loadingLock: locked }, false, 'setLoadingLock')
      },

      /**
       * 更新最后加载时间
       */
      updateLastLoadTime: () => {
        set({ lastLoadTime: Date.now() }, false, 'updateLastLoadTime')
      },

      /**
       * 添加到批处理队列
       * @param {Array} items - 要添加的项目
       */
      addToBatchQueue: (items) => {
        set((state) => ({
          batchQueue: [...state.batchQueue, ...items]
        }), false, 'addToBatchQueue')
      },

      /**
       * 清空批处理队列
       */
      clearBatchQueue: () => {
        set({ batchQueue: [] }, false, 'clearBatchQueue')
      },

      /**
       * 设置批处理状态
       * @param {boolean} processing - 是否正在处理
       */
      setBatchProcessing: (processing) => {
        set({ batchProcessing: processing }, false, 'setBatchProcessing')
      },

      /**
       * 从批处理队列取出一批数据
       * @param {number} batchSize - 批次大小
       * @returns {Array} 一批数据
       */
      takeFromBatchQueue: (batchSize = 5) => {
        const { batchQueue } = get()
        const batch = batchQueue.slice(0, batchSize)
        
        set((state) => ({
          batchQueue: state.batchQueue.slice(batchSize)
        }), false, 'takeFromBatchQueue')
        
        return batch
      },

      /**
       * 检查是否应该加载
       * @returns {boolean} 是否应该加载
       */
      shouldLoad: () => {
        const { loading, loadingLock, lastLoadTime } = get()
        const now = Date.now()
        
        // 多重检查：正在加载、加载锁、距离上次加载时间太短
        if (loading || loadingLock || (now - lastLoadTime < 500)) {
          return false
        }
        
        return true
      },

      /**
       * 加载数据
       * @param {number} pageNum - 页码
       * @param {boolean} isLoadMore - 是否是加载更多
       * @returns {Promise<boolean>} 加载是否成功
       */
      loadData: async (pageNum = 1, isLoadMore = false) => {
        const state = get()
        
        if (!state.shouldLoad()) {
          console.log('跳过加载：条件不满足')
          return false
        }
        
        // 设置加载状态和锁
        set({
          loading: true,
          loadingLock: true,
          error: null
        }, false, 'loadData_start')
        
        get().updateLastLoadTime()
        
        try {
          // 加载数据
          const newItems = await getGuidePhotos(12, pageNum)
          
          if (newItems && newItems.length > 0) {
            // 为每个项目添加随机高度类型
            const itemsWithHeight = newItems.map(item => ({
              ...item,
              heightType: item.heightType || (
                Math.random() > 0.7 ? 'tall' : 
                Math.random() > 0.4 ? 'medium' : 'short'
              )
            }))
            
            if (!isLoadMore) {
              // 首次加载，清空现有数据并直接设置新数据
              set({ 
                items: itemsWithHeight,
                initialLoading: false 
              }, false, 'loadData_firstLoad')
            } else {
              // 加载更多时，添加到现有数据
              set((state) => ({
                items: [...state.items, ...itemsWithHeight]
              }), false, 'loadData_loadMore')
            }
            
            // 更新页码
            set({ page: pageNum + 1 }, false, 'loadData_updatePage')
            
            // 检查是否还有更多数据
            const isDefaultData = newItems.some(item => item.id && item.id.includes('default'))
            if (isLoadMore && newItems.length < 12 && !isDefaultData) {
              set({ hasMore: false }, false, 'loadData_noMore')
            }
            
            return true
          } else {
            set({ 
              hasMore: false,
              initialLoading: false 
            }, false, 'loadData_noData')
            return false
          }
        } catch (error) {
          console.error('加载瀑布流数据失败:', error)
          set({ 
            error: error.message,
            hasMore: false,
            initialLoading: false 
          }, false, 'loadData_error')
          return false
        } finally {
          set({ 
            loading: false,
            loadingLock: false 
          }, false, 'loadData_end')
        }
      },

      /**
       * 处理批次数据 - 简化版本
       * @param {Array} batch - 批次数据
       * @param {boolean} isLoadMore - 是否是加载更多
       */
      processBatch: async (batch, isLoadMore = false) => {
        // 简化逻辑，直接添加数据
        if (isLoadMore) {
          get().addItems(batch)
        } else {
          get().setItems(batch)
        }
        
        // 短暂延迟等待UI更新
        await new Promise(resolve => setTimeout(resolve, 100))
      },

      /**
       * 处理批处理队列
       * @param {boolean} isLoadMore - 是否是加载更多
       */
      processBatchQueue: async (isLoadMore = false) => {
        const { batchProcessing, batchQueue } = get()
        
        if (batchProcessing || batchQueue.length === 0) {
          return
        }
        
        set({ batchProcessing: true }, false, 'processBatchQueue_start')
        
        try {
          while (get().batchQueue.length > 0) {
            // 取出一批数据
            const batch = get().takeFromBatchQueue(5)
            
            // 处理这一批
            await get().processBatch(batch, isLoadMore)
            
            // 批次间延迟
            if (get().batchQueue.length > 0) {
              await new Promise(resolve => setTimeout(resolve, 150))
            }
          }
        } finally {
          set({ batchProcessing: false }, false, 'processBatchQueue_end')
        }
      },

      /**
       * 初始化数据 - 简化版本
       */
      initialize: async () => {
        console.log('🔄 WaterfallStore: 开始初始化')
        
        // 重置所有状态
        set({
          items: [],
          loading: false,
          initialLoading: true,
          hasMore: true,
          page: 1,
          error: null,
          batchQueue: [],
          batchProcessing: false,
          lastLoadTime: 0,
          loadingLock: false
        }, false, 'initialize')
        
        // 开始加载数据
        await get().loadData(1, false)
      },

      /**
       * 加载更多数据
       */
      loadMore: () => {
        const { hasMore, loading, loadingLock } = get()
        
        if (!loading && !loadingLock && hasMore) {
          const { page } = get()
          get().loadData(page, true)
        }
      },

      /**
       * 重置状态
       */
      reset: () => {
        set({
          items: [],
          loading: false,
          initialLoading: true,
          hasMore: true,
          page: 1,
          error: null,
          batchQueue: [],
          batchProcessing: false,
          lastLoadTime: 0,
          loadingLock: false
        }, false, 'reset')
      }
    }),
    {
      name: 'waterfall-store', // DevTools中显示的名称
      enabled: process.env.NODE_ENV === 'development' // 只在开发环境启用DevTools
    }
  )
)

export default useWaterfallStore