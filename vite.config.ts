import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/connectwise': {
        target: 'https://api-na.myconnectwise.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/connectwise/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to ConnectWise:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from ConnectWise:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})

