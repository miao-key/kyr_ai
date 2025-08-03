import { Flex, Loading } from 'react-vant'
import styles from './loading-spinner.module.css'

/**
 * 通用加载组件
 * @param {string} type - 加载动画类型 'ball' | 'spinner' | 'circular'
 * @param {string} size - 尺寸 'small' | 'medium' | 'large'
 * @param {string} text - 加载文本
 * @param {boolean} fullScreen - 是否全屏显示
 * @param {object} style - 自定义样式
 */
const LoadingSpinner = ({ 
  type = 'ball', 
  size = 'medium',
  text,
  fullScreen = false,
  style = {},
  className = ''
}) => {
  const containerClass = fullScreen 
    ? styles.loadingFullscreen
    : styles.loadingContainer

  const sizeMap = {
    small: '16px',
    medium: '24px', 
    large: '32px'
  }

  return (
    <div className={`${containerClass} ${className}`} style={style}>
      <Flex.Item span={8}>
        <Loading 
          type={type} 
          size={sizeMap[size]}
          color="#6FE164"
        />
        {text && <div className={styles.loadingText}>{text}</div>}
      </Flex.Item>
    </div>
  )
}

export default LoadingSpinner