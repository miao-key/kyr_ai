import cors from 'cors'
import config from '../config/index.js'

// CORS配置
const corsOptions = {
  origin: (origin, callback) => {
    // 允许没有origin的请求（如移动应用）
    if (!origin) return callback(null, true)
    
    // 检查origin是否在允许列表中
    if (config.cors.origin.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.warn(`❌ CORS阻止了来自 ${origin} 的请求`)
      callback(new Error('不允许的CORS源'), false)
    }
  },
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24小时预检缓存
}

// 开发环境下允许所有源
if (config.server.env === 'development') {
  corsOptions.origin = true
  console.log('🔓 开发环境：允许所有CORS源')
}

const corsMiddleware = cors(corsOptions)

export default corsMiddleware