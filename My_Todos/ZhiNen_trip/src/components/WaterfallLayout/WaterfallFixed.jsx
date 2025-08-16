/**
 * 瀑布流布局组件
 */

import { useEffect, useRef, useCallback, memo } from 'react'
import { useWaterfallStore } from '../../stores'
import { LazyImage, LoadingSpinner, EmptyState } from '@/components/UI'
import { WATERFALL_CONFIG } from '@/constants'
import { imageUtils } from '@/utils'
import styles from './waterfall.module.css'

const WaterfallFixed = memo(({ 
  columns = WATERFALL_CONFIG.COLUMNS, 
  gap = WATERFALL_CONFIG.GAP,
  loadMore = true 
}) => {
  // 使用Zustand状态管理
  const {
    items,
    loading,
    initialLoading,
    hasMore,
    initialize,
    loadMore: handleLoadMore,
    error
  } = useWaterfallStore()

  const containerRef = useRef(null)
  const columnHeights = useRef([])
  const itemsRef = useRef({})
  const sentinelRef = useRef(null)
  const observerRef = useRef(null)
  
  // 增量布局优化缓存
  const layoutedItemsCache = useRef(new Map()) // 缓存已布局元素的位置信息
  const lastLayoutedCount = useRef(0) // 跟踪已布局的元素数量
  const isFullRelayout = useRef(false) // 标记是否需要完整重新布局

  // 初始化列高度
  const initColumnHeights = useCallback(() => {
    columnHeights.current = new Array(columns).fill(0)
  }, [columns])

  // 计算项目应该放置的列
  const getShortestColumn = useCallback(() => {
    let shortestIndex = 0
    let shortestHeight = columnHeights.current[0] || 0
    
    for (let i = 1; i < columnHeights.current.length; i++) {
      if ((columnHeights.current[i] || 0) < shortestHeight) {
        shortestHeight = columnHeights.current[i] || 0
        shortestIndex = i
      }
    }
    
    return shortestIndex
  }, [])

  // 布局项目 - 增量布局优化版本
  const layoutItems = useCallback(() => {
    if (!containerRef.current || items.length === 0) return

    const startTime = performance.now()
    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const columnWidth = Math.floor((containerWidth - (columns - 1) * gap) / columns)

    // 判断是否需要完整重新布局
    const needsFullRelayout = isFullRelayout.current || 
                             lastLayoutedCount.current === 0 || 
                             lastLayoutedCount.current > items.length

    let startIndex = 0
    
    if (needsFullRelayout) {
      console.log('🔄 执行完整重新布局')
      // 完整重新布局：重置所有状态
      initColumnHeights()
      layoutedItemsCache.current.clear()
      isFullRelayout.current = false
    } else {
      console.log(`⚡ 执行增量布局: 从第 ${lastLayoutedCount.current} 个元素开始`)
      // 增量布局：从缓存中恢复列高度
      startIndex = lastLayoutedCount.current
      
      // 恢复列高度到上次布局的状态
      initColumnHeights()
      for (let i = 0; i < startIndex; i++) {
        const cachedItem = layoutedItemsCache.current.get(items[i]?.id)
        if (cachedItem) {
          columnHeights.current[cachedItem.columnIndex] = Math.max(
            columnHeights.current[cachedItem.columnIndex],
            cachedItem.bottom
          )
        }
      }
    }

    // 批量DOM操作数组
    const domUpdates = []

    // 只处理新增的元素
    for (let index = startIndex; index < items.length; index++) {
      const item = items[index]
      const element = itemsRef.current[item.id]
      if (!element) continue

      // 设置宽度
      element.style.width = `${columnWidth}px`
      
      // 获取最短的列
      const columnIndex = getShortestColumn()
      
      // 计算位置
      const x = columnIndex * (columnWidth + gap)
      const y = columnHeights.current[columnIndex]
      
      // 收集DOM更新操作
      domUpdates.push({
        element,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        opacity: '1'
      })
      
      // 更新列高度
      const elementHeight = element.offsetHeight || 300
      const newColumnHeight = columnHeights.current[columnIndex] + elementHeight + gap
      columnHeights.current[columnIndex] = newColumnHeight
      
      // 缓存布局信息
      layoutedItemsCache.current.set(item.id, {
        x,
        y,
        columnIndex,
        bottom: newColumnHeight,
        width: columnWidth,
        height: elementHeight
      })
    }

    // 使用 requestAnimationFrame 批量应用DOM更新
    requestAnimationFrame(() => {
      domUpdates.forEach(({ element, transform, opacity }) => {
        element.style.transform = transform
        element.style.opacity = opacity
      })

      // 更新容器高度
      const maxHeight = Math.max(...columnHeights.current)
      container.style.height = `${maxHeight}px`
      
      // 更新已布局元素计数
      lastLayoutedCount.current = items.length
      
      const endTime = performance.now()
      console.log(`✅ 布局完成: 容器高度 ${maxHeight}px, 处理元素 ${domUpdates.length}/${items.length}, 耗时 ${(endTime - startTime).toFixed(2)}ms`)
    })
  }, [items, columns, gap, initColumnHeights, getShortestColumn])

  // 使用IntersectionObserver替代scroll事件监听
  useEffect(() => {
    if (!loadMore || !sentinelRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loading) {
          console.log('🎯 哨兵元素进入视口，触发加载更多')
          handleLoadMore()
        }
      },
      {
        rootMargin: '200px 0px',
        threshold: 0
      }
    )

    observerRef.current.observe(sentinelRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore, hasMore, loading, handleLoadMore])

  // 监听窗口大小变化重新布局 - 优化版本
  useEffect(() => {
    const handleResize = () => {
      console.log('🪟 窗口尺寸变化，触发完整重新布局')
      isFullRelayout.current = true // 标记需要完整重新布局
      setTimeout(layoutItems, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [layoutItems])

  // 使用 ResizeObserver + 视口监听，解决从PC切到移动端时布局错位 - 优化版本
  useEffect(() => {
    if (!containerRef.current) return

    const relayout = () => {
      console.log('📐 容器/视口尺寸变化，触发完整重新布局')
      isFullRelayout.current = true // 标记需要完整重新布局
      setTimeout(layoutItems, 150)
    }

    const ro = new ResizeObserver(() => relayout())
    ro.observe(containerRef.current)

    window.addEventListener('orientationchange', relayout)
    const vv = window.visualViewport
    vv && vv.addEventListener('resize', relayout)

    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', relayout)
      vv && vv.removeEventListener('resize', relayout)
    }
  }, [layoutItems])

  // 布局项目 - 响应数据变化
  useEffect(() => {
    if (items.length > 0) {
      const timer = setTimeout(() => {
        console.log(`🔄 触发布局: ${items.length} 个元素`)
        layoutItems()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [items, layoutItems])

  // 初始化
  useEffect(() => {
    console.log('🔄 WaterfallFixed: 开始初始化')
    initialize()
  }, [initialize])

  // 调试信息
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🗂️ 瀑布流状态: ${items.length} 项目, ${loading ? '加载中' : '就绪'}, ${hasMore ? '有更多' : '无更多'}`)
    }
  }, [items.length, loading, hasMore])

  // 错误状态
  if (error) {
    return (
      <div className={styles.waterfallContainer}>
        <EmptyState 
          type="error"
          title="加载失败"
          description={error}
          actionText="重试"
          onAction={() => initialize()}
        />
      </div>
    )
  }

  // 初始加载状态
  if (initialLoading) {
    return (
      <div className={styles.waterfallContainer}>
        <LoadingSpinner 
          type="ball"
          size="medium"
          text="正在加载..."
        />
      </div>
    )
  }

  // 无数据状态
  if (!loading && items.length === 0) {
    return (
      <div className={styles.waterfallContainer}>
        <EmptyState 
          type="noData"
          title="暂无数据"
          description="当前没有旅游攻略数据"
          actionText="重新加载"
          onAction={() => initialize()}
        />
      </div>
    )
  }

  return (
    <div className={styles.waterfallContainer}>
      <div 
        ref={containerRef}
        className={styles.waterfallWrapper}
        style={{ position: 'relative' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            ref={el => itemsRef.current[item.id] = el}
            className={`${styles.waterfallItem} ${styles[item.heightType] || ''}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <div className={styles.guideCard}>
              <div className={styles.cardImage}>
                <LazyImage
                  src={item.image} 
                  alt={item.title}
                  placeholder={imageUtils.placeholder(400, 300, item.title)}
                  threshold={0.1}
                  rootMargin="50px"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                  onLoad={() => {
                    console.log(`✅ 图片加载完成: ${item.title}`)
                    setTimeout(layoutItems, 50)
                  }}
                  onError={(error) => {
                    console.log(`❌ 图片加载失败: ${item.title}`, error)
                  }}
                />
                <div className={styles.cardTag}>{item.tag}</div>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDescription}>{item.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardLocation}>{item.location}</span>
                  <span className={styles.cardPrice}>{item.price}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {hasMore && (
          <div 
            ref={sentinelRef}
            style={{
              position: 'absolute',
              bottom: '200px',
              left: 0,
              width: '100%',
              height: '1px',
              pointerEvents: 'none',
              visibility: 'hidden'
            }}
          />
        )}
      </div>

      {loading && !initialLoading && (
        <LoadingSpinner 
          type="ball"
          size="medium"
          text="加载更多..."
          className={styles.loading}
        />
      )}

      {!hasMore && items.length > 0 && (
        <div className={styles.noMore}>
          <span>已加载全部内容</span>
        </div>
      )}
    </div>
  )
})

WaterfallFixed.displayName = 'WaterfallFixed'

export default WaterfallFixed