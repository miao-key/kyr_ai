/**
 * API配置管理模块
 * 根据环境动态选择调用方式
 */

import { isLocalDevelopment } from './environment.js';

/**
 * API配置类
 */
class ApiConfig {
  constructor() {
    this.isLocal = isLocalDevelopment();
  }

  /**
   * 获取Pexels API配置
   */
  getPexelsConfig() {
    if (this.isLocal) {
      return {
        baseUrl: 'https://api.pexels.com/v1',
        apiKey: import.meta.env.VITE_PEXELS_API || '',
        useServerless: false
      };
    } else {
      return {
        baseUrl: '/api/pexels',
        apiKey: '', // 生产环境不需要在前端暴露API密钥
        useServerless: true
      };
    }
  }

  /**
   * 获取Doubao API配置
   */
  getDoubaoConfig() {
    if (this.isLocal) {
      return {
        baseUrl: '/api/doubao',
        apiKey: import.meta.env.VITE_DOUBAO_IMAGE_API_KEY || '',
        useServerless: false
      };
    } else {
      return {
        baseUrl: '/api/doubao/v3',
        apiKey: '', // 生产环境不需要在前端暴露API密钥
        useServerless: true
      };
    }
  }

  /**
   * 获取Coze API配置
   */
  getCozeConfig() {
    if (this.isLocal) {
      return {
        baseUrl: 'https://api.coze.cn/open_api/v2',
        apiKey: import.meta.env.VITE_PAT_TOKEN || '',
        useServerless: false
      };
    } else {
      return {
        baseUrl: '/api/coze',
        apiKey: '', // 生产环境不需要在前端暴露API密钥
        useServerless: true
      };
    }
  }

  /**
   * 创建通用的HTTP请求配置
   * @param {Object} config - API配置对象
   * @param {Object} options - 额外的请求选项
   */
  createRequestConfig(config, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // 如果是本地环境且有API密钥，添加到请求头
    if (this.isLocal && config.apiKey) {
      if (config.baseUrl.includes('pexels.com')) {
        headers['Authorization'] = config.apiKey;
      } else if (config.baseUrl.includes('volces.com')) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      } else if (config.baseUrl.includes('coze.cn')) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }
    }

    return {
      ...options,
      headers
    };
  }

  /**
   * 构建完整的API URL
   * @param {Object} config - API配置对象
   * @param {string} endpoint - API端点
   */
  buildUrl(config, endpoint) {
    const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }
}

// 创建单例实例
const apiConfig = new ApiConfig();

export default apiConfig;
export { ApiConfig };

// 导出便捷方法
export const getPexelsConfig = () => apiConfig.getPexelsConfig();
export const getDoubaoConfig = () => apiConfig.getDoubaoConfig();
export const getCozeConfig = () => apiConfig.getCozeConfig();
export const createRequestConfig = (config, options) => apiConfig.createRequestConfig(config, options);
export const buildUrl = (config, endpoint) => apiConfig.buildUrl(config, endpoint);