/**
 * 统一的用户头像组件
 * 确保整个应用中头像显示的一致性
 */

import { useState } from 'react'
import { Image } from 'react-vant'
import { useAuthStore } from '../../../stores'
import { formatUserDisplayName, generateAvatarUrl } from '@/utils/auth'
import { imageUtils } from '@/utils'
import styles from './userAvatar.module.css'

const UserAvatar = ({ 
  size = 80, 
  className = '', 
  onClick = null,
  showOnlineStatus = false,
  round = true,
  alt = null
}) => {
  const { user, isAuthenticated } = useAuthStore()
  const [imgError, setImgError] = useState(false)
  
  // 统一的用户信息获取逻辑
  const userInfo = {
    nickname: user ? formatUserDisplayName(user) : '游客',
    avatar: user?.avatar || (user ? generateAvatarUrl(user) : null)
  }
  
  // 头像源优先级：用户自定义头像 > 生成头像 > 本地占位符
  const getAvatarSrc = () => {
    if (imgError || !userInfo.avatar) {
      // 使用本地生成的SVG头像作为fallback
      return imageUtils.placeholder(size, size, userInfo.nickname || '用户')
    }
    return userInfo.avatar
  }
  
  const handleImageError = () => {
    setImgError(true)
  }
  
  const avatarAlt = alt || `${userInfo.nickname}的头像`
  
  return (
    <div 
      className={`${styles.avatarContainer} ${className}`}
      onClick={onClick}
      style={{ 
        width: size, 
        height: size,
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <Image
        round={round}
        width={`${size}px`}
        height={`${size}px`}
        src={getAvatarSrc()}
        alt={avatarAlt}
        fit="cover"
        onError={handleImageError}
        className={styles.avatarImage}
      />
      
      {showOnlineStatus && isAuthenticated && (
        <div className={styles.onlineIndicator}></div>
      )}
      
      {onClick && (
        <div className={styles.clickOverlay}>
          <span className={styles.editHint}>点击更换</span>
        </div>
      )}
    </div>
  )
}

export default UserAvatar