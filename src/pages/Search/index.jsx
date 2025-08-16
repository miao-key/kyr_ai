import useTitle from '@/hooks/useTitle'
import {
  Button,
  Input,
  Tag
} from 'react-vant';
import { Search as SearchIcon, ArrowLeft, DeleteO } from '@react-vant/icons';
import { useState, useEffect, useMemo, useRef } from 'react';
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
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
    const [manuallyHidden, setManuallyHidden] = useState(false) // 标记是否手动隐藏
    const searchBoxRef = useRef(null)
    
    // 搜索建议数据源
    const searchSuggestions = [
      // 热门城市
      '北京天安门', '北京故宫', '北京长城', '北京颐和园',
      '上海外滩', '上海迪士尼', '上海东方明珠', '上海城隍庙',
      '广州塔', '广州长隆', '广州陈家祠', '广州沙面',
      '深圳欢乐谷', '深圳世界之窗', '深圳大梅沙', '深圳莲花山',
      '杭州西湖', '杭州灵隐寺', '杭州雷峰塔', '杭州千岛湖',
      '南京夫子庙', '南京中山陵', '南京明孝陵', '南京总统府',
      '苏州园林', '苏州拙政园', '苏州狮子林', '苏州虎丘',
      // 旅游景点
      '三亚天涯海角', '三亚亚龙湾', '三亚蜈支洲岛', '三亚南山寺',
      '丽江古城', '丽江玉龙雪山', '丽江泸沽湖', '丽江束河古镇',
      '大理古城', '大理洱海', '大理苍山', '大理双廊',
      '张家界国家森林公园', '张家界天门山', '张家界黄龙洞',
      '桂林山水', '桂林阳朔', '桂林漓江', '桂林象鼻山',
      '厦门鼓浪屿', '厦门曾厝垵', '厦门南普陀寺', '厦门环岛路',
      '成都宽窄巷子', '成都锦里', '成都大熊猫基地', '成都都江堰',
      '青岛栈桥', '青岛八大关', '青岛崂山', '青岛金沙滩',
      '西安兵马俑', '西安大雁塔', '西安华清池', '西安钟鼓楼',
      // 特色景点
      '九寨沟', '黄山', '泰山', '华山', '峨眉山', '武当山',
      '故宫博物院', '天坛公园', '颐和园', '圆明园',
      '长城', '八达岭长城', '慕田峪长城', '司马台长城',
      '外滩', '南京路', '淮海路', '新天地',
      // 主题类别
      '海滩度假', '山水风光', '古镇古城', '主题公园',
      '博物馆', '寺庙古建', '自然风景', '民俗文化',
      '美食小吃', '购物中心', '温泉度假', '滑雪场'
    ]
    
    // 过滤搜索建议
    const filteredSuggestions = useMemo(() => {
      if (!searchValue.trim()) {
        return []
      }
      
      return searchSuggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(searchValue.toLowerCase())
        )
        .slice(0, 8) // 最多显示8个建议
    }, [searchValue, searchSuggestions])
    
    // 监听搜索框变化，控制建议显示
    useEffect(() => {
      const shouldShow = searchValue.trim().length > 0 && filteredSuggestions.length > 0 && !manuallyHidden
      setShowSuggestions(shouldShow)
      setSelectedSuggestionIndex(-1) // 重置选择索引
    }, [searchValue, filteredSuggestions, manuallyHidden])
    
    // 当搜索值变化时，重置手动隐藏状态
    useEffect(() => {
      setManuallyHidden(false)
    }, [searchValue])
    
    // 监听点击外部区域隐藏建议
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
          setShowSuggestions(false)
          setSelectedSuggestionIndex(-1)
          setManuallyHidden(true) // 标记为手动隐藏
        }
      }
      
      if (showSuggestions) {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }, [showSuggestions])
    
    const handleSearch = () => {
      if (searchValue.trim()) {
        // 隐藏建议
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        
        // 添加到搜索历史
        const trimmedValue = searchValue.trim()
        if (!searchHistory.includes(trimmedValue)) {
          setSearchHistory([trimmedValue, ...searchHistory.slice(0, 11)]) // 最多保留12个历史记录
        }
        console.log('搜索内容:', trimmedValue)
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
      setShowSuggestions(false) // 隐藏建议
    }
    
    const handleSuggestionClick = (suggestion) => {
      setSearchValue(suggestion)
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
      
      // 添加到搜索历史
      if (!searchHistory.includes(suggestion)) {
        setSearchHistory([suggestion, ...searchHistory.slice(0, 11)]) // 最多保留12个历史记录
      }
      console.log('搜索内容:', suggestion)
    }
    
    const handleHistoryToggle = () => {
      setHistoryOpen(open => !open)
    }
    
    const handleInputFocus = () => {
      // 重置手动隐藏状态，允许建议重新显示
      setManuallyHidden(false)
      
      if (searchValue.trim() && filteredSuggestions.length > 0) {
        setShowSuggestions(true)
      }
    }
    
    const handleInputBlur = () => {
      // 不再在失焦时隐藏建议，改为通过点击外部来控制
    }
    
    const handleKeyDown = (e) => {
      if (!showSuggestions || filteredSuggestions.length === 0) {
        return
      }
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedSuggestionIndex(prev => 
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < filteredSuggestions.length) {
            handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex])
          } else {
            handleSearch()
          }
          break
        case 'Escape':
          setShowSuggestions(false)
          setSelectedSuggestionIndex(-1)
          setManuallyHidden(true)
          break
        default:
          break
      }
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
        <div className={styles['search-box']} ref={searchBoxRef}>
          <Input
            value={searchValue}
            onChange={setSearchValue}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
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
          
          {/* 搜索建议区域 */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className={styles['suggestions-container']}>
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`${styles['suggestion-item']} ${
                    index === selectedSuggestionIndex ? styles['selected'] : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <SearchIcon size="14" className={styles['suggestion-icon']} />
                  <span className={styles['suggestion-text']}>
                    {suggestion.split(new RegExp(`(${searchValue})`, 'gi')).map((part, i) => 
                      part.toLowerCase() === searchValue.toLowerCase() ? (
                        <mark key={i} className={styles['highlight']}>{part}</mark>
                      ) : part
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
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