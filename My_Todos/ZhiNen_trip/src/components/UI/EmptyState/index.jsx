import { Button } from 'react-vant'
import styles from './empty-state.module.css'

/**
 * 空状态组件
 * @param {string} type - 空状态类型 'noData' | 'noNetwork' | 'error' | 'noResults'
 * @param {string} title - 标题
 * @param {string} description - 描述
 * @param {string} image - 自定义图片
 * @param {string} actionText - 操作按钮文本
 * @param {Function} onAction - 操作按钮回调
 * @param {object} style - 自定义样式
 */
const EmptyState = ({
  type = 'noData',
  title,
  description,
  image,
  actionText,
  onAction,
  style = {},
  className = ''
}) => {
  const emptyConfig = {
    noData: {
      emoji: '📭',
      defaultTitle: '暂无数据',
      defaultDescription: '当前没有任何数据'
    },
    noNetwork: {
      emoji: '📶',
      defaultTitle: '网络连接失败',
      defaultDescription: '请检查网络连接后重试'
    },
    error: {
      emoji: '❌',
      defaultTitle: '出错了',
      defaultDescription: '服务暂时不可用，请稍后重试'
    },
    noResults: {
      emoji: '🔍',
      defaultTitle: '没有搜索结果',
      defaultDescription: '试试其他关键词吧'
    }
  }

  const config = emptyConfig[type] || emptyConfig.noData
  const displayTitle = title || config.defaultTitle
  const displayDescription = description || config.defaultDescription

  return (
    <div className={`${styles.emptyState} ${className}`} style={style}>
      <div className={styles.emptyContent}>
        {/* 图片或emoji */}
        <div className={styles.emptyImage}>
          {image ? (
            <img src={image} alt={displayTitle} />
          ) : (
            <span className={styles.emptyEmoji}>{config.emoji}</span>
          )}
        </div>
        
        {/* 标题 */}
        <h3 className={styles.emptyTitle}>{displayTitle}</h3>
        
        {/* 描述 */}
        {displayDescription && (
          <p className={styles.emptyDescription}>{displayDescription}</p>
        )}
        
        {/* 操作按钮 */}
        {actionText && onAction && (
          <div className={styles.emptyAction}>
            <Button 
              type="primary" 
              size="small"
              onClick={onAction}
              className={styles.emptyButton}
            >
              {actionText}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmptyState