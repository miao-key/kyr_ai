/**
 * 路径迁移工具 - 用于更新导入路径
 * 此工具可以帮助自动化更新项目中的导入路径
 */

// 路径映射规则
export const PATH_MAPPINGS = {
  // 组件路径映射
  '@/components/MainLayout': '@components/Layout/MainLayout',
  '@/components/WaterfallLayout': '@components/Layout/WaterfallLayout', 
  '@/components/ProtectedRoute': '@components/Business/ProtectedRoute',
  '@/components/UI': '@components/UI',
  '@/components/UI/LoadingSpinner': '@components/UI/LoadingSpinner',
  '@/components/UI/LazyImage': '@components/UI/LazyImage',
  '@/components/UI/EmptyState': '@components/UI/EmptyState',
  
  // 页面路径映射
  '@/pages': '@pages',
  
  // 上下文路径映射
  '@/contexts': '@contexts',
  
  // 常量路径映射
  '@/constants': '@constants',
  
  // API路径映射
  '@/api': '@api',
  
  // 工具路径映射
  '@/utils': '@utils',
  
  // 钩子路径映射
  '@/hooks': '@hooks',
  
  // 样式路径映射
  '@/styles': '@styles'
}

// 需要更新的文件类型
export const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue']

// 导入语句匹配正则
export const IMPORT_REGEX = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g

/**
 * 更新单个文件中的导入路径
 * @param {string} content - 文件内容
 * @param {Object} mappings - 路径映射规则
 * @returns {Object} - 更新结果 { content, changed, changes }
 */
export function updateImportsInContent(content, mappings = PATH_MAPPINGS) {
  let updatedContent = content
  let changed = false
  const changes = []

  // 遍历所有路径映射规则
  Object.entries(mappings).forEach(([oldPath, newPath]) => {
    const regex = new RegExp(`(['"])(${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\1`, 'g')
    
    const matches = [...content.matchAll(regex)]
    if (matches.length > 0) {
      updatedContent = updatedContent.replace(regex, `$1${newPath}$1`)
      changed = true
      changes.push({
        from: oldPath,
        to: newPath,
        count: matches.length
      })
    }
  })

  return {
    content: updatedContent,
    changed,
    changes
  }
}

/**
 * 检查文件是否需要更新导入路径
 * @param {string} content - 文件内容
 * @param {Object} mappings - 路径映射规则
 * @returns {Array} - 需要更新的导入列表
 */
export function checkImportsInContent(content, mappings = PATH_MAPPINGS) {
  const issues = []
  
  Object.keys(mappings).forEach(oldPath => {
    const regex = new RegExp(`(['"])(${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\1`, 'g')
    const matches = [...content.matchAll(regex)]
    
    if (matches.length > 0) {
      issues.push({
        oldPath,
        newPath: mappings[oldPath],
        occurrences: matches.length,
        lines: matches.map((match, index) => {
          const beforeMatch = content.substring(0, match.index)
          const lineNumber = beforeMatch.split('\n').length
          return lineNumber
        })
      })
    }
  })
  
  return issues
}

/**
 * 生成迁移报告
 * @param {Array} files - 文件列表
 * @param {Function} readFile - 读取文件函数
 * @returns {Object} - 迁移报告
 */
export async function generateMigrationReport(files, readFile) {
  const report = {
    totalFiles: files.length,
    filesToUpdate: 0,
    totalChanges: 0,
    fileReports: []
  }

  for (const file of files) {
    try {
      const content = await readFile(file)
      const issues = checkImportsInContent(content)
      
      if (issues.length > 0) {
        report.filesToUpdate++
        report.totalChanges += issues.reduce((sum, issue) => sum + issue.occurrences, 0)
        
        report.fileReports.push({
          file,
          issues,
          totalIssues: issues.length
        })
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error)
    }
  }

  return report
}

/**
 * 验证新路径是否有效
 * @param {string} path - 路径
 * @param {Function} pathExists - 路径存在检查函数
 * @returns {boolean} - 路径是否有效
 */
export async function validatePath(path, pathExists) {
  try {
    // 移除别名前缀并转换为实际路径
    const actualPath = path
      .replace('@components/', './components/')
      .replace('@pages/', './pages/')
      .replace('@contexts/', './contexts/')
      .replace('@constants/', './constants/')
      .replace('@api/', './api/')
      .replace('@utils/', './utils/')
      .replace('@hooks/', './hooks/')
      .replace('@styles/', './styles/')
    
    return await pathExists(actualPath)
  } catch {
    return false
  }
}

// 使用示例
export const USAGE_EXAMPLES = {
  // 检查单个文件
  checkFile: `
    import { checkImportsInContent } from './pathMigration.js'
    
    const content = await readFile('src/App.jsx')
    const issues = checkImportsInContent(content)
    console.log('Found issues:', issues)
  `,
  
  // 更新单个文件
  updateFile: `
    import { updateImportsInContent } from './pathMigration.js'
    
    const content = await readFile('src/App.jsx')
    const result = updateImportsInContent(content)
    
    if (result.changed) {
      await writeFile('src/App.jsx', result.content)
      console.log('Updated:', result.changes)
    }
  `,
  
  // 生成迁移报告
  generateReport: `
    import { generateMigrationReport } from './pathMigration.js'
    
    const files = ['src/App.jsx', 'src/components/Header.jsx']
    const report = await generateMigrationReport(files, readFile)
    console.log('Migration report:', report)
  `
}