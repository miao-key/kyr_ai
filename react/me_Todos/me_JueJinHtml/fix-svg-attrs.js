/**
 * 该脚本用于自动修复React组件中的SVG属性
 * 将连字符式命名(kebab-case)的属性转换为驼峰式命名(camelCase)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 需要替换的属性映射
const attrMap = {
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'text-anchor': 'textAnchor',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
};

// 递归搜索目录
async function walkDir(dir) {
  try {
    const files = await fs.promises.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.promises.stat(filePath);
      
      if (stats.isDirectory()) {
        await walkDir(filePath);
      } else if (stats.isFile() && /\.(jsx|tsx)$/.test(file)) {
        await fixSvgAttributes(filePath);
      }
    }
  } catch (err) {
    console.error(`读取目录失败: ${dir}`, err);
  }
}

// 修复文件中的SVG属性
async function fixSvgAttributes(filePath) {
  console.log(`正在检查文件: ${filePath}`);
  
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    
    let modified = false;
    let newContent = data;
    
    // 替换所有需要转换的属性
    Object.entries(attrMap).forEach(([kebab, camel]) => {
      if (data.includes(kebab)) {
        const regex = new RegExp(kebab, 'g');
        newContent = newContent.replace(regex, camel);
        modified = true;
        console.log(`  修复: ${kebab} -> ${camel}`);
      }
    });
    
    // 如果有修改，保存文件
    if (modified) {
      await fs.promises.writeFile(filePath, newContent, 'utf8');
      console.log(`  已保存更新到: ${filePath}`);
    }
  } catch (err) {
    console.error(`处理文件失败: ${filePath}`, err);
  }
}

// 主函数
async function main() {
  const srcDir = path.join(__dirname, 'src');
  await walkDir(srcDir);
  console.log('处理完成');
}

main().catch(err => {
  console.error('发生错误:', err);
});