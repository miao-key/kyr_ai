# 🚀 用Cursor AI开发Chrome扩展，让网页秒变绿巨人！

> 摘要：本文记录了使用Cursor AI开发Chrome扩展的全过程。通过一个简单的"网页变绿"功能，展示了如何利用AI辅助工具快速实现Chrome扩展开发。从需求分析、环境搭建到代码实现，完整呈现了开发流程，适合编程新手参考学习。

> 作者：AI开发小白
> 
> 本文记录了使用Cursor AI开发一个简单Chrome扩展的全过程，从需求分析到最终实现，带你体验AI辅助编程的魅力！

## 🌈 前言

作为一名AI开发小白，我一直想开发一个Chrome扩展，但苦于没有经验。直到遇见了Cursor AI，它就像我的编程导师，让我轻松实现了这个梦想！今天，我要分享的是开发一个名为"Hulk"的Chrome扩展，它能让任何网页瞬间变成绿色，就像绿巨人一样充满力量！

## 🎯 需求分析

首先，让我们看看这个扩展需要实现什么功能：

1. 点击扩展图标，弹出一个小窗口
2. 窗口中显示操作提示和按钮
3. 点击按钮后，当前网页背景变成绿色

![需求分析](word/1.png)

## 🛠️ 开发环境准备

在开始之前，我们需要准备以下文件结构：

```
hulk/
  ├── manifest.json
  ├── popup.html
  ├── popup.js
  ├── content.js
  └── icons/
      ├── icon16.png
      ├── icon48.png
      └── icon128.png
```

![项目结构](word/2.png)

## 📝 开始编码

### 1. 创建 manifest.json

首先，我们需要创建扩展的配置文件。在Cursor中，我向AI描述了需求：

![创建manifest](word/3.png)

AI很快就生成了符合Chrome扩展最新标准（Manifest V3）的配置文件：

```json
{
  "manifest_version": 3,
  "name": "Hulk",
  "version": "1.0",
  "description": "一个简单的Chrome扩展，可以改变网页背景颜色",
  ...
}
```

### 2. 设计弹出窗口

接下来，我们需要设计一个美观的弹出窗口。在Cursor中，我让AI帮我生成HTML和CSS：

![设计弹出窗口](word/4.png)

AI生成的代码不仅包含了基本的HTML结构，还添加了美观的样式：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 300px;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    button {
      background-color: #4CAF50;
      ...
    }
  </style>
</head>
...
</html>
```

### 3. 实现交互逻辑

现在，我们需要实现按钮点击后的交互逻辑。在Cursor中，我让AI帮我编写JavaScript代码：

![实现交互逻辑](word/5.png)

AI生成的代码使用了最新的Chrome扩展API：

```javascript
document.getElementById('changeColor').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  ...
});
```

### 4. 添加内容脚本

为了让扩展能够修改网页背景，我们需要添加内容脚本：

![添加内容脚本](word/6.png)

## 🎨 美化界面

为了让扩展看起来更专业，我们添加了一些图标和样式：

![美化界面](word/7.png)

## 🧪 测试扩展

现在，让我们来测试这个扩展：

1. 打开Chrome扩展管理页面
2. 开启开发者模式
3. 加载已解压的扩展程序
4. 点击扩展图标，测试功能

![测试扩展](word/8.png)

## 🎉 效果展示

让我们看看最终效果：

![效果展示1](word/9.png)
![效果展示2](word/10.png)
![效果展示3](word/11.png)

## 💡 开发心得

通过这次开发，我学到了：

1. Chrome扩展的基本结构
2. Manifest V3的新特性
3. 如何使用Cursor AI辅助编程

![开发心得](word/12.png)

## 📚 参考资料

- [Chrome扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Cursor AI 使用指南](https://cursor.sh/)

![参考资料](word/13.png)

## 🌟 结语

感谢Cursor AI的帮助，让我这个编程小白也能开发出实用的Chrome扩展！如果你也想尝试开发Chrome扩展，不妨试试Cursor AI，它会是你最好的编程助手！

> 本文首发于掘金，转载请注明出处。 