import useTitle from '@/hooks/useTitle'
import {
  Button,
  Input,
  Tag
} from 'react-vant';
import { Search as SearchIcon, ArrowLeft, DeleteO } from '@react-vant/icons';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './search.module.css';

const Search = () => {
    useTitle('搜索')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')
    const [searchHistory, setSearchHistory] = useState([
      '北京', '上海', '杭州西湖', '三亚',
      '丽江古城', '张家界', '厦门鼓浪屿', '成都',
      '青岛', '大理', '桂林山水', '西安兵马俑'
    ])
    const [historyOpen, setHistoryOpen] = useState(true)
    
    const handleSearch = () => {
      if (searchValue.trim()) {
        // 添加到搜索历史
        if (!searchHistory.includes(searchValue.trim())) {
          setSearchHistory([searchValue.trim(), ...searchHistory])
        }
        console.log('搜索内容:', searchValue)
        // 这里可以添加搜索逻辑
      }
    }
    
    const handleBack = () => {
      navigate(-1)
    }
    
    const clearHistory = () => {
      setSearchHistory([])
    }
    
    const handleTagClick = (tag) => {
      setSearchValue(tag)
    }
    
    const handleHistoryToggle = () => {
      setHistoryOpen(open => !open)
    }
    
  return (
    <div className={styles['search-container']}>
      {/* 返回按钮和搜索框在同一行 */}
      <div className={styles['search-header']}>
        {/* 返回按钮 */}
        <Button
          icon={<ArrowLeft size="18" />}
          onClick={handleBack}
          className={styles['back-button']}
        />
        
        {/* 搜索框 */}
        <div className={styles['search-box']}>
          <Input
            value={searchValue}
            onChange={setSearchValue}
            placeholder="搜索目的地、景点、酒店..."
            clearable={false}
            autoFocus
            className={styles['search-input']}
          />
          <Button
            type="primary"
            round
            icon={<SearchIcon size="16" />}
            onClick={handleSearch}
            className={styles['search-button']}
          />
        </div>
      </div>
      
      {/* 搜索历史区域 */}
      <div className={styles['history-container']}>
        <div className={styles['history-header']} onClick={handleHistoryToggle}>
          <div className={styles['history-title']}>
            搜索历史
            <span className={`${styles['history-arrow']} ${historyOpen ? styles.open : styles.closed}`}>▲</span>
          </div>
          <DeleteO 
            size="12" 
            color="#999" 
            onClick={(e) => {
              e.stopPropagation()
              clearHistory()
            }} 
            className={styles['delete-icon']}
          />
        </div>
        {historyOpen && searchHistory.length > 0 && (
          <div className={styles['tags-container']}>
            {searchHistory.map((item, index) => (
              <Tag 
                key={index}
                onClick={() => handleTagClick(item)}
                className={styles['history-tag']}
              >
                {item}
              </Tag>
            ))}
          </div>
        )}
        {historyOpen && searchHistory.length === 0 && (
          <div className={styles['empty-history']}>
            暂无搜索历史
          </div>
        )}
      </div>
      
      {/* 搜索结果区域 */}
      <div className="mt-4">
        
      </div>
    </div>
  )
}

export default Search