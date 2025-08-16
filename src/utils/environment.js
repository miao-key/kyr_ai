/**
 * 环境检测工具函数
 * 用于判断当前是否在本地开发环境
 */

/**
 * 检测是否在本地开发环境
 * @returns {boolean} 如果在本地开发环境返回true，否则返回false
 */
export const isLocalDevelopment = () => {
  // 检查是否在浏览器环境
  if (typeof window === 'undefined') {
    return false;
  }

  // 检查开发环境标识
  if (import.meta.env.DEV) {
    return true;
  }

  // 检查本地主机地址
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || 
                     hostname === '127.0.0.1' || 
                     hostname === '0.0.0.0' ||
                     hostname.startsWith('192.168.') ||
                     hostname.startsWith('10.') ||
                     hostname.endsWith('.local');

  // 检查开发端口
  const port = window.location.port;
  const isDevPort = port && (port === '3000' || port === '5173' || port === '8080' || port === '4000');

  return isLocalhost || isDevPort;
};

/**
 * 检测是否在生产环境
 * @returns {boolean} 如果在生产环境返回true，否则返回false
 */
export const isProduction = () => {
  return !isLocalDevelopment();
};

/**
 * 获取当前环境名称
 * @returns {string} 环境名称：'development' 或 'production'
 */
export const getEnvironment = () => {
  return isLocalDevelopment() ? 'development' : 'production';
};

/**
 * 根据环境获取API基础URL
 * @returns {string} API基础URL
 */
export const getApiBaseUrl = () => {
  if (isLocalDevelopment()) {
    // 本地开发环境直接返回空字符串，将直接调用第三方API
    return '';
  } else {
    // 生产环境使用相对路径调用serverless函数
    return '/api';
  }
};

/**
 * 环境配置对象
 */
export const envConfig = {
  isDev: isLocalDevelopment(),
  isProd: isProduction(),
  environment: getEnvironment(),
  apiBaseUrl: getApiBaseUrl()
};