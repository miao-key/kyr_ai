import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // vite 工程化工具 node

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      // 别名
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // 代理Doubao API请求
        "/api/doubao": {
          target: "https://ark.cn-beijing.volces.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/doubao/, "/api/v3"),
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
  }
})
