import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base 設為 GitHub Pages 的 repo 子路徑 /vibe-statistics/，否則部署後資源 404。
// （見 design.md 部署與環境、log CHANGE-0001）
export default defineConfig({
  base: '/vibe-statistics/',
  plugins: [react()],
})
