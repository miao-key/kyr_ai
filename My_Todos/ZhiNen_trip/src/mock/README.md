# 智能旅行后端服务

这是智能旅行项目的后端服务，提供完整的RESTful API接口。

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 环境配置
复制 `.env.example` 文件为 `.env` 并配置相应的环境变量：
```bash
cp .env.example .env
```

### 3. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3001` 启动。

## API 接口

### 健康检查
- `GET /health` - 服务健康状态检查

### 用户认证 (`/api/auth`)
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新用户资料
- `PUT /api/auth/password` - 修改密码
- `POST /api/auth/logout` - 用户登出

### 图片管理 (`/api/photos`)
- `GET /api/photos` - 获取图片列表
- `GET /api/photos/:id` - 获取单张图片详情
- `POST /api/photos/upload` - 上传图片
- `POST /api/photos/:id/like` - 点赞图片
- `DELETE /api/photos/:id/like` - 取消点赞
- `GET /api/photos/:id/download` - 下载图片
- `GET /api/photos/favorites` - 获取用户收藏的图片
- `GET /api/photos/trending` - 获取热门图片

### 文章管理 (`/api/articles`)
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章
- `POST /api/articles/:id/like` - 点赞文章
- `DELETE /api/articles/:id/like` - 取消点赞
- `POST /api/articles/:id/bookmark` - 收藏文章
- `DELETE /api/articles/:id/bookmark` - 取消收藏
- `GET /api/articles/my` - 获取我的文章
- `GET /api/articles/trending` - 获取热门文章
- `GET /api/articles/categories` - 获取文章分类
- `GET /api/articles/tags` - 获取热门标签

### 旅游信息 (`/api/travel`)
- `GET /api/travel/destinations` - 获取旅游目的地列表
- `GET /api/travel/destinations/:id` - 获取目的地详情
- `POST /api/travel/destinations/:id/favorite` - 收藏目的地
- `DELETE /api/travel/destinations/:id/favorite` - 取消收藏
- `GET /api/travel/guides` - 获取旅游指南列表
- `GET /api/travel/guides/:id` - 获取指南详情
- `POST /api/travel/guides/:id/like` - 点赞指南
- `DELETE /api/travel/guides/:id/like` - 取消点赞
- `POST /api/travel/guides/:id/bookmark` - 收藏指南
- `DELETE /api/travel/guides/:id/bookmark` - 取消收藏
- `GET /api/travel/destinations/popular` - 获取热门目的地
- `GET /api/travel/guides/popular` - 获取热门指南
- `GET /api/travel/destinations/favorites` - 获取用户收藏的目的地

## 项目结构

```
src/mock/
├── server.js              # 服务器入口文件
├── package.json           # 项目依赖配置
├── .env.example          # 环境变量示例
├── config/
│   └── index.js          # 应用配置
├── middleware/
│   ├── auth.js           # JWT认证中间件
│   ├── cors.js           # CORS中间件
│   └── logger.js         # 日志中间件
├── routes/
│   ├── auth.js           # 用户认证路由
│   ├── photos.js         # 图片管理路由
│   ├── articles.js       # 文章管理路由
│   └── travel.js         # 旅游信息路由
├── models/
│   ├── User.js           # 用户数据模型
│   ├── Photo.js          # 图片数据模型
│   └── Article.js        # 文章数据模型
└── services/
    └── pexelsService.js   # Pexels API服务
```

## 环境变量说明

请参考 `.env.example` 文件中的配置项说明。主要包括：

- **服务器配置**：端口、主机地址等
- **JWT配置**：密钥和过期时间
- **外部API**：Pexels、Unsplash API密钥
- **安全配置**：CORS、速率限制等
- **业务配置**：分页大小、搜索分类等

## 注意事项

1. 本项目使用内存数据存储，重启服务后数据会重置
2. 图片接口需要配置 Pexels API 密钥才能正常工作
3. 所有需要认证的接口都需要在请求头中携带 JWT 令牌
4. 开发环境下允许所有CORS源，生产环境请配置具体的允许源

## 开发说明

- 使用 Express.js 框架
- JWT 用于用户认证
- 支持文件上传（使用 multer）
- 集成安全中间件（helmet）
- 请求日志记录（morgan + 自定义日志）
- 速率限制防护
- 响应压缩优化