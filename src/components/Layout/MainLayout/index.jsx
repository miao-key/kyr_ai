import { useState, useEffect, useMemo, useCallback } from 'react'
import { Tabbar } from 'react-vant'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HomeO,
  CommentCircleO,
  GuideO,
  UserO
} from '@react-vant/icons'
import { NAVIGATION_TABS, THEME_CONFIG } from '@constants'
import PropTypes from 'prop-types'
import styles from './main-layout.module.css'

/**
 * 主布局组件 - 移动端底部导航布局
 * 
 * 功能特性:
 * - 底部Tab导航
 * - 路由切换平滑滚动
 * - 响应式设计
 * - 动态指示器动画
 * - 路径自动匹配
 * 
 * @param {Object} props - 组件属性
 * @param {boolean} props.enableScrollToTop - 是否启用路由切换时滚动到顶部
 * @param {Object} props.customTheme - 自定义主题配置
 * @param {Function} props.onTabChange - Tab切换回调
 */
const MainLayout = ({
  enableScrollToTop = true,
  customTheme = {},
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  // 图标映射 - 使用useMemo优化性能
  const IconComponents = useMemo(() => ({
    HomeO: <HomeO />,
    CommentCircleO: <CommentCircleO />,
    GuideO: <GuideO />,
    UserO: <UserO />
  }), [])

  // 处理后的导航配置
  const navigationTabs = useMemo(() => 
    NAVIGATION_TABS.map(tab => ({
      ...tab,
      icon: IconComponents[tab.icon]
    })), [IconComponents]
  )

  // 合并主题配置
  const theme = useMemo(() => ({
    ...THEME_CONFIG,
    ...customTheme
  }), [customTheme])

  // 根据当前路径设置active状态
  useEffect(() => {
    const currentIndex = navigationTabs.findIndex(tab => tab.path === location.pathname)
    if (currentIndex !== -1 && currentIndex !== activeTab) {
      setActiveTab(currentIndex)
    }
  }, [location.pathname, navigationTabs, activeTab])

  // 路由切换时滚动到顶部
  useEffect(() => {
    if (!enableScrollToTop) return

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }

    // 使用requestAnimationFrame确保DOM更新后执行
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToTop)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [location.pathname, enableScrollToTop])

  // Tab切换处理函数
  const handleTabChange = useCallback((tabIndex) => {
    if (tabIndex === activeTab) return // 避免重复切换

    setActiveTab(tabIndex)
    navigate(navigationTabs[tabIndex].path)
    
    // 触发外部回调
    onTabChange?.(tabIndex, navigationTabs[tabIndex])
  }, [activeTab, navigate, navigationTabs, onTabChange])

  // 计算指示器位置
  const indicatorStyle = useMemo(() => ({
    position: 'absolute',
    top: '4px',
    left: `calc(${activeTab * (100 / navigationTabs.length)}% + 4px)`,
    width: `calc(${100 / navigationTabs.length}% - 8px)`,
    height: 'calc(100% - 8px)',
    background: theme.COLORS.GRADIENT,
    borderRadius: '12px',
    transition: `left 0.4s ${theme.ANIMATIONS.EASING}`,
    zIndex: 0,
    pointerEvents: 'none'
  }), [activeTab, navigationTabs.length, theme])

  // 底部导航栏样式
  const tabbarContainerStyle = useMemo(() => ({
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderTop: '1px solid #eee',
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
  }), [])

  return (
    <div className={styles.mainLayout}>
      {/* 主内容区域 */}
      <main className={styles.content}>
        <Outlet />
      </main>
      
      {/* 底部导航栏 */}
      <nav style={tabbarContainerStyle} className={styles.tabbarContainer}>
        {/* 动态指示器 */}
        <div style={indicatorStyle} className={styles.indicator} />
        
        <Tabbar 
          value={activeTab} 
          onChange={handleTabChange}
          className={styles.tabbar}
          style={{
            '--rv-tabbar-item-active-background-color': 'transparent',
            '--rv-tabbar-item-active-color': '#333',
            position: 'relative',
            background: 'transparent',
            border: 'none'
          }}
        >
          {navigationTabs.map((tab, index) => (
            <Tabbar.Item
              key={`tab-${index}-${tab.path}`}
              icon={tab.icon}
              className={styles.tabItem}
              style={{
                position: 'relative',
                zIndex: 1,
                background: 'transparent',
                color: activeTab === index ? '#333' : '#999',
                transition: 'color 0.3s ease'
              }}
            >
              {tab.title}
            </Tabbar.Item>
          ))}
        </Tabbar>
      </nav>
    </div>
  )
}

// PropTypes类型检查
MainLayout.propTypes = {
  enableScrollToTop: PropTypes.bool,
  customTheme: PropTypes.object,
  onTabChange: PropTypes.func
}

export default MainLayout