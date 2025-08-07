/**
 * Axios 请求拦截器配置
 * 集成JWT认证、错误处理和请求/响应拦截
 */

import axios from 'axios'
import { tokenManager, verifyJWT, refreshJWT } from './jwt'

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 使用代理路径
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 获取当前token
    const token = tokenManager.getToken()
    
    if (token && verifyJWT(token)) {
      // Token有效，添加到请求头
      config.headers.Authorization = `Bearer ${token}`
      console.log('📤 请求已添加JWT Token:', config.url)
    } else if (token) {
      // Token无效，清除并可能需要重新登录
      console.warn('⚠️ JWT Token无效，已清除')
      tokenManager.removeToken()
      
      // 触发登录过期事件
      window.dispatchEvent(new CustomEvent('tokenExpired'))
    }
    
    // 添加请求时间戳用于调试
    config.metadata = { startTime: new Date() }
    
    // 打印请求信息（开发环境）
    if (import.meta.env.DEV) {
      console.log('🚀 API请求:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 计算请求耗时
    const endTime = new Date()
    const duration = endTime - response.config.metadata.startTime
    
    // 打印响应信息（开发环境）
    if (import.meta.env.DEV) {
      console.log('📥 API响应:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      })
    }
    
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // 计算请求耗时
    if (originalRequest.metadata) {
      const endTime = new Date()
      const duration = endTime - originalRequest.metadata.startTime
      console.warn(`⏱️ 请求失败耗时: ${duration}ms`)
    }
    
    // 处理401认证失败
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('🔒 收到401响应，尝试token刷新...')
      
      originalRequest._retry = true
      const currentToken = tokenManager.getToken()
      
      if (currentToken) {
        // 尝试刷新token
        const newToken = refreshJWT(currentToken)
        
        if (newToken) {
          console.log('✅ Token刷新成功，重试原请求')
          tokenManager.setToken(newToken)
          
          // 更新请求头并重试
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return request(originalRequest)
        }
      }
      
      // Token刷新失败，清除认证状态
      console.error('❌ Token刷新失败，需要重新登录')
      tokenManager.removeToken()
      
      // 触发登录过期事件
      window.dispatchEvent(new CustomEvent('tokenExpired'))
      
      // 可选：自动重定向到登录页面
      if (window.location.pathname !== '/login') {
        console.log('🔄 自动重定向到登录页面')
        window.location.href = '/login'
      }
    }
    
    // 处理网络错误
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 网络连接错误')
      error.userMessage = '网络连接失败，请检查网络设置'
    }
    
    // 处理超时错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏰ 请求超时')
      error.userMessage = '请求超时，请稍后重试'
    }
    
    // 处理服务器错误
    if (error.response?.status >= 500) {
      console.error('🔥 服务器内部错误:', error.response.status)
      error.userMessage = '服务器暂时不可用，请稍后重试'
    }
    
    // 处理客户端错误
    if (error.response?.status >= 400 && error.response?.status < 500) {
      console.error('⚠️ 客户端请求错误:', error.response.status, error.response.data)
      error.userMessage = error.response.data?.message || '请求参数错误'
    }
    
    // 统一错误日志
    console.error('❌ API请求失败:', {
      method: originalRequest.method?.toUpperCase(),
      url: originalRequest.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    
    return Promise.reject(error)
  }
)

/**
 * 统一的API请求方法
 */
export const apiRequest = {
  // GET请求
  get: (url, params = {}, config = {}) => {
    return request.get(url, { params, ...config })
  },
  
  // POST请求
  post: (url, data = {}, config = {}) => {
    return request.post(url, data, config)
  },
  
  // PUT请求
  put: (url, data = {}, config = {}) => {
    return request.put(url, data, config)
  },
  
  // DELETE请求
  delete: (url, config = {}) => {
    return request.delete(url, config)
  },
  
  // PATCH请求
  patch: (url, data = {}, config = {}) => {
    return request.patch(url, data, config)
  }
}

/**
 * 文件上传请求
 */
export const uploadFile = (url, formData, onProgress = null) => {
  return request.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress ? (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      onProgress(percentCompleted)
    } : undefined
  })
}

/**
 * 下载文件请求
 */
export const downloadFile = (url, filename) => {
  return request.get(url, {
    responseType: 'blob'
  }).then(response => {
    // 创建下载链接
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  })
}

/**
 * 批量请求（并发控制）
 */
export const batchRequest = async (requests, concurrency = 3) => {
  const results = []
  const executing = []
  
  for (const [index, requestFn] of requests.entries()) {
    const promise = requestFn().then(result => ({ index, result, success: true }))
      .catch(error => ({ index, error, success: false }))
    
    results.push(promise)
    
    if (requests.length >= concurrency) {
      executing.push(promise)
      
      if (executing.length >= concurrency) {
        await Promise.race(executing)
        executing.splice(executing.findIndex(p => p === promise), 1)
      }
    }
  }
  
  return Promise.all(results)
}

// 添加全局错误处理监听器
window.addEventListener('tokenExpired', () => {
  // 可以在这里显示全局的登录过期提示
  console.log('🔔 Token已过期，请重新登录')
})

window.addEventListener('tokenRefreshed', (event) => {
  console.log('🔔 Token已自动刷新:', event.detail)
})

export default request