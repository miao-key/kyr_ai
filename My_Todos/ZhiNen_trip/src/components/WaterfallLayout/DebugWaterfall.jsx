/**
 * 调试版瀑布流组件 - 最简化版本
 */

import { useEffect, useState } from 'react'
import { getGuidePhotos } from '../../services/pexelsApi'
import { imageUtils } from '@/utils'

const DebugWaterfall = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🔄 DebugWaterfall: 开始加载数据')
        
        const data = await getGuidePhotos(6, 1)
        console.log('📊 DebugWaterfall: 加载的数据', data)
        
        if (data && data.length > 0) {
          setItems(data)
          console.log('✅ DebugWaterfall: 数据设置成功', data.length, '条')
        } else {
          console.log('⚠️ DebugWaterfall: 没有获取到数据')
          setError('没有获取到数据')
        }
      } catch (err) {
        console.error('❌ DebugWaterfall: 加载数据失败', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>🔄 正在加载...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <div>❌ 错误: {error}</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>📭 暂无数据</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        📊 调试信息: 共 {items.length} 条数据
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px' 
      }}>
        {items.map((item, index) => (
          <div 
            key={item.id || index}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <img 
              src={item.image} 
              alt={item.title}
              style={{ 
                width: '100%', 
                height: '120px', 
                objectFit: 'cover' 
              }}
              onError={(e) => {
                e.target.src = imageUtils.placeholder(200, 120, `图片${index + 1}`)
              }}
            />
            <div style={{ padding: '8px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.title}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.location} • {item.price}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DebugWaterfall