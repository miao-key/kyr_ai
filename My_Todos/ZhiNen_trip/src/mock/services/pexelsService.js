import axios from 'axios'
import { logger } from '../middleware/logger.js'
import config from '../config/index.js'

// Pexels API 服务类
class PexelsService {
  constructor() {
    this.apiKey = config.apis.pexels.apiKey
    this.baseURL = 'https://api.pexels.com/v1'
    this.timeout = 10000
    
    // 请求频率控制
    this.requestQueue = []
    this.isProcessingQueue = false
    this.lastRequestTime = 0
    this.minRequestInterval = 1000 // 1秒间隔
    this.maxRetries = 3
    this.retryDelay = 1000 // 初始重试延迟1秒
    
    // 缓存机制
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5分钟缓存
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': this.apiKey
      },
      timeout: this.timeout
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Pexels API 请求', {
          url: config.url,
          method: config.method,
          params: config.params
        })
        return config
      },
      (error) => {
        logger.error('Pexels API 请求错误', { error: error.message })
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Pexels API 响应成功', {
          url: response.config.url,
          status: response.status,
          dataLength: response.data?.photos?.length || 0
        })
        return response
      },
      (error) => {
        logger.error('Pexels API 响应错误', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        })
        return Promise.reject(error)
      }
    )
  }

  // 请求队列处理
  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.requestQueue.length > 0) {
      const { resolve, reject, requestFn, retryCount = 0 } = this.requestQueue.shift()
      
      try {
        // 确保请求间隔
        const now = Date.now()
        const timeSinceLastRequest = now - this.lastRequestTime
        if (timeSinceLastRequest < this.minRequestInterval) {
          await this.delay(this.minRequestInterval - timeSinceLastRequest)
        }
        
        this.lastRequestTime = Date.now()
        const result = await requestFn()
        resolve(result)
      } catch (error) {
        if (error.response?.status === 429 && retryCount < this.maxRetries) {
          // 429错误重试，使用指数退避
          const delay = this.retryDelay * Math.pow(2, retryCount)
          logger.warn(`API请求被限制，${delay}ms后重试 (${retryCount + 1}/${this.maxRetries})`, {
            url: error.config?.url,
            retryCount: retryCount + 1
          })
          
          await this.delay(delay)
          // 重新加入队列
          this.requestQueue.unshift({ resolve, reject, requestFn, retryCount: retryCount + 1 })
        } else {
          reject(error)
        }
      }
    }

    this.isProcessingQueue = false
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 队列化请求
  queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, requestFn })
      this.processQueue()
    })
  }

  // 获取缓存键
  getCacheKey(url, params) {
    return `${url}?${new URLSearchParams(params).toString()}`
  }

  // 检查缓存
  getFromCache(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  // 设置缓存
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // 带缓存和重试的请求方法
  async makeRequest(url, params = {}) {
    const cacheKey = this.getCacheKey(url, params)
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      logger.debug('使用缓存数据', { url, params })
      return cached
    }

    // 队列化请求
    return this.queueRequest(async () => {
      const response = await this.client.get(url, { params })
      const result = response.data
      
      // 缓存结果
      this.setCache(cacheKey, result)
      return result
    })
  }

  // 搜索图片
  async searchPhotos(queryOrOptions, options = {}) {
    try {
      // 支持对象参数和传统参数两种调用方式
      let query, finalOptions;
      if (typeof queryOrOptions === 'object' && queryOrOptions !== null) {
        // 新的对象参数方式: searchPhotos({query, page, per_page})
        query = queryOrOptions.query;
        finalOptions = {
          per_page: queryOrOptions.per_page || queryOrOptions.count || 15,
          page: queryOrOptions.page || 1,
          orientation: queryOrOptions.orientation || 'all',
          size: queryOrOptions.size || 'all',
          color: queryOrOptions.color || 'all',
          locale: queryOrOptions.locale || 'en-US'
        };
      } else {
        // 传统参数方式: searchPhotos(query, options)
        query = queryOrOptions;
        finalOptions = {
          per_page: options.per_page || 15,
          page: options.page || 1,
          orientation: options.orientation || 'all',
          size: options.size || 'all',
          color: options.color || 'all',
          locale: options.locale || 'en-US'
        };
      }
      
      const params = {
        query,
        page: finalOptions.page,
        per_page: Math.min(finalOptions.per_page, 80), // Pexels 限制最大80
        orientation: finalOptions.orientation !== 'all' ? finalOptions.orientation : undefined,
        size: finalOptions.size !== 'all' ? finalOptions.size : undefined,
        color: finalOptions.color !== 'all' ? finalOptions.color : undefined,
        locale: finalOptions.locale
      }

      // 移除 undefined 值
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key]
        }
      })

      // 使用新的请求方法
      const responseData = await this.makeRequest('/search', params)
      
      return {
        success: true,
        data: {
          photos: responseData.photos.map(photo => this.formatPhoto(photo)),
          total_results: responseData.total_results,
          page: responseData.page,
          per_page: responseData.per_page,
          next_page: responseData.next_page
        }
      }
    } catch (error) {
      logger.error('搜索图片失败', {
        query,
        error: error.message,
        status: error.response?.status
      })
      
      // 429错误时返回默认数据而不是抛出错误
      if (error.response?.status === 429) {
        logger.warn('API请求频率超限，返回默认数据', { query })
        return {
          success: true,
          data: {
            photos: this.getDefaultPhotos(query, finalOptions.per_page),
            total_results: 100,
            page: finalOptions.page,
            per_page: finalOptions.per_page,
            next_page: finalOptions.page < 5 ? finalOptions.page + 1 : null
          }
        }
      }
      
      return {
        success: false,
        error: this.handleError(error),
        data: {
          photos: [],
          total_results: 0,
          page: 1,
          per_page: 20
        }
      }
    }
  }

  // 获取精选图片
  async getCuratedPhotos(options = {}) {
    try {
      const {
        page = 1,
        per_page = 20
      } = options

      const params = {
        page,
        per_page: Math.min(per_page, 80)
      }

      // 使用新的请求方法
      const responseData = await this.makeRequest('/curated', params)
      
      return {
        success: true,
        data: {
          photos: responseData.photos.map(photo => this.formatPhoto(photo)),
          page: responseData.page,
          per_page: responseData.per_page,
          next_page: responseData.next_page
        }
      }
    } catch (error) {
      logger.error('获取精选图片失败', {
        error: error.message,
        status: error.response?.status
      })
      
      // 429错误时返回默认数据
      if (error.response?.status === 429) {
        logger.warn('API请求频率超限，返回默认精选图片', { page, per_page })
        return {
          success: true,
          data: {
            photos: this.getDefaultPhotos('curated', per_page),
            page: page,
            per_page: per_page,
            next_page: page < 5 ? page + 1 : null
          }
        }
      }
      
      return {
        success: false,
        error: this.handleError(error),
        data: {
          photos: [],
          page: 1,
          per_page: 20
        }
      }
    }
  }

  // 根据ID获取单张图片
  async getPhotoById(id) {
    try {
      // 使用新的请求方法
      const responseData = await this.makeRequest(`/photos/${id}`)
      
      return {
        success: true,
        data: this.formatPhoto(responseData)
      }
    } catch (error) {
      logger.error('获取图片详情失败', {
        photoId: id,
        error: error.message,
        status: error.response?.status
      })
      
      // 429错误时返回默认图片
      if (error.response?.status === 429) {
        logger.warn('API请求频率超限，返回默认图片', { photoId: id })
        const defaultPhotos = this.getDefaultPhotos('default', 1)
        return {
          success: true,
          data: defaultPhotos[0] || null
        }
      }
      
      return {
        success: false,
        error: this.handleError(error),
        data: null
      }
    }
  }

  // 获取默认图片数据
  getDefaultPhotos(query = 'travel', count = 12) {
    const defaultPhotos = [
      {
        id: 'default-1',
        width: 1920,
        height: 1280,
        url: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg',
        photographer: 'Default Photographer',
        photographer_url: 'https://www.pexels.com',
        photographer_id: 1,
        avg_color: '#4A90E2',
        src: {
          original: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg',
          large2x: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
          large: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
          medium: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&h=350',
          small: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&h=130',
          portrait: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
          landscape: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          tiny: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280'
        },
        liked: false,
        alt: 'Beautiful travel destination'
      },
      {
        id: 'default-2',
        width: 1920,
        height: 1280,
        url: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg',
        photographer: 'Default Photographer',
        photographer_url: 'https://www.pexels.com',
        photographer_id: 2,
        avg_color: '#7B68EE',
        src: {
          original: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg',
          large2x: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
          large: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
          medium: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&h=350',
          small: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&h=130',
          portrait: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
          landscape: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
          tiny: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280'
        },
        liked: false,
        alt: 'Scenic landscape view'
      }
    ]

    // 根据需要的数量重复默认图片
    const result = []
    for (let i = 0; i < count; i++) {
      const photo = { ...defaultPhotos[i % defaultPhotos.length] }
      photo.id = `default-${i + 1}`
      result.push(photo)
    }

    return result
  }

  // 获取热门搜索关键词
  getPopularSearchTerms() {
    return [
      'travel', 'nature', 'city', 'beach', 'mountain', 'forest',
      'sunset', 'architecture', 'food', 'culture', 'adventure',
      'landscape', 'ocean', 'desert', 'snow', 'flowers', 'wildlife',
      'street', 'vintage', 'modern', 'minimalist', 'colorful',
      'black and white', 'aerial', 'night', 'summer', 'winter',
      'spring', 'autumn', 'tropical', 'urban', 'rural'
    ]
  }

  // 获取分类建议
  getCategoryKeywords() {
    return {
      destination: ['city', 'landmark', 'architecture', 'street', 'urban', 'culture'],
      nature: ['landscape', 'mountain', 'forest', 'ocean', 'beach', 'desert', 'wildlife'],
      food: ['food', 'restaurant', 'cuisine', 'cooking', 'ingredients', 'dining'],
      adventure: ['hiking', 'climbing', 'skiing', 'surfing', 'camping', 'adventure'],
      culture: ['festival', 'art', 'museum', 'tradition', 'people', 'culture'],
      accommodation: ['hotel', 'resort', 'room', 'luxury', 'accommodation', 'interior']
    }
  }

  // 格式化图片数据
  formatPhoto(photo) {
    return {
      id: photo.id,
      width: photo.width,
      height: photo.height,
      url: photo.url,
      photographer: photo.photographer,
      photographer_url: photo.photographer_url,
      photographer_id: photo.photographer_id,
      avg_color: photo.avg_color,
      src: {
        original: photo.src.original,
        large2x: photo.src.large2x,
        large: photo.src.large,
        medium: photo.src.medium,
        small: photo.src.small,
        portrait: photo.src.portrait,
        landscape: photo.src.landscape,
        tiny: photo.src.tiny
      },
      liked: photo.liked || false,
      alt: photo.alt || ''
    }
  }

  // 错误处理
  handleError(error) {
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.error || error.message
      
      switch (status) {
        case 400:
          return {
            code: 'BAD_REQUEST',
            message: '请求参数错误',
            details: message
          }
        case 401:
          return {
            code: 'UNAUTHORIZED',
            message: 'API密钥无效或缺失',
            details: message
          }
        case 403:
          return {
            code: 'FORBIDDEN',
            message: 'API访问被拒绝',
            details: message
          }
        case 404:
          return {
            code: 'NOT_FOUND',
            message: '请求的资源不存在',
            details: message
          }
        case 429:
          return {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'API请求频率超限，已启用自动重试和缓存机制',
            details: message,
            suggestion: '系统将自动重试请求，如持续出现此错误，请稍后再试',
            retryAfter: error.response?.headers?.['retry-after'] || 60
          }
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            code: 'SERVER_ERROR',
            message: 'Pexels服务器错误',
            details: message
          }
        default:
          return {
            code: 'UNKNOWN_ERROR',
            message: '未知错误',
            details: message
          }
      }
    } else if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: '网络连接错误',
        details: '无法连接到Pexels服务器'
      }
    } else {
      return {
        code: 'REQUEST_ERROR',
        message: '请求配置错误',
        details: error.message
      }
    }
  }

  // 检查API密钥是否配置
  isConfigured() {
    return !!this.apiKey && this.apiKey !== 'your_pexels_api_key_here'
  }

  // 获取API使用统计（模拟）
  getUsageStats() {
    // 在实际应用中，这些数据应该从数据库或缓存中获取
    return {
      requests_today: Math.floor(Math.random() * 1000),
      requests_this_month: Math.floor(Math.random() * 20000),
      rate_limit_remaining: Math.floor(Math.random() * 200),
      rate_limit_reset: new Date(Date.now() + 60 * 60 * 1000) // 1小时后重置
    }
  }
}

// 创建单例实例
const pexelsService = new PexelsService()

// 导出服务实例和类
export default pexelsService
export { PexelsService }