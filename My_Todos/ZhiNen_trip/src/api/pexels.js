/**
 * Pexels API集成 - 获取高质量旅游、生活相关图片
 * 
 * 使用说明：
 * 在.env.local中配置 VITE_PEXELS_API=your-pexels-api-key
 * 
 * API文档: https://www.pexels.com/api/documentation/
 */

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API
// 生产（Vercel）通过无服务函数隐藏密钥；开发仍直连官方 API
const PEXELS_BASE_URL = typeof window !== 'undefined' && window.location?.host?.includes('vercel.app')
  ? '/api/pexels'
  : 'https://api.pexels.com/v1'

// Pexels API请求封装
// 添加缓存机制
const API_CACHE = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存
const MAX_CACHE_SIZE = 50
const REQUEST_QUEUE = new Map() // 请求去重队列

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

// 优化的pexels请求函数
const pexelsRequest = async (endpoint, options = {}) => {
    const cacheKey = getCacheKey(endpoint, options.params || {})
    
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
    
    if (!PEXELS_API_KEY) {
        console.warn('⚠️ Pexels API Key未配置，使用模拟数据')
        return generateMockImages()
    }

    // 创建请求Promise并加入队列
    const requestPromise = (async () => {
        try {
            const response = await fetch(`${PEXELS_BASE_URL}${endpoint}`, {
                headers: {
                    ...(PEXELS_BASE_URL.startsWith('http') && PEXELS_API_KEY ? { 'Authorization': PEXELS_API_KEY } : {}),
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            })

            if (!response.ok) {
                throw new Error(`Pexels API错误: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log('🖼️ Pexels API响应:', data)
            
            // 缓存成功的响应
            setCachedData(cacheKey, data)
            
            return data
        } catch (error) {
            console.error('❌ Pexels API请求失败:', error)
            return generateMockImages()
        } finally {
            // 请求完成后从队列中移除
            REQUEST_QUEUE.delete(cacheKey)
        }
    })()
    
    // 将请求加入队列
    REQUEST_QUEUE.set(cacheKey, requestPromise)
    
    return await requestPromise
}

// 优化getMixedTravelContent - 减少并发请求
export const getMixedTravelContent = async (page = 1, perPage = 20) => {
    console.log('🎯 开始获取混合旅游内容:', { page, perPage })
    
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
            
            const data = await category.func(page, count)
            results.push(data)
            
            // 添加请求间隔，避免API限流
            if (categories.indexOf(category) < categories.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200))
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
        
        // 预加载下一页数据（后台进行）
        if (page < 5) { // 只预加载前5页
            setTimeout(() => {
                getMixedTravelContent(page + 1, perPage).catch(console.warn)
            }, 1000)
        }
        
        return result
    } catch (error) {
        console.error('❌ 获取混合旅游内容失败:', error)
        return generateMockImages()
    }
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

// 获取随机头像
export const getRandomAvatar = async () => {
    if (!PEXELS_API_KEY) {
        console.warn('⚠️ Pexels API Key未配置，使用默认头像生成')
        // 使用随机种子生成DiceBear头像作为后备
        const seed = Math.random().toString(36).substring(7)
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
    }

    try {
        // 搜索人物肖像照片
        const portraitKeywords = ['portrait', 'face', 'person', 'headshot', 'profile']
        const randomKeyword = portraitKeywords[Math.floor(Math.random() * portraitKeywords.length)]
        
        const response = await pexelsRequest(`/search?query=${randomKeyword}&per_page=80&orientation=portrait`)
        
        if (response?.photos && response.photos.length > 0) {
            // 随机选择一张照片
            const randomPhoto = response.photos[Math.floor(Math.random() * response.photos.length)]
            // 返回中等尺寸的头像
            return randomPhoto.src.medium || randomPhoto.src.small
        } else {
            throw new Error('没有找到合适的头像图片')
        }
    } catch (error) {
        console.error('❌ 获取Pexels头像失败:', error)
        // 降级到DiceBear头像
        const seed = Math.random().toString(36).substring(7)
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
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
    const travelKeywords = ['travel', 'vacation', 'tourism', 'adventure', 'journey', 'destination', 'explore', 'wanderlust']
    const randomKeyword = travelKeywords[Math.floor(Math.random() * travelKeywords.length)]
    
    return await pexelsRequest(`/search?query=${randomKeyword}&per_page=${perPage}&page=${page}`)
}

// 获取美食相关图片
const getFoodImages = async (page = 1, perPage = 10) => {
    const foodKeywords = ['food', 'cuisine', 'meal', 'restaurant', 'cooking', 'delicious', 'gourmet', 'dining']
    const randomKeyword = foodKeywords[Math.floor(Math.random() * foodKeywords.length)]
    
    return await pexelsRequest(`/search?query=${randomKeyword}&per_page=${perPage}&page=${page}`)
}

// 获取风景相关图片
const getLandscapeImages = async (page = 1, perPage = 10) => {
    const landscapeKeywords = ['landscape', 'nature', 'mountain', 'ocean', 'forest', 'sunset', 'scenery', 'beautiful']
    const randomKeyword = landscapeKeywords[Math.floor(Math.random() * landscapeKeywords.length)]
    
    return await pexelsRequest(`/search?query=${randomKeyword}&per_page=${perPage}&page=${page}`)
}

// 获取人物相关图片
const getPeopleImages = async (page = 1, perPage = 10) => {
    const peopleKeywords = ['people', 'person', 'portrait', 'lifestyle', 'happy', 'friends', 'family', 'smile']
    const randomKeyword = peopleKeywords[Math.floor(Math.random() * peopleKeywords.length)]
    
    return await pexelsRequest(`/search?query=${randomKeyword}&per_page=${perPage}&page=${page}`)
}