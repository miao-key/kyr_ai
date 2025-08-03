# Pexels API 配置指南

## 📸 如何获取Pexels API密钥

1. **访问Pexels官网**
   - 打开 https://www.pexels.com/api/
   - 点击 "Request API Key" 按钮

2. **注册/登录账户**
   - 使用邮箱注册新账户或登录现有账户

3. **申请API密钥**
   - 填写申请表单：
     - **项目名称**: 智旅 / ZhiNen Trip
     - **项目类型**: 个人使用/教育
     - **简要说明**: 
       ```
       我正在开发一个名为"智旅"的移动端旅游应用，将使用Pexels提供的高质量旅游风景照片用于：
       1. 首页轮播图展示（景点风光图片）
       2. 旅游攻略卡片的背景图片
       3. 旅游目的地推荐的配图
       所有图片将在React Web应用中展示，用于提升用户浏览旅游信息的视觉体验。会严格遵守Pexels的使用条款，包括适当的图片署名。
       ```
     - **网站URL**: localhost:5173 (开发环境)

4. **获取API密钥**
   - 提交申请后，通常会立即获得API密钥
   - 复制你的API密钥

## ⚙️ 本地配置

1. **创建环境变量文件**
   在项目根目录下创建 `.env.local` 文件：
   ```bash
   # 在 My_Todos/ZhiNen_trip/ 目录下创建 .env.local 文件
   touch .env.local
   ```

2. **配置API密钥**
   在 `.env.local` 文件中添加：
   ```env
   # Pexels API Configuration
   VITE_PEXELS_API=your_actual_api_key_here
   ```
   
   ⚠️ **重要**: 将 `your_actual_api_key_here` 替换为你从Pexels获得的实际API密钥
   
   **完整示例文件内容**:
   ```env
   # Pexels API Configuration
   # 复制这个内容到 .env.local 文件并填入你的实际API密钥
   VITE_PEXELS_API=your_pexels_api_key_here

   # 获取API密钥步骤：
   # 1. 访问 https://www.pexels.com/api/
   # 2. 点击 "Request API Key" 注册并申请
   # 3. 将获得的API密钥替换上面的 your_pexels_api_key_here
   # 4. 保存文件并重启开发服务器
   ```

3. **重启开发服务器**
   ```bash
   # 停止当前服务器 (Ctrl+C)
   # 然后重新启动
   cd My_Todos/ZhiNen_trip
   npm run dev
   ```

## 🎯 功能特性

### ✅ 已实现的功能

1. **智能轮播图**
   - 自动从Pexels获取高质量风景图片
   - 支持触摸滑动和自动播放
   - 智能错误处理和备用图片

2. **高级瀑布流布局**
   - 真正的瀑布流算法，自动计算最佳位置
   - 不同高度卡片自然排列
   - 图片加载完成后准确布局
   - 骨架屏加载效果
   - 无限滚动加载更多

3. **性能优化**
   - 图片懒加载
   - Promise-based布局系统
   - ResizeObserver响应式布局
   - API缓存机制
   - 防重复加载机制

### 🔧 技术特点

- **API服务模块**: 完整的Pexels API封装
- **瀑布流算法**: 自动计算最短列放置新项目
- **错误处理**: 优雅降级到备用图片
- **移动端优化**: 触摸手势和响应式布局

## 🚀 使用方法

1. **配置API密钥** (按上述步骤)
2. **启动开发服务器**:
   ```bash
   cd My_Todos/ZhiNen_trip
   npm run dev
   ```
3. **访问应用**: http://localhost:5173

## 📱 在Windows中启动项目

### 方法一：使用批处理文件 (推荐)
双击项目根目录下的 `start-dev.bat` 文件即可启动

### 方法二：PowerShell命令
如果遇到 `&&` 语法错误，使用以下命令：
```powershell
cd My_Todos\ZhiNen_trip
npm run dev
```

### 方法三：分步执行
```powershell
cd My_Todos\ZhiNen_trip
npm run dev
```

## 🎨 自定义配置

### 瀑布流参数
```jsx
<WaterfallLayout 
  columns={2}        // 列数
  gap={12}          // 间距
  itemMinWidth={150} // 最小项目宽度
  loadMore={true}   // 自动加载更多
/>
```

### 瀑布流组件特性

#### 🏗️ 布局算法
- **智能列选择**: 自动选择最短的列放置新卡片
- **精确高度计算**: 等待图片加载完成后计算真实高度
- **流畅动画**: 使用CSS3 Transform和Transition
- **响应式布局**: 支持屏幕尺寸变化自动重新布局

#### 🎭 用户体验
- **骨架屏**: 首次加载时显示漂亮的加载动画
- **懒加载**: 图片按需加载，提升性能
- **无限滚动**: 自动检测滚动位置加载更多
- **错误处理**: 图片加载失败时自动使用占位符

#### ⚡ 性能优化
- **Promise并发**: 并行处理多个布局计算
- **去重机制**: 自动过滤重复数据
- **内存管理**: 合理使用useRef避免不必要的重渲染
- **ResizeObserver**: 高效监听容器尺寸变化

### API请求参数
可以在 `src/services/pexelsApi.js` 中自定义：
- 图片数量 (per_page)
- 图片方向 (landscape/portrait/square)
- 搜索关键词分类
- 图片尺寸 (large/medium/small)
- 颜色筛选

## 🛠️ 故障排除

### 控制台警告说明

**"Pexels API密钥未配置，使用默认图片"**
- ✅ 这是正常提示，不是错误
- 🔧 解决方法：按照上述步骤配置API密钥即可

**"Encountered two children with the same key"**
- ✅ 已修复此React key重复警告
- 🔧 现在所有项目都有唯一的ID，不会再出现此问题

### API密钥问题
- 确保 `.env.local` 文件在正确位置
- 检查API密钥是否正确复制
- 重启开发服务器

### 图片加载问题
- 检查网络连接
- 查看控制台错误信息
- 会自动降级到备用图片

### 瀑布流显示问题
- 检查容器宽度
- 确保图片正确加载
- 查看CSS样式是否生效

### PowerShell语法错误
- 使用提供的 `start-dev.bat` 文件启动
- 或分步执行命令，不要使用 `&&` 操作符

## 📄 API使用条款

使用Pexels图片时会自动包含摄影师署名，符合Pexels使用条款。

---

🎉 **配置完成后，你将看到来自Pexels的高质量旅游图片！**