import useTitle from '@/hooks/useTitle'
import {
  Button,
  Input,
  Flex
} from 'react-vant';
import { Search as SearchIcon } from '@react-vant/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    useTitle('智旅-首页')
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState('')
    
    const handleSearch = () => {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`)
    }
    
    const handleInputClick = () => {
      navigate('/search')
    }
    
    // 导航数据
    const navigationItems = [
      {
        id: 'hotel',
        title: '酒店',
        icon: '🏨',
        bgColor: '#8B5CF6',
        route: '/hotel'
      },
      {
        id: 'flight',
        title: '机票',
        icon: '✈️',
        bgColor: '#06B6D4',
        route: '/flight'
      },
      {
        id: 'train',
        title: '火车票',
        icon: '🚄',
        bgColor: '#10B981',
        route: '/train'
      },
      {
        id: 'taxi',
        title: '打车',
        icon: '🚗',
        bgColor: '#F59E0B',
        route: '/taxi'
      },
      {
        id: 'tourism',
        title: '旅游',
        icon: '🏖️',
        bgColor: '#EF4444',
        route: '/tourism'
      }
    ]
    
    const handleNavClick = (route) => {
      navigate(route)
    }
    
  return (
    <div className="p-4" style={{ margin: '16px' }}>
      {/* 搜索框 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '2px',
          border: '1px solid #e5e5e5',
          maxWidth: '320px',
          margin: '0 auto 24px auto'
        }}
      >
        <Input
          value={searchValue}
          onChange={setSearchValue}
          placeholder="搜索目的地、景点、酒店等"
          clearable={false}
          onClick={handleInputClick}
          readOnly
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            padding: '8px 12px',
            fontSize: '13px',
            color: '#333',
            cursor: 'pointer'
          }}
        />
        <Button
          type="primary"
          round
          icon={<SearchIcon size="16" />}
          onClick={handleSearch}
          style={{
            width: '32px',
            height: '32px',
            minWidth: '32px',
            backgroundColor: '#1976d2',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '2px'
          }}
        />
      </div>
      
      {/* 导航网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        maxWidth: '320px',
        margin: '0 auto'
      }}>
        {navigationItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNavClick(item.route)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: item.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              {item.icon}
            </div>
            <span style={{
              fontSize: '12px',
              color: '#333',
              fontWeight: '500'
            }}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
