import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button, Space } from 'react-vant'
import styles from './welcome.module.css'

const Welcome = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // 如果已登录，直接跳转到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = () => {
    navigate('/login')
  }



  return (
    <div className={styles.welcomeContainer}>
      {/* 背景装饰 */}
      <div className={styles.backgroundDecoration}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>

      {/* 主要内容 */}
      <div className={styles.welcomeContent}>
        {/* Logo区域 */}
        <div className={styles.logoSection}>
          <div className={styles.mainLogo}>
            <span className={styles.logoIcon}>✈️</span>
            <span className={styles.logoText}>智旅</span>
          </div>
          <p className={styles.logoSubtitle}>智能旅行，从这里开始</p>
        </div>

        {/* 功能介绍 */}
        <div className={styles.featuresSection}>
          <h2 className={styles.featuresTitle}>探索世界的全新方式</h2>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🤖</div>
              <div className={styles.featureContent}>
                <h3>AI智能助手</h3>
                <p>个性化旅行建议和AI生成头像</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📸</div>
              <div className={styles.featureContent}>
                <h3>精美旅记分享</h3>
                <p>记录旅行足迹，分享美好时光</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🌍</div>
              <div className={styles.featureContent}>
                <h3>全球目的地</h3>
                <p>发现全世界的美景和文化</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🎯</div>
              <div className={styles.featureContent}>
                <h3>个性化推荐</h3>
                <p>基于喜好的智能行程规划</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className={styles.actionSection}>
          <Space direction="vertical" size="large" className={styles.buttonGroup}>
            <Button 
              type="primary" 
              size="large" 
              block 
              className={styles.primaryButton}
              onClick={handleLogin}
            >
              开始我的旅行
            </Button>
          </Space>
        </div>

        {/* 底部信息 */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            让AI为你定制专属的旅行体验
          </p>
          <div className={styles.versionInfo}>
            <span>智旅 v1.0</span>
            <span>•</span>
            <span>React + AI驱动</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome