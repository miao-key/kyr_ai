import fs from 'fs'
import path from 'path'
import config from '../config/index.js'

// 确保日志目录存在
const logDir = path.dirname(config.logging.file)
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 日志级别
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

// 获取当前日志级别
const currentLogLevel = LOG_LEVELS[config.logging.level] || LOG_LEVELS.info

// 格式化日志消息
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...meta
  }
  return JSON.stringify(logEntry)
}

// 写入日志文件
const writeToFile = (logMessage) => {
  if (config.logging.file) {
    fs.appendFileSync(config.logging.file, logMessage + '\n')
  }
}

// 日志记录器
const logger = {
  error: (message, meta = {}) => {
    if (currentLogLevel >= LOG_LEVELS.error) {
      const logMessage = formatLogMessage('error', message, meta)
      console.error(`❌ ${message}`, meta)
      writeToFile(logMessage)
    }
  },

  warn: (message, meta = {}) => {
    if (currentLogLevel >= LOG_LEVELS.warn) {
      const logMessage = formatLogMessage('warn', message, meta)
      console.warn(`⚠️  ${message}`, meta)
      writeToFile(logMessage)
    }
  },

  info: (message, meta = {}) => {
    if (currentLogLevel >= LOG_LEVELS.info) {
      const logMessage = formatLogMessage('info', message, meta)
      console.log(`ℹ️  ${message}`, meta)
      writeToFile(logMessage)
    }
  },

  debug: (message, meta = {}) => {
    if (currentLogLevel >= LOG_LEVELS.debug) {
      const logMessage = formatLogMessage('debug', message, meta)
      console.log(`🐛 ${message}`, meta)
      writeToFile(logMessage)
    }
  }
}

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const startTime = Date.now()
  const { method, url, ip, headers } = req
  
  // 记录请求开始
  logger.info('请求开始', {
    method,
    url,
    ip: ip || req.connection.remoteAddress,
    userAgent: headers['user-agent'],
    referer: headers.referer
  })

  // 监听响应结束
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const { statusCode } = res
    
    const logLevel = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info'
    const statusEmoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅'
    
    logger[logLevel]('请求完成', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ip: ip || req.connection.remoteAddress,
      emoji: statusEmoji
    })
  })

  next()
}

// API错误日志中间件
const errorLogger = (err, req, res, next) => {
  logger.error('API错误', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    body: req.body,
    params: req.params,
    query: req.query
  })
  
  next(err)
}

// 性能监控中间件
const performanceLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint()
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1000000 // 转换为毫秒
    
    if (duration > 1000) { // 超过1秒的请求
      logger.warn('慢请求检测', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode
      })
    }
  })
  
  next()
}

// 导出日志记录器和中间件
export { logger, errorLogger, performanceLogger }
export default requestLogger