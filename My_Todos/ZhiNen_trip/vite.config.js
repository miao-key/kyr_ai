import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // vite 工程化工具 node
import { visualizer } from 'rollup-plugin-visualizer'


// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      
      // 智能代码分割插件 - 暂时禁用以解决依赖解析问题
      // chunkSplitPlugin({
      //   strategy: 'split-by-experience',
      //   customSplitting: {
      //     'react-vendor': ['react', 'react-dom'],
      //     'router-vendor': ['react-router-dom'],
      //     'ui-vendor': ['react-vant', '@react-vant/icons'],
      //     'utils-vendor': ['axios', 'zustand'],
      //     'api-vendor': ['@api']
      //   }
      // }),
      
      // 构建分析插件（仅在分析模式或构建时启用）
      ...(mode === 'analyze' || (command === 'build' && process.env.ANALYZE) ? [
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap' // 可选: treemap, sunburst, network
        })
      ] : [])
    ],
    resolve: {
      // 别名
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@constants': path.resolve(__dirname, './src/constants'),
        '@api': path.resolve(__dirname, './src/api'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },
    server: {
      // 预热常用文件
      warmup: {
        clientFiles: [
          './src/App.jsx',
          './src/main.jsx',
          './src/components/**/*.jsx',
          './src/pages/**/*.jsx'
        ]
      },
      proxy: {
        // 代理Doubao API请求
        "/api/doubao": {
          target: "https://ark.cn-beijing.volces.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/doubao/, "/api"),
          configure: (proxy, options) => {
            proxy.on("proxyReq", (proxyReq, req, res) => {
              // 安全地添加API密钥到请求头
              const apiKey = env.VITE_DOUBAO_IMAGE_API_KEY;
              
              if (apiKey && apiKey.trim() !== '') {
                proxyReq.setHeader("Authorization", `Bearer ${apiKey}`);
                console.log('✅ 代理请求已添加Authorization头，图像生成模型: ep-20250804182253-ckvjk');
                console.log('🔗 目标URL:', req.url);
                console.log('📊 请求方法:', req.method);
              } else {
                console.error('❌ 未找到VITE_DOUBAO_IMAGE_API_KEY环境变量或为空');
                console.error('请在.env.local文件中设置: VITE_DOUBAO_IMAGE_API_KEY=your-api-key');
              }
            });
          },
        },
        // 代理Coze API请求
        '/api/coze': {
          target: 'https://api.coze.cn',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            // 根据不同的路径使用不同的重写规则
            if (path.includes('/api/coze/workflow')) {
              return path.replace(/^\/api\/coze\/workflow/, '/v1/workflow');
            } else {
              return path.replace(/^\/api\/coze/, '/api/v1');
            }
          },
          headers: {
            'Origin': 'https://api.coze.cn',
            'Referer': 'https://api.coze.cn/'
          },
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('❌ Coze代理错误:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // 安全地添加PAT Token到请求头
              const patToken = env.VITE_PAT_TOKEN;
              
              if (patToken && patToken.trim() !== '') {
                proxyReq.setHeader('Authorization', `Bearer ${patToken}`);
                console.log('✅ Coze代理请求已添加Authorization头');
                console.log('🔗 目标URL:', req.url);
                console.log('📊 请求方法:', req.method);
              } else {
                console.error('❌ 未找到VITE_PAT_TOKEN环境变量或为空');
                console.error('请在.env.local文件中设置: VITE_PAT_TOKEN=your-pat-token');
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('📥 Coze代理响应:', req.url, proxyRes.statusCode);
            });
          }
        },
      },
    },

    // 构建优化配置
    build: {
      // 目标浏览器
      target: 'es2015',
      
      // 启用 CSS 代码分割
      cssCodeSplit: true,
      
      // 构建后的文件大小报告
      reportCompressedSize: true,
      
      // 块大小警告限制 (KB)
      chunkSizeWarningLimit: 1000,
      
      // Rollup 配置
      rollupOptions: {
        output: {
          // 手动配置代码分割
          manualChunks(id) {
            // 将 node_modules 中的包分割到 vendor chunk
            if (id.includes('node_modules')) {
              // React 相关
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor'
              }
              
              // 路由相关
              if (id.includes('react-router')) {
                return 'router-vendor'
              }
              
              // UI 库
              if (id.includes('react-vant') || id.includes('@react-vant')) {
                return 'ui-vendor'
              }
              
              // 工具库
              if (id.includes('axios') || id.includes('zustand')) {
                return 'utils-vendor'
              }
              
              // 其他第三方库
              return 'vendor'
            }
          },
          
          // 文件命名规则
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk'
            return `js/[name]-[hash].js`
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name.split('.').pop()
            
            // 根据文件类型分类存放
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `images/[name]-[hash].[ext]`
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `fonts/[name]-[hash].[ext]`
            }
            return `assets/[name]-[hash].[ext]`
          }
        }
      },
      
      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          // 生产环境移除 console 和 debugger
          drop_console: command === 'build',
          drop_debugger: command === 'build',
          // 移除未使用的代码
          pure_funcs: command === 'build' ? ['console.log', 'console.info'] : []
        },
        mangle: {
          // 混淆变量名
          safari10: true
        }
      }
    },

    // 预构建优化
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-vant',
        '@react-vant/icons',
        'axios',
        'zustand'
      ],
      exclude: ['@api'] // 排除我们的API模块，让它保持动态导入
    },



    // 开发环境性能优化
    esbuild: {
      // 开发环境保留 console，生产环境移除
      drop: command === 'build' ? ['console', 'debugger'] : []
    }
  }
})
