import { useState, useEffect, useRef, useCallback } from 'react'
import { getGuidePhotos } from '@/services/pexelsApi'
import { useThrottle } from '@hooks'
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
 * - 无限滚动加载
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

  // 布局项目 - 优化版本
  const layoutItems = useCallback(() => {
    if (!containerRef.current || items.length === 0) return

    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const columnWidth = Math.floor((containerWidth - (columns - 1) * gap) / columns)

    // 重置列高度
    initColumnHeights()

    // 使用Promise来确保所有图片加载完成后再布局
    const layoutPromises = items.map((item) => {
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

    // 所有元素布局完成后更新容器高度
    Promise.all(layoutPromises).then(() => {
      const maxHeight = Math.max(...columnHeights.current)
      container.style.height = `${maxHeight}px`
      
      console.log(`布局完成: 容器高度 ${maxHeight}px, 元素数量 ${items.length}`)
      
      // 如果有自动滚动回调，执行它
      if (autoScrollCallbackRef.current) {
        console.log(`执行自动滚动回调`)
        autoScrollCallbackRef.current()
        autoScrollCallbackRef.current = null
      }
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
          // 加载更多时，检查是否有重复的ID
          setItems(prev => {
            const existingIds = new Set(prev.map(item => item.id))
            const filteredNewItems = itemsWithHeight.filter(item => !existingIds.has(item.id))
            return [...prev, ...filteredNewItems]
          })
          
          // 设置自动滚动回调，在布局完成后执行
          autoScrollCallbackRef.current = () => {
            // 延迟执行自动滚动，确保布局完全稳定
            setTimeout(() => {
              const newContainerHeight = containerRef.current?.offsetHeight || 0
              const heightDifference = newContainerHeight - currentContainerHeight
              const currentScroll = window.pageYOffset || document.documentElement.scrollTop
              
              console.log(`自动滚动检查: 容器高度变化 ${heightDifference}px (${currentContainerHeight} -> ${newContainerHeight})`)
              
              // 如果有新内容且容器高度增加了，则滚动到新内容区域
              if (heightDifference > 50 && currentContainerHeight > 0) {
                // 计算新内容的起始位置（保留一些上下文）
                const newContentStartPosition = currentContainerHeight - 150 // 向上偏移150px显示上下文
                const targetScrollPosition = Math.max(0, Math.min(newContentStartPosition, newContainerHeight - window.innerHeight))
                
                // 只有当目标位置与当前位置差距较大时才滚动
                if (Math.abs(targetScrollPosition - currentScroll) > 50) {
                  console.log(`自动滚动: ${currentScroll}px -> ${targetScrollPosition}px，新内容高度: ${heightDifference}px`)
                  
                  // 平滑滚动到新内容位置
                  window.scrollTo({
                    top: targetScrollPosition,
                    behavior: 'smooth'
                  })
                } else {
                  console.log(`跳过自动滚动: 滚动距离太小 (${Math.abs(targetScrollPosition - currentScroll)}px)`)
                }
              } else {
                console.log(`跳过自动滚动: 高度变化不足 (${heightDifference}px)`)
              }
            }, 200) // 200ms延迟，确保DOM完全更新
          }
        } else {
          // 首次加载，直接设置数据
          setItems(itemsWithHeight)
          setInitialLoading(false)
        }
        
        setPage(pageNum + 1)
        
        // 检查数据来源：如果是默认数据（ID包含"default"），则支持无限滚动
        const isDefaultData = newItems.some(item => item.id && item.id.includes('default'))
        
        console.log(`数据检查: 新数据量=${newItems.length}, 是否默认数据=${isDefaultData}, 是否加载更多=${isLoadMore}`)
        
        // 只有当是加载更多、数据量不足、且不是默认数据时，才说明没有更多数据了
        if (isLoadMore && newItems.length < 15 && !isDefaultData) {
          console.log(`设置hasMore=false: 数据不足且非默认数据`)
          setHasMore(false)
        } else {
          console.log(`保持hasMore=true: 有足够数据或为默认数据`)
        }
      } else {
        setHasMore(false)
        if (!isLoadMore) {
          setInitialLoading(false)
        }
      }
    } catch (error) {
      console.error('加载瀑布流数据失败:', error)
      setError(ERROR_MESSAGES.LOAD_FAILED)
      setHasMore(false)
      if (!isLoadMore) {
        setInitialLoading(false)
      }
    } finally {
      setLoading(false)
      // 释放加载锁
      loadingLockRef.current = false
    }
  }, [loading, onLoadData])

  // 加载更多
  const handleLoadMore = useCallback(() => {
    console.log(`handleLoadMore 检查: loading=${loading}, lockRef=${loadingLockRef.current}, hasMore=${hasMore}, loadMore=${loadMore}, page=${page}`)
    
    if (!loading && !loadingLockRef.current && hasMore && loadMore) {
      console.log(`触发加载更多: 页码 ${page}`)
      loadData(page, true)
    } else {
      console.log(`跳过加载更多: loading=${loading}, lockRef=${loadingLockRef.current}, hasMore=${hasMore}, loadMore=${loadMore}`)
    }
  }, [loading, hasMore, loadMore, page, loadData])

  // 项目点击处理
  const handleItemClick = useCallback((item, event) => {
    onItemClick?.(item, event)
  }, [onItemClick])

  // 监听滚动加载更多 - 添加节流机制
  const throttledHandleScroll = useThrottle(() => {
    // 如果正在加载，直接返回
    if (loading || loadingLockRef.current) {
      console.log(`滚动检测: 正在加载中，跳过 (loading=${loading}, lockRef=${loadingLockRef.current})`)
      return
    }
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // 距离底部100px时加载更多
    const distanceToBottom = documentHeight - scrollTop - windowHeight
    console.log(`滚动状态: 距离底部 ${distanceToBottom}px, hasMore=${hasMore}, loadMore=${loadMore}`)
    
    if (distanceToBottom < 100) {
      console.log(`距离底部 ${distanceToBottom}px，触发加载更多`)
      handleLoadMore()
    }
  }, 300) // 增加到300ms节流，减少触发频率

  useEffect(() => {
    if (!loadMore) return

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [throttledHandleScroll, loadMore])

  // 监听窗口大小变化重新布局 - 添加节流机制
  const throttledHandleResize = useThrottle(() => {
    setTimeout(layoutItems, 100)
  }, 200) // 200ms节流，避免频繁重新布局

  useEffect(() => {
    window.addEventListener('resize', throttledHandleResize)
    return () => window.removeEventListener('resize', throttledHandleResize)
  }, [throttledHandleResize])

  // 布局项目 - 响应数据变化
  useEffect(() => {
    if (items.length > 0) {
      // 根据是否是初始加载决定延迟时间
      const isFirstLoad = items.length <= 15 && page === 1
      const delay = isFirstLoad ? WATERFALL_CONFIG.DELAYS.INITIAL_LOAD : WATERFALL_CONFIG.DELAYS.SCROLL_LOAD
      
      const timer = setTimeout(() => {
        console.log(`触发布局: ${items.length} 个元素${isFirstLoad ? ' (初始加载)' : ' (滚动加载)'}`)
        layoutItems()
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [items, layoutItems, page])

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