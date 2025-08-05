# AI头像生成API配置指南 - 专用图像生成模型

## 🚀 快速开始

### 1. 创建环境配置文件

在项目根目录创建 `.env.local` 文件：

```env
# 豆包API密钥（必需 - 专用图像生成模型）
VITE_DOUBAO_IMAGE_API_KEY=your-api-key-here
```

### 🎯 新版本特性

✅ **专用图像生成模型** - 使用 `ep-20250804182253-ckvjk`  
✅ **真实图片生成** - 直接返回图片URL或base64数据  
✅ **专业图像API** - `/api/v3/images/generations` 端点  
✅ **高级参数支持** - guidance_scale、watermark、size等  
✅ **彻底解决跨域** - Vite代理自动处理  
✅ **API密钥安全** - 前端代码零API密钥暴露

### 2. 获取豆包API密钥

1. 访问豆包开发者平台
2. 创建应用并获取API密钥
3. 将密钥填入 `VITE_DOUBAO_API_KEY`

## 🔧 配置说明

### 环境变量详解

- **VITE_DOUBAO_IMAGE_API_KEY**: 豆包API密钥（必需）
  - 从豆包开发者平台获取
  - 用于新的多模态模型 `ep-20250804180537-29vn5`
  - 代理服务器自动添加到Authorization头
  - 前端代码完全不接触敏感密钥

### 新模型配置说明

在 `vite.config.js` 中的代理配置：
```javascript
server: {
  proxy: {
    "/api/doubao": {
      target: "https://ark.cn-beijing.volces.com",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/doubao/, "/api/v3"),
      configure: (proxy, options) => {
        proxy.on("proxyReq", (proxyReq, req, res) => {
          const apiKey = env.VITE_DOUBAO_IMAGE_API_KEY;
          proxyReq.setHeader("Authorization", `Bearer ${apiKey}`);
        });
      }
    }
  }
}
```

### API请求格式

使用专用图像生成API：
```javascript
{
  "model": "ep-20250804182253-ckvjk",
  "prompt": "请为旅行应用生成一个专属头像...",
  "response_format": "url",
  "size": "1024x1024",
  "guidance_scale": 3,
  "watermark": false
}
```

### 请求参数说明

- **model**: 图像生成模型ID
- **prompt**: 图像生成的提示词描述
- **response_format**: 返回格式 ("url" 或 "b64_json")
- **size**: 图片尺寸 ("1024x1024", "512x512", "256x256")
- **guidance_scale**: 引导强度 (1-20，推荐3-7)
- **watermark**: 是否添加水印 (true/false)

## 🛡️ 安全提示

- ✅ 将 `.env.local` 添加到 `.gitignore`
- ✅ 不要在代码中硬编码API密钥
- ✅ 定期轮换API密钥
- ❌ 不要将密钥提交到公共仓库

## 🎯 测试方法

### 1. 启动项目
```bash
npm run dev
```

### 2. 检查配置
在浏览器控制台查看 "API配置检查" 输出

### 3. 测试功能
点击 "AI生成旅行头像" 按钮测试

## 🔄 故障排除

### 常见错误及解决方案

#### 1. `reactRender is not a function`
**原因**: Toast组件调用方式问题
**解决**: 已修复，使用兼容的Toast调用方式

#### 2. `404 Not Found` 或 `HTTP error! status: 404`
**原因**: API密钥未配置或无效
**解决**: 
- 检查 `.env.local` 中的 `VITE_DOUBAO_IMAGE_API_KEY`
- 确认API密钥有访问新模型 `ep-20250804180537-29vn5` 的权限
- 重启开发服务器
- 查看控制台代理日志确认Authorization头已添加

#### 3. `未找到VITE_DOUBAO_IMAGE_API_KEY环境变量`
**原因**: 环境变量配置错误
**解决**: 
- 在项目根目录创建 `.env.local` 文件
- 确保变量名完全匹配: `VITE_DOUBAO_IMAGE_API_KEY`
- 重启开发服务器生效
- 检查控制台输出确认配置成功

#### 4. `API返回格式异常：未找到预期的图片数据结构`
**原因**: 图像生成API返回了意外的数据格式
**解决**: 
- 检查控制台的"豆包API原始响应"日志
- 确认使用的是图像生成端点 `/images/generations`
- 验证请求参数格式是否正确
- 查看是否有API配额或权限问题

#### 5. `图像生成失败但返回了错误信息`
**原因**: API识别了请求但无法生成图像
**解决**: 
- 检查提示词是否包含敏感内容
- 调整 guidance_scale 参数 (推荐3-7)
- 确认API密钥有图像生成权限
- 系统会自动使用精美的备用头像

## 🎨 备用方案

即使API配置失败，系统也会自动使用精美的备用SVG头像生成器：

### 特色功能
- 🌈 7种旅行主题配色
- ✈️ 专属旅行图标（飞机、地图、背包等）
- 💎 渐变背景和阴影效果
- 🎯 基于用户信息的个性化生成

### 主题配色
1. 蓝紫渐变 + ✈️ 飞机
2. 粉紫渐变 + 🗺️ 地图
3. 蓝青渐变 + 🎒 背包
4. 绿青渐变 + 📷 相机
5. 粉黄渐变 + 🏔️ 山峰
6. 青粉渐变 + 🏖️ 海滩
7. 橙黄渐变 + 🎯 目标

## 📝 开发日志

### 已修复的问题
- ✅ Toast调用错误 (`reactRender is not a function`) - 使用Notify替代
- ✅ 跨域问题 (通过Vite代理彻底解决)
- ✅ API密钥暴露风险 (前端代码零API密钥暴露)
- ✅ 向后兼容代码冗余 (清理废弃的VITE_DOUBAO_API_KEY)
- ✅ 组件卸载后的状态更新错误
- ✅ 异步操作的错误处理

### 当前状态 (v3.0 - 真实图片生成)
- ✅ **专用图像生成模型** - `ep-20250804182253-ckvjk`
- ✅ **真实图片输出** - 直接生成并返回图片URL
- ✅ **专业图像API端点** - `/api/v3/images/generations`
- ✅ **高级参数控制** - guidance_scale、watermark、size等
- ✅ **API密钥安全处理** - 代理服务器自动添加Authorization头
- ✅ **前端代码安全** - 完全移除API密钥相关代码
- ✅ **增强错误处理** - 详细的调试日志和API响应记录
- ✅ **智能降级保护** - API失败时使用7种精美旅行备用头像
- ✅ **用户体验优化** - 多重保护机制确保100%可用性

## 🆘 获取帮助

如果遇到问题：
1. 查看浏览器控制台的详细错误信息
2. 确认环境变量配置正确
3. 重启开发服务器
4. 检查网络连接

**注意**: 即使API调用失败，系统也会生成精美的备用头像，确保功能100%可用！