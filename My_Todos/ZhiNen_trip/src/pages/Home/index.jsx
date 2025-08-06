import useTitle from '@/hooks/useTitle'
import {
  Button,
  Input,
  Flex
} from 'react-vant';
import { Search as SearchIcon } from '@react-vant/icons';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCarouselPhotos } from '@/services/pexelsApi';
import WaterfallLayout from '@/components/WaterfallLayout';
import SimpleWaterfall from '@/components/WaterfallLayout/SimpleWaterfall';
import DebugWaterfall from '@/components/WaterfallLayout/DebugWaterfall';
import WaterfallFixed from '@/components/WaterfallLayout/WaterfallFixed';
import { imageUtils } from '@/utils';
import useDebounce from '@/hooks/useDebounce';
import useThrottle from '@/hooks/useThrottle';
import styles from './home.module.css';

// 重构后的轮播组件 - 使用Pexels API + 无缝循环
const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // 初始位置设为1（真实的第一张）
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [timerKey, setTimerKey] = useState(0); // 添加计时器重置键
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false); // 控制过渡状态
  
  // 创建用于无缝循环的扩展图片数组
  const extendedImages = images.length > 0 ? [
    { ...images[images.length - 1], id: `clone-last-${images[images.length - 1].id}` }, // 克隆最后一张到开头
    ...images,
    { ...images[0], id: `clone-first-${images[0].id}` } // 克隆第一张到末尾
  ] : [];

  // 从Pexels API加载轮播图片
  useEffect(() => {
    const loadCarouselImages = async () => {
      try {
        setLoading(true);
        const carouselImages = await getCarouselPhotos(4);
        if (carouselImages && carouselImages.length > 0) {
          setImages(carouselImages);
        } else {
          // 使用备用图片 - 更新为与title相关联的图片
          setImages([
            {
              id: 1,
              url: 'https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
              title: '九寨沟风光',
              description: '人间仙境，水色斑斓'
            },
            {
              id: 2,
              url: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
              title: '桂林山水',
              description: '山水甲天下，如诗如画'
            },
            {
              id: 3,
              url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
              title: '西湖美景',
              description: '淡妆浓抹总相宜'
            },
            {
              id: 4,
              url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
              title: '张家界天门山',
              description: '天门洞开，云雾缭绕'
            }
          ]);
        }
      } catch (error) {
        console.error('加载轮播图失败:', error);
        // 使用备用图片 - 与上面保持一致
        setImages([
          {
            id: 1,
            url: 'https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            title: '九寨沟风光',
            description: '人间仙境，水色斑斓'
          },
          {
            id: 2,
            url: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            title: '桂林山水',
            description: '山水甲天下，如诗如画'
          },
          {
            id: 3,
            url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            title: '西湖美景',
            description: '淡妆浓抹总相宜'
          },
          {
            id: 4,
            url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            title: '张家界天门山',
            description: '天门洞开，云雾缭绕'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCarouselImages();
  }, []);

  // 当图片加载完成后，确保初始位置正确
  useEffect(() => {
    if (images.length > 0 && currentIndex === 1) {
      // 图片加载完成，位置已经正确，不需要额外操作
    } else if (images.length > 0) {
      // 重置到第一张真实图片的位置
      setCurrentIndex(1);
      setIsTransitioning(false);
    }
  }, [images.length]);

  // 重置计时器的函数
  const resetTimer = useCallback(() => {
    setTimerKey(prev => prev + 1);
  }, []);

  // 处理过渡结束后的无缝重置
  const handleTransitionEnd = useCallback(() => {
    if (!isTransitioning) return;
    
    // 如果在克隆的最后一张（extendedImages.length - 1），跳到真实的第一张（index 1）
    if (currentIndex === extendedImages.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    }
    // 如果在克隆的第一张（index 0），跳到真实的最后一张（images.length）
    else if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(images.length);
    }
    else {
      setIsTransitioning(false);
    }
  }, [currentIndex, extendedImages.length, images.length, isTransitioning]);

  // 自动轮播 - 修改为处理扩展数组
  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex - 1);
  }, [isTransitioning]);

  // 手动切换到上一张并重置计时器
  const handlePrevSlide = useCallback(() => {
    prevSlide();
    resetTimer();
  }, [prevSlide, resetTimer]);

  // 手动切换到下一张并重置计时器
  const handleNextSlide = useCallback(() => {
    nextSlide();
    resetTimer();
  }, [nextSlide, resetTimer]);

  // 自动播放定时器 - 依赖timerKey来重置
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000); // 4秒切换一次
    return () => clearInterval(timer);
  }, [nextSlide, timerKey]); // 添加timerKey依赖

  // 触摸事件处理 - 添加节流机制
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = useThrottle((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, 16); // 60fps的节流，约16ms一次

  const handleTouchEnd = useDebounce(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextSlide(); // 使用带重置计时器的函数
    } else if (isRightSwipe) {
      handlePrevSlide(); // 使用带重置计时器的函数
    }
  }, 100); // 100ms防抖，避免快速连续滑动

  // 点击指示器并重置计时器 - 添加防抖机制，调整为真实图片索引
  const goToSlide = useDebounce((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index + 1); // +1 因为真实图片从index 1开始
    resetTimer();
  }, 150); // 150ms防抖，避免快速重复点击

  // 如果还在加载或没有图片，显示加载状态
  if (loading || images.length === 0) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.carouselWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            {loading ? '加载中...' : '暂无图片'}
          </div>
        </div>
      </div>
    );
  }

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
            transform: `translateX(-${currentIndex * (100 / extendedImages.length)}%)`,
            transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedImages.map((image, index) => (
            <div key={image.id} className={styles.carouselSlide}>
              <img 
                src={image.url} 
                alt={image.title}
                className={styles.carouselImage}
                loading={index <= 2 ? 'eager' : 'lazy'} // 预加载前3张
                decoding="async"
                onError={(e) => {
                  e.target.src = imageUtils.placeholder(1200, 600, image.title);
                }}
              />
              <div className={styles.imageOverlay}>
                <h3 className={styles.imageTitle}>{image.title}</h3>
                <p className={styles.imageDescription}>{image.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* 导航箭头 - 使用带重置计时器的函数 */}
        <button 
          className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
          onClick={handlePrevSlide}
          aria-label="上一张"
        >
          ‹
        </button>
        <button 
          className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
          onClick={handleNextSlide}
          aria-label="下一张"
        >
          ›
        </button>
      </div>
      
      {/* 指示器 - 根据真实图片数量显示，并计算当前激活状态 */}
      <div className={styles.carouselDots}>
        {images.map((_, index) => {
          // 计算当前真实图片的索引（去除克隆图片的影响）
          let realCurrentIndex = currentIndex - 1; // 减去开头的克隆图片
          if (currentIndex === 0) realCurrentIndex = images.length - 1; // 如果在开头克隆，显示最后一张
          if (currentIndex === extendedImages.length - 1) realCurrentIndex = 0; // 如果在末尾克隆，显示第一张
          
          return (
            <button
              key={index}
              className={`${styles.carouselDot} ${realCurrentIndex === index ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`跳转到第${index + 1}张图片`}
            />
          );
        })}
      </div>
    </div>
  );
};



const Home = () => {
    useTitle('智旅-首页')
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState('')
    
    // 搜索功能添加防抖机制
    const handleSearch = useDebounce(() => {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`)
    }, 300)
    
    // 搜索框点击添加防抖机制
    const handleInputClick = useDebounce(() => {
      navigate('/search')
    }, 200)

    // 导航数据
    const navigationItems = [
      {
        id: 'hotel',
        title: '酒店',
        icon: '🏨',
        iconClass: styles.hotelIcon,
        route: '/hotel'
      },
      {
        id: 'flight',
        title: '机票',
        icon: '✈️',
        iconClass: styles.flightIcon,
        route: '/flight'
      },
      {
        id: 'train',
        title: '火车票',
        icon: '🚄',
        iconClass: styles.trainIcon,
        route: '/train'
      },
      {
        id: 'taxi',
        title: '打车',
        icon: '🚗',
        iconClass: styles.taxiIcon,
        route: '/taxi'
      },
      {
        id: 'tourism',
        title: '旅游',
        icon: '🏖️',
        iconClass: styles.tourismIcon,
        route: '/tourism'
      }
    ]

    // 导航点击添加防抖机制
    const handleNavClick = useDebounce((route) => {
      navigate(route)
    }, 250) // 250ms防抖，避免重复点击
    
  return (
    <div className={styles.container}>
      {/* 搜索框 */}
      <div className={styles.searchContainer}>
        <Input
          value={searchValue}
          onChange={setSearchValue}
          placeholder="搜索目的地、景点、酒店等"
          clearable={false}
          onClick={handleInputClick}
          readOnly
          className={styles.searchInput}
        />
        <Button
          type="primary"
          round
          icon={<SearchIcon size="16" />}
          onClick={handleSearch}
          className={styles.searchButton}
        />
      </div>
      
      {/* 导航区域 - 包含导航图标和轮播图 */}
      <div className={styles.navigationGrid}>
        {/* 导航图标 */}
        <div className={styles.navigationContent}>
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className={styles.navigationItem}
              onClick={() => handleNavClick(item.route)}
            >
              <div 
                className={`${styles.iconContainer} ${item.iconClass}`}
              >
                <span className={styles.iconEmoji}>{item.icon}</span>
              </div>
              <span className={styles.iconText}>{item.title}</span>
            </div>
          ))}
        </div>
        
        {/* 轮播图 */}
        <ImageCarousel />
        
        {/* 瀑布流攻略展示 - 使用Pexels API */}
        <WaterfallFixed columns={2} gap={12} />
      </div>
    </div>
  )
}

export default Home
