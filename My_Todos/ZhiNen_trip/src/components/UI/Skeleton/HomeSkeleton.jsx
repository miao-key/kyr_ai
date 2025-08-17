import { memo } from 'react'
import Skeleton from './index'
import styles from './home-skeleton.module.css'

/**
 * Home页面专用骨架屏组件
 * 模拟首页的布局结构
 */
const HomeSkeleton = () => {
  return (
    <div className={styles.homeSkeletonContainer}>
      {/* 搜索框骨架屏 */}
      <div className={styles.searchSkeleton}>
        <Skeleton 
          variant="rounded" 
          height="48px" 
          className={styles.searchInput}
        />
        <Skeleton 
          variant="circular" 
          width="48px" 
          height="48px" 
          className={styles.searchButton}
        />
      </div>
      
      {/* 导航图标骨架屏 */}
      <div className={styles.navigationSkeleton}>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={styles.navItem}>
            <Skeleton 
              variant="circular" 
              width="56px" 
              height="56px" 
              className={styles.navIcon}
            />
            <Skeleton 
              variant="text" 
              width="40px" 
              height="14px" 
              className={styles.navText}
            />
          </div>
        ))}
      </div>
      
      {/* 轮播图骨架屏 */}
      <div className={styles.carouselSkeleton}>
        <Skeleton 
          variant="rounded" 
          height="200px" 
          className={styles.carouselImage}
        />
        {/* 轮播指示器 */}
        <div className={styles.carouselDots}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton 
              key={index}
              variant="circular" 
              width="8px" 
              height="8px" 
              className={styles.dot}
            />
          ))}
        </div>
      </div>
      
      {/* 瀑布流骨架屏 */}
      <div className={styles.waterfallSkeleton}>
        <div className={styles.waterfallColumn}>
          <Skeleton variant="rounded" height="180px" className={styles.waterfallItem} />
          <Skeleton variant="rounded" height="220px" className={styles.waterfallItem} />
          <Skeleton variant="rounded" height="160px" className={styles.waterfallItem} />
        </div>
        <div className={styles.waterfallColumn}>
          <Skeleton variant="rounded" height="200px" className={styles.waterfallItem} />
          <Skeleton variant="rounded" height="180px" className={styles.waterfallItem} />
          <Skeleton variant="rounded" height="240px" className={styles.waterfallItem} />
        </div>
      </div>
    </div>
  )
}

const MemoizedHomeSkeleton = memo(HomeSkeleton)
MemoizedHomeSkeleton.displayName = 'HomeSkeleton'

export default MemoizedHomeSkeleton