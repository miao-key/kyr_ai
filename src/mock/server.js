import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// 导入配置
import config from './config/index.js'

// 导入中间件
import corsMiddleware from './middleware/cors.js'
import authMiddleware from './middleware/auth.js'
import loggerMiddleware from './middleware/logger.js'

// 导入路由
import authRoutes from './routes/auth.js'
import photosRoutes from './routes/photos.js'
import articlesRoutes from './routes/articles.js'
import travelRoutes from './routes/travel.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = config.server.port || 3001

// 安全中间件
app.use(helmet())

// 压缩中间件
app.use(compression())

// 跨域处理
app.use(corsMiddleware)

// 请求日志
app.use(morgan('combined'))
app.use(loggerMiddleware)

// 请求体解析
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 速率限制 - 调整为更宽松的限制
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 200, // 限制每个IP 1分钟内最多200个请求
  message: {
    error: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 跳过成功的请求，只计算失败的请求
  skipSuccessfulRequests: true
})
app.use('/api/', limiter)

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// 调试路由 - 检查API密钥配置
app.get('/debug/config', (req, res) => {
  res.json({
    pexels_api_key: config.apis.pexels.apiKey ? `${config.apis.pexels.apiKey.substring(0, 10)}...` : 'NOT_SET',
    pexels_configured: !!config.apis.pexels.apiKey,
    env_vars: {
      VITE_PEXELS_API: process.env.VITE_PEXELS_API ? `${process.env.VITE_PEXELS_API.substring(0, 10)}...` : 'NOT_SET',
      PEXELS_API_KEY: process.env.PEXELS_API_KEY ? `${process.env.PEXELS_API_KEY.substring(0, 10)}...` : 'NOT_SET'
    }
  })
})

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/photos', photosRoutes)
app.use('/api/articles', articlesRoutes)
app.use('/api/travel', travelRoutes)

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '接口不存在',
    code: 'NOT_FOUND',
    path: req.originalUrl
  })
})

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  
  // 开发环境返回详细错误信息
  const isDev = process.env.NODE_ENV === 'development'
  
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(isDev && { stack: err.stack })
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务器启动成功！`)
  console.log(`📍 服务地址: http://localhost:${PORT}`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...')
  process.exit(0)
})

export default app