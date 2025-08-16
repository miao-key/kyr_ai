import { useEffect, useRef, useCallback, memo } from 'react'
import { useWaterfallStore } from '../../stores'
import { LazyImage, LoadingSpinner, EmptyState } from '@/components/UI'
import { WATERFALL_CONFIG, ERROR_MESSAGES } from '@/constants'
import { imageUtils } from '@/utils'
import styles from './waterfall.module.css'

/**
 * 瀑布流布局组件 - 性能优化版本
 * 实现真正的瀑布流效果，自动计算最佳位置
 * 优化特性：React.memo, 缓存API请求, 减少重渲染
 */
const WaterfallLayout = memo(({ 
  columns = WATERFALL_CONFIG.COLUMNS, 
  gap = WATERFALL_CONFIG.GAP, 
  itemMinWidth = 150,
  loadMore = true 
}) => {
  // 使用Zustand状态管理
  const {
    items,
    loading,
    initialLoading,
    hasMore,
    initialize,
    loadMore: handleLoadMore
  } = useWaterfallStore()

  const containerRef = useRef(null)
  const columnHeights = useRef([])
  const itemsRef = useRef({})
  const sentinelRef = useRef(null)
  const observerRef = useRef(null)

  // 初始化列高度
  const initColumnHeights = useCallback(() => {
    columnHeights.current = new Array(columns).fill(0)
  }, [columns])

  // 计算项目应该放置的列
  const getShortestColumn = useCallback(() => {
    let shortestIndex = 0
    let shortestHeight = columnHeights.current[0]
    
    for (let i = 1; i < columnHeights.current.length; i++) {
      if (columnHeights.current[i] < shortestHeight) {
        shortestHeight = columnHeights.current[i]
        shortestIndex = i
      }
    }
    
    return shortestIndex
  }, [])

  // 用于存储自动滚动的回调函数
  const autoScrollCallbackRef = useRef(null)

  // 布局项目 - 优化版本
  const layoutItems = useCallback(() => {
    if (!containerRef.current || items.length === 0) return

    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const columnWidth = Math.floor((containerWidth - (columns - 1) * gap) / columns)

    // 重置列高度
    initColumnHeights()

    // 使用Promise来确保所有图片加载完成后再布局
    const layoutPromises = items.map((item, index) => {
      return new Promise((resolve) => {
        const element = itemsRef.current[item.id]
        if (!element) {
          resolve()
          return
        }

        // 设置宽度
        element.style.width = `${columnWidth}px`
        
        // 查找元素中的图片
        const img = element.querySelector('img')
        
        const doLayout = () => {
          // 获取最短的列
          const columnIndex = getShortestColumn()
          
          // 计算位置
          const x = columnIndex * (columnWidth + gap)
          const y = columnHeights.current[columnIndex]
          
          // 设置位置
          element.style.transform = `translate3d(${x}px, ${y}px, 0)`
          element.style.opacity = '1'
          
          // 更新列高度
          const elementHeight = element.offsetHeight
          columnHeights.current[columnIndex] += elementHeight + gap
          
          resolve()
        }

        if (img) {
          if (img.complete) {
            setTimeout(doLayout, 10)
          } else {
            const timeout = setTimeout(() => {
              console.log(`⚠️ 图片加载超时，强制布局: ${img.src}`)
              doLayout()
            }, 3000)

            img.onload = () => {
              clearTimeout(timeout)
              setTimeout(doLayout, 10)
            }
            img.onerror = () => {
              clearTimeout(timeout)
              console.log(`❌ 图片加载失败: ${img.src}`)
              setTimeout(doLayout, 10)
            }
          }
        } else {
          setTimeout(doLayout, 10)
        }
      })
    })

    // 所有元素布局完成后更新容器高度
    Promise.all(layoutPromises).then(() => {
      const maxHeight = Math.max(...columnHeights.current)
      container.style.height = `${maxHeight}px`
      
      console.log(`📐 布局完成: 容器高度 ${maxHeight}px, 元素数量 ${items.length}`)
      
      // 如果有自动滚动回调，执行它
      if (autoScrollCallbackRef.current) {
        console.log(`🎯 执行自动滚动回调`)
        autoScrollCallbackRef.current()
        autoScrollCallbackRef.current = null
      }
    }).catch(error => {
      console.error('布局过程中出现错误:', error)
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
        rootMargin: '100px 0px',
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

  // 监听窗口大小变化重新布局
  useEffect(() => {
    const handleResize = () => {
      setTimeout(layoutItems, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [layoutItems])

  // 布局项目 - 响应数据变化
  useEffect(() => {
    if (items.length > 0) {
      const isFirstLoad = items.length <= 15
      const delay = isFirstLoad ? WATERFALL_CONFIG.DELAYS.INITIAL_LOAD : WATERFALL_CONFIG.DELAYS.SCROLL_LOAD
      
      const timer = setTimeout(() => {
        console.log(`🔄 触发布局: ${items.length} 个元素${isFirstLoad ? ' (初始加载)' : ' (滚动加载)'}`)
        layoutItems()
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [items, layoutItems])

  // 响应容器尺寸变化
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(layoutItems, WATERFALL_CONFIG.DELAYS.RESIZE)
    })
    
    resizeObserver.observe(container)
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [layoutItems])

  // 初始加载
  useEffect(() => {
    initialize()
  }, [initialize])

  // 调试信息 (开发模式下)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🗂️ 瀑布流状态: ${items.length} 项目, ${loading ? '加载中' : '就绪'}, ${hasMore ? '有更多' : '无更多'}`)
    }
  }, [items.length, loading, hasMore])

  // 骨架屏组件
  const SkeletonCards = () => (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={`skeleton-${index}`} className={styles.skeletonCard}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonDescription}></div>
            <div className={styles.skeletonDescription} style={{ width: '80%' }}></div>
            <div className={styles.skeletonFooter}>
              <div className={styles.skeletonTag}></div>
              <div className={styles.skeletonPrice}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // 如果正在初始加载，显示骨架屏
  if (initialLoading) {
    return (
      <div className={styles.waterfallContainer}>
        <SkeletonCards />
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
            className={`${styles.waterfallItem} ${styles[item.heightType]}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transition: 'transform 0.3s ease'
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
              bottom: '100px',
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
      
      {!loading && items.length === 0 && (
        <EmptyState 
          type="noData"
          title="暂无数据"
          description="当前没有旅游攻略数据"
          actionText="重新加载"
          onAction={() => window.location.reload()}
        />
      )}

      {!loading && !hasMore && items.length === 0 && (
        <div className={styles.noMore}>
          <span>暂无数据</span>
        </div>
      )}
    </div>
  )
})

WaterfallLayout.displayName = 'WaterfallLayout'

export default WaterfallLayout