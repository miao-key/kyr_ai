/**
 * Pexels API集成 - 获取高质量旅游、生活相关图片
 * 
 * 使用说明：
 * 在.env.local中配置 VITE_PEXELS_API=your-pexels-api-key
 * 
 * API文档: https://www.pexels.com/api/documentation/
 */

import axios from 'axios';
import { getPexelsConfig, createRequestConfig, buildUrl } from '../utils/apiConfig';

// Pexels API请求封装
// 添加缓存机制
const API_CACHE = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存
const MAX_CACHE_SIZE = 50
// 请求队列管理，防止重复请求
const REQUEST_QUEUE = new Map()

// 缓存管理
const getCacheKey = (endpoint, params) => {
  return `${endpoint}?${new URLSearchParams(params).toString()}`
}

const getCachedData = (key) => {
  const cached = API_CACHE.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('🎯 使用缓存数据:', key)
    return cached.data
  }
  return null
}

const setCachedData = (key, data) => {
  // 限制缓存大小
  if (API_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = API_CACHE.keys().next().value
    API_CACHE.delete(firstKey)
  }
  
  API_CACHE.set(key, {
    data,
    timestamp: Date.now()
  })
}

// 智能API请求函数 - 根据环境自动选择调用方式
const smartRequest = async (endpoint, params = {}) => {
    const cacheKey = getCacheKey(endpoint, params)
    
    // 检查缓存
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
        return cachedData
    }
    
    // 请求去重 - 如果相同请求正在进行，等待结果
    if (REQUEST_QUEUE.has(cacheKey)) {
        console.log('⏳ 等待进行中的请求:', cacheKey)
        return await REQUEST_QUEUE.get(cacheKey)
    }

    // 创建请求Promise并加入队列
    const requestPromise = (async () => {
        try {
            const config = getPexelsConfig();
            
            if (config.useServerless) {
                // 生产环境：使用serverless函数
                const url = buildUrl(config, endpoint);
                const requestConfig = createRequestConfig(config);
                
                // 将参数添加到URL查询字符串中
                const urlObj = new URL(url, window.location.origin);
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null) {
                        urlObj.searchParams.append(key, params[key]);
                    }
                });

                const response = await fetch(urlObj.toString(), {
                    ...requestConfig,
                    headers: {
                        'Content-Type': 'application/json',
                        ...requestConfig.headers
                    }
                });

                if (!response.ok) {
                    throw new Error(`Serverless API错误: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('🖼️ Serverless API响应:', data);
                
                // 缓存成功的响应
                setCachedData(cacheKey, data);
                
                return data;
            } else {
                // 本地环境：直接调用Pexels API
                const url = buildUrl(config, endpoint);
                const requestConfig = createRequestConfig(config, { params });
                
                console.log('🌐 直接调用Pexels API:', url);
                
                const response = await axios.get(url, requestConfig);
                const data = response.data;
                
                console.log('🖼️ Pexels API响应:', data);
                
                // 缓存成功的响应
                setCachedData(cacheKey, data);
                
                return data;
            }
        } catch (error) {
            console.error('❌ API请求失败:', error);
            return generateMockImages();
        } finally {
            // 请求完成后从队列中移除
            REQUEST_QUEUE.delete(cacheKey);
        }
    })();
    
    // 将请求加入队列
    REQUEST_QUEUE.set(cacheKey, requestPromise);
    
    return await requestPromise;
}

// 优化getMixedTravelContent - 减少并发请求，增强缓存和去重
export const getMixedTravelContent = async (page = 1, perPage = 20) => {
    const cacheKey = `mixed_travel_${page}_${perPage}`
    
    // 检查缓存
    const cached = getCachedData(cacheKey)
    if (cached) {
        console.log('🎯 使用缓存的混合旅游内容:', { page, perPage })
        return cached
    }
    
    // 检查是否已有相同请求在进行中
    if (REQUEST_QUEUE.has(cacheKey)) {
        console.log('🔄 等待进行中的混合旅游内容请求:', { page, perPage })
        return await REQUEST_QUEUE.get(cacheKey)
    }
    
    console.log('🎯 开始获取混合旅游内容:', { page, perPage })
    
    const requestPromise = (async () => {
        try {
            // 改为串行请求，减少API压力，添加请求间隔
            const results = []
            const categories = [
                { func: getTravelImages, ratio: 0.4, name: '旅游' },
                { func: getFoodImages, ratio: 0.25, name: '美食' },
                { func: getLandscapeImages, ratio: 0.25, name: '风景' },
                { func: getPeopleImages, ratio: 0.1, name: '人物' }
            ]
            
            for (const category of categories) {
                const count = Math.ceil(perPage * category.ratio)
                console.log(`📸 获取${category.name}图片:`, count, '张')
                
                try {
                    const data = await category.func(page, count)
                    results.push(data)
                } catch (error) {
                    console.warn(`⚠️ ${category.name}图片获取失败，使用默认数据:`, error.message)
                    // 如果某个分类失败，使用模拟数据填充
                    results.push({
                        photos: generateMockPhotosForCategory(category.name, count),
                        total_results: 100
                    })
                }
                
                // 添加请求间隔，避免API限流
                if (categories.indexOf(category) < categories.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300)) // 增加间隔时间
                }
            }
            
            // 合并结果
            const allPhotos = results.reduce((acc, result) => {
                return acc.concat(result.photos || [])
            }, [])

            // Fisher-Yates洗牌算法
            for (let i = allPhotos.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allPhotos[i], allPhotos[j]] = [allPhotos[j], allPhotos[i]]
            }

            console.log('✅ 成功获取混合旅游内容:', allPhotos.length, '张图片')
            
            const result = {
                photos: allPhotos.slice(0, perPage),
                total_results: Math.max(...results.map(r => r.total_results || 0)),
                page,
                per_page: perPage
            }
            
            // 缓存结果
            setCachedData(cacheKey, result, 5 * 60 * 1000) // 缓存5分钟
            
            return result
        } catch (error) {
            console.error('❌ 获取混合旅游内容失败:', error)
            return generateMockImages()
        } finally {
            REQUEST_QUEUE.delete(cacheKey)
        }
    })()
    
    REQUEST_QUEUE.set(cacheKey, requestPromise)
    return await requestPromise
}

// 模拟数据生成器（当API不可用时使用）
const generateMockImages = () => {
    const mockPhotos = Array.from({ length: 20 }, (_, index) => ({
        id: `mock-${index + 1}`,
        width: 400,
        height: Math.floor(Math.random() * 200) + 300, // 随机高度
        url: `https://picsum.photos/400/${Math.floor(Math.random() * 200) + 300}?random=${index}`,
        photographer: `摄影师${index + 1}`,
        photographer_url: '#',
        photographer_id: index + 1,
        avg_color: '#' + Math.floor(Math.random()*16777215).toString(16),
        src: {
            original: `https://picsum.photos/800/${Math.floor(Math.random() * 400) + 600}?random=${index}`,
            large2x: `https://picsum.photos/800/${Math.floor(Math.random() * 400) + 600}?random=${index}`,
            large: `https://picsum.photos/600/${Math.floor(Math.random() * 300) + 450}?random=${index}`,
            medium: `https://picsum.photos/400/${Math.floor(Math.random() * 200) + 300}?random=${index}`,
            small: `https://picsum.photos/200/${Math.floor(Math.random() * 100) + 150}?random=${index}`,
            portrait: `https://picsum.photos/400/${Math.floor(Math.random() * 200) + 500}?random=${index}`,
            landscape: `https://picsum.photos/600/${Math.floor(Math.random() * 200) + 300}?random=${index}`,
            tiny: `https://picsum.photos/100/${Math.floor(Math.random() * 50) + 75}?random=${index}`
        },
        liked: false,
        alt: `旅行图片 ${index + 1}`
    }))

    console.log('🎨 使用模拟图片数据:', mockPhotos.length, '张')
    
    return {
        photos: mockPhotos,
        total_results: 1000,
        page: 1,
        per_page: 20,
        next_page: 'mock-next-page-url'
    }
}

// 为特定分类生成模拟图片
const generateMockPhotosForCategory = (categoryName, count) => {
    const categoryKeywords = {
        '旅游': ['travel', 'vacation', 'tourism'],
        '美食': ['food', 'cuisine', 'restaurant'],
        '风景': ['landscape', 'nature', 'scenery'],
        '人物': ['people', 'portrait', 'person']
    }
    
    const keywords = categoryKeywords[categoryName] || ['general']
    const keyword = keywords[Math.floor(Math.random() * keywords.length)]
    
    return Array.from({ length: count }, (_, index) => ({
        id: `mock-${categoryName}-${Date.now()}-${index}`,
        width: 800,
        height: 600,
        url: `https://picsum.photos/800/600?random=${keyword}-${Date.now()}-${index}`,
        photographer: `${categoryName}摄影师`,
        photographer_url: '#',
        photographer_id: 1,
        avg_color: '#' + Math.floor(Math.random()*16777215).toString(16),
        src: {
            original: `https://picsum.photos/800/600?random=${keyword}-${Date.now()}-${index}`,
            large2x: `https://picsum.photos/1600/1200?random=${keyword}-${Date.now()}-${index}`,
            large: `https://picsum.photos/800/600?random=${keyword}-${Date.now()}-${index}`,
            medium: `https://picsum.photos/400/300?random=${keyword}-${Date.now()}-${index}`,
            small: `https://picsum.photos/200/150?random=${keyword}-${Date.now()}-${index}`,
            portrait: `https://picsum.photos/400/600?random=${keyword}-${Date.now()}-${index}`,
            landscape: `https://picsum.photos/600/400?random=${keyword}-${Date.now()}-${index}`,
            tiny: `https://picsum.photos/100/75?random=${keyword}-${Date.now()}-${index}`
        },
        liked: false,
        alt: `${categoryName}图片`
    }))
}

// 获取随机头像
export const getRandomAvatar = async () => {
  console.log('🎯 开始获取随机头像...')
  console.log('🌐 当前时间:', new Date().toLocaleTimeString())
  
  try {
    console.log('📡 正在请求头像API: /search?query=portrait')
    
    // 使用智能API配置系统获取人像照片
    const data = await smartRequest('/search', {
      query: 'portrait',
      page: 1,
      per_page: 20
    })
    
    console.log('📦 头像API返回数据:', data)
    console.log('📦 数据类型:', typeof data, '是否为数组:', Array.isArray(data?.photos))
    
    // 检查返回的数据结构
    if (data && data.photos && data.photos.length > 0) {
      // 随机选择一张照片
      const randomIndex = Math.floor(Math.random() * data.photos.length)
      const selectedPhoto = data.photos[randomIndex]
      
      console.log('📸 选中的头像数据:', {
        id: selectedPhoto.id,
        photographer: selectedPhoto.photographer
      })
      
      // 处理Pexels头像数据
      const avatarUrl = selectedPhoto.src?.medium || selectedPhoto.src?.small || selectedPhoto.url
      console.log('✅ 成功获取Pexels头像URL:', avatarUrl)
      console.log('📸 Pexels头像详情:', {
        id: selectedPhoto.id,
        photographer: selectedPhoto.photographer,
        alt: selectedPhoto.alt
      })
      
      return {
        success: true,
        avatar: avatarUrl,
        source: 'pexels',
        photographer: selectedPhoto.photographer,
        photographerUrl: selectedPhoto.photographer_url,
        title: selectedPhoto.alt
      }
    } else {
      console.log('⚠️ 没有找到合适的头像，使用DiceBear降级')
      // 降级使用DiceBear头像
      const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
      console.log('🔄 生成DiceBear降级头像:', fallbackAvatar)
      return {
        success: true,
        avatar: fallbackAvatar,
        source: 'dicebear_fallback'
      }
    }
  } catch (error) {
    console.error('❌ 头像获取失败:', error)
    console.error('❌ 错误详情:', error.message, error.stack)
    // 降级使用DiceBear头像
    const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
    console.log('🔄 使用DiceBear降级头像:', fallbackAvatar)
    
    return {
      success: true,
      avatar: fallbackAvatar,
      source: 'dicebear_error_fallback'
    }
  }
}

// 导出工具函数
export const formatImageUrl = (photo, size = 'medium') => {
    return photo?.src?.[size] || photo?.src?.medium || '/placeholder-image.jpg'
}

export const formatPhotographer = (photo) => {
    return {
        name: photo?.photographer || '未知摄影师',
        url: photo?.photographer_url || '#',
        id: photo?.photographer_id || 0
    }
}

// 获取旅游相关图片
const getTravelImages = async (page = 1, perPage = 10) => {
    return await smartRequest('/search', {
        query: 'travel',
        page,
        per_page: perPage
    })
}

// 获取美食相关图片
const getFoodImages = async (page = 1, perPage = 10) => {
    return await smartRequest('/search', {
        query: 'food',
        page,
        per_page: perPage
    })
}

// 获取风景相关图片
const getLandscapeImages = async (page = 1, perPage = 10) => {
    return await smartRequest('/search', {
        query: 'landscape',
        page,
        per_page: perPage
    })
}

// 获取人物相关图片
const getPeopleImages = async (page = 1, perPage = 10) => {
    return await smartRequest('/search', {
        query: 'people',
        page,
        per_page: perPage
    })
}