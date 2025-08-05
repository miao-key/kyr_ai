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
      },
    },
  }
})
