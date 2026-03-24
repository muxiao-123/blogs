import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    // 目标为 Node.js 环境
    target: 'node18',
    // 输出目录
    outDir: 'dist',
    // 入口文件
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.ts')
      },
      external: [
        'express',
        'cors',
        'mongodb',
        'multer',
        'uuid',
        'md5-file',
        'fs',
        'path',
        'url',
        'crypto',
        'http',
        'https',
        'net',
        'tls',
        'zlib',
        'stream',
        'util',
        'os',
        'events',
        'buffer'
      ],
      output: {
        // 格式化
        format: 'cjs',
        // 入口文件名称
        entryFileNames: 'index.js',
        // chunk 文件名称
        chunkFileNames: '[name].js'
      }
    },
    // 压缩配置
    minify: false,
    sourcemap: false,
    // 报告写入大小
    reportCompressedSize: false,
    // 清空输出目录
    emptyOutDir: true
  },
  // TypeScript 配置
  tsconfig: './tsconfig.json'
})
