import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { Plugin as CdnImportPlugin } from 'vite-plugin-cdn-import';
// 自定义插件：自动添加 CSS 预加载标签
function htmlInjectPlugin() {
    return {
        name: 'html-inject-plugin',
        closeBundle: function () {
            var htmlPath = resolve(__dirname, 'dist/index.html');
            // 读取生成的 HTML 文件
            var html = readFileSync(htmlPath, 'utf-8');
            // 获取入口 CSS 文件路径
            var cssMatch = html.match(/href="(\/assets\/css\/index-[^"]+\.css)"/);
            var cssFile = cssMatch ? cssMatch[1] : null;
            if (cssFile) {
                // 移除重复的样式表链接（Vite 自动添加的）
                var duplicateStyleRegex = new RegExp("<link rel=\"stylesheet\"[^>]*href=\"".concat(cssFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "\"[^>]*>"), 'g');
                html = html.replace(duplicateStyleRegex, '');
                // 替换 CSS 预加载占位符
                html = html.replace(/<!--\s*PRELOAD_CSS\s*-->/g, "<link rel=\"preload\" href=\"".concat(cssFile, "\" as=\"style\" onload=\"this.onload=null;this.rel='stylesheet'\">\n    <noscript><link rel=\"stylesheet\" href=\"").concat(cssFile, "\"></noscript>"));
            }
            // 写回文件
            writeFileSync(htmlPath, html);
        }
    };
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
            '/api': {
                target: 'http://192.168.10.6:3001',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ''); }
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
                assetFileNames: function (assetInfo) {
                    var _a;
                    var info = ((_a = assetInfo.name) === null || _a === void 0 ? void 0 : _a.split('.')) || [];
                    var ext = info[info.length - 1];
                    // CSS 强制输出到 css 目录
                    if (assetInfo.type === 'asset' && /\.css$/.test(assetInfo.name || '')) {
                        return "assets/css/[name]-[hash][extname]";
                    }
                    if (/\.(png|jpe?g|svg|webp|gif|avif)$/.test(assetInfo.name || '')) {
                        return "assets/images/[name]-[hash][extname]";
                    }
                    if (/\.woff2?$/.test(ext) || /\.ttf$/.test(ext) || /\.eot$/.test(ext)) {
                        return "assets/fonts/[name]-[hash][extname]";
                    }
                    return "assets/js/[name]-[hash][extname]";
                },
                // JS 文件名
                entryFileNames: 'assets/js/[name]-[hash].js',
                // 代码分割配置
                // manualChunks: {
                //   // Vue 核心库
                //   'vue-vendor': ['vue', 'vue-router', 'pinia']
                // },
                // 分隔符
                chunkFileNames: 'assets/js/[name]-[hash].js'
            },
            external: ['vue', 'vue-router', 'pinia']
        },
        // 报告写入大小
        reportCompressedSize: true
    }
});
