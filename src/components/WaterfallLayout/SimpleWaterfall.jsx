/**
 * 简化的瀑布流组件 - 用于调试
 */

import { useEffect } from 'react'
import { useWaterfallStore } from '../../stores'
import { LoadingSpinner, EmptyState } from '@/components/UI'
import { imageUtils } from '@/utils'
import styles from './waterfall.module.css'

const SimpleWaterfall = () => {
  const {
    items,
    loading,
    initialLoading,
    hasMore,
    initialize,
    error
  } = useWaterfallStore()

  useEffect(() => {
    console.log('🔄 SimpleWaterfall: 开始初始化')
    initialize()
  }, [initialize])

  useEffect(() => {
    console.log('📊 SimpleWaterfall状态:', {
      itemsCount: items.length,
      loading,
      initialLoading,
      hasMore,
      error
    })
  }, [items.length, loading, initialLoading, hasMore, error])

  if (initialLoading) {
    return (
      <div className={styles.waterfallContainer}>
        <LoadingSpinner 
          type="ball"
          size="medium"
          text="加载中..."
        />
      </div>
    )
  }

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {items.map((item, index) => (
          <div key={item.id} style={{ marginBottom: '12px' }}>
            <div className={styles.guideCard}>
              <div className={styles.cardImage}>
                <img 
                  src={item.image} 
                  alt={item.title}
                  style={{ width: '100%', height: 'auto' }}
                  onError={(e) => {
                    e.target.src = imageUtils.placeholder(400, 300, item.title)
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
}

export default SimpleWaterfall