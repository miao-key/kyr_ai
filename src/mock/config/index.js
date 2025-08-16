import dotenv from 'dotenv'
import path from 'path'

// 加载根目录的.env.local文件
// 由于后端在 src/mock 目录下运行，需要向上两级找到项目根目录
const rootDir = path.resolve(process.cwd(), '../../')
dotenv.config({ path: path.resolve(rootDir, '.env.local') })
// 也加载默认的.env文件作为备选
dotenv.config({ path: path.resolve(rootDir, '.env') })

const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // 数据库配置（如果需要）
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./data.db',
    options: {
      logging: process.env.NODE_ENV === 'development'
    }
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'zhinen-trip-secret-key-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // 第三方API配置
  apis: {
    pexels: {
      apiKey: process.env.VITE_PEXELS_API || process.env.PEXELS_API_KEY || '',
      baseUrl: 'https://api.pexels.com/v1',
      rateLimit: {
        requests: 200, // 每小时请求数
        window: 3600000 // 1小时（毫秒）
      }
    },
    unsplash: {
      accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
      baseUrl: 'https://api.unsplash.com'
    }
  },

  // 文件上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    destination: process.env.UPLOAD_PATH || './uploads'
  },

  // 缓存配置
  cache: {
    ttl: 300, // 5分钟
    maxSize: 100, // 最大缓存条目数
    checkPeriod: 600 // 10分钟检查一次过期项
  },

  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    file: process.env.LOG_FILE || './logs/app.log'
  },

  // 安全配置
  security: {
    bcryptRounds: 12,
    sessionSecret: process.env.SESSION_SECRET || 'zhinen-trip-session-secret',
    rateLimitWindow: 15 * 60 * 1000, // 15分钟
    rateLimitMax: 100 // 每个IP最大请求数
  },

  // 业务配置
  business: {
    pagination: {
      defaultLimit: 20,
      maxLimit: 100
    },
    search: {
      defaultQuery: 'travel',
      categories: ['nature', 'city', 'food', 'culture', 'adventure', 'beach']
    }
  }
}

// 验证必要的环境变量
const requiredEnvVars = []

if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('JWT_SECRET', 'DATABASE_URL')
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ 缺少必要的环境变量: ${envVar}`)
    process.exit(1)
  }
}

// 开发环境下打印配置信息
if (config.server.env === 'development') {
  console.log('📋 当前配置:')
  console.log(`   服务器端口: ${config.server.port}`)
  console.log(`   环境: ${config.server.env}`)
  console.log(`   CORS源: ${config.cors.origin.join(', ')}`)
  console.log(`   JWT过期时间: ${config.jwt.expiresIn}`)
  console.log(`   Pexels API密钥: ${config.apis.pexels.apiKey ? '已配置' : '未配置'}`)
  if (config.apis.pexels.apiKey) {
    console.log(`   API密钥前缀: ${config.apis.pexels.apiKey.substring(0, 10)}...`)
  }
}

export default config