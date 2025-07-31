import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteMockServe } from "vite-plugin-mock";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteMockServe({
      mockPath: "mock",
      localEnabled: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
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
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from:', req.url, proxyRes.statusCode);
          });
        }
      },
    },
  },
});