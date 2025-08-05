/**
 * AI图像生成API配置 - 通过Vite代理解决跨域问题
 * - 使用豆包专用图像生成模型 ep-20250804182253-ckvjk
 * 
 * API端点：
 * - 图像生成：/api/v3/images/generations
 * - 支持参数：model, prompt, response_format, size, guidance_scale, watermark
 * 
 * 环境变量配置：
 * 在项目根目录下创建 .env.local 文件：
 * VITE_DOUBAO_IMAGE_API_KEY=your-api-key-here
 */

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
        console.log('发送API请求:', url, '模型:', API_CONFIG.MODEL)
        const response = await fetch(url, config)
        
        if (!response.ok) {
            const errorText = await response.text()
            console.error('API响应错误:', response.status, response.statusText, errorText)
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        const result = await response.json()
        console.log('API请求成功:', result)
        return result
    } catch (error) {
        console.error('API请求失败:', error)
        throw error
    }
}

// 生成旅行头像API - 使用专用图像生成模型
export const generateTravelAvatar = async (prompt) => {
    console.log('🎨 开始生成旅行头像:', {
        baseUrl: API_CONFIG.BASE_URL,
        imageModel: API_CONFIG.IMAGE_MODEL,
        prompt: prompt.substring(0, 100) + '...'
    })
    
    try {
        // 构建专业的图像生成提示词
        const imagePrompt = `请为旅行应用生成一个专属头像。用户信息：${prompt}。要求：
        1. 风格：现代插画风格，色彩温暖明亮
        2. 元素：包含旅行相关元素（如地图、飞机、行李箱、相机等）
        3. 形状：适合圆形头像显示
        4. 色调：使用暖色系，体现旅行的快乐和自由
        5. 背景：简洁的渐变背景，不要过于复杂
        6. 尺寸：512x512像素，高清晰度`

        // 尝试调用豆包多模态API
        const response = await callDoubaoAPI(imagePrompt)
        
        if (response && response.url) {
            console.log('✅ API成功返回图片URL:', response.url.substring(0, 50) + '...')
            return response.url
        }
        
        if (response && response.error) {
            console.warn('⚠️ API返回了错误信息:', response.error, response.content)
            throw new Error(`API错误: ${response.error}`)
        }

        // 如果API调用没有返回有效图片，使用备用方案
        throw new Error('API未返回有效的图片数据')

    } catch (error) {
        console.error('豆包API生成头像失败:', error)
        
        // 返回一个备用的头像生成方案
        return generateBackupAvatar(prompt)
    }
}

// 调用豆包API的核心函数 - 使用专用图像生成端点
const callDoubaoAPI = async (imagePrompt) => {
    try {
        // 构建专用图像生成API的请求数据
        const requestData = {
            model: API_CONFIG.IMAGE_MODEL, // 专用图像生成模型
            prompt: imagePrompt,
            response_format: "url", // 返回图片URL
            size: "1024x1024", // 图片尺寸
            guidance_scale: 3, // 引导强度
            watermark: false // 不添加水印
        }

        console.log('🖼️ 发送豆包图像生成API请求:', {
            model: requestData.model,
            size: requestData.size,
            promptLength: requestData.prompt.length,
            endpoint: 'images/generations'
        })

        // 发送请求到图像生成端点（Authorization头由代理自动添加）
        const response = await createRequest(`${API_CONFIG.BASE_URL}/images/generations`, {
            method: 'POST',
            body: JSON.stringify(requestData)
        })

        console.log('📸 豆包API原始响应:', response)

        // 处理图像生成API的响应
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
            const imageData = response.data[0]
            
            if (imageData.url) {
                console.log('✅ 成功获取图片URL:', imageData.url.substring(0, 80) + '...')
                return { url: imageData.url }
            }
            
            if (imageData.b64_json) {
                const base64Url = `data:image/png;base64,${imageData.b64_json}`
                console.log('✅ 成功获取base64图片数据，长度:', imageData.b64_json.length)
                return { url: base64Url }
            }
        }

        // 检查是否有错误信息
        if (response.error) {
            throw new Error(`API错误: ${response.error.message || response.error}`)
        }

        // 如果没有预期的数据结构，记录完整响应用于调试
        console.warn('⚠️ API返回了意外的数据结构:', JSON.stringify(response, null, 2))
        throw new Error('API返回格式异常：未找到预期的图片数据结构')

    } catch (error) {
        console.error('❌ 豆包图像生成API调用失败:', error)
        throw error
    }
}

// 备用头像生成方案（使用本地生成精美的旅行主题头像）
const generateBackupAvatar = (prompt) => {
    console.log('使用备用头像生成方案，输入参数:', prompt)
    
    // 旅行主题配色方案
    const travelThemes = [
        { bg: 'linear-gradient(135deg, #667eea, #764ba2)', icon: '✈️', color: '#ffffff' },
        { bg: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: '🗺️', color: '#ffffff' },
        { bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', icon: '🎒', color: '#ffffff' },
        { bg: 'linear-gradient(135deg, #43e97b, #38f9d7)', icon: '📷', color: '#ffffff' },
        { bg: 'linear-gradient(135deg, #fa709a, #fee140)', icon: '🏔️', color: '#ffffff' },
        { bg: 'linear-gradient(135deg, #a8edea, #fed6e3)', icon: '🏖️', color: '#333333' },
        { bg: 'linear-gradient(135deg, #ffecd2, #fcb69f)', icon: '🎯', color: '#333333' },
    ]
    
    // 基于用户信息生成hash值
    const hash = prompt.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
    }, 0)
    
    const themeIndex = Math.abs(hash) % travelThemes.length
    const theme = travelThemes[themeIndex]
    
    // 获取用户昵称的首字符
    const nickname = prompt.match(/昵称:\s*([^,]+)/)?.[1] || '旅行者'
    const initial = nickname.charAt(0) || '旅'
    
    // 动态生成渐变色值
    const gradientColors = theme.bg.match(/#[a-fA-F0-9]{6}/g) || ['#667eea', '#764ba2']
    
    // 创建精美的SVG旅行头像
    const svgAvatar = `
        <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bg-${themeIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${gradientColors[0]};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${gradientColors[1] || gradientColors[0]};stop-opacity:1" />
                </linearGradient>
                <filter id="shadow-${themeIndex}" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.15"/>
                </filter>
                <radialGradient id="highlight-${themeIndex}" cx="40%" cy="30%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:0" />
                </radialGradient>
            </defs>
            
            <!-- 外圈装饰 -->
            <circle cx="60" cy="60" r="58" fill="none" stroke="url(#bg-${themeIndex})" stroke-width="4" opacity="0.3"/>
            
            <!-- 主背景 -->
            <circle cx="60" cy="60" r="54" fill="url(#bg-${themeIndex})" filter="url(#shadow-${themeIndex})"/>
            
            <!-- 高光效果 -->
            <circle cx="60" cy="60" r="54" fill="url(#highlight-${themeIndex})"/>
            
            <!-- 旅行图标背景 -->
            <circle cx="60" cy="45" r="18" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            
            <!-- 旅行图标 -->
            <text x="60" y="52" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif" font-size="20" 
                  fill="${theme.color}" text-anchor="middle" dominant-baseline="middle">${theme.icon}</text>
            
            <!-- 用户首字符背景 -->
            <circle cx="60" cy="78" r="12" fill="rgba(255,255,255,0.15)"/>
            
            <!-- 用户首字符 -->
            <text x="60" y="82" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="16" font-weight="bold"
                  fill="${theme.color}" text-anchor="middle" dominant-baseline="middle">${initial}</text>
            
            <!-- 装饰小点 -->
            <circle cx="35" cy="35" r="2" fill="rgba(255,255,255,0.6)">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="85" cy="35" r="1.5" fill="rgba(255,255,255,0.4)"/>
            <circle cx="85" cy="85" r="2" fill="rgba(255,255,255,0.6)">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="35" cy="85" r="1.5" fill="rgba(255,255,255,0.4)"/>
        </svg>
    `
    
    // 将SVG转换为DataURL
    const base64 = btoa(unescape(encodeURIComponent(svgAvatar)))
    const result = `data:image/svg+xml;base64,${base64}`
    
    console.log('备用头像生成完成，主题:', theme.icon, '首字符:', initial)
    return result
}

// 导出其他可能需要的API函数
export const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    return createRequest(`${API_CONFIG.BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {} // 让浏览器自动设置Content-Type
    })
}

export default {
    generateTravelAvatar,
    uploadImage
}