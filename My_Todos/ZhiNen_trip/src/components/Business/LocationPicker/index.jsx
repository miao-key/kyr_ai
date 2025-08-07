import { useState, useEffect, useCallback } from 'react'
import { 
  Popup, 
  Field, 
  Button, 
  Cell, 
  Toast,
  Loading,
  Tag
} from 'react-vant'
import { 
  Location, 
  Search, 
  Star,
  Clear,
  ArrowLeft
} from '@react-vant/icons'
import styles from './locationPicker.module.css'

const LocationPicker = ({ 
  visible, 
  onClose, 
  onSelect,
  currentLocation = '', // eslint-disable-line no-unused-vars
  title = '选择位置'
}) => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPos, setCurrentPos] = useState(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [recentLocations, setRecentLocations] = useState([])
  const [hotLocations, setHotLocations] = useState([])
  
  // 热门位置数据
  const defaultHotLocations = [
    { name: '北京', type: 'city', desc: '首都' },
    { name: '上海', type: 'city', desc: '魔都' },
    { name: '杭州', type: 'city', desc: '人间天堂' },
    { name: '成都', type: 'city', desc: '天府之国' },
    { name: '西安', type: 'city', desc: '古都' },
    { name: '厦门', type: 'city', desc: '鹭岛' },
    { name: '青岛', type: 'city', desc: '帆船之都' },
    { name: '大理', type: 'city', desc: '风花雪月' },
    { name: '丽江', type: 'city', desc: '古城' },
    { name: '三亚', type: 'city', desc: '热带天堂' },
    { name: '张家界', type: 'scenic', desc: '仙境' },
    { name: '九寨沟', type: 'scenic', desc: '人间仙境' }
  ]
  
  // 获取当前位置
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      Toast.fail('您的浏览器不支持定位功能')
      return
    }
    
    setGettingLocation(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // 这里应该调用真实的逆地理编码API
          // 模拟获取位置信息
          const mockLocation = {
            name: '当前位置',
            address: '北京市朝阳区建国门外大街1号',
            lat: latitude,
            lng: longitude,
            type: 'current'
          }
          
          setCurrentPos(mockLocation)
          Toast.success('定位成功')
        } catch (error) {
          console.error('逆地理编码失败:', error)
          Toast.fail('获取位置信息失败')
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        console.error('定位失败:', error)
        let errorMessage = '定位失败'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '您拒绝了定位权限'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用'
            break
          case error.TIMEOUT:
            errorMessage = '定位请求超时'
            break
        }
        
        Toast.fail(errorMessage)
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }, [])
  
  // 搜索位置
  const searchLocation = useCallback(async (keyword) => {
    if (!keyword.trim()) {
      setSearchResults([])
      return
    }
    
    setLoading(true)
    
    try {
      // 这里应该调用真实的地点搜索API
      // 模拟搜索结果
      const mockResults = [
        {
          name: keyword + '市',
          address: keyword + '市中心',
          type: 'city',
          desc: '城市'
        },
        {
          name: keyword + '公园',
          address: keyword + '市' + keyword + '公园',
          type: 'park',
          desc: '公园'
        },
        {
          name: keyword + '大学',
          address: keyword + '市' + keyword + '大学',
          type: 'university',
          desc: '大学'
        }
      ]
      
      // 添加一些延迟模拟网络请求
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSearchResults(mockResults)
    } catch (error) {
      console.error('搜索失败:', error)
      Toast.fail('搜索失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [])
  
  // 处理位置选择
  const handleLocationSelect = useCallback((location) => {
    // 使用函数式更新，避免依赖recentLocations
    setRecentLocations(prevRecentLocations => {
      const newRecentLocations = [
        location,
        ...prevRecentLocations.filter(item => item.name !== location.name)
      ].slice(0, 8) // 最多保存8个
      
      localStorage.setItem('recentLocations', JSON.stringify(newRecentLocations))
      return newRecentLocations
    })
    
    onSelect(location.name)
    onClose()
    Toast.success(`已选择：${location.name}`)
  }, [onSelect, onClose]) // 移除recentLocations依赖
  
  // 清空搜索
  const handleClearSearch = useCallback(() => {
    setSearchKeyword('')
    setSearchResults([])
  }, [])
  
  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(searchKeyword)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchKeyword]) // 移除searchLocation依赖，因为它是稳定的
  
  // 初始化数据
  useEffect(() => {
    if (visible) {
      // 加载最近使用的位置
      const saved = localStorage.getItem('recentLocations')
      if (saved) {
        try {
          setRecentLocations(JSON.parse(saved))
        } catch (error) {
          console.error('加载最近位置失败:', error)
        }
      }
      
      // 设置热门位置
      setHotLocations(defaultHotLocations)
    }
  }, [visible, defaultHotLocations])
  
  // 获取位置类型图标
  const getLocationIcon = (type) => {
    switch (type) {
      case 'current':
        return '📍'
      case 'city':
        return '🏙️'
      case 'scenic':
        return '🏔️'
      case 'park':
        return '🌳'
      case 'university':
        return '🎓'
      case 'hotel':
        return '🏨'
      case 'restaurant':
        return '🍽️'
      default:
        return '📍'
    }
  }
  
  return (
    <Popup
      visible={visible}
      onClose={onClose}
      position="bottom"
      style={{ height: '80vh' }}
      closeable={false}
      className={styles.locationPopup}
    >
      <div className={styles.container}>
        {/* 头部 */}
        <div className={styles.header}>
          <Button 
            icon={<ArrowLeft />} 
            type="default" 
            size="small"
            onClick={onClose}
            className={styles.backBtn}
          />
          <div className={styles.title}>{title}</div>
          <div style={{ width: 60 }}></div>
        </div>
        
        {/* 搜索框 */}
        <div className={styles.searchSection}>
          <Field
            value={searchKeyword}
            onChange={setSearchKeyword}
            placeholder="搜索城市、景点、地址..."
            leftIcon={<Search />}
            rightIcon={
              searchKeyword ? (
                <Clear onClick={handleClearSearch} />
              ) : null
            }
            className={styles.searchInput}
          />
        </div>
        
        {/* 当前位置 */}
        <div className={styles.currentSection}>
          <Cell
            title={
              <div className={styles.currentLocation}>
                <Location className={styles.currentIcon} />
                <span>使用当前位置</span>
              </div>
            }
            value={currentPos ? currentPos.address : '点击获取当前位置'}
            isLink
            onClick={getCurrentLocation}
            className={styles.currentCell}
          />
          {gettingLocation && (
            <div className={styles.locatingHint}>
              <Loading size="12px" />
              <span>正在定位...</span>
            </div>
          )}
        </div>
        
        {/* 搜索结果 */}
        {searchKeyword && (
          <div className={styles.resultsSection}>
            <div className={styles.sectionTitle}>搜索结果</div>
            {loading ? (
              <div className={styles.loadingState}>
                <Loading size="16px" />
                <span>正在搜索...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className={styles.resultsList}>
                {searchResults.map((location, index) => (
                  <div
                    key={index}
                    className={styles.locationItem}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className={styles.locationIcon}>
                      {getLocationIcon(location.type)}
                    </div>
                    <div className={styles.locationInfo}>
                      <div className={styles.locationName}>{location.name}</div>
                      <div className={styles.locationAddress}>{location.address}</div>
                    </div>
                    <Tag size="mini" type="primary">{location.desc}</Tag>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyText}>没有找到相关位置</div>
              </div>
            )}
          </div>
        )}
        
        {/* 最近使用 */}
        {!searchKeyword && recentLocations.length > 0 && (
          <div className={styles.recentSection}>
            <div className={styles.sectionTitle}>最近使用</div>
            <div className={styles.recentList}>
              {recentLocations.map((location, index) => (
                <div
                  key={index}
                  className={styles.locationItem}
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className={styles.locationIcon}>
                    {getLocationIcon(location.type)}
                  </div>
                  <div className={styles.locationInfo}>
                    <div className={styles.locationName}>{location.name}</div>
                    {location.address && (
                      <div className={styles.locationAddress}>{location.address}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 热门位置 */}
        {!searchKeyword && (
          <div className={styles.hotSection}>
            <div className={styles.sectionTitle}>
              <Star className={styles.sectionIcon} />
              <span>热门位置</span>
            </div>
            <div className={styles.hotGrid}>
              {hotLocations.map((location, index) => (
                <div
                  key={index}
                  className={styles.hotItem}
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className={styles.hotIcon}>
                    {getLocationIcon(location.type)}
                  </div>
                  <div className={styles.hotName}>{location.name}</div>
                  <div className={styles.hotDesc}>{location.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Popup>
  )
}

export default LocationPicker