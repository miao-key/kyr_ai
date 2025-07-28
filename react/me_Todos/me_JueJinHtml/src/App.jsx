import { useState } from 'react'
import './App.css'
import { Search as SearchIcon } from '@react-vant/icons'
import { Search, Button, Tabs } from 'react-vant'

function App() {
  const [value, setValue] = useState('')
  const [active, setActive] = useState('综合')
  return (
    <div>
    <div className='search-container'>  
      <Search
      value={value}
      onChange={setValue}
        clearable
        placeholder="请输入搜索关键词"
        leftIcon={null}
        action={
          <div className="search-action-group">
            <Button
              type="default"
              icon={<SearchIcon />}
              className="search-btn"
      />
            <Button
              type="default"
              className="login-btn"
            >
              登录
            </Button>
          </div>
        }
      />
       </div>
       <div className='tabs-container'>
        <Tabs active={active} onChange={setActive}>
          {['关注','综合','排行榜', '后端', '前端', '人工智能', '产品', '设计', '运营', '安全', '工具', '其他'].map((item) => (
            <Tabs.TabPane name={item} key={item} title={item} />
        ))}
      </Tabs>
       </div>
       </div>
  )
}

export default App