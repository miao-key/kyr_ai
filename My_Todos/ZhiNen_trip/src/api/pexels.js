/**
 * Pexels API集成 - 获取高质量旅游、生活相关图片
 * 
 * 使用说明：
 * 在.env.local中配置 VITE_PEXELS_API=your-pexels-api-key
 * 
 * API文档: https://www.pexels.com/api/documentation/
 */

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API
const PEXELS_BASE_URL = 'https://api.pexels.com/v1'

// Pexels API请求封装
const pexelsRequest = async (endpoint, options = {}) => {
    if (!PEXELS_API_KEY) {
        console.warn('⚠️ Pexels API Key未配置，使用模拟数据')
        return generateMockImages()
    }

    try {
        const response = await fetch(`${PEXELS_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': PEXELS_API_KEY,
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
        return data
    } catch (error) {
        console.error('❌ Pexels API请求失败:', error)
        return generateMockImages() // 降级到模拟数据
    }
}

// 获取旅游相关图片
export const getTravelImages = async (page = 1, perPage = 20) => {
    const travelKeywords = [
        'travel', 'vacation', 'destination', 'adventure', 'explore',
        'beach', 'mountain', 'city', 'sunset', 'landscape'
    ]
    
    const randomKeyword = travelKeywords[Math.floor(Math.random() * travelKeywords.length)]
    
    return await pexelsRequest(`/search?query=${randomKeyword}&page=${page}&per_page=${perPage}&orientation=portrait`)
}

// 获取美食图片
export const getFoodImages = async (page = 1, perPage = 10) => {
    const foodKeywords = [
        'food', 'delicious', 'cuisine', 'restaurant', 'cooking',
        'breakfast', 'dinner', 'dessert', 'coffee', 'fruit'
    ]
    
    const randomKeyword = foodKeywords[Math.floor(Math.random() * foodKeywords.length)]
    
    return await pexelsRequest(`/search?query=${randomKeyword}&page=${page}&per_page=${perPage}&orientation=portrait`)
}

// 获取风景图片
export const getLandscapeImages = async (page = 1, perPage = 10) => {
    const landscapeKeywords = [
        'landscape', 'nature', 'mountain', 'ocean', 'forest',
        'sunset', 'sunrise', 'lake', 'river', 'sky'
    ]
    
    const randomKeyword = landscapeKeywords[Math.floor(Math.random() * landscapeKeywords.length)]
    
    return await pexelsRequest(`/search?query=${randomKeyword}&page=${page}&per_page=${perPage}&orientation=landscape`)
}

// 获取人物旅行图片
export const getPeopleImages = async (page = 1, perPage = 10) => {
    const peopleKeywords = [
        'people travel', 'friends vacation', 'couple travel', 'family trip',
        'backpacker', 'tourist', 'adventure people', 'travel lifestyle'
    ]
    
    const randomKeyword = peopleKeywords[Math.floor(Math.random() * peopleKeywords.length)]
    
    return await pexelsRequest(`/search?query=${randomKeyword}&page=${page}&per_page=${perPage}&orientation=portrait`)
}

// 获取混合旅游内容
export const getMixedTravelContent = async (page = 1, perPage = 20) => {
    console.log('🎯 开始获取混合旅游内容:', { page, perPage })
    
    try {
        // 并行获取不同类型的图片
        const [travelData, foodData, landscapeData, peopleData] = await Promise.all([
            getTravelImages(page, Math.ceil(perPage * 0.4)), // 40% 旅游
            getFoodImages(page, Math.ceil(perPage * 0.2)),   // 20% 美食
            getLandscapeImages(page, Math.ceil(perPage * 0.2)), // 20% 风景
            getPeopleImages(page, Math.ceil(perPage * 0.2))  // 20% 人物
        ])

        // 合并并打乱顺序
        const allPhotos = [
            ...(travelData.photos || []),
            ...(foodData.photos || []),
            ...(landscapeData.photos || []),
            ...(peopleData.photos || [])
        ]

        // Fisher-Yates洗牌算法
        for (let i = allPhotos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allPhotos[i], allPhotos[j]] = [allPhotos[j], allPhotos[i]]
        }

        console.log('✅ 成功获取混合旅游内容:', allPhotos.length, '张图片')
        
        return {
            photos: allPhotos.slice(0, perPage),
            total_results: Math.max(
                travelData.total_results || 0,
                foodData.total_results || 0,
                landscapeData.total_results || 0,
                peopleData.total_results || 0
            ),
            page,
            per_page: perPage
        }
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