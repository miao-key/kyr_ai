# Vercel 部署指南

## 📋 部署前检查清单 (2025版)

- [ ] 代码已推送到 GitHub
- [ ] 所有依赖已正确安装
- [ ] `pnpm-lock.yaml` 已提交到仓库
- [ ] 本地构建成功 (`pnpm run build`)
- [ ] 环境变量已配置
- [ ] TypeScript 编译无错误
- [ ] Node.js 版本与 `.nvmrc` 一致 (20.x)
- [ ] 安全头配置已启用

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
- 现代化的 Vercel 配置格式
- 支持 SPA 路由（使用 rewrites）
- 静态资源缓存优化
- 兼容最新版本 Vercel

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

#### "functions" 和 "builds" 冲突错误
如果遇到 `"functions"属性不能与"builds"属性一起使用` 错误：
- 使用现代化的 `vercel.json` 配置（已修复）
- 避免同时使用旧版 `builds` 和新版 `functions`

#### TypeScript 编译错误 (TS18003)
如果遇到 `No inputs were found in config file` 错误：
- 已优化 TypeScript 配置文件兼容性
- 移除了较新的编译器选项，使用更稳定的配置
- 指定 Node.js 20.x 版本确保环境一致性

#### 依赖安装问题
如果遇到依赖相关错误：
- 确保 `pnpm-lock.yaml` 已提交到仓库
- 使用 `--frozen-lockfile` 确保依赖版本一致
- 检查 Node.js 版本是否与 `.nvmrc` 一致

#### 安全头配置
现已启用完整的安全头配置：
- `X-Content-Type-Options`: 防止 MIME 类型嗅探
- `X-Frame-Options`: 防止点击劫持
- `X-XSS-Protection`: 防止 XSS 攻击
- `Referrer-Policy`: 控制引用信息泄露
- `Permissions-Policy`: 限制浏览器功能访问

#### 构建失败
- 检查依赖版本兼容性
- 确保 TypeScript 编译无错误
- 查看构建日志
- 确认使用正确的包管理器（pnpm）

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

---

## 🏆 2025年最佳实践

### 性能优化
- ✅ 使用 Node.js 20.x (LTS) 获得最佳性能
- ✅ 启用 `--frozen-lockfile` 确保构建一致性
- ✅ 优化资源缓存策略（静态资源1年缓存）
- ✅ 压缩和优化构建输出

### 安全性
- ✅ 完整的安全头配置 (CSP, XSS, CSRF 防护)
- ✅ 严格的内容类型检查
- ✅ 防止点击劫持和内容嗅探
- ✅ 限制浏览器权限访问

### 可维护性
- ✅ 版本锁定 (pnpm-lock.yaml)
- ✅ 环境一致性 (.nvmrc)
- ✅ 构建前检查脚本
- ✅ 详细的部署日志和监控

## 🔗 相关链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html#vercel)
- [React 部署最佳实践](https://react.dev/learn/start-a-new-react-project#deploying-to-production)
- [Node.js 20.x 发布说明](https://nodejs.org/en/blog/release/v20.0.0)
