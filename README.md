# 🌟 智旅 - React智能旅行应用

一款现代化的移动端旅行应用，集成AI智能助手、用户认证系统、高质量图片内容和流畅的用户体验。

## 🚀 快速开始

### 1. 环境配置

```bash
# 1) 安装依赖（推荐使用 pnpm）
pnpm i
# 或：npm i

# 2) 复制环境变量模板（已提供 .env.example）
cp .env.example .env.local
# Windows PowerShell：Copy-Item .env.example .env.local

# 3) 启动开发服务器
pnpm run dev
# 或：npm run dev

# 4) 访问应用
# http://localhost:5173
```

### 2. 项目构建

```bash
# 生产构建
pnpm build    # 或 npm run build

# 构建并分析包大小
pnpm run build:analyze    # 或 npm run build:analyze

# 预览构建结果
pnpm preview  # 或 npm run preview
```

### 3. 常用脚本

- **start**: 开发启动同 `dev`
- **dev**: 启动 Vite 开发服务器
- **build**: 生产构建（已启用 Terser 压缩与手动分包）
- **build:analyze**: 生成 `dist/stats.html` 可视化分析
- **build:test**: 自动选择包管理器执行构建并输出性能报告
- **build:report**: 构建并本地预览 `dist`
- **preview**: 预览生产构建
- **lint** / **lint:fix**: 代码检查 / 自动修复
- **performance:test** / **performance:mid**: 内置性能测试脚本

## 🎯 核心功能

### 🔐 用户认证系统
- 🔑 **完整登录注册** - 安全的用户认证和会话管理（基于JWT）
- 👤 **个人档案管理** - 用户信息编辑和偏好设置
- 🛡️ **路由保护** - 智能页面访问控制
- 📱 **状态持久化** - 登录状态安全保存（Cookie + Zustand）
- 🚪 **安全退出** - 双重确认的退出登录机制

### ✨ AI智能助手
- 🤖 **智能对话** - 基于Coze工作流的旅行咨询助手
- 🎨 **AI头像生成** - 豆包API驱动的个性化旅行头像
- 💬 **实时交流** - 智能回复和加载状态管理
- 🔄 **流式输出** - 支持AI内容的流式展示

### 📸 旅记内容
- 🏖️ **高质量图片** - Pexels API提供专业旅行摄影
- 📱 **仿小红书设计** - 瀑布流布局和现代卡片风格
- 🏷️ **分类标签** - 发现、美食、风景、人文、攻略等
- 💬 **完整交互** - 点赞、收藏、评论、关注功能
- ✍️ **写文章功能** - 支持用户发表旅行文章

### 🎪 用户体验优化
- 🔄 **无缝轮播** - 真正的无限循环，消除视觉跳跃
- ⚡ **性能优化** - 防抖节流、图片懒加载、代码分割
- 📱 **移动端优先** - 完美适配各种屏幕尺寸（lib-flexible + rem）
- 🎭 **流畅动画** - 60fps的过渡效果和交互反馈
- 🦴 **骨架屏** - 优雅的加载状态展示

## 🏗️ 项目架构

### 技术栈
- **框架**: React 19.1.0 + Vite 6.x
- **路由**: React Router DOM 7.x
- **状态管理**: Zustand 5.x
- **UI组件库**: React-Vant 3.x + @react-vant/icons
- **HTTP客户端**: Axios
- **移动端适配**: lib-flexible + postcss-pxtorem
- **认证**: JWT + js-cookie
- **构建优化**: 代码分割、打包分析

### 项目结构
```
src/
├── components/           # 组件目录
│   ├── UI/              # 通用UI组件库
│   │   ├── LoadingSpinner/   # 加载组件
│   │   ├── LazyImage/        # 懒加载图片组件
│   │   └── EmptyState/       # 空状态组件
│   ├── MainLayout/      # 主布局组件
│   ├── WaterfallLayout/ # 瀑布流组件
│   └── ProtectedRoute/  # 路由保护组件
├── contexts/            # React上下文
│   └── AuthContext.jsx # 认证上下文
├── hooks/               # 自定义钩子
│   ├── useDebounce.js   # 防抖钩子
│   ├── useThrottle.js   # 节流钩子
│   └── useTitle.js      # 标题钩子
├── constants/           # 常量配置
├── utils/               # 工具函数
│   └── auth.js          # 认证工具函数
├── services/            # API服务
│   └── pexelsApi.js     # Pexels API
├── pages/               # 页面组件
│   ├── Login/          # 登录注册页面
│   ├── Welcome/        # 欢迎页面
│   ├── Home/           # 首页
│   ├── Article/        # 旅记页面
│   ├── AI_chat/        # AI聊天
│   └── Account/        # 个人中心
└── assets/              # 静态资源
```

## 🔧 API集成指南

### 1. 豆包AI图像生成（可选）

**获取API密钥：**
1. 访问豆包开发者平台
2. 创建应用并获取API密钥
3. 配置到 `VITE_DOUBAO_IMAGE_API_KEY`

**功能特性：**
- 专用图像生成模型
- 真实图片输出，直接返回图片URL
- 代理服务器安全处理API密钥
- 智能降级到精美旅行备用头像

### 2. Pexels图片API（可选）

**获取API密钥：**
1. 访问 [Pexels API官网](https://www.pexels.com/api/)
2. 免费注册获得API密钥（每月200次免费调用）
3. 配置到 `VITE_PEXELS_API`

**功能特性：**
- 高质量旅行、美食、风景图片
- 智能分类和标签系统
- 自动降级到Lorem Picsum备用图片

### 3. Coze工作流API（推荐）

**获取API密钥：**
1. 登录 [Coze平台](https://www.coze.cn/)
2. 创建AI工作流
3. 获取PAT Token配置到 `VITE_PAT_TOKEN`

**工作流配置：**
- 输入变量：`input` (string)
- 输出变量：`output` (string)
- API端点：`/api/v1/workflow/run`

### 环境变量配置

创建 `.env.local` 文件：

```env
# AI图像生成API（可选）- 用于AI头像生成
VITE_DOUBAO_IMAGE_API_KEY=your-doubao-api-key-here

# Pexels图片API（可选）- 用于高质量旅行图片
VITE_PEXELS_API=your-pexels-api-key-here

# Coze工作流API（推荐）- 用于AI聊天助手
VITE_PAT_TOKEN=your-coze-pat-token-here
```

### 线上部署（Vercel）

1. 在项目根目录已提供 `vercel.json`，包含 SPA 重写配置。
2. 在 Vercel 项目设置 → Environment Variables 添加：
   - `COZE_PAT_TOKEN`（或 `VITE_PAT_TOKEN`）
   - `DOUBAO_IMAGE_API_KEY`（或 `VITE_DOUBAO_IMAGE_API_KEY`）
3. Framework 选择 Vite；Root Directory 设为 `My_Todos/ZhiNen_trip`；Build Command `vite build`；Output `dist`。
4. 部署完成后，前端通过 `/api/coze/*` 与 `/api/doubao/*` 调用 Vercel 无服务函数，避免在浏览器暴露密钥。

## 🗄️ 后端与 Mock 说明

- **是否包含后端**: 本项目不内置独立后端服务。开发阶段通过 Vite 代理安全转发到第三方 API，并在代理层注入鉴权信息。

- **开发代理配置**（见 `vite.config.js` → `server.proxy`）
  - `/api/doubao` → `https://ark.cn-beijing.volces.com`
    - 代理层自动注入 `Authorization: Bearer ${VITE_DOUBAO_IMAGE_API_KEY}`
    - 用于豆包图像生成接口（`/v3/images/generations`）
  - `/api/coze` → `https://api.coze.cn`
    - 代理层自动注入 `Authorization: Bearer ${VITE_PAT_TOKEN}`
    - 同时进行路径重写：如 `/api/coze/workflow` → `/v1/workflow`

- **如何使用**
  - 开发环境：按“环境变量配置”填写密钥后，前端直接请求 `/api/doubao`、`/api/coze` 前缀（参考 `src/api/index.js`）。
  - 生产环境：需要在部署层提供同等反向代理，或将 `src/api/index.js` 中的 `BASE_URL` 改为真实服务地址；否则 `/api/*` 前缀将无法在生产直接访问。

- **内置 Mock（降级策略）**
  - `src/api/pexels.js` 在未配置 `VITE_PEXELS_API` 或请求失败时，会自动降级到本地 `generateMockImages()`，使用 Picsum 占位图生成模拟数据，确保页面功能可用。
  - 配置 `VITE_PEXELS_API` 后会自动使用真实 Pexels 数据，无需额外开关。

- **可选：vite-plugin-mock（已安装，默认未启用）**
  - 依赖已在 `devDependencies` 中：`vite-plugin-mock`
  - 如需本地接口 Mock：
    1. 在 `vite.config.js` 启用插件：
       ```js
       import { viteMockServe } from 'vite-plugin-mock'
       export default defineConfig(({ command, mode }) => ({
         plugins: [
           react(),
           viteMockServe({ mockPath: 'mock', localEnabled: true })
         ]
       }))
       ```
    2. 新建 `mock/example.js`：
       ```js
       export default [
         { url: '/api/demo', method: 'get', response: () => ({ ok: true }) }
       ]
       ```
    3. 运行 `pnpm dev` 后访问 `/api/demo` 验证本地 Mock。

- **安全提示**
  - 请勿在前端代码中硬编码密钥；密钥仅通过代理层注入。
  - `.env.local` 已加入 `.gitignore`，避免泄露。

## ⚡ 性能优化特性

### 防抖节流配置
```javascript
// 时间配置
搜索功能: 300ms      // 防重复搜索
导航点击: 250ms      // 防误触
轮播滑动: 100ms      // 防过快滑动
滚动监听: 100ms      // 平衡流畅度和性能
触摸移动: 16ms       // 60fps流畅体验
```

### 移动端适配方案
- **lib-flexible**: 1rem = 屏幕宽度/10
- **设计稿标准**: 375px（postcss rootValue=37.5）
- **postcss-pxtorem**: 自动 px→rem 转换
- **响应式设计**: 适配常见移动设备

### 构建优化
- **代码分割**: vite-plugin-chunk-split
- **打包分析**: rollup-plugin-visualizer
- **性能测试**: 内置性能测试脚本
- **压缩优化**: Terser压缩

## 🛠️ 开发指南

### 认证系统使用
```javascript
// 在组件中使用认证状态
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>请先登录</div>
  }
  
  return (
    <div>
      <h1>欢迎, {user.nickname}!</h1>
      <button onClick={logout}>退出登录</button>
    </div>
  )
}
```

### 路由保护
```javascript
// 保护需要登录的页面
<ProtectedRoute>
  <SomePage />
</ProtectedRoute>

// 或者在路由配置中使用
<Route path="/protected" element={
  <ProtectedRoute>
    <ProtectedPage />
  </ProtectedRoute>
} />
```

### 自定义钩子
```javascript
// 防抖使用
const handleSearch = useDebounce(() => {
  // 搜索逻辑
}, 300)

// 节流使用  
const handleScroll = useThrottle(() => {
  // 滚动处理
}, 100)
```

## 🎨 设计规范

### 视觉风格
- **色彩方案**: 渐变蓝紫色系 (#667eea → #764ba2)
- **圆角设计**: 16px主要圆角，12px次要圆角
- **阴影系统**: 多层次box-shadow
- **字体层级**: 15px主文本，13-14px辅助文本

### 交互反馈
- **悬停效果**: 卡片上浮和阴影加深
- **点击反馈**: 按钮缩放和颜色变化
- **加载状态**: 优雅的skeleton loading
- **空状态**: 友好的引导文案

## 🔍 故障排除

### 常见问题

**1. 依赖安装问题**
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

**2. API调用失败**
- 检查 `.env.local` 配置是否正确
- 确认API密钥有效且有权限
- 重启开发服务器使环境变量生效

**3. 移动端适配问题**
- 确保meta viewport标签正确设置
- 检查postcss.config.js配置
- 验证lib-flexible是否正确加载

**4. 认证状态丢失**
- 检查Cookie配置
- 确认JWT token有效期
- 验证Zustand store配置

### 调试信息
在浏览器控制台查看以下关键日志：
- `🔄 开始加载数据` - 请求开始
- `✅ 数据加载完成` - 请求成功  
- `🎨 使用备用方案` - 降级处理
- `❌ 请求失败` - 错误状态

## 🛡️ 安全提示

- ✅ 将 `.env.local` 添加到 `.gitignore`
- ✅ API密钥通过代理服务器安全处理
- ✅ 前端代码零API密钥暴露
- ✅ JWT token安全存储
- ✅ 定期轮换API密钥
- ❌ 不要将密钥提交到公共仓库

## 🎯 功能路线图

### 已完成 ✅
- [x] **完整认证系统** - JWT登录、注册、路由保护
- [x] **用户状态管理** - Zustand + Context API
- [x] **个人中心** - 用户档案、头像管理、设置功能
- [x] **AI聊天助手** - Coze工作流集成
- [x] **AI头像生成** - 豆包API集成
- [x] **高质量图片** - Pexels API集成
- [x] **移动端适配** - lib-flexible + postcss
- [x] **性能优化** - 防抖节流、代码分割
- [x] **无缝轮播** - 真正的无限循环

### 开发中 🚧
- [ ] 写文章页面完整实现
- [ ] 评论系统和互动功能  
- [ ] 个人主页和关注列表
- [ ] 内容搜索和过滤

### 未来规划 🔮
- [ ] 视频内容支持
- [ ] AI智能推荐算法
- [ ] 社交分享功能
- [ ] 离线内容缓存
- [ ] 多语言国际化
- [ ] PWA支持

## 📊 项目亮点

### 前端智能化
- **多模型支持**: 灵活切换不同AI模型
- **工作流集成**: Coze智能编排AI流程
- **降级策略**: 完善的备用方案机制

### 用户体验
- **原子CSS**: 高复用性的样式架构
- **组件粒度**: React.memo + useCallback优化
- **懒加载**: 图片和路由懒加载
- **骨架屏**: 优雅的加载状态

### 工程化
- **代码规范**: ESLint + Git提交规范
- **性能监控**: 内置性能测试工具
- **构建优化**: 智能代码分割和压缩
- **开发体验**: 热更新 + Mock数据

## 💡 获取帮助

如果遇到问题：
1. 查看浏览器控制台的详细错误信息
2. 确认环境变量配置正确
3. 重启开发服务器
4. 检查网络连接
5. 查看本文档的故障排除部分

---

🎉 **即使不配置任何API，应用也会使用精美的备用方案，确保100%功能可用性！**

**开发团队**: 智旅开发组  
**技术栈**: React 19 + Vite 6 + React-Vant  
**设计风格**: 仿小红书/马蜂窝移动端体验  
**项目类型**: 移动端SPA + AI智能应用