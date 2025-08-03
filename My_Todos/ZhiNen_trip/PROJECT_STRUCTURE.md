# 🏗️ 项目结构优化说明

## 📁 优化后的目录结构

```
src/
├── components/           # 组件目录
│   ├── UI/              # 通用UI组件库
│   │   ├── LoadingSpinner/   # 加载组件
│   │   ├── LazyImage/        # 懒加载图片组件
│   │   ├── EmptyState/       # 空状态组件
│   │   └── index.js         # UI组件统一导出
│   ├── MainLayout/      # 主布局组件
│   ├── WaterfallLayout/ # 瀑布流组件
│   └── index.js         # 所有组件统一导出
├── hooks/               # 自定义钩子
│   ├── useDebounce.js   # 防抖钩子
│   ├── useThrottle.js   # 节流钩子
│   ├── useTitle.js      # 标题钩子
│   └── index.js         # 钩子统一导出
├── constants/           # 常量配置
│   └── index.js         # 应用常量
├── utils/               # 工具函数
│   └── index.js         # 工具函数库
├── services/            # API服务
│   └── pexelsApi.js     # Pexels API
├── pages/               # 页面组件
└── assets/              # 静态资源
```

## 🎯 优化内容

### 1. **UI组件库** 
- ✅ `LoadingSpinner` - 通用加载组件，支持多种类型和尺寸
- ✅ `LazyImage` - 懒加载图片组件，支持超时、错误处理、占位图
- ✅ `EmptyState` - 空状态组件，支持多种场景（无数据、网络错误等）

### 2. **常量管理**
- ✅ 导航菜单配置 `NAVIGATION_TABS`
- ✅ 瀑布流配置 `WATERFALL_CONFIG`
- ✅ 图片配置 `IMAGE_CONFIG`
- ✅ API配置 `API_CONFIG`
- ✅ 主题配置 `THEME_CONFIG`
- ✅ 错误消息 `ERROR_MESSAGES`

### 3. **Hooks优化**
- ✅ 统一导出所有自定义钩子
- ✅ 功能分类：性能优化类、工具类
- ✅ 提供类型定义和使用说明

### 4. **工具函数库**
- ✅ 通用防抖/节流函数
- ✅ 价格格式化工具
- ✅ 文本截断工具
- ✅ 本地存储工具
- ✅ 图片处理工具
- ✅ URL处理工具
- ✅ 设备检测工具

### 5. **组件优化**
- ✅ `MainLayout` - 使用新的常量配置
- ✅ `WaterfallLayout` - 集成新的UI组件和常量
- ✅ `App.jsx` - 使用新的LoadingSpinner组件

## 🚀 使用示例

### 导入组件
```javascript
// 导入UI组件
import { LoadingSpinner, LazyImage, EmptyState } from '@/components/UI'

// 导入所有组件
import { MainLayout, WaterfallLayout } from '@/components'

// 导入钩子
import { useDebounce, useThrottle } from '@/hooks'

// 导入常量
import { WATERFALL_CONFIG, THEME_CONFIG } from '@/constants'

// 导入工具
import { formatPrice, truncateText, storage } from '@/utils'
```

### 使用UI组件
```javascript
// 加载组件
<LoadingSpinner 
  type="ball" 
  size="medium"
  text="正在加载..."
  fullScreen={true}
/>

// 懒加载图片
<LazyImage
  src={imageUrl}
  alt="图片描述"
  placeholder="/placeholder.jpg"
  timeout={10000}
  onLoad={() => console.log('图片加载完成')}
  onError={(error) => console.log('图片加载失败', error)}
/>

// 空状态
<EmptyState 
  type="noData"
  title="暂无数据"
  description="当前没有内容"
  actionText="重新加载"
  onAction={() => window.location.reload()}
/>
```

## 📈 性能优化

1. **图片懒加载** - 只加载可视区域内的图片
2. **组件懒加载** - 路由级别的代码分割
3. **防抖节流** - 优化高频事件处理
4. **常量提取** - 减少重复代码和硬编码
5. **组件复用** - 提高开发效率和一致性

## 🔧 开发建议

1. **新增功能** - 优先使用已有的UI组件和工具函数
2. **样式统一** - 使用constants中的主题配置
3. **错误处理** - 使用EmptyState组件处理各种异常状态
4. **性能优化** - 使用LazyImage替代普通img标签
5. **代码复用** - 将通用逻辑提取到utils中

## 🎨 样式规范

- 使用CSS Modules避免样式冲突
- 遵循BEM命名规范（转换为camelCase）
- 响应式设计，支持移动端适配
- 统一的颜色和动画配置

## 🧪 测试建议

- 测试各UI组件在不同状态下的表现
- 验证图片懒加载和错误处理
- 检查响应式布局在不同设备上的效果
- 确保所有导入路径正确无误