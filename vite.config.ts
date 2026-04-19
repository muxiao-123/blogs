import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { Plugin as CdnImportPlugin } from 'vite-plugin-cdn-import'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
// 自定义插件：自动添加 CSS 预加载标签
function htmlInjectPlugin(): PluginOption {
  return {
    name: 'html-inject-plugin',
    closeBundle() {
      const htmlPath = resolve(__dirname, 'dist/index.html')

      // 读取生成的 HTML 文件
      let html = readFileSync(htmlPath, 'utf-8')

      // 获取入口 CSS 文件路径
      const cssMatch = html.match(/href="(\/assets\/css\/index-[^"]+\.css)"/)
      const cssFile = cssMatch ? cssMatch[1] : null

      if (cssFile) {
        // 移除重复的样式表链接（Vite 自动添加的）
        const duplicateStyleRegex = new RegExp(
          `<link rel="stylesheet"[^>]*href="${cssFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`,
          'g'
        )
        html = html.replace(duplicateStyleRegex, '')

        // 替换 CSS 预加载占位符
        html = html.replace(
          /<!--\s*PRELOAD_CSS\s*-->/g,
          `<link rel="preload" href="${cssFile}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${cssFile}"></noscript>`
        )
      }

      // 写回文件
      writeFileSync(htmlPath, html)
    }
  }
}
export default defineConfig({
  plugins: [
    vue(),
    CdnImportPlugin({
      modules: [
        {
          name: 'vue',
          var: 'Vue',
          path: 'http://119.91.22.42:8081/cdn/vue.global.prod.js'
        },
        {
          name: 'vue-router',
          var: 'VueRouter',
          path: 'http://119.91.22.42:8081/cdn/vue-router.global.prod.js'
        },
        {
          name: 'pinia',
          var: 'Pinia',
          path: 'http://119.91.22.42:8081/cdn/pinia.iife.prod.js'
        }
      ]
    }),
    htmlInjectPlugin(),
    // 打包分析插件（仅在 build 时启用）
    visualizer({
      filename: './stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    }) as PluginOption,
    // Gzip 压缩插件
    viteCompression({
      algorithm: 'gzip',
      threshold: 10240, // 仅压缩大于 10KB 的文件
      ext: '.gz'
    })
    // // Brotli 压缩插件
    // viteCompression({
    //   algorithm: 'brotliCompress',
    //   threshold: 10240,
    //   ext: '.br'
    // })
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: true
    },
    proxy: {
      // '/api': {
      //   target: 'http://192.168.10.6:3001',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // },
      '/api': {
        target: 'http://192.168.10.3:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  // 预构建优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia']
  },
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生成 sourcemap 方便调试
    sourcemap: false,
    // 目标浏览器
    target: 'es2015',
    // 最小化（使用 esbuild，更快）
    minify: 'esbuild',
    // 资源内联阈值
    assetsInlineLimit: 4096,
    // 滚动代码分割
    rollupOptions: {
      output: {
        // 产物按类别分类
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          // CSS 强制输出到 css 目录
          if (assetInfo.type === 'asset' && /\.css$/.test(assetInfo.name || '')) {
            return `assets/css/[name]-[hash][extname]`
          }
          if (/\.(png|jpe?g|svg|webp|gif|avif)$/.test(assetInfo.name || '')) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/\.woff2?$/.test(ext) || /\.ttf$/.test(ext) || /\.eot$/.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          return `assets/js/[name]-[hash][extname]`
        },
        // JS 文件名
        entryFileNames: 'assets/js/[name]-[hash].js',
        // 代码分割配置
        manualChunks(id) {
          // Vue 核心库
          if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) {
            return 'vue-core'
          }
          // Vue Router
          if (id.includes('node_modules/vue-router')) {
            return 'vue-router'
          }
          // Pinia
          if (id.includes('node_modules/pinia')) {
            return 'pinia'
          }
          // Tiptap 整体打包（包括 prosemirror、tiptap-markdown 及所有扩展）
          // 避免循环依赖，将它们合并为一个 chunk
          if (
            id.includes('node_modules/@tiptap') ||
            id.includes('node_modules/tiptap') ||
            id.includes('node_modules/prosemirror') ||
            id.includes('tiptap-markdown')
          ) {
            return 'tiptap'
          }
          // highlight.js 代码高亮
          if (id.includes('node_modules/highlight.js') || id.includes('node_modules/lowlight')) {
            return 'highlight'
          }
          // marked 和 dompurify
          if (id.includes('node_modules/marked') || id.includes('node_modules/dompurify')) {
            return 'markdown'
          }
        },
        // 分隔符
        chunkFileNames: 'assets/js/[name]-[hash].js'
      },
      external: ['vue', 'vue-router', 'pinia']
    },
    // 报告写入大小
    reportCompressedSize: true
  }
})
