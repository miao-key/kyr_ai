import { useState, useEffect, useRef, useCallback } from 'react'
import { getGuidePhotos } from '@/services/pexelsApi'
import { LazyImage, LoadingSpinner, EmptyState } from '@components/UI'
import { WATERFALL_CONFIG, ERROR_MESSAGES } from '@constants'
import { imageUtils } from '@/utils'
import PropTypes from 'prop-types'
import styles from './waterfall.module.css'

/**
 * 瀑布流布局组件 - 高质量实现
 * 
 * 功能特性:
 * - 真正的瀑布流效果，自动计算最佳位置
 * - 响应式列数调整
 * - 无限滚动加载 (使用 IntersectionObserver)
 * - 图片懒加载
 * - 性能优化
 * - 自动滚动到新内容
 * 
 * @param {Object} props - 组件属性
 * @param {number} props.columns - 列数
 * @param {number} props.gap - 间距
 * @param {number} props.itemMinWidth - 项目最小宽度
 * @param {boolean} props.loadMore - 是否支持加载更多
 * @param {Function} props.onLoadData - 自定义数据加载函数
 * @param {Function} props.onItemClick - 项目点击回调
 */
const WaterfallLayout = ({ 
  columns = WATERFALL_CONFIG.COLUMNS, 
  gap = WATERFALL_CONFIG.GAP, 
  itemMinWidth = 150,
  loadMore = true,
  onLoadData,
  onItemClick
}) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  
  const containerRef = useRef(null)
  const columnHeights = useRef([])
  const itemsRef = useRef({})
  const autoScrollCallbackRef = useRef(null)
  const loadingLockRef = useRef(false)
  const lastLoadTimeRef = useRef(0)
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
    let shortestHeight = columnHeights.current[0]
    
    for (let i = 1; i < columnHeights.current.length; i++) {
      if (columnHeights.current[i] < shortestHeight) {
        shortestHeight = columnHeights.current[i]
        shortestIndex = i
      }
    }
    
    return shortestIndex
  }, [])

  // 增量布局项目 - 性能优化版本
  const layoutItems = useCallback(() => {
    const container = containerRef.current
    if (!container || items.length === 0) return

    const startTime = performance.now()
    const containerWidth = container.offsetWidth
    const columnWidth = (containerWidth - (columns - 1) * gap) / columns

    // 检测是否需要完整重新布局
    const needsFullRelayout = isFullRelayout.current || 
                             items.length < lastLayoutedCount.current ||
                             layoutedItemsCache.current.size === 0

    if (needsFullRelayout) {
      console.log(`🔄 执行完整重新布局: ${items.length} 个元素`)
      // 完整重新布局：重置所有缓存和列高度
      initColumnHeights()
      layoutedItemsCache.current.clear()
      lastLayoutedCount.current = 0
      isFullRelayout.current = false
    } else {
      console.log(`⚡ 执行增量布局: 新增 ${items.length - lastLayoutedCount.current} 个元素`)
      // 增量布局：从缓存恢复已布局元素的列高度
      const cachedHeights = Array.from(layoutedItemsCache.current.values())
      if (cachedHeights.length > 0) {
        // 重建列高度状态
        initColumnHeights()
        cachedHeights.forEach(({ columnIndex, bottom }) => {
          if (columnHeights.current[columnIndex] < bottom) {
            columnHeights.current[columnIndex] = bottom
          }
        })
      }
    }

    // 确定需要布局的元素范围
    const startIndex = needsFullRelayout ? 0 : lastLayoutedCount.current
    const itemsToLayout = items.slice(startIndex)
    
    if (itemsToLayout.length === 0) {
      console.log(`⏭️ 跳过布局: 没有新元素需要布局`)
      return
    }

    // 批量DOM操作队列
    const domOperations = []
    
    // 使用Promise来确保所有图片加载完成后再布局
    const layoutPromises = itemsToLayout.map((item, index) => {
      return new Promise((resolve) => {
        const element = itemsRef.current[item.id]
        if (!element) {
          resolve()
          return
        }

        // 批量设置宽度
        domOperations.push(() => {
          element.style.width = `${columnWidth}px`
        })
        
        // 查找元素中的图片
        const img = element.querySelector('img')
        
        const doLayout = () => {
          // 获取最短的列
          const columnIndex = getShortestColumn()
          
          // 计算位置
          const x = columnIndex * (columnWidth + gap)
          const y = columnHeights.current[columnIndex]
          
          // 批量设置位置和透明度
          domOperations.push(() => {
            element.style.transform = `translate3d(${x}px, ${y}px, 0)`
            element.style.opacity = '1'
          })
          
          // 更新列高度
          const elementHeight = element.offsetHeight
          const newHeight = columnHeights.current[columnIndex] + elementHeight + gap
          columnHeights.current[columnIndex] = newHeight
          
          // 缓存布局信息
          layoutedItemsCache.current.set(item.id, {
            x,
            y,
            columnIndex,
            bottom: newHeight,
            width: columnWidth,
            height: elementHeight
          })
          
          resolve()
        }

        if (img) {
          if (img.complete) {
            // 图片已加载完成
            setTimeout(doLayout, 10)
          } else {
            // 设置加载超时，防止图片加载卡住
            const timeout = setTimeout(() => {
              console.warn(`图片加载超时，强制布局: ${img.src}`)
              doLayout()
            }, 5000) // 5秒超时

            // 等待图片加载完成
            img.onload = () => {
              clearTimeout(timeout)
              setTimeout(doLayout, 10)
            }
            img.onerror = () => {
              clearTimeout(timeout)
              console.error(`图片加载失败: ${img.src}`)
              setTimeout(doLayout, 10)
            }
          }
        } else {
          // 没有图片，直接布局
          setTimeout(doLayout, 10)
        }
      })
    })

    // 所有元素布局完成后批量执行DOM操作并更新容器高度
    Promise.all(layoutPromises).then(() => {
      // 使用requestAnimationFrame批量执行DOM操作
      requestAnimationFrame(() => {
        domOperations.forEach(operation => operation())
        
        const maxHeight = Math.max(...columnHeights.current)
        container.style.height = `${maxHeight}px`
        
        // 更新已布局元素计数
        lastLayoutedCount.current = items.length
        
        const endTime = performance.now()
        const layoutType = needsFullRelayout ? '完整布局' : '增量布局'
        console.log(`✅ ${layoutType}完成: 容器高度 ${maxHeight}px, 元素数量 ${items.length}, 耗时 ${(endTime - startTime).toFixed(2)}ms`)
        
        // 如果有自动滚动回调，执行它
        if (autoScrollCallbackRef.current) {
          console.log(`执行自动滚动回调`)
          autoScrollCallbackRef.current()
          autoScrollCallbackRef.current = null
        }
      })
    }).catch(error => {
      console.error('布局过程中出现错误:', error)
      setError('布局失败，请刷新页面重试')
    })
  }, [items, columns, gap, initColumnHeights, getShortestColumn])

  // 加载数据
  const loadData = useCallback(async (pageNum = 1, isLoadMore = false) => {
    const now = Date.now()
    
    // 多重防重复加载检查
    if (loading || loadingLockRef.current) return
    
    // 防止短时间内重复加载（500ms内只允许一次加载）
    if (now - lastLoadTimeRef.current < 500) {
      console.log('防重复加载: 距离上次加载时间太短，跳过本次加载')
      return
    }
    
    // 设置加载锁
    loadingLockRef.current = true
    lastLoadTimeRef.current = now
    
    // 记录加载前的滚动位置和容器高度，用于自动滚动到新内容
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
    const currentContainerHeight = containerRef.current?.offsetHeight || 0
    
    setLoading(true)
    setError(null)
    
    try {
      // 使用自定义数据加载函数或默认函数
      const newItems = onLoadData 
        ? await onLoadData(15, pageNum)
        : await getGuidePhotos(15, pageNum)
      
      if (newItems && newItems.length > 0) {
        // 为每个项目添加随机高度类型（模拟不同内容长度）
        const itemsWithHeight = newItems.map(item => ({
          ...item,
          // 确保heightType存在，如果API已经提供了则保留，否则随机生成
          heightType: item.heightType || (Math.random() > 0.7 ? 'tall' : Math.random() > 0.4 ? 'medium' : 'short')
        }))
        
        if (isLoadMore) {
          // 加载更多：追加到现有数据
          setItems(prevItems => {
            const existingIds = new Set(prevItems.map(item => item.id))
            const uniqueNewItems = itemsWithHeight.filter(item => !existingIds.has(item.id))
            
            if (uniqueNewItems.length === 0) {
              console.log('没有新的唯一项目，停止加载更多')
              setHasMore(false)
              return prevItems
            }
            
            console.log(`加载更多: 新增 ${uniqueNewItems.length} 个项目`)
            
            // 设置自动滚动回调，在布局完成后执行
            if (uniqueNewItems.length > 0) {
              autoScrollCallbackRef.current = () => {
                const newContainerHeight = containerRef.current?.offsetHeight || 0
                const heightDiff = newContainerHeight - currentContainerHeight
                
                if (heightDiff > 100) { // 只有当高度变化超过100px时才滚动
                  const targetScrollTop = currentScrollTop + Math.min(heightDiff * 0.3, 200)
                  window.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                  })
                  console.log(`自动滚动到新内容: ${currentScrollTop} -> ${targetScrollTop}`)
                }
              }
            }
            
            return [...prevItems, ...uniqueNewItems]
          })
          
          setPage(pageNum + 1)
          
          // 如果返回的数据少于预期，可能没有更多数据了
          if (newItems.length < 15) {
            console.log(`返回数据不足，可能没有更多数据: ${newItems.length}/15`)
            setHasMore(false)
          }
        } else {
          // 初始加载：替换所有数据
          console.log(`初始加载: ${itemsWithHeight.length} 个项目`)
          setItems(itemsWithHeight)
          setPage(2) // 下次加载第2页
          setInitialLoading(false)
          
          // 如果初始数据就不足，说明没有更多了
          if (newItems.length < 15) {
            setHasMore(false)
          }
        }
      } else {
        console.log('没有获取到数据')
        if (!isLoadMore) {
          setItems([])
          setInitialLoading(false)
        }
        setHasMore(false)
      }
    } catch (err) {
      console.error('加载数据失败:', err)
      const errorMessage = err.message || ERROR_MESSAGES.NETWORK_ERROR
      setError(errorMessage)
      
      if (!isLoadMore) {
        setInitialLoading(false)
      }
    } finally {
      setLoading(false)
      // 延迟释放加载锁，防止快速重复触发
      setTimeout(() => {
        loadingLockRef.current = false
      }, 300)
    }
  }, [loading, onLoadData])

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && loadMore && !loadingLockRef.current) {
      console.log(`触发加载更多: 第${page}页`)
      loadData(page, true)
    } else {
      console.log(`跳过加载更多: loading=${loading}, lockRef=${loadingLockRef.current}, hasMore=${hasMore}, loadMore=${loadMore}`)
    }
  }, [loading, hasMore, loadMore, page, loadData])

  // 项目点击处理
  const handleItemClick = useCallback((item, event) => {
    onItemClick?.(item, event)
  }, [onItemClick])

  // 使用 IntersectionObserver 监听哨兵元素
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

  // 监听窗口大小变化重新布局 - 优化版本
  useEffect(() => {
    const handleResize = () => {
      console.log('🔄 窗口大小变化，触发完整重新布局')
      isFullRelayout.current = true // 标记需要完整重新布局
      setTimeout(layoutItems, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [layoutItems])

  // 布局项目 - 响应数据变化
  useEffect(() => {
    if (items.length > 0) {
      // 根据是否是初始加载决定延迟时间
      const isFirstLoad = items.length <= 15 && page === 1
      const delay = isFirstLoad ? WATERFALL_CONFIG.DELAYS.INITIAL_LOAD : WATERFALL_CONFIG.DELAYS.SCROLL_LOAD
      
      const timer = setTimeout(() => {
        console.log(`触发布局: ${items.length} 个元素${isFirstLoad ? ' (初始加载)' : ' (滚动加载)'})`)
        layoutItems()
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [items, layoutItems, page])

  // 响应容器尺寸变化 - 优化版本
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleResize = () => {
      console.log('📐 容器尺寸变化，触发完整重新布局')
      isFullRelayout.current = true // 标记需要完整重新布局
      setTimeout(layoutItems, WATERFALL_CONFIG.DELAYS.RESIZE)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [layoutItems])

  // 初始加载
  useEffect(() => {
    // 重置所有锁状态
    loadingLockRef.current = false
    lastLoadTimeRef.current = 0
    loadData(1, false)
  }, [loadData])

  // 调试信息 (开发模式下)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`瀑布流状态: ${items.length} 项目, ${loading ? '加载中' : '就绪'}, ${hasMore ? '有更多' : '无更多'}, 当前页码: ${page}`)
    }
  }, [items.length, loading, hasMore, page])

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

  // 如果有错误，显示错误状态
  if (error && items.length === 0) {
    return (
      <div className={styles.waterfallContainer}>
        <EmptyState 
          type="error"
          title="加载失败"
          description={error}
          actionText="重新加载"
          onAction={() => {
            setError(null)
            setInitialLoading(true)
            setItems([])
            setPage(1)
            setHasMore(true)
            loadData(1, false)
          }}
        />
      </div>
    )
  }

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
              opacity: 0,
              transition: 'transform 0.3s ease, opacity 0.3s ease'
            }}
            onClick={(e) => handleItemClick(item, e)}
          >
            <div className={styles.guideCard}>
              <div className={styles.cardImage}>
                <LazyImage
                  src={item.image} 
                  alt={item.title}
                  placeholder={imageUtils.placeholder(400, 300, item.title)}
                  timeout={WATERFALL_CONFIG.DELAYS.IMAGE_TIMEOUT}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                  onLoad={() => {
                    console.log(`图片加载完成: ${item.title}`)
                  }}
                  onError={(error) => {
                    console.log(`图片加载失败: ${item.title}`, error)
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
        
        {/* 哨兵元素 - 用于 IntersectionObserver 监听 */}
        {loadMore && hasMore && (
          <div 
            ref={sentinelRef}
            style={{
              position: 'absolute',
              bottom: '100px',
              left: 0,
              width: '100%',
              height: '1px',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {loading && !initialLoading && (
        <LoadingSpinner 
          type="spinner"
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
      
      {!loading && items.length === 0 && !error && (
        <EmptyState 
          type="noData"
          title="暂无数据"
          description="当前没有旅游攻略数据"
          actionText="重新加载"
          onAction={() => window.location.reload()}
        />
      )}
    </div>
  )
}

// PropTypes类型检查
WaterfallLayout.propTypes = {
  columns: PropTypes.number,
  gap: PropTypes.number,
  itemMinWidth: PropTypes.number,
  loadMore: PropTypes.bool,
  onLoadData: PropTypes.func,
  onItemClick: PropTypes.func
}

// 默认属性
WaterfallLayout.defaultProps = {
  columns: WATERFALL_CONFIG.COLUMNS,
  gap: WATERFALL_CONFIG.GAP,
  itemMinWidth: 150,
  loadMore: true
}

export default WaterfallLayout