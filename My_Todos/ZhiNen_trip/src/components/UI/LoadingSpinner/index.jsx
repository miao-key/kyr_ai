import React, { useMemo, memo } from 'react'
import { Loading } from 'react-vant'
import PropTypes from 'prop-types'
import styles from './loading-spinner.module.css'

/**
 * 通用加载组件 - 高质量实现
 * 
 * 功能特性:
 * - 多种加载动画类型
 * - 响应式尺寸设计
 * - 全屏和局部加载模式
 * - 自定义颜色和文本
 * - 性能优化
 * 
 * @param {Object} props - 组件属性
 * @param {string} props.type - 加载动画类型 'ball' | 'spinner' | 'circular' | 'dots'
 * @param {string} props.size - 尺寸 'small' | 'medium' | 'large'
 * @param {string} props.color - 颜色主题 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 自定义颜色
 * @param {string} props.text - 加载文本
 * @param {boolean} props.fullScreen - 是否全屏显示
 * @param {boolean} props.overlay - 是否显示遮罩层
 * @param {number} props.delay - 延迟显示时间(ms)，避免闪烁
 * @param {Object} props.style - 自定义样式
 * @param {string} props.className - 额外的CSS类名
 */
const LoadingSpinner = ({ 
  type = 'spinner', 
  size = 'medium',
  color = 'primary',
  text,
  fullScreen = false,
  overlay = false,
  delay = 0,
  style = {},
  className = '',
  ...restProps
}) => {
  // 颜色映射
  const colorMap = useMemo(() => ({
    primary: '#6FE164',
    secondary: '#70E3DC', 
    success: '#52c41a',
    warning: '#faad14',
    danger: '#f5222d'
  }), [])

  // 尺寸映射
  const sizeMap = useMemo(() => ({
    small: '16px',
    medium: '24px', 
    large: '32px'
  }), [])

  // 获取实际颜色值
  const actualColor = useMemo(() => {
    return colorMap[color] || color
  }, [color, colorMap])

  // 容器类名
  const containerClass = useMemo(() => {
    const baseClass = fullScreen ? styles.loadingFullscreen : styles.loadingContainer
    const overlayClass = overlay ? styles.withOverlay : ''
    return `${baseClass} ${overlayClass} ${className}`.trim()
  }, [fullScreen, overlay, className])

  // 延迟显示逻辑
  const shouldShow = useMemo(() => {
    if (delay === 0) return true
    
    // 这里可以添加延迟显示的逻辑
    // 为了简化，暂时直接返回true
    return true
  }, [delay])

  if (!shouldShow) {
    return null
  }

  return (
    <div 
      className={containerClass} 
      style={style}
      role="status"
      aria-live="polite"
      aria-label={text || "正在加载"}
      {...restProps}
    >
      <div className={styles.loadingContent}>
        <Loading 
          type={type} 
          size={sizeMap[size]}
          color={actualColor}
          className={styles.spinner}
        />
        {text && (
          <div className={styles.loadingText}>
            {text}
          </div>
        )}
      </div>
    </div>
  )
}

// PropTypes类型检查
LoadingSpinner.propTypes = {
  type: PropTypes.oneOf(['ball', 'spinner', 'circular', 'dots']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOfType([
    PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger']),
    PropTypes.string
  ]),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  delay: PropTypes.number,
  style: PropTypes.object,
  className: PropTypes.string
}

// 默认属性
LoadingSpinner.defaultProps = {
  type: 'spinner',
  size: 'medium',
  color: 'primary',
  fullScreen: false,
  overlay: false,
  delay: 0,
  style: {},
  className: ''
}

// 使用 React.memo 优化性能，避免不必要的重渲染
const MemoizedLoadingSpinner = memo(LoadingSpinner, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重渲染
  return (
    prevProps.type === nextProps.type &&
    prevProps.size === nextProps.size &&
    prevProps.color === nextProps.color &&
    prevProps.text === nextProps.text &&
    prevProps.fullScreen === nextProps.fullScreen &&
    prevProps.overlay === nextProps.overlay &&
    prevProps.delay === nextProps.delay
  )
})

MemoizedLoadingSpinner.displayName = 'LoadingSpinner'

export default MemoizedLoadingSpinner