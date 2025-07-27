import { useState } from 'react'
import {
  Search,
  Tabs,
  Tag
} from 'react-vant'
import './App.css'
import { DeleteO } from '@react-vant/icons'

function App() {
  const [value, setValue] = useState('')
  const [active, setActive] = useState('综合')
  const [searchHistory, setSearchHistory] = useState([
    '谁杀死了比尔', 'tiantianup', 'react',
    'Next.js全栈', '天天加油', '150行',
    'mvvm 手写', 'mvvm', '虚拟dom',
    '奇趣', '来颗奇趣蛋', '字节常考算法题',
    'coze', '徐小夕', '洪巴',
    'vue源码解读', '奇趣蛋', '图雀',
    '面试题', 'vue ts', '周榜',
    'ssh', '神光', 'leetcode',
    '字节算法'
  ])
  const [historyOpen, setHistoryOpen] = useState(true)

  const clearHistory = () => {
    setSearchHistory([])
  }

  const handleSearch = () => {
    if (value.trim()) {
      if (!searchHistory.includes(value.trim())) {
        setSearchHistory([value.trim(), ...searchHistory])
      }
      setValue('')
    }
  }

  const handleTagClick = (tag) => {
    setValue(tag)
  }

  const handleHistoryToggle = () => {
    setHistoryOpen(open => !open)
  }

  return (
    <div className="search-container">
      <Search
        value={value}
        onChange={setValue}
        onSearch={handleSearch}
        placeholder="搜索文章/课程/标签/用户"
        showAction
        actionText="取消"
      />
      <div className='tabs-container'>
      <Tabs active={active} onChange={setActive}>
          {['综合','文章', '课程', '标签', '用户'].map((item) => (
            <Tabs.TabPane name={item} key={item} title={item} />
        ))}
      </Tabs>
    </div>
      <div className="divider"></div>
      <div className='history-container'>
        <div className='history-header' onClick={handleHistoryToggle} style={{cursor:'pointer'}}>
          <div className='history-title'>
            搜索历史
            <span className='history-arrow'>{historyOpen ? '\u25B2' : '\u25BC'}</span>
          </div>
          <DeleteO onClick={e => {e.stopPropagation(); clearHistory();}} />
        </div>
        {historyOpen && (
          <div className='tags-container'>
            {searchHistory.map((item, index) => (
              <Tag 
                key={index}
                className="history-tag" 
                plain 
                onClick={() => handleTagClick(item)}
              >
                {item}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
