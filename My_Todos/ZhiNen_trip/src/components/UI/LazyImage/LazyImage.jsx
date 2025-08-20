/**
 * 高性能图片懒加载组件
 * 功能特性:
 * - Intersection Observer API 实现懒加载
 * - 渐进式图片质量提升
 * - 错误处理和重试机制
 * - 骨架屏占位符
 * - WebP 格式支持检测
 * - 响应式图片支持
 * - 内存优化
 */

import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import PropTypes from 'prop-types'
import styles from './lazy-image.module.css'

const LazyImage = memo(({
  src,
  alt = '',
  className = '',
  placeholder,
  fallback,
  quality = 'medium',
  loading = 'lazy',
  retryCount = 3,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  progressive = false,
  webpSupport = true,
  responsive = false,
  sizes,
  srcSet,
  style = {},
  ...props
}) => {
  const [loadState, setLoadState] = useState('idle') // idle, loading, loaded, error
  const [imageSrc, setImageSrc] = useState('')
  const [retries, setRetries] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const [supportsWebP, setSupportsWebP] = useState(false)
  
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  // 检测 WebP 支持
  useEffect(() => {
    if (!webpSupport) return

    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const dataURL = canvas.toDataURL('image/webp')
      setSupportsWebP(dataURL.indexOf('data:image/webp') === 0)
    }

    checkWebPSupport()
  }, [webpSupport])

  // 获取优化后的图片 URL
  const getOptimizedImageUrl = useCallback((originalSrc) => {
    if (!originalSrc) return ''

    // 如果支持 WebP 且原图不是 WebP，尝试转换
    if (supportsWebP && webpSupport && !originalSrc.includes('.webp')) {
      // 这里可以根据实际的图片服务配置 WebP 转换
      // 示例：如果使用 CDN 服务，可能需要添加参数
      return originalSrc // 暂时返回原图，可根据具体 CDN 配置修改
    }

    return originalSrc
  }, [supportsWebP, webpSupport])

  // 获取渐进式图片 URL（低质量版本用于预览）
  const getProgressiveImageUrl = useCallback((originalSrc, isLowQuality = false) => {
    if (!progressive || !originalSrc) return originalSrc

    // 这里可以根据实际的图片服务配置不同质量
    // 示例：添加质量参数
    if (isLowQuality) {
      // 返回低质量版本用于快速预览
      return originalSrc // + '?quality=20&blur=5' // 根据实际CDN配置
    }

    return originalSrc
  }, [progressive])

  // 图片加载处理
  const handleImageLoad = useCallback(() => {
    setLoadState('loaded')
    onLoad?.(imgRef.current)
  }, [onLoad])

  // 图片错误处理
  const handleImageError = useCallback(() => {
    if (retries < retryCount) {
      setRetries(prev => prev + 1)
      setTimeout(() => {
        setLoadState('loading')
        setImageSrc(getOptimizedImageUrl(src))
      }, 1000 * Math.pow(2, retries)) // 指数退避重试
    } else {
      setLoadState('error')
      onError?.(imgRef.current)
    }
  }, [retries, retryCount, src, getOptimizedImageUrl, onError])

  // Intersection Observer 设置
  useEffect(() => {
    if (!imgRef.current || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        threshold: threshold,
        rootMargin: rootMargin
      }
    )

    observer.observe(imgRef.current)
    observerRef.current = observer

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, isInView])

  // 开始加载图片
  useEffect(() => {
    if (isInView && src && loadState === 'idle') {
      setLoadState('loading')
      
      if (progressive) {
        // 先加载低质量版本
        const lowQualityUrl = getProgressiveImageUrl(src, true)
        setImageSrc(lowQualityUrl)
        
        // 然后预加载高质量版本
        const highQualityImg = new Image()
        highQualityImg.onload = () => {
          setImageSrc(getOptimizedImageUrl(src))
        }
        highQualityImg.onerror = handleImageError
        highQualityImg.src = getOptimizedImageUrl(src)
      } else {
        setImageSrc(getOptimizedImageUrl(src))
      }
    }
  }, [
    isInView, 
    src, 
    loadState, 
    progressive, 
    getProgressiveImageUrl, 
    getOptimizedImageUrl, 
    handleImageError
  ])

  // 清理函数
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  // 渲染占位符
  const renderPlaceholder = () => {
    if (placeholder) {
      return typeof placeholder === 'string' ? (
        <img src={placeholder} alt="" className={styles.placeholder} />
      ) : (
        placeholder
      )
    }

    return (
      <div className={styles.skeletonPlaceholder}>
        <div className={styles.skeletonShimmer}></div>
      </div>
    )
  }

  // 渲染错误状态
  const renderError = () => {
    if (fallback) {
      return typeof fallback === 'string' ? (
        <img src={fallback} alt={alt} className={styles.errorImage} />
      ) : (
        fallback
      )
    }

    return (
      <div className={styles.errorPlaceholder}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorText}>加载失败</div>
        {retries < retryCount && (
          <button
            className={styles.retryButton}
            onClick={() => {
              setLoadState('idle')
              setRetries(0)
            }}
          >
            重试
          </button>
        )}
      </div>
    )
  }

  // 组合样式类
  const containerClasses = [
    styles.lazyImageContainer,
    className,
    loadState === 'loading' ? styles.loading : '',
    loadState === 'loaded' ? styles.loaded : '',
    loadState === 'error' ? styles.error : ''
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={imgRef}
      className={containerClasses}
      style={style}
      {...props}
    >
      {loadState === 'idle' || loadState === 'loading' ? (
        <>
          {renderPlaceholder()}
          {imageSrc && (
            <img
              src={imageSrc}
              alt={alt}
              srcSet={responsive ? srcSet : undefined}
              sizes={responsive ? sizes : undefined}
              loading={loading}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={styles.image}
            />
          )}
        </>
      ) : loadState === 'loaded' && imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          srcSet={responsive ? srcSet : undefined}
          sizes={responsive ? sizes : undefined}
          loading={loading}
          className={styles.image}
        />
      ) : (
        renderError()
      )}
    </div>
  )
})

LazyImage.displayName = 'LazyImage'

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  fallback: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  quality: PropTypes.oneOf(['low', 'medium', 'high']),
  loading: PropTypes.oneOf(['lazy', 'eager']),
  retryCount: PropTypes.number,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  progressive: PropTypes.bool,
  webpSupport: PropTypes.bool,
  responsive: PropTypes.bool,
  sizes: PropTypes.string,
  srcSet: PropTypes.string,
  style: PropTypes.object
}

export default LazyImage