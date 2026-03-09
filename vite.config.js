import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 仓库名，用于 GitHub Pages 的 base 路径
const REPO_NAME = 'trpg-achievement-forge'

export default defineConfig({
  plugins: [vue()],
  // 生产环境使用 /仓库名/，本地开发使用 /
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
})
