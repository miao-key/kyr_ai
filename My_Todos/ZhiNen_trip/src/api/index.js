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

// API 配置 - 使用代理路径，API密钥由代理服务器处理
const API_CONFIG = {
    BASE_URL: '/api/doubao', // 代理路径，自动转发到真实API
    IMAGE_MODEL: 'ep-20250804182253-ckvjk', // 专用图像生成模型
    TIMEOUT: 30000
}

// 安全的请求拦截器 - API密钥由代理服务器自动添加
const createRequest = async (url, options = {}) => {
    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 注意：Authorization头由vite.config.js代理自动添加，无需在前端处理
            ...options.headers
        },
        timeout: API_CONFIG.TIMEOUT,
        ...options
    }

    try {
        const response = await fetch(url, config)
        
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
        console.error('豆包API网络错误:', error)
        throw error
    }
}

// 生成旅行头像的主函数 - 集成缓存机制
export const generateTravelAvatar = async (prompt) => {
    const optimizedPrompt = `Portrait of a traveler, ${prompt}, professional photography, high quality, travel style, friendly expression, outdoor lighting, 4K resolution`
    
    // 生成缓存键
    const cacheKey = `avatar_${btoa(optimizedPrompt).slice(0, 32)}`
    
    // 检查缓存
    const cachedResult = avatarCache.get(cacheKey)
    if (cachedResult) {
        console.log('🎯 使用缓存的头像结果')
        return { ...cachedResult, fromCache: true }
    }
    
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
        const response = await createRequest(`${API_CONFIG.BASE_URL}/v3/images/generations`, {
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
            
            // 缓存成功结果
            avatarCache.set(cacheKey, result)
            
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
        
        // 缓存降级结果（较短时间）
        avatarCache.set(cacheKey, fallbackResult)
        
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

        const response = await createRequest(`${API_CONFIG.BASE_URL}/v3/images/generations`, {
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