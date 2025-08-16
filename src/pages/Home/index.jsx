import { useState, useEffect } from 'react';
import styles from './home.module.css';

// 优化后的轮播组件
const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // 从1开始，因为0是克隆的最后一张
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  
  // 图片数据 - 使用您创建的本地图片
  // 图片数据 - 修改为相对路径
  const images = [
    {
      id: 1,
      url: '../My_Todos/ZhiNen_trip/public/images/jiuzhaigou.jpg',
      title: '九寨沟'
    },
    {
      id: 2,
      url: '../My_Todos/ZhiNen_trip/public/images/guilin.jpg',
      title: '桂林山水'
    },
    {
      id: 3,
      url: '../My_Todos/ZhiNen_trip/public/images/xihu.jpg',
      title: '西湖美景'
    },
    {
      id: 4,
      url: '../My_Todos/ZhiNen_trip/public/images/tianmenshan.jpg',
      title: '张家界天门山'
    }
  ];

  // 创建扩展的图片数组（首尾各添加一张克隆图片）
  const extendedImages = [
    images[images.length - 1], // 克隆最后一张
    ...images,
    images[0] // 克隆第一张
  ];

  // 自动播放逻辑
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex === images.length) {
        // 到达真实的最后一张，跳转到克隆的第一张
        setCurrentIndex(images.length + 1);
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentIndex(1);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 300);
      } else if (currentIndex === extendedImages.length - 1) {
        // 在克隆的第一张，直接跳到真实的第一张
        setIsTransitioning(false);
        setCurrentIndex(1);
        setTimeout(() => setIsTransitioning(true), 50);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIndex, images.length, extendedImages.length]);

  // 触摸事件处理
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // 向左滑动，显示下一张
      if (currentIndex === images.length) {
        setCurrentIndex(images.length + 1);
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentIndex(1);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 300);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }

    if (isRightSwipe) {
      // 向右滑动，显示上一张
      if (currentIndex === 1) {
        setCurrentIndex(0);
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentIndex(images.length);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 300);
      } else {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  // 点击导航点
  const handleDotClick = (index) => {
    setCurrentIndex(index + 1); // +1 因为extendedImages的索引偏移
  };

  return (
    <div className={styles.carouselContainer}>
      <div 
        className={styles.carouselWrapper}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={styles.carouselTrack}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.3s ease' : 'none',
            width: `${extendedImages.length * 100}%`,
          }}
        >
          {extendedImages.map((image, index) => (
            <div key={`${image.id}-${index}`} className={styles.carouselSlide}>
              <img 
                src={image.url} 
                alt={image.title}
                className={styles.carouselImage}
                loading="eager"
                decoding="async"
              />
              <div className={styles.imageOverlay}>
                <h3 className={styles.imageTitle}>{image.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 导航点 */}
      <div className={styles.carouselDots}>
        {images.map((_, index) => (
          <button
            key={index}
            className={`${styles.carouselDot} ${
              (currentIndex === index + 1 || 
               (currentIndex === 0 && index === images.length - 1) ||
               (currentIndex === extendedImages.length - 1 && index === 0))
                ? styles.active 
                : ''
            }`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className={styles.container}>
      {/* 搜索框 */}
      <div className={styles.searchContainer}>
        <input
          placeholder="搜索目的地、景点、酒店等"
          className={styles.searchInput}
        />
        <button className={styles.searchButton}>
          🔍
        </button>
      </div>
      
      {/* 导航区域 - 包含导航图标和轮播图 */}
      <div className={styles.navigationGrid}>
        {/* 导航图标 */}
        <div className={styles.navigationContent}>
          <div className={styles.navigationItem}>
            <div className={`${styles.iconContainer} ${styles.hotelIcon}`}>
              <div className={styles.iconEmoji}>🏨</div>
              <div className={styles.iconText}>酒店</div>
            </div>
          </div>
          <div className={styles.navigationItem}>
            <div className={`${styles.iconContainer} ${styles.flightIcon}`}>
              <div className={styles.iconEmoji}>✈️</div>
              <div className={styles.iconText}>机票</div>
            </div>
          </div>
          <div className={styles.navigationItem}>
            <div className={`${styles.iconContainer} ${styles.trainIcon}`}>
              <div className={styles.iconEmoji}>🚄</div>
              <div className={styles.iconText}>火车票</div>
            </div>
          </div>
          <div className={styles.navigationItem}>
            <div className={`${styles.iconContainer} ${styles.taxiIcon}`}>
              <div className={styles.iconEmoji}>🚗</div>
              <div className={styles.iconText}>打车</div>
            </div>
          </div>
          <div className={styles.navigationItem}>
            <div className={`${styles.iconContainer} ${styles.tourismIcon}`}>
              <div className={styles.iconEmoji}>🏖️</div>
              <div className={styles.iconText}>旅游</div>
            </div>
          </div>
        </div>
        
        {/* 轮播图 - 在导航下方的白色背景上 */}
        <ImageCarousel />
      </div>
    </div>
  )
}

export default Home