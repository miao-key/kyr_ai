import useTitle from '@hooks/useTitle'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './trip.module.css'

const Trip = () => {
  useTitle('智旅-行程')
  const navigate = useNavigate()
  
  // 模拟行程数据
  const [trips, setTrips] = useState([
    {
      id: 1,
      title: '北京三日游',
      dates: '2024-03-15 至 2024-03-17',
      status: '已完成',
      image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400',
      days: [
        { day: 1, title: '天安门广场 → 故宫博物院 → 王府井', time: '09:00-18:00' },
        { day: 2, title: '长城一日游 → 明十三陵', time: '08:00-17:00' },
        { day: 3, title: '颐和园 → 圆明园 → 清华大学', time: '09:00-16:00' }
      ]
    },
    {
      id: 2,
      title: '上海周末游',
      dates: '2024-04-06 至 2024-04-07',
      status: '进行中',
      image: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=400',
      days: [
        { day: 1, title: '外滩 → 南京路 → 豫园', time: '10:00-20:00' },
        { day: 2, title: '迪士尼乐园', time: '09:00-22:00' }
      ]
    },
    {
      id: 3,
      title: '杭州西湖游',
      dates: '2024-04-20 至 2024-04-22',
      status: '计划中',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&crop=center',
      days: [
        { day: 1, title: '西湖 → 雷峰塔 → 三潭印月', time: '09:00-17:00' },
        { day: 2, title: '灵隐寺 → 飞来峰 → 宋城', time: '08:30-19:00' },
        { day: 3, title: '千岛湖一日游', time: '07:00-18:00' }
      ]
    }
  ])

  const handleAIPlan = () => {
    navigate('/coze')
  }

  const handleCreateTrip = () => {
    console.log('创建行程功能待实现...')
    // 这里将来实现创建行程的功能
  }

  const handleDeleteTrip = (tripId) => {
    if (window.confirm('确定要删除这个行程吗？此操作不可撤销。')) {
      setTrips(trips.filter(trip => trip.id !== tripId))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case '已完成': return '#52c41a'
      case '进行中': return '#1890ff' 
      case '计划中': return '#faad14'
      default: return '#d9d9d9'
    }
  }

  return (
    <div className={styles.tripContainer}>
      {/* 头部区域 */}
      <div className={styles.tripHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.tripTitle}>我的行程</h1>
          <button className={styles.createTripBtn} onClick={handleCreateTrip}>
            <span className={styles.createIcon}>+</span>
            创建行程
          </button>
        </div>
        <div className={styles.tripStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{trips.length}</span>
            <span className={styles.statLabel}>总行程</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{trips.filter(t => t.status === '已完成').length}</span>
            <span className={styles.statLabel}>已完成</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{trips.filter(t => t.status === '进行中').length}</span>
            <span className={styles.statLabel}>进行中</span>
          </div>
        </div>
      </div>

      {/* AI机器人按钮 */}
      <div className={styles.aiRobotButton} onClick={handleAIPlan}>
        <div className={styles.robotContainer}>
          <div className={styles.robotHead}>
            <div className={styles.robotFace}>
              <div className={styles.robotEyes}>
                <div className={styles.robotEye}>
                  <div className={styles.eyePupil}></div>
                </div>
                <div className={`${styles.robotEye} ${styles.right}`}>
                  <div className={styles.eyePupil}></div>
                </div>
              </div>
              <div className={styles.robotMouth}>
                <div className={styles.mouthSmile}></div>
              </div>
            </div>
          </div>
          <div className={styles.robotSparkles}>
            <div className={`${styles.sparkle} ${styles['sparkle-1']}`}>✨</div>
            <div className={`${styles.sparkle} ${styles['sparkle-2']}`}>💫</div>
            <div className={`${styles.sparkle} ${styles['sparkle-3']}`}>⭐</div>
          </div>
        </div>
        <span className={styles.robotText}>🤖 AI智能规划行程</span>
      </div>

      {/* 行程列表 */}
      <div className={styles.tripList}>
        {trips.map(trip => (
          <div key={trip.id} className={styles.tripCard}>
            <div className={styles.tripCardHeader}>
              <img src={trip.image} alt={trip.title} className={styles.tripImage} />
              <div className={styles.tripInfo}>
                <h3 className={styles.tripName}>{trip.title}</h3>
                <p className={styles.tripDates}>{trip.dates}</p>
                <span 
                  className={styles.tripStatus} 
                  style={{ backgroundColor: getStatusColor(trip.status) }}
                >
                  {trip.status}
                </span>
              </div>
              <button 
                className={styles.deleteTripBtn}
                onClick={() => handleDeleteTrip(trip.id)}
                title="删除行程"
              >
                <span className={styles.deleteIcon}>✕</span>
              </button>
            </div>
            
            <div className={styles.tripDetails}>
              <h4 className={styles.detailsTitle}>行程安排</h4>
              <div className={styles.daysList}>
                {trip.days.map(day => (
                  <div key={day.day} className={styles.dayItem}>
                    <div className={styles.dayNumber}>Day {day.day}</div>
                    <div className={styles.dayContent}>
                      <div className={styles.dayTitle}>{day.title}</div>
                      <div className={styles.dayTime}>{day.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Trip
