import { useState, useRef, useEffect, memo } from 'react'
import LoadingSpinner from '../LoadingSpinner'
import styles from './lazy-image.module.css'

/**
 * 懒加载图片组件
 * @param {string} src - 图片地址
 * @param {string} alt - 图片描述
 * @param {string} placeholder - 占位图地址
 * @param {string} className - 样式类名
 * @param {object} style - 自定义样式
 * @param {Function} onLoad - 图片加载完成回调
 * @param {Function} onError - 图片加载失败回调
 * @param {number} timeout - 加载超时时间(ms)
 * @param {boolean} showLoading - 是否显示加载状态
 */
const LazyImage = memo(({ 
  src, 
  alt = '', 
  placeholder,
  className = '',
  style = {},
  onLoad,
  onError,
  timeout = 10000,
  showLoading = true,
  ...props 
}) => {
  const [status, setStatus] = useState('loading') // loading | loaded | error
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const imgRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!src) return

    setStatus('loading')
    
    // 创建新的图片对象预加载
    const img = new Image()
    
    // 设置超时
    timeoutRef.current = setTimeout(() => {
      setStatus('error')
      onError?.({ type: 'timeout', message: '图片加载超时' })
    }, timeout)
    
    img.onload = () => {
      clearTimeout(timeoutRef.current)
      setImageSrc(src)
      setStatus('loaded')
      onLoad?.(img)
    }
    
    img.onerror = (error) => {
      clearTimeout(timeoutRef.current)
      setStatus('error')
      setImageSrc(placeholder || '')
      onError?.(error)
    }
    
    img.src = src
    
    return () => {
      clearTimeout(timeoutRef.current)
      img.onload = null
      img.onerror = null
    }
  }, [src, placeholder, timeout, onLoad, onError])

  const handleImageLoad = () => {
    if (status === 'loaded') {
      // 图片在DOM中加载完成
      imgRef.current?.classList.add(styles.fadeIn)
    }
  }

  return (
    <div className={`${styles.lazyImageContainer} ${className}`} style={style}>
      {/* 加载状态 */}
      {status === 'loading' && showLoading && (
        <div className={styles.lazyImageLoading}>
          <LoadingSpinner size="small" />
        </div>
      )}
      
      {/* 图片 */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${styles.lazyImage} ${styles[status]}`}
        onLoad={handleImageLoad}
        style={{ 
          display: status === 'loading' && showLoading ? 'none' : 'block'
        }}
        {...props}
      />
      
      {/* 错误状态 */}
      {status === 'error' && !placeholder && (
        <div className={styles.lazyImageError}>
          <span>图片加载失败</span>
        </div>
      )}
    </div>
  )
})

LazyImage.displayName = 'LazyImage'

export default LazyImage