import { defineConfig } from 'vite';
import { resolve } from 'path';
export default defineConfig({
    build: {
        // 目标为 Node.js 环境
        target: 'node18',
        // 打包为单个文件
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['cjs'],
            fileName: function () { return 'index.js'; }
        },
        // 输出目录
        outDir: 'dist',
        // 压缩配置
        minify: false,
        sourcemap: true,
        // Rollup 配置
        rollupOptions: {
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
                // 导出格式
                exports: 'named',
                // 格式化
                format: 'cjs',
                // 入口文件名称
                entryFileNames: 'index.js',
                // chunk 文件名称
                chunkFileNames: '[name].js',
                // 资产文件名称
                assetFileNames: '[name].[ext]'
            }
        },
        // 报告写入大小
        reportCompressedSize: false,
        // 清空输出目录
        emptyOutDir: true
    },
    // TypeScript 配置
    tsconfig: './tsconfig.json'
});
