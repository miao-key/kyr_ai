/**
 * 豆包AI图像生成API配置 - 通过Vite代理解决跨域问题
 * - 使用豆包专用图像生成模型 ep-20250804182253-ckvjk
 * - 集成缓存机制，提升性能
 * 
 * API端点：
 * - 图像生成：/api/v3/images/generations
 * - 支持参数：model, prompt, response_format, size, guidance_scale, watermark
 * 
 * 环境变量配置：
 * 在项目根目录下创建 .env.local 文件：
 * VITE_DOUBAO_IMAGE_API_KEY=your-api-key-here
 */

import { avatarCache, imageCache } from '@utils/apiCache'

import { ApiConfig } from '../utils/apiConfig.js'

// 获取API配置
const apiConfig = new ApiConfig()
const config = apiConfig.getDoubaoConfig()

// API 配置 - 使用代理路径，API密钥由代理服务器处理
const API_CONFIG = {
    // 在开发环境通过 Vite 代理；在 Vercel 生产环境由 Serverless 处理
    BASE_URL: config.baseUrl,
    IMAGE_MODEL: 'ep-20250804182253-ckvjk', // 专用图像生成模型
    TIMEOUT: 30000,
    USE_SERVERLESS: config.useServerless,
    API_KEY: config.apiKey
}

// 智能请求函数 - 根据环境选择调用方式
const smartRequest = async (endpoint, options = {}) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

    try {
        // 使用API配置构建URL和请求配置
        const url = apiConfig.buildUrl(config, endpoint)
        const requestConfig = apiConfig.createRequestConfig(config, {
            ...options,
            signal: controller.signal
        })

        console.log('📡 发送请求到:', url)
        console.log('🔧 请求配置:', requestConfig)

        const response = await fetch(url, requestConfig)

        clearTimeout(timeoutId)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('豆包API请求失败:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            })
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
            throw new Error('请求超时')
        }
        console.error('豆包API网络错误:', error)
        throw error
    }
}

// 旅行场景配置
const TRAVEL_SCENARIOS = {
    landscapes: [
        'standing in front of majestic mountains with snow peaks',
        'on a beautiful beach with crystal clear water and palm trees',
        'exploring ancient temples with traditional architecture',
        'in a vibrant city skyline during golden hour',
        'beside a serene lake surrounded by autumn forests',
        'at a scenic viewpoint overlooking vast valleys',
        'in front of famous landmarks and monuments',
        'walking through colorful flower fields'
    ],
    activities: [
        'hiking with a backpack and trekking poles',
        'taking photos with a professional camera',
        'reading a map while exploring new places',
        'enjoying local street food at a market',
        'camping under a starry night sky',
        'cycling through scenic countryside',
        'snorkeling in tropical waters',
        'watching sunrise from a mountain peak'
    ],
    styles: [
        'adventurous explorer with outdoor gear',
        'casual backpacker with comfortable clothing',
        'cultural enthusiast visiting museums',
        'nature photographer capturing wildlife',
        'luxury traveler enjoying fine experiences',
        'solo wanderer discovering hidden gems',
        'group traveler making new friends',
        'digital nomad working remotely'
    ]
}

// 随机选择旅行场景元素
const getRandomTravelScenario = () => {
    const categories = Object.keys(TRAVEL_SCENARIOS)
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const scenarios = TRAVEL_SCENARIOS[randomCategory]
    return scenarios[Math.floor(Math.random() * scenarios.length)]
}

// 生成旅行头像的主函数 - 修改缓存机制确保每次生成唯一头像
export const generateTravelAvatar = async (prompt) => {
    // 随机选择一个旅行场景
    const travelScenario = getRandomTravelScenario()
    
    // 构建丰富的旅行主题prompt
    const optimizedPrompt = `Professional portrait of a friendly traveler, ${prompt}, ${travelScenario}, beautiful travel photography, high quality, natural lighting, warm and inviting expression, travel lifestyle, outdoor adventure, 4K resolution, cinematic composition`
    
    // 头像生成不使用缓存，确保每次都生成新的头像
    console.log('🎨 每次都生成新的旅行头像，不使用缓存')
    
    console.log('🎨 开始生成旅行头像...')
    console.log('📝 提示词:', optimizedPrompt)

    try {
        const requestBody = {
            model: API_CONFIG.IMAGE_MODEL,
            prompt: optimizedPrompt,
            response_format: 'url', // 返回图片URL而非base64
            size: '512x512', // 头像尺寸
            guidance_scale: 7.5, // 提示词遵循度
            watermark: false // 不添加水印
        }

        console.log('📡 发送请求到豆包API...')
        const response = await smartRequest('/v3/images/generations', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        })

        console.log('✅ 豆包API响应:', response)

        // 检查响应格式
        if (response && response.data && response.data.length > 0) {
            const imageUrl = response.data[0].url
            console.log('🖼️ 生成的头像URL:', imageUrl)
            
            const result = {
                success: true,
                url: imageUrl,
                prompt: optimizedPrompt
            }
            
            // 不缓存头像生成结果，确保每次都是新的
            return result
        } else {
            console.warn('⚠️ 豆包API返回格式异常:', response)
            throw new Error('API返回数据格式不正确')
        }

    } catch (error) {
        console.error('❌ 豆包API调用失败:', error)
        
        // 提供降级方案 - 使用DiceBear头像
        const seed = Math.random().toString(36).substring(7)
        const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
        
        console.log('🔄 使用降级头像:', fallbackUrl)
        
        const fallbackResult = {
            success: false,
            url: fallbackUrl,
            prompt: optimizedPrompt,
            error: error.message,
            fallback: true
        }
        
        // 不缓存降级结果，确保每次都尝试重新生成
        return fallbackResult
    }
}

// 生成写实风格图像 - 集成缓存机制
export const generateRealisticImage = async (prompt, options = {}) => {
    const {
        size = '1024x1024',
        guidance_scale = 7.5,
        watermark = false
    } = options

    const optimizedPrompt = `Realistic photography, ${prompt}, high detail, professional quality, natural lighting`
    
    // 生成缓存键（包含参数）
    const cacheKey = `image_${btoa(optimizedPrompt + size + guidance_scale).slice(0, 32)}`
    
    // 检查缓存
    const cachedResult = imageCache.get(cacheKey)
    if (cachedResult) {
        console.log('🎯 使用缓存的图像结果')
        return { ...cachedResult, fromCache: true }
    }

    try {
        const requestBody = {
            model: API_CONFIG.IMAGE_MODEL,
            prompt: optimizedPrompt,
            response_format: 'url',
            size,
            guidance_scale,
            watermark
        }

        const response = await smartRequest('/v3/images/generations', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        })

        if (response && response.data && response.data.length > 0) {
            const result = {
                success: true,
                url: response.data[0].url,
                prompt: optimizedPrompt
            }
            
            // 缓存成功结果
            imageCache.set(cacheKey, result)
            
            return result
        } else {
            throw new Error('API返回数据格式不正确')
        }

    } catch (error) {
        console.error('生成写实图像失败:', error)
        
        const errorResult = {
            success: false,
            error: error.message,
            prompt: optimizedPrompt
        }
        
        // 不缓存错误结果，让下次请求重试
        return errorResult
    }
}

// 图片上传功能（如果需要）
export const uploadImage = async (imageFile) => {
    try {
        const formData = new FormData()
        formData.append('image', imageFile)

        const response = await fetch(`${API_CONFIG.BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: {} // 让浏览器自动设置Content-Type
        })

        if (!response.ok) {
            throw new Error(`上传失败: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('图片上传失败:', error)
        throw error
    }
}

export default {
    generateTravelAvatar,
    generateRealisticImage,
    uploadImage
}