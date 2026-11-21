import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

// テストではルーター生成や devtools のプラグインは不要なので、vite.config.ts とは分ける
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
