import {
  useState,
  useEffect
} from 'react'
import {
  Tabbar
} from 'react-vant'
import {
    Outlet,
    useNavigate,
    useLocation
} from 'react-router-dom'
import {
  HomeO,
  CommentCircleO,
  GuideO,
  UserO
} from '@react-vant/icons'

// 菜单栏配置
const tabs = [
    {icon: <HomeO/>,title: '首页',path: '/home'},
    {icon:<CommentCircleO  />,title: '旅记',path: '/article'},
    {icon: <GuideO  />,title: '行程',path: '/trip'},
    {icon: <UserO/>,title: '我的',path: '/account'}
]

const MainLayout = () => {
  const [action, setAction] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  // 根据当前路径设置active状态
  useEffect(() => {
    const currentIndex = tabs.findIndex(tab => tab.path === location.pathname)
    if (currentIndex !== -1) {
      setAction(currentIndex)
    }
  }, [location.pathname])

  return (
    <>
      {/* 主内容区域 */}
      <div style={{ paddingBottom: '60px', minHeight: '100vh' }}>
        <Outlet />
      </div>
      
      {/* 底部导航栏 - 固定在底部 */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        backgroundColor: '#fff',
        borderTop: '1px solid #eee'
      }}>
        {/* 滑动指示器 */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: `calc(${action * 25}% + 4px)`,
            width: 'calc(25% - 8px)',
            height: 'calc(100% - 8px)',
            background: 'linear-gradient(135deg,rgb(110, 225, 100) 0%,rgb(112, 227, 220) 100%)',
            borderRadius: '12px',
            transition: 'left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
        <Tabbar 
          value={action} 
          onChange={
           (key) => { 
             setAction(key);
             navigate(tabs[key].path);
           }
          }
          style={{
            '--rv-tabbar-item-active-background-color': 'transparent',
            '--rv-tabbar-item-active-color': '#333',
            position: 'relative',
            background: 'transparent',
            border: 'none'
          }}
        >
         {tabs.map((tab, index) => (
           <Tabbar.Item
            key={index}
            icon={tab.icon}
            style={{
              position: 'relative',
              zIndex: 1,
              background: 'transparent',
              color: action === index ? '#333' : '#999'
            }}
           >
             {tab.title}
           </Tabbar.Item>
         ))}
         </Tabbar>
      </div>
    </>
  )
}

export default MainLayout