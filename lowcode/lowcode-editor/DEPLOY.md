# Vercel 部署指南

## 🚀 快速部署到 Vercel

### 前提条件
1. 拥有 GitHub/GitLab/Bitbucket 账户
2. 拥有 Vercel 账户（免费）
3. 项目代码已推送到代码仓库

### 部署步骤

#### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账户登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 选择 `lowcode/lowcode-editor` 目录

3. **配置项目**
   - **Framework Preset**: Vite
   - **Root Directory**: `lowcode/lowcode-editor`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成

#### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 进入项目目录
cd lowcode/lowcode-editor

# 登录 Vercel
vercel login

# 部署项目
vercel

# 部署到生产环境
vercel --prod
```

### 🔧 配置文件说明

#### vercel.json
- 配置构建和路由规则
- 支持 SPA 路由
- 静态资源缓存优化

#### vite.config.ts
- 优化构建配置
- 代码分割策略
- 静态资源处理

#### .vercelignore
- 排除不必要的文件
- 减少上传时间

### 📦 构建优化

项目已配置以下优化：

1. **代码分割**
   - vendor: React 核心库
   - ui: Ant Design 组件库
   - utils: 工具库

2. **缓存策略**
   - 静态资源长期缓存
   - 文件指纹确保更新

3. **性能优化**
   - 压缩代码
   - Tree shaking
   - 资源预加载

### 🌐 自定义域名

1. 在 Vercel Dashboard 中选择项目
2. 进入 "Domains" 设置
3. 添加自定义域名
4. 配置 DNS 记录

### 🔍 故障排除

#### 构建失败
- 检查依赖版本兼容性
- 确保 TypeScript 编译无错误
- 查看构建日志

#### 路由问题
- 确保 `vercel.json` 中的路由配置正确
- SPA 应用需要回退到 `index.html`

#### 静态资源加载失败
- 检查 `base` 配置
- 确保资源路径正确

### 📊 监控和分析

Vercel 免费版提供：
- 构建日志
- 访问统计
- 性能监控
- 错误追踪

### 💰 免费版限制

- 每月 100GB 带宽
- 每月 1000 次构建
- 单次构建 45 秒限制
- 无服务器函数执行时间限制

### 🔄 自动部署

推送到主分支时自动部署：
1. 确保 GitHub 集成已启用
2. 推送代码到 main/master 分支
3. Vercel 自动触发构建和部署

### 📝 环境变量

如需配置环境变量：
1. 在 Vercel Dashboard 中进入项目设置
2. 添加环境变量
3. 重新部署项目

---

## 🎉 部署完成！

部署成功后，你将获得：
- 生产环境 URL
- 预览环境 URL（每个 PR）
- 自动 HTTPS 证书
- 全球 CDN 加速

享受你的低代码编辑器吧！ 🚀
