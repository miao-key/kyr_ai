import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react'
import { Image, Loading, Empty, Button } from 'react-vant'
import { LikeO, Star, ChatO, Location, Edit } from '@react-vant/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import useTitle from '@/hooks/useTitle'
import useThrottle from '@/hooks/useThrottle'
import { getMixedTravelContent } from '@/api/pexels'
import styles from './article.module.css'

// 图片源配置 - 多个备用源提高稳定性，本地回退优先
const IMAGE_SOURCES = [
  {
    name: 'local-fallback',
    baseUrl: 'data:image/svg+xml',
    generateUrl: (width, height, id) => {
      // 创建更美观的占位符图片，根据尺寸判断是头像还是普通图片
      const isAvatar = width <= 100 && height <= 100
      
      const svgContent = isAvatar ? 
        // 头像样式
        `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle cx="50%" cy="50%" r="50%" fill="url(#avatarGrad)"/>
          <text x="50%" y="60%" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="white" text-anchor="middle" font-weight="600">👤</text>
        </svg>` :
        // 普通图片样式  
        `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.6" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)"/>
          <circle cx="50%" cy="40%" r="20" fill="white" opacity="0.3"/>
          <text x="50%" y="65%" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="white" text-anchor="middle" font-weight="500">🌟 精彩旅程</text>
        </svg>`
      
      // 使用 encodeURIComponent 替代 btoa 来处理中文字符
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
    },
    fallback: true
  },
  {
    name: 'picsum',
    baseUrl: 'https://picsum.photos',
    generateUrl: (width, height, id) => `https://picsum.photos/${width}/${height}?random=${id}`,
    fallback: true
  },
  {
    name: 'unsplash',
    baseUrl: 'https://source.unsplash.com',
    generateUrl: (width, height, id) => `https://source.unsplash.com/${width}x${height}/?travel,nature&sig=${id}`,
    fallback: true
  }
]

// 网络状态检测Hook
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState('unknown')

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 检测连接类型（如果支持）
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown')
        const handleConnectionChange = () => {
          setConnectionType(connection.effectiveType || 'unknown')
        }
        connection.addEventListener('change', handleConnectionChange)
        
        return () => {
          window.removeEventListener('online', handleOnline)
          window.removeEventListener('offline', handleOffline)
          connection.removeEventListener('change', handleConnectionChange)
        }
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, connectionType }
}

// 生成优化的图片URL
const generateOptimizedImageUrl = (width, height, id, sourceIndex = 0) => {
  const source = IMAGE_SOURCES[sourceIndex] || IMAGE_SOURCES[0]
  return source.generateUrl(width, height, id)
}

// 图片预加载工具函数
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// 批量预加载图片
const preloadImages = async (urls, maxConcurrent = 3) => {
  const results = []
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent)
    const batchPromises = batch.map(url => 
      preloadImage(url).catch(err => {
        console.warn(`预加载失败: ${url}`, err)
        return null
      })
    )
    const batchResults = await Promise.allSettled(batchPromises)
    results.push(...batchResults)
  }
  return results
}

// 简单的Toast组件
const SimpleToast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: type === 'success' ? '#52c41a' : '#1890ff',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      zIndex: 9999,
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'fadeInOut 2s ease-in-out'
    }}>
      {message}
    </div>
  )
}

// 图片加载骨架屏组件
const ImageSkeleton = () => (
  <div className={styles.imageSkeleton}>
    <div className={styles.skeletonContent}>
      <div className={styles.skeletonShimmer}></div>
    </div>
  </div>
)

// 检查图片URL有效性
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  
  // 检查是否是有效的URL格式
  try {
    new URL(url)
  } catch {
    return false
  }
  
  // 检查是否是图片格式
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
  const urlLower = url.toLowerCase()
  const hasImageExtension = imageExtensions.some(ext => urlLower.includes(ext))
  const hasImageInPath = urlLower.includes('image') || urlLower.includes('photo') || urlLower.includes('picture')
  
  return hasImageExtension || hasImageInPath || url.startsWith('data:image/')
}

// 自定义图片组件，支持加载状态和重试机制
const CustomImage = ({ src, alt, className, onClick, onLoadStatusChange, width = 400, height = 300, imageId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [minLoadTimeComplete, setMinLoadTimeComplete] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [sourceIndex, setSourceIndex] = useState(0)
  const timeoutRef = useRef(null)
  const loadStartTimeRef = useRef(Date.now())
  const imgRef = useRef(null)
  const maxRetries = IMAGE_SOURCES.length * 2 // 每个源尝试2次
  const { isOnline, connectionType } = useNetworkStatus()
  
  // 重试加载图片的函数
  const retryLoadImage = useCallback(() => {
    if (retryCount < maxRetries) {
      const newRetryCount = retryCount + 1
      setRetryCount(newRetryCount)
      setIsLoading(true)
      setHasError(false)
      setShowImage(false)
      setMinLoadTimeComplete(false)
      
      // 重新设计重试策略：优先尝试真实图片，失败后使用占位符
      let newSourceIndex = 1 // 默认尝试 picsum
      if (newRetryCount === 1 && isOnline) {
        newSourceIndex = 1 // 首次重试使用 picsum
      } else if (newRetryCount === 2 && isOnline) {
        newSourceIndex = 2 // 第二次重试使用 unsplash
      } else {
        newSourceIndex = 0 // 最后使用本地回退
      }
      setSourceIndex(newSourceIndex)
      
      let newSrc
      if (imageId) {
        // 使用优化的图片URL生成器
        newSrc = generateOptimizedImageUrl(width, height, `${imageId}-${newRetryCount}`, newSourceIndex)
      } else {
        // 在原URL基础上添加重试参数
        newSrc = `${src}${src.includes('?') ? '&' : '?'}retry=${newRetryCount}&t=${Date.now()}&source=${newSourceIndex}`
      }
      
      console.log(`图片加载重试第${newRetryCount}次，使用源: ${IMAGE_SOURCES[newSourceIndex].name}`)
      setCurrentSrc(newSrc)
    } else {
      if (!isOnline) {
        console.warn('网络离线，使用本地回退图片')
        // 网络离线时直接使用本地回退
        const fallbackSrc = generateOptimizedImageUrl(width, height, `fallback-${imageId || 'default'}`, 0)
        setCurrentSrc(fallbackSrc)
        setRetryCount(0)
        return
      } else {
        console.warn(`图片加载失败，已达到最大重试次数: ${src}`)
      }
      setIsLoading(false)
      setHasError(true)
      setShowImage(false)
      onLoadStatusChange?.(false)
    }
  }, [src, retryCount, maxRetries, onLoadStatusChange, isOnline, imageId, width, height])

  // 检查图片URL并初始化状态
  useEffect(() => {
    // 立即检查URL有效性
    if (!isValidImageUrl(src)) {
      console.warn(`无效的图片URL: ${src}`)
      setIsLoading(false)
      setHasError(true)
      setShowImage(false)
      onLoadStatusChange?.(false)
      return
    }
    
    // 重置状态，首先尝试加载真实图片
    setIsLoading(true)
    setHasError(false)
    setShowImage(false)
    setMinLoadTimeComplete(false)
    setRetryCount(0)
    
    // 初始化时优先尝试真实图片（如果在线）
    if (isOnline && imageId) {
      setSourceIndex(1) // 使用 picsum 作为首选
      const realImageSrc = generateOptimizedImageUrl(width, height, imageId, 1)
      setCurrentSrc(realImageSrc)
    } else if (imageId) {
      setSourceIndex(0) // 离线时使用本地回退
      const localSrc = generateOptimizedImageUrl(width, height, imageId, 0)
      setCurrentSrc(localSrc)
    } else {
      setSourceIndex(0)
      setCurrentSrc(src)
    }
    loadStartTimeRef.current = Date.now()
    
    const timer = setTimeout(() => {
      setMinLoadTimeComplete(true)
    }, 600)
    
    // 根据网络类型调整超时时间
    const getTimeoutDuration = () => {
      if (!isOnline) return 5000 // 离线时快速失败
      switch (connectionType) {
        case 'slow-2g': return 30000 // 30秒
        case '2g': return 25000 // 25秒
        case '3g': return 15000 // 15秒
        case '4g': return 10000 // 10秒
        default: return 12000 // 默认12秒
      }
    }
    
    timeoutRef.current = setTimeout(() => {
      console.warn(`图片加载超时 (${connectionType}): ${src}`)
      // 超时时自动重试
      retryLoadImage()
    }, getTimeoutDuration())
    
    return () => {
      clearTimeout(timer)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [src, onLoadStatusChange, retryLoadImage])
  
  const handleLoad = useCallback(() => {
    // 清除超时定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // 通知父组件图片加载成功
    onLoadStatusChange?.(true)
    
    if (minLoadTimeComplete) {
      // 先显示图片，然后延迟隐藏加载状态，实现平滑过渡
      setShowImage(true)
      setTimeout(() => {
        setIsLoading(false)
        setHasError(false)
      }, 200) // 200ms延迟，让淡入动画完成
    } else {
      const elapsed = Date.now() - loadStartTimeRef.current
      const remainingTime = Math.max(100, 600 - elapsed)
      
      setTimeout(() => {
        setShowImage(true)
        setTimeout(() => {
          setIsLoading(false)
          setHasError(false)
        }, 200)
      }, remainingTime)
    }
  }, [minLoadTimeComplete, onLoadStatusChange])
  
  const handleError = useCallback(() => {
    console.warn(`图片加载失败: ${currentSrc}`)
    
    // 清除超时定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // 尝试重试
    if (retryCount < maxRetries) {
      setTimeout(() => {
        retryLoadImage()
      }, 1000 * (retryCount + 1)) // 递增延迟重试：1s, 2s, 3s
    } else {
      // 达到最大重试次数，通知父组件加载失败
      onLoadStatusChange?.(false)
      setIsLoading(false)
      setHasError(true) 
      setShowImage(false)
    }
  }, [currentSrc, retryCount, maxRetries, retryLoadImage, onLoadStatusChange])
  
  const handleClick = () => {
    if (!isLoading && !hasError) {
      // 移除Toast提示，直接处理点击事件
      console.log('查看大图')
    }
  }
  
  // 图片加载失败时，仍然返回容器，但不显示任何内容
  // 因为父组件会根据加载状态来控制整个图片区域的显示隐藏

  // 如果图片加载失败，返回空的div（父组件会隐藏整个图片区域）
  if (hasError) {
    return <div className={className} style={{ display: 'none' }}></div>
  }

  // 使用固定纵横比容器，避免图片未加载时高度不确定导致与骨架叠加
  const aspectRatio = `${width} / ${height}`
  return (
    <div className={className} style={{ position: 'relative', width: '100%', aspectRatio, overflow: 'hidden', borderRadius: '12px' }}>
      {/* 骨架屏 - 添加淡出效果 */}
      {isLoading && (
        <div 
          className={styles.imageSkeleton}
          style={{
            opacity: showImage ? 0 : 1,
            transition: 'opacity 0.3s ease-out',
            zIndex: 2
          }}
        >
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonShimmer}></div>
          </div>
        </div>
      )}
      
      {/* 重试提示 */}
      {isLoading && retryCount > 0 && (
        <div 
          className={styles.retryIndicator}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '60px'
          }}
        >
          <div>重试 {retryCount}/{maxRetries}</div>
          <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
            {IMAGE_SOURCES[sourceIndex]?.name || '默认'}
          </div>
        </div>
      )}

      {/* 网络状态提示 */}
      {!isOnline && (
        <div 
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            zIndex: 3
          }}
        >
          📵 网络离线
        </div>
      )}

      {/* 图片 - 添加淡入效果 */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={styles.fadeInImage}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showImage && !hasError ? 1 : 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer',
          transition: 'opacity 0.4s ease-in',
          transform: showImage && !hasError ? 'scale(1)' : 'scale(1.02)',
          transitionProperty: 'opacity, transform',
          transitionDuration: '0.4s',
          transitionTimingFunction: 'ease-out',
          visibility: showImage && !hasError ? 'visible' : 'hidden'
        }}
        onLoad={handleLoad}
        onError={handleError}
        onClick={handleClick}
        loading="lazy"
        decoding="async"
      />
      
      {/* 手动重试按钮 */}
      {hasError && (
        <div 
          className={styles.errorOverlay}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(248, 249, 250, 0.95)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4,
            cursor: 'pointer',
            transition: 'opacity 0.3s ease-in'
          }}
          onClick={() => {
            setRetryCount(0)
            retryLoadImage()
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>🖼️</div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>图片加载失败</div>
          <div style={{ 
            fontSize: '12px', 
            color: '#667eea', 
            padding: '4px 12px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #667eea'
          }}>
            点击重试
          </div>
        </div>
      )}
    </div>
  )
}

// 自定义头像组件，支持加载状态和重试机制
const CustomAvatar = ({ src, alt, className, width = 80, height = 80, imageId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showAvatar, setShowAvatar] = useState(false)
  const [minLoadTimeComplete, setMinLoadTimeComplete] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [sourceIndex, setSourceIndex] = useState(0)
  const timeoutRef = useRef(null)
  const maxRetries = Math.min(IMAGE_SOURCES.length, 2) // 头像重试次数较少
  const { isOnline } = useNetworkStatus()
  
  // 重试加载头像的函数
  const retryLoadAvatar = useCallback(() => {
    if (retryCount < maxRetries) {
      const newRetryCount = retryCount + 1
      setRetryCount(newRetryCount)
      setIsLoading(true)
      setHasError(false)
      setShowAvatar(false)
      setMinLoadTimeComplete(false)
      
      // 头像重试策略：先尝试真实图片，最后使用占位符
      let newSourceIndex = 1 // 默认尝试 picsum
      if (newRetryCount === 1 && isOnline) {
        newSourceIndex = 1 // 首次重试使用 picsum
      } else {
        newSourceIndex = 0 // 最后使用本地回退
      }
      setSourceIndex(newSourceIndex)
      
      let newSrc
      if (imageId) {
        newSrc = generateOptimizedImageUrl(width, height, `avatar-${imageId}-${newRetryCount}`, newSourceIndex)
      } else {
        newSrc = `${src}${src.includes('?') ? '&' : '?'}retry=${newRetryCount}&t=${Date.now()}&source=${newSourceIndex}`
      }
      
      console.log(`头像重试第${newRetryCount}次，使用源: ${IMAGE_SOURCES[newSourceIndex].name}`)
      setCurrentSrc(newSrc)
    } else {
      console.warn(`头像加载失败，停止重试: ${src}`)
      setIsLoading(false)
      setHasError(true)
      setShowAvatar(false)
    }
  }, [src, retryCount, maxRetries, isOnline, imageId, width, height])

  // 检查头像URL并初始化状态
  useEffect(() => {
    // 立即检查URL有效性
    if (!isValidImageUrl(src)) {
      console.warn(`无效的头像URL: ${src}`)
      setIsLoading(false)
      setHasError(true)
      setShowAvatar(false)
      return
    }
    
    // 重置状态，头像也优先尝试真实图片
    setIsLoading(true)
    setHasError(false)
    setShowAvatar(false)
    setMinLoadTimeComplete(false)
    setRetryCount(0)
    
    // 头像初始化时也优先尝试真实图片
    if (isOnline && imageId) {
      setSourceIndex(1) // 使用 picsum 作为首选
      const realAvatarSrc = generateOptimizedImageUrl(width, height, `avatar-${imageId}`, 1)
      setCurrentSrc(realAvatarSrc)
    } else if (imageId) {
      setSourceIndex(0) // 离线时使用本地回退
      const localAvatarSrc = generateOptimizedImageUrl(width, height, `avatar-${imageId}`, 0)
      setCurrentSrc(localAvatarSrc)
    } else {
      setSourceIndex(0)
      setCurrentSrc(src)
    }
    
    const timer = setTimeout(() => {
      setMinLoadTimeComplete(true)
    }, 400)
    
    // 头像超时时间设为8秒（相对较短）
    timeoutRef.current = setTimeout(() => {
      console.warn(`头像加载超时: ${src}`)
      retryLoadAvatar()
    }, 8000)
    
    return () => {
      clearTimeout(timer)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [src, retryLoadAvatar])
  
  const handleLoad = useCallback(() => {
    // 清除超时定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    if (minLoadTimeComplete) {
      setShowAvatar(true)
      setTimeout(() => {
        setIsLoading(false)
        setHasError(false)
      }, 150) // 稍微短一些的延迟
    } else {
      setTimeout(() => {
        setShowAvatar(true)
        setTimeout(() => {
          setIsLoading(false)
          setHasError(false)
        }, 150)
      }, Math.max(100, 400))
    }
  }, [minLoadTimeComplete])
  
  const handleError = useCallback(() => {
    console.warn(`头像加载失败: ${currentSrc}`)
    
    // 清除超时定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // 尝试重试
    if (retryCount < maxRetries) {
      setTimeout(() => {
        retryLoadAvatar()
      }, 500 * (retryCount + 1)) // 较短的重试延迟
    } else {
      setIsLoading(false)
      setHasError(true)
      setShowAvatar(false)
    }
  }, [currentSrc, retryCount, maxRetries, retryLoadAvatar])
  
  return (
    <div style={{ position: 'relative', width: '42px', height: '42px' }}>
      {/* 头像骨架屏 - 只在非错误状态下显示 */}
      {isLoading && !hasError && (
        <div 
          className={styles.avatarSkeleton}
          style={{
            opacity: showAvatar ? 0 : 1,
            transition: 'opacity 0.25s ease-out',
            zIndex: 2
          }}
        />
      )}
      
      {/* 错误状态 - 确保在最上层 */}
      {hasError && (
        <div 
          className={styles.avatarSkeleton} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '16px',
            opacity: 1,
            transition: 'opacity 0.25s ease-in',
            zIndex: 3,
            backgroundColor: '#f5f5f5'
          }}
        >
          👤
        </div>
      )}
      
      {/* 头像图片 - 添加淡入效果 */}
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        style={{
          opacity: showAvatar && !hasError ? 1 : 0,
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: '2px solid #e3f2fd',
          objectFit: 'cover',
          objectPosition: 'center center',
          transition: 'opacity 0.3s ease-in',
          transform: showAvatar && !hasError ? 'scale(1)' : 'scale(1.05)',
          transitionProperty: 'opacity, transform',
          transitionDuration: '0.3s',
          transitionTimingFunction: 'ease-out'
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

// 将TravelCard组件移到外部，避免每次父组件渲染时重新创建
const TravelCard = memo(({ article, onLike, onCollect, onFollow, isAuthenticated = true }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(null) // null=未知, true=成功, false=失败
  
  // 组件挂载后触发进入动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100) // 短暂延迟，让DOM完成渲染
    
    return () => clearTimeout(timer)
  }, [])
  
  // 处理图片加载状态变化
  const handleImageLoadStatus = useCallback((success) => {
    setImageLoaded(success)
  }, [])

  return (
    <div 
      className={`${styles.travelCard} ${isVisible ? styles.cardVisible : styles.cardHidden}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
      }}
    >
      {/* 卡片头部 */}
      <div className={styles.cardHeader}>
        <div className={styles.userInfo}>
          <CustomAvatar
            src={article.user.avatar}
            alt={article.user.name}
            className={styles.userAvatar}
            width={80}
            height={80}
            imageId={article.user.avatarId}
          />
          <div className={styles.userDetails}>
            <h4 className={styles.userName}>{article.user.name}</h4>
            <p className={styles.userTime}>{article.time}</p>
          </div>
        </div>
        {isAuthenticated && (
          <button 
            className={`${styles.followBtn} ${article.user.isFollowed ? styles.followed : ''}`}
            onClick={() => onFollow(article.user.id)}
          >
            {article.user.isFollowed ? '已关注' : '+ 关注'}
          </button>
        )}
      </div>

      {/* 卡片内容 */}
      <div className={styles.cardContent}>
        <p className={styles.contentText}>{article.content}</p>
        
        {/* 图片展示 - 只有当图片未加载失败时才显示 */}
        {article.images && article.images.length > 0 && imageLoaded !== false && (
          <div className={styles.contentImages}>
            <CustomImage
              src={article.images[0].src?.medium || article.images[0].url}
              alt={article.images[0].alt || '旅行图片'}
              className={styles.singleImage}
              width={article.images[0].width || 400}
              height={article.images[0].height || 300}
              imageId={article.images[0].imageId}
              onLoadStatusChange={handleImageLoadStatus}
            />
          </div>
        )}

        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className={styles.contentTags}>
            {article.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* 卡片底部 */}
      <div className={styles.cardFooter}>
        <div className={styles.actionButtons}>
          <button 
            className={`${styles.actionBtn} ${article.isLiked ? styles.liked : ''}`}
          onClick={() => onLike(article.id)}
          >
            <LikeO /> {article.likes}
          </button>
          <button 
            className={`${styles.actionBtn} ${article.isCollected ? styles.collected : ''}`}
          onClick={() => onCollect(article.id)}
          >
            <Star /> {article.collections}
          </button>
          <button className={styles.actionBtn}>
            <ChatO /> {article.comments}
          </button>
        </div>
        <div className={styles.locationTag}>
          <Location size={12} />
          {article.location}
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // 自定义比较函数：返回true表示不需要重新渲染，返回false表示需要重新渲染
  const prev = prevProps.article
  const next = nextProps.article
  
  // 如果这些关键属性没有变化，就不需要重新渲染
  const isEqual = (
    prev.id === next.id &&
    prev.isLiked === next.isLiked &&
    prev.isCollected === next.isCollected &&
    prev.likes === next.likes &&
    prev.collections === next.collections &&
    prev.user.isFollowed === next.user.isFollowed &&
    prevProps.onLike === nextProps.onLike &&
    prevProps.onCollect === nextProps.onCollect &&
    prevProps.onFollow === nextProps.onFollow
  )
  
  return isEqual
})

const Article = () => {
  useTitle('智旅-旅记')
  const navigate = useNavigate()
  
  // 获取认证状态
  const { isAuthenticated } = useAuthStore()
  
  // 根据登录状态决定初始标签
  const defaultTab = isAuthenticated ? '关注' : '衣'
  
  // 状态管理
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false) // 添加首次加载标记
  const [isSwitching, setIsSwitching] = useState(false) // 添加切换状态标记
  const [toastMessage, setToastMessage] = useState('') // Toast消息状态
  const [showToast, setShowToast] = useState(false) // Toast显示状态
  const [toastType, setToastType] = useState('info') // Toast类型
  const [currentToastMessage, setCurrentToastMessage] = useState('') // 当前显示的Toast消息
  const isMountedRef = useRef(true)
  const isUpdatingRef = useRef(false) // 添加更新状态锁

  // 使用useEffect处理Toast显示，避免在渲染过程中调用
  useEffect(() => {
    if (toastMessage) {
      // 设置Toast类型和显示状态
      setToastType(toastMessage.includes('成功') ? 'success' : 'info')
      setCurrentToastMessage(toastMessage)
      setShowToast(true)
      setToastMessage('') // 清空消息
    }
  }, [toastMessage])

  // 关闭Toast的处理函数
  const handleCloseToast = useCallback(() => {
    setShowToast(false)
  }, [])

  // 分类标签配置 - 根据登录状态过滤
  const allTabs = [
    { key: '关注', label: '关注', icon: '❤️' },
    { key: '衣', label: '衣', icon: '👗' },
    { key: '食', label: '食', icon: '🍽️' },
    { key: '住', label: '住', icon: '🏨' },
    { key: '行', label: '行', icon: '✈️' }
  ]
  
  // 根据登录状态过滤标签
  const tabs = isAuthenticated ? allTabs : allTabs.filter(tab => tab.key !== '关注')
  
  // 监听登录状态变化，调整activeTab
  useEffect(() => {
    if (!isAuthenticated && activeTab === '关注') {
      setActiveTab('衣') // 如果用户退出登录且当前在关注标签，切换到衣标签
    }
  }, [isAuthenticated, activeTab])

  // 根据分类生成用户数据
  const generateMockUser = (category = activeTab) => {
    const userNames = {
      '关注': [
        // 真实的年轻人名字 - 90后00后风格
        '小星星✨', '柠檬茶🍋', '晚风徐来', '云朵朵☁️', '小鹿撞心', '糖果盒子🍭',
        '月亮船🌙', '樱花飞舞🌸', '奶茶控💕', '小确幸', '暖阳如初☀️', '清风徐来',
        '小兔几🐰', '星河滚烫⭐', '甜甜圈🍩', '漫步云端', '小美好💫', '糖醋里脊',
        '柠檬不萌🍋', '月半小夜曲', '小幸运🍀', '温柔晚风', '软糖少女🍬', '阳光灿烂',
        '小可爱呀', '蜜桃气泡水🍑', '晚安好梦', '小确幸呀', '温暖如初', '甜甜的梦'
      ],
      '衣': [
        // 时尚穿搭博主风格名字
        'Chloe时尚记', 'Emma穿搭日记', 'Mia Style', '小仙女穿搭', 'Luna时尚笔记',
        'Grace优雅日常', 'Zoe搭配师', '时尚小公举👑', 'Iris穿搭分享', 'Ruby时尚志',
        'Amy Style Book', '穿搭小达人', 'Lily时尚手册', '时尚芭莎girl', 'Nora穿搭记',
        '小香风女孩', 'Ella Style', '时尚icon', 'Bella穿搭', '优雅小姐姐',
        'Kate时尚日记', '时尚小精灵', 'Sophia Style', '穿搭灵感家', 'Eva时尚生活'
      ],
      '食': [
        // 美食博主风格名字
        '吃货小仙女🧚‍♀️', '美食探险家🍜', '甜品控小姐姐🧁', '深夜食堂主', '美食家小雅',
        '料理研究生👩‍🍳', '吃遍天下', '美食日记本📖', '小厨娘日常', '味蕾冒险记',
        '美食猎人🔍', '甜品实验室', '厨房小白兔', '美食摄影师📷', '烘焙小达人👩‍🍳',
        '深夜放毒者', '美食种草机', '吃货联盟主', '料理小当家', '美食vlog主',
        '甜蜜生活家🍰', '食光记录者', '美食旅行家', '小食神', '味觉冒险家'
      ],
      '住': [
        // 居住生活博主风格名字
        '温馨小窝主🏠', '家居设计师Elena', '北欧风小姐姐', '装修日记本📝', '家的艺术家',
        '简约生活家', '家居博主Momo', '温暖的家💕', '生活美学家', '室内设计小达人',
        '家装灵感库', '居家达人', '温馨小屋主', '家的守护者', '生活方式博主',
        '家居收纳王', '舒适生活家', '家装小专家', '居住美学', '温暖生活录',
        '家的设计师', '生活品质家', '居家小能手', '温馨时光', '家居艺术家'
      ],
      '行': [
        // 旅行博主风格名字
        '背包客小雨☔', '旅行日记本📔', '远方的呼唤', '行走的相机📸', '旅途中的你',
        '流浪诗人🎒', '世界那么大', '旅行摄影师', '漫游者小鹿', '自由行达人',
        '徒步爱好者🥾', '旅行vlogger', '探索者日记', '远行的少年', '旅途记录者',
        '背包旅行家', '自驾游达人🚗', '户外探险家', '旅行故事家', '行者无疆',
        '旅途摄影师📷', '风景收集者', '旅行生活家', '远方和诗', '行走天涯客'
      ]
    }
    
    const names = userNames[category] || userNames['关注']
    
    const userId = Math.floor(Math.random() * 10000)
    return {
      id: userId,
      name: names[Math.floor(Math.random() * names.length)],
      avatar: generateOptimizedImageUrl(80, 80, `avatar-${userId}`, 0),
      avatarId: `avatar-${userId}`,
      // 关注导航下的用户都是已关注状态
      isFollowed: category === '关注' ? true : Math.random() > 0.7,
      location: [
        '上海·静安', '北京·朝阳', '广州·天河', '深圳·南山', '杭州·西湖', 
        '成都·锦江', '西安·雁塔', '大理·古城', '厦门·思明', '青岛·市南',
        '苏州·姑苏', '南京·秦淮', '武汉·江汉', '长沙·岳麓', '重庆·渝中',
        '昆明·五华', '三亚·吉阳', '桂林·象山', '丽江·古城', '张家界·永定'
      ][Math.floor(Math.random() * 20)]
    }
  }

  // 根据分类生成对应的内容 - 增强旅游导航相关性，大幅增加内容多样性
  const generateContentByCategory = (category) => {
    const contentMap = {
      '关注': [
        // 导航出行类
        '【智能导航】今天用AR导航走了一遍故宫，太震撼了！📱手机屏幕上直接显示历史建筑的3D模型和文物介绍，感觉穿越回了明清时代。导航精确到每个展厅，还能避开人流高峰区域。在太和殿前用AI讲解听康熙皇帝的故事，仿佛身临其境。这种沉浸式的文化体验比传统讲解器强太多了！',
        '【地铁探索】用地铁导航发现了帝都隐藏的艺术宝藏！🚇每个地铁站都有独特的设计主题，从中关村的科技感到国贸的商务风，简直是地下博物馆。导航APP还推荐了最佳拍照位置和人少的时间段。今天打卡了8个最美地铁站，收获了满满的城市美学体验',
        '【骑行路线】沿着海岸线骑行30公里，用骑行导航规划的路线简直完美！🚴‍♀️从大梅沙到小梅沙，全程都是无敌海景，导航还贴心标注了补给站和休息点。海风拂面，阳光洒在波光粼粼的海面上，这种自由自在的感觉太棒了！途中还遇到了同样骑行的小伙伴，一起拍照留念',
        '【徒步挑战】用登山导航挑战了华山西峰！⛰️全程8小时的徒步，导航实时显示海拔、坡度和天气变化。最惊险的是长空栈道，导航提醒了安全注意事项和最佳通过时间。登顶那一刻看到日出破云而出，所有的疲惫瞬间烟消云散。这种征服自然的成就感无法用言语形容',
        '【水上导航】第一次在千岛湖体验皮划艇，用水上导航太有趣了！🛶APP显示了湖中小岛的分布和最佳路线，还能监测水流和风向。划船穿梭在翠绿的小岛间，感受大自然的宁静与美好。遇到了野生的白鹭和小鱼群，这种与自然和谐共处的体验太珍贵了',
        
        // 美食导航类
        '【深夜觅食】用夜宵导航在广州来了场深夜美食马拉松！🌙从粤式茶点到潮汕砂锅粥，每家店都是本地人推荐的隐藏美食。导航显示营业时间和特色菜品，避免了跑空的尴尬。最难忘的是在路边摊和老板聊天，听他讲述30年来这条街的变化，满满的人情味',
        '【米其林探店】按照美食导航的推荐路线，打卡了上海滩的米其林餐厅！⭐从一星到三星，每家店都有独特的烹饪哲学。最惊艳的是那道鹅肝配无花果，入口即化的奢华体验。虽然价格不菲，但偶尔犒赏自己也很值得，毕竟生活需要仪式感',
        '【街头小食】用小吃导航在西安回民街吃到撑！🥟从肉夹馍到凉皮，从羊肉泡馍到柿子饼，每一口都是正宗的关中味道。导航还介绍了每道小吃的历史典故，边吃边学文化知识。老板们都很热情，推荐了很多游客不知道的地道美食',
        '【农家寻味】开车两小时到乡下，用乡村导航找到了一家绝美农庄！🌾老板用自家养的土鸡和刚摘的蔬菜做农家菜，每道菜都散发着田园香味。在竹林里用餐，听着鸟叫蝉鸣，远离城市的喧嚣。这种返璞归真的用餐体验让人身心都得到了治愈',
        
        // 住宿体验类
        '【树屋民宿】在云南住了三天树屋，用民宿导航找到这个隐藏在原始森林中的秘境！🌳房间建在20米高的大树上，推开窗就是无边的绿色海洋。晚上听着各种鸟类和昆虫的大合唱入睡，早上被第一缕阳光和鸟鸣声唤醒。这种与自然融为一体的住宿体验太神奇了',
        '【冰雪酒店】在哈尔滨体验了一晚冰雪主题酒店！❄️整个房间都是用冰块雕刻而成，床铺、桌椅、甚至杯子都是冰制的。虽然温度只有-5度，但酒店提供了专业的保暖睡袋。在冰床上看极光投影，感受北国冰雪的浪漫与纯净',
        '【星空帐篷】在内蒙古草原住帐篷看银河，用户外导航找到了最佳观星位置！⭐透明的穹顶帐篷让我躺在床上就能看到漫天繁星。牧民大叔教我们识别星座，分享了很多草原传说。篝火晚会上大家一起唱歌跳舞，这种原始而纯真的快乐久违了',
        '【水上木屋】在马尔代夫住水上别墅，用度假导航规划了完美的海岛时光！🏝️推开房门就是碧蓝的印度洋，可以直接跳进海里游泳。夜晚躺在甲板上数星星，听海浪拍打木桩的节奏声。这种面朝大海的奢华体验让人瞬间忘记所有烦恼',
        
        // 时尚穿搭类
        '【沙漠穿搭】在撒哈拉沙漠的穿搭分享！🐪选择了防晒又透气的长袖衬衫和宽松长裤，配上专业沙漠靴和遮阳帽。用旅行导航找到了最佳拍照沙丘，金色沙海中的剪影照片美得像大片。头巾既能防沙又很有异域风情，绝对是沙漠旅行的必备单品',
        '【极地装备】南极旅行的保暖穿搭攻略！🐧三层保暖系统：排汗内衣+保温中层+防风外套。用极地导航规划登陆路线，在冰川上与企鹅合影。虽然装备很厚重，但能在世界尽头留下足迹，这种成就感无法言喻。专业保暖靴让我在冰面上行走如履平地',
        '【雨林探险】在亚马逊雨林的户外装备测评！🌿速干衣裤+防水靴+驱虫头套，每件装备都经过实战检验。用雨林导航跟随向导深入原始森林，看到了珍稀的鸟类和蝴蝶。虽然条件艰苦，但能亲眼见证地球之肺的壮观，这趟探险太值得了',
        '【都市夜游】今晚的夜游穿搭太成功了！✨选择了闪片连衣裙配高跟鞋，在城市霓虹灯下闪闪发光。用夜景导航找到了最佳拍照地标，从摩天大楼到艺术装置，每张照片都很出片。这种glamorous的夜晚让人感受到都市生活的精彩与活力',
        
        // 文化体验类
        '【博物馆之旅】用文化导航逛了一整天国家博物馆！🏛️从古代文明到现代艺术，每个展厅都有详细的语音讲解和AR互动体验。最震撼的是看到2000年前的丝绸之路文物，感受古代商贸的繁荣。导航还推荐了最佳参观路线，避免了人群拥堵',
        '【非遗体验】在苏州学习了传统刺绣工艺！🧵用文化导航找到了200年历史的刺绣世家，跟着传承人学习基础针法。虽然只学了3小时，但对这门古老艺术有了全新认识。每一针每一线都承载着匠人的心血，这种慢工出细活的精神值得敬佩',
        '【古镇漫步】在平遥古城穿越时空！🏘️用古建导航了解每栋建筑的历史故事，从明清商铺到古代银行，每个角落都有故事。在日升昌票号体验古代汇兑业务，感受晋商的智慧。石板路上的脚步声仿佛能听到历史的回响',
        '【民俗节庆】赶上了云南火把节，用节庆导航参与了盛大庆典！🔥和彝族同胞一起跳舞，品尝传统美食，感受原生态的民族文化。最震撼的是千人同时点燃火把的场面，火光照亮夜空，歌声响彻山谷。这种文化盛宴让人深深感动',
        
        // 自然探索类
        '【观鸟之旅】在湿地公园用观鸟导航记录了30多种鸟类！🦆从优雅的白天鹅到机灵的翠鸟，每种都有独特的美丽。导航显示最佳观鸟时间和位置，还能识别鸟类品种。清晨薄雾中的湿地宁静而神秘，这种与自然和谐共处的时光太珍贵了',
        '【追光之旅】在挪威看到了绿色极光，用极光预测导航选择了完美时机！🌌午夜时分，天空突然被绿色光带点亮，如梦如幻的美景让人屏息。在零下30度的雪地里等待了3小时，但看到极光舞动的那一刻，所有寒冷都值得了',
        '【深海潜水】在马尔代夫深潜看到了鲸鲨，用潜水导航找到了最佳潜点！🦈这个海洋巨无霸长达8米，游过身边时的震撼无法言喻。海底世界五彩斑斓，珊瑚礁和热带鱼构成了童话般的海洋花园。这种零距离接触海洋生物的体验太神奇了',
        '【星空摄影】在青海湖拍银河，用天文导航选择了最佳拍摄时机！📸零光污染的环境下，银河清晰可见，星空璀璨如钻石。用延时摄影记录了星轨的运动轨迹，感受宇宙的浩瀚与神秘。这种与星空对话的体验让人重新思考生命的意义'
      ],
      '衣': [
        '【高原旅行穿搭】西藏行的高原装备分享！🏔️三层穿衣法是关键：速干内衣+抓绒中层+冲锋衣外套。用高原导航监测海拔变化，随时调整衣物。防晒霜和唇膏更是必需品，高原紫外线太强了。在纳木错湖边拍照，蓝天白云下的藏式披肩特别出片',
        '【城市商务穿搭】出差北京的职场Look！💼选择了免烫衬衫和西装裤，即使坐高铁也不会皱。用商务导航找到客户公司，顺便打卡了几个网红咖啡厅。简约的珍珠耳环和小包包提升精致感，专业又不失女性魅力',
        '【海岛度假穿搭】马尔代夫的比基尼合集！👙每套泳装都有不同风格，从性感到甜美应有尽有。用潜水导航找到最美珊瑚礁，在水下拍摄了梦幻大片。防水化妆品让我在海里也能保持美美哒状态',
        '【雪山登山装备】攀登四姑娘山的专业装备！🥾冲锋衣裤、登山靴、保暖帽、手套一样不能少。用登山导航规划路线，实时监测天气变化。虽然装备很重，但在4000米海拔看日出的震撼值得所有付出',
        '【古风汉服体验】在故宫穿汉服拍古装大片！👘选择了明制汉服，从襦裙到披帛都很考究。用古建导航找到最佳拍摄角度，避开游客高峰期。每个姿势都经过精心设计，仿佛穿越回了明朝宫廷',
        '【沙漠探险装备】腾格里沙漠的防护穿搭！🏜️长袖长裤防晒伤，沙套防进沙，头巾防风沙。用沙漠导航跟随驼队，体验丝绸之路的古老魅力。夜晚的篝火晚会上，民族风饰品让我融入了当地文化',
        '【热带雨林穿搭】西双版纳的丛林装备！🌿速干衣物、驱虫剂、防水背包都是必需品。用雨林导航寻找珍稀植物，在原始森林中探索自然奥秘。特制的丛林帽既防蚊虫又很有冒险家的感觉',
        '【极地探险装备】南极邮轮的保暖穿搭！🐧羽绒服、防水裤、保暖靴缺一不可。用极地导航观察企鹅栖息地，在冰天雪地中与可爱的企鹅合影。每件装备都经过极地考验，确保在严寒中的安全与舒适',
        '【草原骑行装备】呼伦贝尔的骑马装备！🐎牛仔裤、马靴、牛仔帽组成完美的草原风。用草原导航找到最美的花海，策马奔腾在无边绿野中。晚上的蒙古包聚餐，民族服饰让我体验到草原人民的豪迈',
        '【都市夜景穿搭】上海外滩的夜游Look！🌃亮片裙、高跟鞋、小披肩，在璀璨灯光下闪闪发光。用夜景导航找到最佳观景台，黄浦江两岸的美景尽收眼底。每张照片都很出片，仿佛置身时尚大片中',
        '【温泉度假穿搭】日本温泉乡的和风体验！♨️浴衣、木屐、发簪，体验正宗的日式文化。用温泉导航找到私汤位置，在山间美景中享受温泉疗愈。传统服饰让我更好地融入当地文化氛围',
        '【文艺旅行穿搭】厦门鼓浪屿的小清新Look！🌺棉麻连衣裙、帆布鞋、草编帽，散发浓浓的文艺气息。用文艺导航寻找隐藏的咖啡厅和书店，在海风中享受慢时光。每个角落都很适合拍照，岛屿生活太惬意了'
      ],
      '食': [
        '【米其林探索】用米其林导航打卡了沪上三星餐厅！⭐主厨的创意法餐让人惊艳，每道菜都是艺术品。鹅肝慕斯入口即化，海胆配香槟泡沫层次丰富。服务生能精确介绍每道菜的制作工艺和食材来源，专业度令人敬佩',
        '【街头小吃】用小吃导航在台北夜市吃到爽！🥟蚵仔煎、臭豆腐、大肠包小肠，每样都是正宗台味。老板们都很热情，还教我怎么调最地道的酱料。深夜的士林夜市烟火气十足，这才是真正的台湾味道',
        '【海鲜盛宴】在青岛用海鲜导航找到了最新鲜的渔港！🦞刚上岸的扇贝、海虾、螃蟹，现选现做超新鲜。老板推荐的海胆蒸蛋嫩滑无比，配上青岛啤酒简直完美。海风中品海鲜，这种体验太棒了',
        '【私房菜探秘】在胡同里发现了一家神秘私房菜！🏠用美食导航按图索骥，终于找到这个隐藏的美食天堂。老板只做预约客人，每道菜都有故事。宫保鸡丁是慈禧太后的御用配方，麻婆豆腐是正宗川味',
        '【素食料理】在五台山体验了精进料理！🌿寺庙里的素食完全颠覆了我的认知，罗汉斋、素烧鹅、糖醋里脊，每道菜都做得惟妙惟肖。用禅食导航了解素食文化，在青灯古佛前品味人生',
        '【分子料理】在上海体验了科技感十足的分子餐厅！🧪液氮冰淇淋、泡沫汤、球状橄榄，每道菜都像科学实验。主厨用现代技术重新诠释传统菜品，视觉冲击力极强。这种创新料理开拓了味觉新境界',
        '【火锅文化】在重庆体验了最正宗的九宫格火锅！🌶️麻辣鲜香，一口下去整个人都燃烧了。用火锅导航找到百年老店，师傅现场调制底料，香料配比都是秘方。边吃边冒汗，这就是重庆人的豪爽',
        '【茶文化体验】在杭州龙井村学习了茶艺！🍃从采茶到制茶，全程参与体验。用茶园导航找到最佳采茶点，清晨的茶园云雾缭绕如仙境。品尝刚炒制的明前龙井，那种清香甘甜让人回味无穷',
        '【异国料理】在泰国清迈学做泰式料理！🌶️跟着当地大厨学做冬阴功汤和芒果糯米饭，用料理导航寻找最正宗的香料市场。每种香料都有独特香味，酸甜辣的完美平衡就是泰菜精髓',
        '【烘焙体验】在法国巴黎学做马卡龙！🥐用烘焙导航找到百年面包店，跟着法国师傅学习传统工艺。从打发蛋白到烤制成型，每个步骤都很关键。成功做出彩虹色马卡龙的成就感无法言喻',
        '【酒庄体验】在意大利托斯卡纳品酒！🍷用酒庄导航参观葡萄园，了解红酒酿造全过程。在夕阳西下的山坡上品尝陈年基安帝，配上当地奶酪和橄榄，那种惬意无法言语。庄主分享了家族酿酒传统，每一口都有历史的味道',
        '【早餐文化】在香港茶餐厅体验港式早茶！🥟虾饺、烧卖、叉烧包，每样点心都精致可爱。用早茶导航找到最地道的茶楼，听着粤语聊天声，感受香港的市井文化。配上丝袜奶茶，这就是正宗的港式慢生活'
      ],
      '住': [
        '【树屋民宿】在云南西双版纳住树屋，太有意思了！🌳房间建在15米高的古榕树上，用民宿导航找到这个隐秘基地。推开窗就是原始雨林，各种鸟类在身边飞来飞去。晚上听着雨林的天籁之音入睡，早上被猴子的叫声唤醒，这种返璞归真的体验太棒了',
        '【海上木屋】马尔代夫的水上别墅简直是梦中天堂！🏝️用度假导航预定了overwater villa，私人阳台直通碧蓝海水。可以直接从房间跳进海里游泳，晚上躺在玻璃地板上看海底鱼群。每天早上都有管家送早餐到房间，服务贴心到极致',
        '【冰屋酒店】在芬兰拉普兰住了真正的冰雪酒店！❄️用极地导航找到这个冰雪城堡，整个房间都是冰块雕刻而成。床铺、桌椅、甚至酒杯都是冰制的，但保暖设施很完善。最神奇的是透明圆顶设计，躺在床上就能看到极光舞动',
        '【沙漠帐篷】在撒哈拉沙漠住奢华帐篷！🏜️用沙漠导航跟随驼队深入沙海，豪华帐篷配备了空调和热水。夜晚的篝火晚会上，柏柏尔人演奏传统音乐，满天繁星下的沙漠之夜浪漫到极致。清晨看日出染红沙丘的震撼场面',
        '【古堡城堡】在苏格兰住了600年历史的古堡！🏰用古迹导航找到这座中世纪城堡，每个房间都有独特的历史故事。四柱床、古典壁炉、骑士盔甲，仿佛穿越回了中古时代。管家服务保持着贵族传统，晚餐是正宗的苏格兰大餐',
        '【温泉旅馆】在日本北海道泡私汤温泉！♨️用温泉导航找到隐藏在雪山中的传统旅馆，榻榻米房间典雅舒适。露天温泉被雪山环绕，泡汤时雪花飘在身上的感觉太奇妙。会席料理精美绝伦，每道菜都体现了日式美学',
        '【草原蒙古包】在内蒙古大草原住传统蒙古包！🐎用草原导航找到牧民家庭，体验最原生态的草原生活。晚上围着篝火吃烤全羊，听老人讲草原传说。躺在蒙古包里看满天星斗，感受游牧民族的自由与豪迈',
        '【洞穴酒店】在土耳其卡帕多奇亚住洞穴房！🪨用奇岩导航找到这个神奇的地下酒店，房间是天然石洞改造而成。古老的拜占庭风格装饰，神秘而浪漫。清晨从阳台看热气球升空的壮观场面，彩色气球点缀蓝天',
        '【雨林生态酒店】在哥斯达黎加住雨林生态旅馆！🌿用生态导航深入云雾森林，酒店完全融入自然环境。房间设计最大化保护生态，能近距离观察各种野生动物。瑜伽平台悬在树冠间，晨练时被各种鸟类环绕',
        '【湖畔木屋】在加拿大落基山脉住湖边小木屋！🏔️用山地导航找到这个静谧的湖畔度假村，推开门就是雪山倒影的湖泊。壁炉里火光摇曳，窗外是无边的荒野美景。夜晚能听到远山的狼嚎声，原始而神秘',
        '【农场民宿】在托斯卡纳住百年农庄！🍇用乡村导航找到这个家族经营的葡萄酒庄，住宿在石头农舍中。每天跟农夫一起干活，从采摘葡萄到酿酒全程参与。傍晚在葡萄园中用餐，配着自家酿的美酒看夕阳西下',
        '【竹屋度假村】在巴厘岛住全竹子建造的eco lodge！🎋用生态导航找到这个可持续发展度假村，所有建筑都用竹子建造。房间通风良好自然凉爽，瑜伽平台面向梯田美景。SPA疗程使用当地有机材料，身心都得到了净化'
      ],
      '行': [
        '【跨国火车】坐西伯利亚大铁路横跨欧亚大陆！🚂用国际铁路导航规划了莫斯科到北京的传奇路线，全程7天6夜穿越8个时区。火车上遇到了来自世界各地的旅行者，大家一起分享食物和故事。贝加尔湖的壮美、蒙古草原的辽阔，每个窗外风景都是明信片',
        '【骑行川藏】用骑行导航挑战318国道！🚴‍♂️从成都到拉萨2100公里，翻越14座海拔4000米以上的大山。每天骑行80-120公里，虽然辛苦但风景绝美。在色达看万僧诵经，在纳木错看圣湖蓝天，这种用双脚丈量高原的体验太震撼了',
        '【热气球之旅】在土耳其卡帕多奇亚坐热气球看日出！🎈用航空导航选择了最佳起飞时间，清晨4点半开始准备。当热气球缓缓升空，整个仙人烟囱地貌尽收眼底。100多个彩色热气球同时升空的壮观场面，像童话世界一样梦幻',
        '【游艇出海】在圣托里尼租游艇环岛游！⛵用海上导航规划了完美的航行路线，从费拉港出发绕岛一圈。蓝白相间的建筑从海上看更加惊艳，在爱琴海上看世界最美日落。船长还带我们去了隐秘的海湾游泳，海水清澈见底',
        '【越野穿沙】在迪拜沙漠用4x4越野车冲沙！🏜️专业导航显示沙丘高度和最佳冲坡路线，肾上腺素飙升的刺激体验。在金色沙海中驰骋，感受阿拉伯沙漠的雄浑壮阔。晚上的沙漠营地有骆驼骑行和传统表演，体验贝都因文化',
        '【雪橇探险】在芬兰拉普兰体验哈士奇雪橇！🐕用极地导航在雪原上驰骋，12只哈士奇拉着雪橇在雪地狂奔。穿越白桦林和冰湖，银装素裹的北欧风光美得不真实。中途休息时和可爱的哈士奇玩耍，它们太聪明太可爱了',
        '【摩托环岛】在巴厘岛骑摩托车环岛游！🏍️用岛屿导航规划了经典路线，从乌布出发到库塔海滩。穿越热带雨林、梯田、火山，每个转弯都是新风景。在山路上遇到猴子群，在海边看冲浪者，自由度超高的旅行方式',
        '【徒步朝圣】走西班牙圣地亚哥朝圣之路！👟用朝圣导航规划了800公里的徒步路线，每天走25-30公里。从庇里牛斯山到大西洋海岸，35天的徒步是身心的双重洗礼。住朝圣者旅馆，和世界各地的朝圣者交流，收获的不只是风景',
        '【丛林探险】在亚马逊雨林乘独木舟探险！🛶用雨林导航深入原始森林，看到了粉色海豚、巨型水蟒、各种珍稀鸟类。夜晚在雨林中过夜，听着大自然的交响乐入睡。向导是当地土著，教我们识别可食用植物和药用草本',
        '【极地邮轮】南极探险邮轮之旅太震撼了！🐧用极地导航穿越德雷克海峡，在暴风雪中航行两天到达南极半岛。登陆时看到成千上万的企鹅栖息地，冰川崩塌的轰鸣声响彻天际。在世界最南端留下足迹，这种体验终生难忘',
        '【直升机观光】在新西兰坐直升机看冰川！🚁用航空导航飞越南阿尔卑斯山脉，从空中俯瞰弗朗茨约瑟夫冰川。降落在雪山顶峰，360度雪山美景环绕，仿佛置身仙境。飞行员介绍了冰川形成和气候变化，寓教于乐',
        '【索道缆车】在瑞士少女峰坐齿轮火车上欧洲之巅！🚞用山地导航规划了登山路线，从因特拉肯出发到海拔3454米的少女峰。穿越阿尔卑斯山的隧道，在观景台看阿莱奇冰川全貌。站在欧洲最高的火车站，雪山美景震撼心灵'
      ]
    }
    
    const categoryContents = contentMap[category] || contentMap['关注']
    return categoryContents[Math.floor(Math.random() * categoryContents.length)]
  }

  // 根据分类生成标签 - 增加更多丰富的标签
  const generateTagsByCategory = (category) => {
    const tagMap = {
      '关注': [
        // 导航相关
        'AR导航', '智能导航', '地铁探索', '骑行路线', '徒步挑战', '水上导航', '城市漫步', '路线规划',
        // 体验相关
        '深度体验', '文化体验', '自然探索', '冒险之旅', '心灵之旅', '视觉盛宴', '震撼体验', '终生难忘',
        // 情感相关
        '生活记录', '旅行日记', '分享快乐', '美好时光', '治愈系', '小确幸', '浪漫时刻', '惊喜发现',
        // 技术相关
        '科技感', '黑科技', '智慧出行', 'GPS定位', '实时导航', '语音讲解', '互动体验', '数字化',
        // 社交相关
        '朋友圈', '同行伙伴', '相遇故事', '旅行社交', '文化交流', '人情味', '当地人推荐', '温暖相遇'
      ],
      '衣': [
        // 场景穿搭
        '高原装备', '海岛度假', '极地探险', '沙漠防护', '雨林装备', '都市夜游', '古风汉服', '温泉和风',
        // 风格类型
        '户外装备', '商务穿搭', '文艺清新', '民族风情', '复古风格', '时尚潮流', '专业装备', '度假风',
        // 功能特性
        '防晒保护', '保暖舒适', '速干透气', '防水防风', '轻便实用', '颜值在线', '拍照出片', '舒适度满分',
        // 搭配技巧
        'OOTD', '穿搭分享', '搭配技巧', '色彩搭配', '层次穿搭', '配饰点缀', '细节精致', '整体造型',
        // 购买体验
        '购物攻略', '性价比高', '质量很好', '值得推荐', '必备单品', '经典款', '限量版', '设计感'
      ],
      '食': [
        // 料理类型
        '米其林餐厅', '街头小吃', '私房菜', '素食料理', '分子料理', '火锅文化', '茶文化', '异国料理',
        // 食材特色
        '新鲜食材', '有机蔬菜', '野生海鲜', '当地特产', '时令美食', '手工制作', '传统工艺', '秘制配方',
        // 体验感受
        '味觉冒险', '舌尖体验', '美食马拉松', '深夜觅食', '农家探味', '文化学习', '技艺传承', '匠人精神',
        // 环境氛围
        '烟火气息', '市井文化', '历史故事', '文化底蕴', '温馨氛围', '精致生活', '慢生活', '治愈美食',
        // 社交分享
        '美食摄影', '探店攻略', '隐藏美食', '网红餐厅', '本地推荐', '排队美食', '性价比', '值得品尝'
      ],
      '住': [
        // 住宿类型
        '树屋民宿', '海上木屋', '冰屋酒店', '沙漠帐篷', '古堡城堡', '温泉旅馆', '草原蒙古包', '洞穴酒店',
        // 环境特色
        '雨林生态', '湖畔木屋', '农场体验', '竹屋度假', '山景民宿', '海景房', '星空帐篷', '原始森林',
        // 体验感受
        '返璞归真', '与自然融为一体', '奢华体验', '文化体验', '生态环保', '可持续发展', '传统文化', '现代科技',
        // 服务设施
        '贴心服务', '智能设施', '配套完善', '性价比高', '设计精美', '空间舒适', '私密性好', '安全保障',
        // 情感价值
        '心灵净化', '身心放松', '逃离都市', '慢生活', '静谧时光', '浪漫体验', '温馨氛围', '难忘回忆'
      ],
      '行': [
        // 交通方式
        '跨国火车', '骑行川藏', '热气球', '游艇出海', '越野穿沙', '雪橇探险', '摩托环岛', '徒步朝圣',
        // 探险类型
        '丛林探险', '极地探险', '直升机观光', '索道缆车', '深海潜水', '高空飞行', '户外挑战', '自然探索',
        // 体验感受
        '肾上腺素', '震撼体验', '视觉盛宴', '心灵洗礼', '终生难忘', '征服自然', '突破极限', '自由驰骋',
        // 技术支持
        '专业导航', '安全保障', '实时监测', '路线规划', '天气预报', '装备齐全', '向导服务', '应急预案',
        // 文化交流
        '跨文化体验', '历史传承', '民族风情', '传统文化', '现代科技', '国际交流', '友谊桥梁', '文明对话'
      ]
    }
    
    const categoryTags = tagMap[category] || tagMap['关注']
    const commonTags = ['生活', '分享', '记录', '推荐', '体验']
    const allTags = [...categoryTags, ...commonTags]
    
    const tagCount = Math.floor(Math.random() * 3) + 2 // 2-4个标签
    const shuffled = allTags.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, tagCount)
  }

  // 根据分类生成对应的图片 - 所有旅记都配图
  const generateImagesByCategory = (category, pageNum, count = 10) => {
    const imageKeywords = {
      '关注': ['lifestyle', 'social', 'friends', 'cafe', 'restaurant'],
      '衣': ['fashion', 'clothing', 'outfit', 'style', 'accessories'],
      '食': ['food', 'restaurant', 'cuisine', 'dessert', 'cooking'],
      '住': ['hotel', 'accommodation', 'interior', 'bedroom', 'living'],
      '行': ['travel', 'transportation', 'destination', 'vacation', 'journey']
    }
    
    const keywords = imageKeywords[category] || imageKeywords['关注']
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
    
    const photos = Array.from({ length: count }, (_, index) => {
      const imageIndex = (pageNum - 1) * count + index + 1
      const categoryPrefix = category === '关注' ? 'follow' : 
                            category === '衣' ? 'fashion' :
                            category === '食' ? 'food' :
                            category === '住' ? 'hotel' : 'travel'
      
      const imageHeight = Math.floor(Math.random() * 200) + 400
      const imageId = `${categoryPrefix}-${imageIndex}`
      
      // 使用优化的图片源生成URL
      const optimizedUrl = generateOptimizedImageUrl(400, imageHeight, imageId, 0)
      
      return {
        id: imageId,
        width: 400,
        height: imageHeight,
        url: optimizedUrl,
        photographer: `${category}达人${imageIndex}`,
        src: {
          medium: optimizedUrl,
          small: generateOptimizedImageUrl(300, Math.floor(imageHeight * 0.75), `${imageId}-thumb`, 0)
        },
        alt: `${category}相关图片 ${imageIndex}`,
        hasImage: true,  // 所有图片都存在
        imageId: imageId // 添加imageId用于重试时的源切换
      }
    })
    
    return { photos, total_results: 1000 }
  }

  // 简化的加载旅记数据
  const loadArticles = useCallback(async (pageNum = 1, isRefresh = false) => {
    // 防止重复调用
    if (loading && !isRefresh) return Promise.resolve()
    if (!isMountedRef.current) return Promise.resolve()
    
    return new Promise(async (resolve, reject) => {
      try {
        setLoading(true)
        console.log('🔄 开始加载旅记数据:', { page: pageNum, activeTab })
        
        // 模拟网络延迟，让用户看到加载状态
        await new Promise(r => setTimeout(r, 600))
        
        // 根据当前分类生成对应内容
        const response = generateImagesByCategory(activeTab, pageNum, 8) // 每页8条数据
        const photos = response.photos || []
        
        if (photos.length === 0) {
          setHasMore(false)
          resolve()
          return
        }

        // 将图片数据转换为旅记数据
        const newArticles = photos.map((photo, index) => {
          const user = generateMockUser(activeTab) // 传入当前分类
          return {
            id: `${activeTab}-${pageNum}-${index}-${Date.now()}`, // 包含分类信息确保唯一性
            user,
            content: generateContentByCategory(activeTab), // 使用分类内容
            images: [photo], // 所有旅记都有图片
            tags: generateTagsByCategory(activeTab), // 使用分类标签
            likes: Math.floor(Math.random() * 1000) + 50,
            comments: Math.floor(Math.random() * 100) + 5,
            collections: Math.floor(Math.random() * 300) + 10,
            time: `${Math.floor(Math.random() * 48) + 1}小时前`,
            isLiked: Math.random() > 0.85,
            isCollected: Math.random() > 0.9,
            location: user.location
          }
        })

        if (isRefresh || pageNum === 1) {
          setArticles(newArticles)
          setPage(1)
          setHasMore(true)
        } else {
          setArticles(prev => [...prev, ...newArticles])
        }
        
        setHasMore(pageNum < 8) // 每个分类最多8页
        setHasLoadedOnce(true) // 标记首次加载完成
        console.log('✅ 旅记数据加载完成:', newArticles.length, '条')
        
        resolve()
      } catch (error) {
        console.error('❌ 加载旅记数据失败:', error)
        setToastMessage('加载失败，请重试')
        reject(error)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    })
  }, [activeTab, loading, isMountedRef])

  // 平滑回到顶部的函数
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  // 切换标签 - 优化防闪烁逻辑
  const handleTabChange = (tab) => {
    if (tab === activeTab || isSwitching) return // 如果是当前标签或正在切换，不需要切换
    
    console.log('🔄 切换标签:', tab)
    
    // 设置切换状态，防止重复点击
    setIsSwitching(true)
    
    // 立即回到顶部
    scrollToTop()
    
    // 设置切换状态，防止闪烁
    setLoading(true) // 立即设置loading状态
    setActiveTab(tab)
    setPage(1)
    setHasMore(true)
    
    // 延迟清空内容，确保loading状态先显示
    setTimeout(() => {
      setArticles([]) // 清空当前内容
      setHasLoadedOnce(false) // 重置首次加载标记
      
      // 再延迟一点加载新内容，确保UI更新完成
      setTimeout(() => {
        loadArticles(1, true).finally(() => {
          // 加载完成后重置切换状态
          setTimeout(() => {
            setIsSwitching(false)
          }, 300) // 给过渡动画一些时间
        })
      }, 50)
    }, 50)
  }

  // 简化的加载更多
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadArticles(nextPage, false)
    }
  }, [loading, hasMore, page, loadArticles])

  // 简化的滚动监听
  const throttledHandleScroll = useThrottle(() => {
    if (loading || !hasMore) return
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // 距离底部150px时加载更多
    const distanceToBottom = documentHeight - scrollTop - windowHeight
    
    if (distanceToBottom < 150) {
      loadMore()
    }
  }, 500) // 增加节流时间到500ms，减少频繁触发

  // 添加滚动监听器
  useEffect(() => {
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [throttledHandleScroll])

  // 优化的交互操作 - 确保只有变化的项目才更新引用
  const handleLike = useCallback((articleId) => {
    // 防止快速连续点击
    if (isUpdatingRef.current) return
    isUpdatingRef.current = true
    
    setArticles(prev => {
      let hasChanged = false
      const newArticles = prev.map(article => {
        if (article.id === articleId) {
          hasChanged = true
          return {
            ...article,
            isLiked: !article.isLiked,
            likes: article.isLiked ? article.likes - 1 : article.likes + 1
          }
        }
        return article // 保持原引用，React.memo会识别这个优化
      })
      
      // 快速释放更新锁，提高响应速度
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 100) // 提高用户体验
      
      // 只有当确实有变化时才返回新数组
      return hasChanged ? newArticles : prev
    })
  }, [])

  const handleCollect = useCallback((articleId) => {
    // 防止快速连续点击
    if (isUpdatingRef.current) return
    isUpdatingRef.current = true
    
    setArticles(prev => {
      let hasChanged = false
      const newArticles = prev.map(article => {
        if (article.id === articleId) {
          hasChanged = true
          return {
            ...article,
            isCollected: !article.isCollected,
            collections: article.isCollected ? article.collections - 1 : article.collections + 1
          }
        }
        return article // 保持原引用
      })
      
      // 快速释放更新锁，提高响应速度
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 100) // 提高用户体验
      
      return hasChanged ? newArticles : prev
    })
  }, [])

  const handleFollow = useCallback((userId) => {
    // 防止快速连续点击
    if (isUpdatingRef.current) return
    isUpdatingRef.current = true
    
    setArticles(prev => {
      let hasChanged = false
      const newArticles = prev.map(article => {
        if (article.user.id === userId) {
          hasChanged = true
          const newFollowStatus = !article.user.isFollowed
          
          // 设置Toast消息，通过useEffect显示
          let message = ''
          if (activeTab === '关注' && !newFollowStatus) {
            message = '已取消关注，该动态将从关注列表中移除'
          } else if (activeTab === '关注' && newFollowStatus) {
            message = '重新关注成功 ❤️'
          } else if (newFollowStatus) {
            message = '关注成功 ❤️'
          } else {
            message = '已取消关注'
          }
          
          // 异步设置Toast消息
          setTimeout(() => {
            setToastMessage(message)
          }, 0)
          
          return {
            ...article,
            user: { ...article.user, isFollowed: newFollowStatus }
          }
        }
        return article // 保持原引用
      })
      
      // 快速释放更新锁
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 100)
      
      return hasChanged ? newArticles : prev
    })
  }, [activeTab])

  const handleWriteArticle = () => {
    console.log('开始写旅记...')
    navigate('/write-article')
  }

  // 将useMemo移到组件顶层，避免条件渲染中使用Hook
  const renderedArticles = useMemo(() => {
    if (articles.length === 0) return []
    
    return articles.map(article => (
      <TravelCard 
        key={article.id} 
        article={article}
        onLike={handleLike}
        onCollect={handleCollect}
        onFollow={handleFollow}
        isAuthenticated={isAuthenticated}
      />
    ))
  }, [articles, handleLike, handleCollect, handleFollow, isAuthenticated])

  // 组件挂载时加载数据
  useEffect(() => {
    isMountedRef.current = true
    console.log('🎯 组件挂载，初始化加载数据')
    
    // 延迟加载，确保组件完全挂载
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        loadArticles(1, true).catch(console.error)
      }
    }, 200)
    
    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
    }
  }, [])

  // 监听activeTab变化，重新加载数据
  useEffect(() => {
    if (isMountedRef.current && articles.length === 0 && !loading && hasLoadedOnce) {
      console.log('🔄 标签切换，重新加载数据:', activeTab)
      loadArticles(1, true).catch(console.error)
    }
  }, [activeTab])



  return (
    <div className={styles.articleContainer}>
      {/* 顶部分类标签栏 */}
      <div className={styles.topTabs}>
        <div className={`${styles.tabsContainer} ${!isAuthenticated ? styles.fourTabs : ''}`}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <span style={{ marginRight: '4px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 瀑布流内容区 */}
      <div className={styles.waterfallContainer}>
        {/* 优化的渲染逻辑：确保切换标签时正确显示loading状态 */}
        {articles.length === 0 && !loading && hasLoadedOnce ? (
          // 真正的空状态：没有数据且已加载完成
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🌟</div>
            <div className={styles.emptyText}>暂时没有发现精彩内容</div>
            <div className={styles.emptySubtext}>下拉刷新试试，或者分享你的旅行故事吧！</div>
            <Button 
              type="primary" 
              size="small" 
              style={{ 
                marginTop: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
              onClick={() => {
                setPage(1)
                setHasMore(true)
                setLoading(true)
                scrollToTop()
                loadArticles(1, true)
              }}
            >
              刷新试试
            </Button>
          </div>
        ) : (
          // 内容列表容器：包含内容和各种状态
          <div className={styles.waterfallList}>
            {/* 切换标签时的加载状态：在内容清空前显示 */}
            {loading && articles.length === 0 && (
              <div className={styles.waterfallList}>
                {/* 旅记卡片骨架屏（3 条） */}
                {[0,1,2].map(i => (
                  <div key={i} className={styles.cardSkeleton}>
                    <div className={styles.cardHeaderSkeleton}>
                      <div className={styles.circleSkeleton}></div>
                      <div style={{flex:1}}>
                        <div className={styles.lineSkeleton} style={{width:'40%'}}></div>
                        <div className={styles.lineSkeleton} style={{width:'25%', marginTop:6}}></div>
                      </div>
                    </div>
                    <div className={styles.imageBoxSkeleton}>
                      <div className={styles.skeletonShimmer}></div>
                    </div>
                    <div className={styles.lineSkeleton} style={{width:'90%', marginTop:8}}></div>
                    <div className={styles.lineSkeleton} style={{width:'70%', marginTop:8}}></div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 内容列表 - 使用提前计算好的渲染结果 */}
            {articles.length > 0 && renderedArticles}
            
            {/* 加载更多状态：有内容时的加载状态 */}
            {loading && articles.length > 0 && (
              <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                <span>正在为你发现更多精彩内容...</span>
              </div>
            )}
            
            {/* 加载更多提示 - 有内容且未完成加载时显示 */}
            {!loading && hasMore && articles.length > 0 && hasLoadedOnce && (
              <div className={styles.loading} style={{ color: '#999', fontSize: '13px', padding: '30px' }}>
                继续滑动，发现更多精彩 ✨
              </div>
            )}
            
            {/* 加载完成提示 - 有内容且加载完成时显示 */}
            {!hasMore && articles.length > 0 && hasLoadedOnce && (
              <div className={styles.loading} style={{ color: '#bbb', fontSize: '13px' }}>
                <span>🎉 太棒了！你已经看完了所有内容</span>
                <span style={{ marginTop: '8px', fontSize: '12px' }}>快去分享你的旅行故事吧</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 写文章浮动按钮 */}
      <button 
        className={styles.writeButton}
        onClick={handleWriteArticle}
        title="写旅记"
      >
        <Edit />
      </button>
      
      {/* 自定义Toast组件 */}
      <SimpleToast 
        message={currentToastMessage}
        type={toastType}
        show={showToast}
        onClose={handleCloseToast}
      />
    </div>
  )
}

export default Article