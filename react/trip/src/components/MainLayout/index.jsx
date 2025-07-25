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
  Search,
  FriendsO,
  SettingO,
  UserO
} from '@react-vant/icons'

// 菜单栏配置
const tabs = [
    {icon: <HomeO/>,title: '首页',path: '/home'},
    {icon: <Search/>,title: '特惠专区',path: '/discount'},
    {icon: <FriendsO/>,title: '我的收藏',path: '/collection'},
    {icon: <SettingO/>,title: '旅程',path: '/trip'},
    {icon: <UserO/>,title: '我的账户',path: '/account'}
]
const MainLayout = () => {
  const [action, setAction] = useState(0)
  const navigate = useNavigate();
  useEffect(() => {
    console.log(location.pathname,'///////')
    // es6的使用power
    const index = tabs.findIndex(
      tab => location.pathname.startsWith(tab.path)
    );
    setAction(index)
  }, []);
  return (
    <>
      <div className='flex flex-col h-screen'
           style={{paddingBottom: '50px'}}
      >
        <div className='flex-1'>
          <Outlet />
        </div>
       {/* tabbar */}
       <Tabbar value={action} onChange={
        (key) => { 
          setAction(key);
          navigate(tabs[key].path);
        }
       }>
        {tabs.map((tab, index) => (
          <Tabbar.Item
           key={index}
           icon={tab.icon}
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