import { memo } from 'react'
import PropTypes from 'prop-types'
import styles from './skeleton.module.css'

/**
 * 通用骨架屏组件 - 高质量实现
 * 
 * 功能特性:
 * - 多种骨架屏类型（文本、图片、按钮、卡片等）
 * - 自定义尺寸和圆角
 * - 流畅的动画效果
 * - 响应式设计
 * - 可组合使用
 * 
 * @param {Object} props - 组件属性
 * @param {string} props.variant - 骨架屏类型 'text' | 'rectangular' | 'circular' | 'rounded'
 * @param {string|number} props.width - 宽度
 * @param {string|number} props.height - 高度
 * @param {boolean} props.animation - 是否显示动画
 * @param {string} props.className - 额外的CSS类名
 * @param {Object} props.style - 自定义样式
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  animation = true,
  className = '',
  style = {},
  ...restProps
}) => {
  // 根据variant设置默认尺寸
  const getDefaultSize = () => {
    switch (variant) {
      case 'text':
        return { width: '100%', height: '1em' }
      case 'circular':
        return { width: '40px', height: '40px' }
      case 'rectangular':
        return { width: '100%', height: '140px' }
      case 'rounded':
        return { width: '100%', height: '140px' }
      default:
        return { width: '100%', height: '20px' }
    }
  }

  const defaultSize = getDefaultSize()
  const finalWidth = width || defaultSize.width
  const finalHeight = height || defaultSize.height

  // 组合类名
  const skeletonClass = [
    styles.skeleton,
    styles[variant],
    animation ? styles.animation : '',
    className
  ].filter(Boolean).join(' ')

  // 组合样式
  const skeletonStyle = {
    width: finalWidth,
    height: finalHeight,
    ...style
  }

  return (
    <div
      className={skeletonClass}
      style={skeletonStyle}
      role="status"
      aria-label="加载中"
      {...restProps}
    />
  )
}

// PropTypes类型检查
Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'rectangular', 'circular', 'rounded']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  animation: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
}

// 使用 React.memo 优化性能
const MemoizedSkeleton = memo(Skeleton)
MemoizedSkeleton.displayName = 'Skeleton'

export default MemoizedSkeleton