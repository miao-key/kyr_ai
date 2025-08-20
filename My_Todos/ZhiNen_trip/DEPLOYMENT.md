# 🚀 ZhiNen_trip Vercel 部署指南

## 📋 部署配置概览

本项目已针对Vercel部署进行优化，特别考虑了Coze工作流50秒的长请求时间需求。

### 🔧 关键配置

#### 1. Serverless函数超时设置
- **Coze工作流**: 60秒 (支持50秒长请求 + 10秒缓冲)
- **豆包图片生成**: 30秒 (图片生成通常需要15-25秒)
- **Pexels API**: 10秒 (快速响应的图片搜索)

#### 2. Runtime配置
- 从 `edge` runtime 升级到 `nodejs18.x`
- 支持更长的执行时间和更好的错误处理
- 添加了详细的日志记录

#### 3. CORS和安全配置
- 完整的跨域资源共享配置
- 安全头设置（X-Frame-Options, X-Content-Type-Options等）
- 亚太地区优化（香港、新加坡、东京）

## 🛠️ 部署步骤

### 1. 准备工作

确保项目根目录包含以下文件：
```
ZhiNen_trip/
├── vercel.json          # Vercel配置文件
├── .vercelignore        # 部署时忽略的文件
├── package.json         # 项目依赖
└── api/                 # Serverless函数
    ├── coze/workflow/run.js
    ├── doubao/v3/images/generations.js
    └── pexels/[...path].js
```

### 2. 环境变量配置

在Vercel项目设置中添加以下环境变量：

```env
# 必需 - Coze工作流API
COZE_PAT_TOKEN=your_coze_pat_token_here

# 可选 - 豆包AI图片生成
DOUBAO_IMAGE_API_KEY=your_doubao_image_api_key_here

# 可选 - Pexels高质量图片
PEXELS_API_KEY=your_pexels_api_key_here

# 环境标识
NODE_ENV=production
```

### 3. Vercel项目配置

1. **Framework**: Vite
2. **Root Directory**: `My_Todos/ZhiNen_trip`
3. **Build Command**: `vite build`
4. **Output Directory**: `dist`
5. **Install Command**: `pnpm install` (推荐) 或 `npm install`

### 4. 部署

```bash
# 使用Vercel CLI
vercel --prod

# 或通过Git推送自动部署
git push origin main
```

## 📊 API端点说明

### Coze工作流 (最长60秒)
```
POST /api/coze/workflow/run
```
- 用于AI聊天和智能推荐
- 支持50秒长时间工作流处理
- 自动重试和错误处理

### 豆包图片生成 (最长30秒)
```
POST /api/doubao/v3/images/generations
```
- AI头像和图片生成
- 高质量旅行主题图片
- 智能降级到Pexels备用

### Pexels图片搜索 (最长10秒)
```
GET /api/pexels/search?query=travel&per_page=20
GET /api/pexels/curated?per_page=20
```
- 高质量股票图片
- 旅行、美食、风景主题
- 智能降级到Lorem Picsum

## 🔍 性能监控

### 日志监控
每个API函数都包含详细的执行时间日志：
- 🚀 请求开始标记
- ✅ 成功完成 + 执行时间
- ❌ 错误信息 + 堆栈跟踪

### Vercel Analytics
建议启用Vercel Analytics监控：
- 函数执行时间
- 错误率统计
- 用户访问分析

## 🚨 故障排除

### 常见问题

#### 1. 函数超时
```
Error: Function execution timed out
```
**解决方案**: 检查vercel.json中的maxDuration设置，确保足够的执行时间。

#### 2. 环境变量未找到
```
Error: Missing COZE_PAT_TOKEN
```
**解决方案**: 在Vercel项目设置 → Environment Variables 中添加相应的API密钥。

#### 3. CORS错误
```
Access to fetch blocked by CORS policy
```
**解决方案**: 已在vercel.json和API函数中配置CORS头，如仍有问题请检查域名配置。

### 调试技巧

1. **查看函数日志**:
   - Vercel Dashboard → Functions → 点击具体函数
   - 查看实时日志和错误信息

2. **本地测试**:
   ```bash
   # 安装Vercel CLI
   npm i -g vercel
   
   # 本地运行Serverless函数
   vercel dev
   ```

3. **性能测试**:
   ```bash
   # 测试Coze工作流响应时间
   curl -X POST https://your-app.vercel.app/api/coze/workflow/run \
     -H "Content-Type: application/json" \
     -d '{"workflow_id":"your_workflow_id","parameters":{"input":"test"}}'
   ```

## 📈 优化建议

### 1. 缓存策略
- 静态资源使用CDN缓存
- API响应适当缓存以减少重复请求

### 2. 区域优化
当前配置的服务区域：
- `hkg1` - 香港 (主要)

> **注意**: 多区域部署需要 Vercel 专业版或企业版计划。免费版只支持单一区域部署。

### 3. 监控告警
建议设置以下监控告警：
- 函数执行时间超过45秒
- 错误率超过5%
- API调用频率异常

## 🎯 部署检查清单

- [ ] vercel.json配置正确
- [ ] 环境变量已设置
- [ ] API函数正常响应
- [ ] CORS配置生效
- [ ] 日志输出正常
- [ ] 性能监控启用
- [ ] 错误处理完整

部署完成后，访问 `https://your-app.vercel.app` 测试所有功能！
