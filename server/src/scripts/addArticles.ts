import { MongoClient } from 'mongodb'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'lumina-blog'

const newArticles = [
  // Vue 文章
  {
    id: '38',
    title: 'Vue 3 组合式 API 完全指南',
    excerpt: '深入探索 Vue 3 组合式 API，掌握现代 Vue 开发的最佳实践。',
    content: `
# Vue 3 组合式 API 完全指南

## 为什么需要组合式 API？

Vue 3 引入的组合式 API（Composition API）是对选项式 API 的重大升级。它解决了长期困扰开发者的代码组织问题，让相关逻辑更加集中，代码复用更加便捷。

## 核心 API

### ref 和 reactive

\`ref\` 用于创建基本类型的响应式数据：

\`\`\`typescript
import { ref } from 'vue'

const count = ref(0)
count.value++ // 访问值需要 .value
\`\`\`

\`reactive\` 用于创建对象类型的响应式数据：

\`\`\`typescript
import { reactive } from 'vue'

const state = reactive({
  name: 'Lumina',
  age: 25
})
\`\`\`

### computed 和 watch

计算属性自动缓存依赖变化：

\`\`\`typescript
const doubled = computed(() => count.value * 2)
\`\`\`

监听器处理副作用：

\`\`\`typescript
watch(count, (newVal, oldVal) => {
  console.log(\`\${oldVal} -> \${newVal}\`)
})
\`\`\`

### 生命周期钩子

组合式 API 中的生命周期钩子：

\`\`\`typescript
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  console.log('组件挂载完成')
})

onUnmounted(() => {
  console.log('组件卸载')
})
\`\`\`

## 组件复用

组合式 API 最大的优势之一是逻辑复用。通过抽取为组合函数：

\`\`\`typescript
// useMouse.ts
export function useMouse() {
  const x = ref(0)
  const y = ref(0)
  
  function update(e: MouseEvent) {
    x.value = e.pageX
    y.value = e.pageY
  }
  
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))
  
  return { x, y }
}
\`\`\`

## 最佳实践

1. **按逻辑组织代码** - 将相关功能放在一起
2. **使用组合函数** - 抽取复用逻辑
3. **保持简洁** - 避免过度抽象
4. **类型安全** - 充分利用 TypeScript

组合式 API 是 Vue 开发的未来，值得深入学习。
    `,
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=85',
    category: 'frontend',
    tags: ['Vue', 'JavaScript', '前端', '组合式API'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-03-26',
    readTime: 8,
    views: 0,
    likes: 0,
    isLiked: false,
    comments: []
  },
  // TypeScript 文章
  {
    id: '39',
    title: 'TypeScript 进阶：类型系统完全掌握',
    excerpt: '深入理解 TypeScript 类型系统，提升代码类型安全与开发效率。',
    content: `
# TypeScript 进阶：类型系统完全掌握

## TypeScript 的价值

TypeScript 是 JavaScript 的超集，通过静态类型检查大幅提升代码质量。它在编译时捕获潜在错误，提供完善的类型推断和智能提示。

## 基础类型

\`\`\`typescript
// 基本类型
let name: string = 'Lumina'
let age: number = 25
let isDeveloper: boolean = true

// 数组
let tags: string[] = ['Vue', 'TypeScript']
let numbers: Array<number> = [1, 2, 3]

// 元组
let position: [number, number] = [10, 20]

// 枚举
enum Color { Red, Green, Blue }
\`\`\`

## 高级类型

### 联合类型与交叉类型

\`\`\`typescript
// 联合类型 - 多种可能
let result: string | number
result = 'success'
result = 200

// 交叉类型 - 合并类型
type Person = { name: string }
type Worker = { company: string }
type Employee = Person & Worker
\`\`\`

### 接口与类型别名

\`\`\`typescript
interface User {
  id: number
  name: string
  email?: string // 可选属性
  readonly createdAt: Date // 只读属性
}

type ID = string | number
\`\`\`

### 泛型

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg
}

// 约束泛型
interface Lengthwise {
  length: number
}

function logLength<T extends Lengthwise>(arg: T): void {
  console.log(arg.length)
}
\`\`\`

## 实用技巧

### 类型守卫

\`\`\`typescript
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase()
  }
  return value.toFixed(2)
}
\`\`\`

### 映射类型

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}
\`\`\`

### 条件类型

\`\`\`typescript
type NonNullable<T> = T extends null | undefined ? never : T
\`\`\`

## 最佳实践

1. **启用严格模式** - 提升类型安全
2. **避免 any** - 使用 unknown 替代
3. **充分利用推断** - 减少冗余类型标注
4. **类型分层** - API 使用接口，内部用类型

掌握 TypeScript 类型系统，是成为专业前端工程师的必经之路。
    `,
    cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=85',
    category: 'frontend',
    tags: ['TypeScript', 'JavaScript', '前端', '类型系统'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-03-26',
    readTime: 8,
    views: 0,
    likes: 0,
    isLiked: false,
    comments: []
  },
  // Node 文章
  {
    id: '40',
    title: 'Node.js 性能优化实战',
    excerpt: '从架构到细节，全面提升 Node.js 应用性能的实用指南。',
    content: `
# Node.js 性能优化实战

## 为什么关注性能？

Node.js 以非阻塞 I/O 著称，但不当的使用方式会导致性能瓶颈。优化 Node.js 应用能显著提升用户体验和资源利用率。

## 事件循环优化

### 理解事件循环

Node.js 基于 V8 引擎的事件循环机制：

1. **Timers** - 执行 setTimeout/setInterval
2. **Pending callbacks** - 执行延迟的 I/O 回调
3. **Idle, prepare** - 内部使用
4. **Poll** - 获取新的 I/O 事件
5. **Check** - 执行 setImmediate
6. **Close callbacks** - 关闭的回调

### 避免阻塞事件循环

\`\`\`typescript
// 不好 - 同步阻塞
const data = fs.readFileSync('./large-file.txt')

// 好 - 异步非阻塞
const data = await fs.promises.readFile('./large-file.txt')

// 对于 CPU 密集型任务，使用 Worker Threads
import { Worker } = require('worker_threads')
\`\`\`

## 内存管理

### 内存泄漏检测

\`\`\`typescript
// 使用 --inspect 启动，通过 Chrome DevTools 分析
// 或使用 clinic.js 工具

const used = process.memoryUsage()
console.log(\`Heap Used: \${Math.round(used.heapUsed / 1024 / 1024)}MB\`)
\`\`\`

### 常见内存泄漏

1. **全局变量** - 意外创建
2. **闭包** - 引用大量数据
3. **事件监听器** - 未移除
4. **缓存** - 无限制增长

\`\`\`typescript
// 解决方案：使用 WeakMap/WeakSet
const cache = new WeakMap()
\`\`\`

## 异步最佳实践

### 并行与串行

\`\`\`typescript
// 并行 - 独立任务
const [users, posts] = await Promise.all([
  getUsers(),
  getPosts()
])

// 串行 - 依赖任务
const user = await getUser(id)
const orders = await getOrders(user.id)
\`\`\`

### 错误处理

\`\`\`typescript
// 使用 try-catch
try {
  await riskyOperation()
} catch (error) {
  console.error(error)
  // 记录日志，上报监控
}

// 全局未捕获异常
process.on('uncaughtException', (err) => {
  // 优雅退出
  process.exit(1)
})
\`\`\`

## 连接池与缓存

### 数据库连接池

\`\`\`typescript
import mongoose from 'mongoose'

mongoose.connect(uri, {
  poolSize: 10, // 连接池大小
  maxPoolSize: 50
})
\`\`\`

### 使用 Redis 缓存

\`\`\`typescript
const cache = new Redis()

async function getData(key) {
  const cached = await cache.get(key)
  if (cached) return JSON.parse(cached)
  
  const data = await fetchData()
  await cache.setex(key, 3600, JSON.stringify(data))
  return data
}
\`\`\`

## 监控与调试

使用 APM 工具持续监控：
- 响应时间
- 错误率
- 吞吐量
- 资源使用

性能优化是持续的过程，需要不断分析、改进。
    `,
    cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=85',
    category: 'backend',
    tags: ['Node.js', '后端', '性能', 'JavaScript'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-03-26',
    readTime: 8,
    views: 0,
    likes: 0,
    isLiked: false,
    comments: []
  },
  // Vite 文章
  {
    id: '41',
    title: 'Vite 5 完全指南：下一代构建工具',
    excerpt: '探索 Vite 的极速开发体验与强大功能，打造现代前端项目。',
    content: `
# Vite 5 完全指南：下一代构建工具

## Vite 是什么？

Vite 是由 Vue.js 作者尤雨溪创建的下一代前端构建工具。它利用浏览器原生 ES 模块实现极速的开发体验，是目前最受欢迎的前端构建工具之一。

## 核心优势

### 极速开发

- **依赖预构建** - 使用 esbuild 快速处理 node_modules
- **按需加载** - 浏览器直接加载 ES 模块
- **热更新** - 基于 ESM 的 HMR，速度毫秒级

### 生产构建

- 使用 Rollup 进行高效打包
- 智能代码分割
- 丰富的插件生态

## 快速开始

\`\`\`bash
npm create vite@latest my-app -- --template vue-ts
cd my-app
npm install
npm run dev
\`\`\`

## 配置详解

### vite.config.ts

\`\`\`typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'es2015',
    cssCodeSplit: true
  }
})
\`\`\`

## 依赖优化

### optimizeDeps

\`\`\`typescript
optimizeDeps: {
  include: ['vue', 'vue-router', 'pinia'],
  exclude: ['some-huge-package']
}
\`\`\`

### 预构建选项

- **include** - 强制预构建的依赖
- **exclude** - 不需要预构建的依赖
- **esbuildOptions** - 自定义 esbuild 配置

## 代码分割

### manualChunks

\`\`\`typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vue-vendor': ['vue', 'vue-router', 'pinia'],
        'ui-components': ['element-plus', 'vant']
      }
    }
  }
}
\`\`\`

## 插件系统

Vite 插件兼容 Rollup，同时提供 Vite 特有钩子：

\`\`\`typescript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    // Vite 特有钩子
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 自定义中间件
        next()
      })
    },
    // Rollup 钩子
    buildStart() {
      console.log('构建开始')
    }
  }
}
\`\`\`

## 环境变量

\`\`\`typescript
// .env
VITE_API_BASE_URL=http://localhost:3000

// 使用
console.log(import.meta.env.VITE_API_BASE_URL)
\`\`\`

## 最佳实践

1. **合理配置预构建** - 避免重复构建
2. **使用 CDN** - 对于大型库考虑外部化
3. **代码分割** - 按需加载优化首屏
4. **类型检查** - CI 中运行 TypeScript 检查

Vite 正在改变前端开发方式，值得深入探索。
    `,
    cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=85',
    category: 'frontend',
    tags: ['Vite', '前端', '构建工具', '工具'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-03-26',
    readTime: 8,
    views: 0,
    likes: 0,
    isLiked: false,
    comments: []
  },
  // CSS 文章
  {
    id: '42',
    title: '现代 CSS 技巧：打造精美界面',
    excerpt: '掌握现代 CSS 技术，让你的网页设计更上一层楼。',
    content: `
# 现代 CSS 技巧：打造精美界面

## CSS 的演进

CSS 从简单的样式表语言演进为强大的布局系统。掌握现代 CSS 技术，能用更少的代码实现更精美的效果。

## Flexbox 布局

### 基本用法

\`\`\`css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
\`\`\`

### 实用技巧

\`\`\`css
/* 居中布局 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 等高列 */
.columns {
  display: flex;
  align-items: stretch;
}

/* 响应式换行 */
.responsive {
  display: flex;
  flex-wrap: wrap;
}
\`\`\`

## Grid 布局

### 二维布局

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
}

/* 命名区域 */
.area {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 200px 1fr 1fr;
}
\`\`\`

## CSS 变量

### 定义与使用

\`\`\`css
:root {
  --primary-color: #3498db;
  --spacing: 16px;
  --font-size: 14px;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing);
  font-size: var(--font-size);
}

/* 响应式变量 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
  }
}
\`\`\`

## 动画与过渡

### 过渡效果

\`\`\`css
.button {
  transition: all 0.3s ease;
}

.button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
\`\`\`

### 关键帧动画

\`\`\`css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.animate {
  animation: slideUp 0.5s ease forwards;
}
\`\`\`

## 实用技巧

### 文字省略

\`\`\`css
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multi-line {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
\`\`\`

### 滚动条美化

\`\`\`css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
\`\`\`

### 玻璃拟态效果

\`\`\`css
.glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
}
\`\`\`

## 响应式设计

\`\`\`css
/* 移动优先 */
.container {
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    width: 750px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .container {
    width: 960px;
  }
}
\`\`\`

现代 CSS 功能强大，合理运用能大大提升开发效率和用户体验。
    `,
    cover: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&q=85',
    category: 'frontend',
    tags: ['CSS', '前端', '样式', '布局'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-03-26',
    readTime: 8,
    views: 0,
    likes: 0,
    isLiked: false,
    comments: []
  },
  {
    id: '37',
    title: 'GitHub Actions 实战：打造自动化部署流水线',
    excerpt: '从零开始学习 GitHub Actions，掌握 CI/CD 自动化部署的核心技能。',
    content: `
# GitHub Actions 实战：打造自动化部署流水线

## 什么是 GitHub Actions？

GitHub Actions 是 GitHub 提供的自动化工作流工具，可以帮助开发者自动执行代码构建、测试、部署等流程。无需额外配置服务器，只需在仓库中定义工作流文件即可。

## 核心概念

### Workflow（工作流）

工作流是自动化的核心，通过 .github/workflows 目录下的 YAML 文件定义。一个工作流可以包含多个 Job，每个 Job 又包含多个 Step。

### Runner（运行器）

Runner 是执行工作流的服务器。GitHub 提供了托管的 Ubuntu、Windows、macOS 运行器，也可以自建运行器满足特殊需求。

### Action（动作）

Action 是最小的可复用单元。可以使用 GitHub 社区分享的 Action，也可以编写自定义 Action 来完成特定任务。

## 实战演练

### 第一步：创建工作流文件

在项目中新建 .github/workflows/deploy.yml：

\`\`\`yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Tests
        run: npm test
      
      - name: Build
        run: npm run build
\`\`\`

### 第二步：添加部署步骤

\`\`\`yaml
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.HOST }}
          username: \${{ secrets.USERNAME }}
          key: \${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/app
            git pull origin main
            npm install
            npm run build
            pm2 restart app
\`\`\`

## 最佳实践

1. **使用缓存**：利用 actions/cache 加速依赖安装
2. **环境变量**：敏感信息使用 Secrets 存储
3. **并行任务**：独立的 Job 可以并行执行，提高效率
4. **失败通知**：配置 Slack 或邮件通知，及时获取构建状态

## 总结

GitHub Actions 让 CI/CD 变得简单高效。掌握其核心概念后，可以快速搭建适合项目的自动化流水线，大幅提升开发效率。
    `,
    cover: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&q=85',
    category: 'fullstack',
    tags: ['GitHub', 'CI/CD', 'DevOps', '自动化'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-03-25',
    readTime: 8,
    views: 0,
    likes: 0,
    isLiked: false,
    comments: []
  },
  {
    id: '27',
    title: 'Go 语言并发编程实战',
    excerpt: '深入学习 Go 语言的 goroutine 和 channel，掌握高效并发编程技巧。',
    content: `
# Go 语言并发编程实战

## goroutine 基础

goroutine 是 Go 语言轻量级的并发执行单元。

\`\`\`go
go func() {
    // 并发执行的代码
}()
\`\`\`

## Channel

Channel 是 goroutine 之间的通信机制。

\`\`\`go
ch := make(chan int)
go func() {
    ch <- 42
}()
value := <-ch
\`\`\`

## Select

select 可以同时等待多个 channel。

\`\`\`go
select {
case msg := <-ch1:
    fmt.Println(msg)
case msg := <-ch2:
    fmt.Println(msg)
}
\`\`\`

## 总结

Go 的并发模型简洁而强大。
    `,
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=85',
    category: 'backend',
    tags: ['Go', '并发', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-02-15',
    readTime: 10,
    views: 1567,
    likes: 42,
    isLiked: false,
    comments: []
  },
  {
    id: '28',
    title: 'Rust 内存安全编程指南',
    excerpt: '学习 Rust 的所有权系统，理解内存安全是如何通过编译时检查来保证的。',
    content: `
# Rust 内存安全编程指南

## 所有权规则

1. 每个值有且只有一个所有者
2. 当所有者离开作用域时，值被丢弃
3. 只能有一个可变引用或多个不可变引用

## 生命周期

生命周期注解告诉编译器引用有效的时间。

\`\`\`rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
\`\`\`

## 总结

Rust 在保证内存安全的同时提供了高性能。
    `,
    cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=85',
    category: 'backend',
    tags: ['Rust', '内存安全', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-02-12',
    readTime: 12,
    views: 2341,
    likes: 56,
    isLiked: false,
    comments: []
  },
  {
    id: '29',
    title: 'Three.js 3D 图形编程入门',
    excerpt: '使用 Three.js 创建令人惊叹的 3D 网页应用和交互式体验。',
    content: `
# Three.js 3D 图形编程入门

## 基础场景

\`\`\`javascript
import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
\`\`\`

## 创建几何体

\`\`\`javascript
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
\`\`\`

## 动画循环

\`\`\`javascript
function animate() {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    renderer.render(scene, camera)
}
\`\`\`

## 总结

Three.js 让 Web 3D 开发变得简单。
    `,
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=85',
    category: 'frontend',
    tags: ['Three.js', '3D', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-02-10',
    readTime: 8,
    views: 3421,
    likes: 78,
    isLiked: false,
    comments: []
  },
  {
    id: '30',
    title: 'PostgreSQL 高级查询优化',
    excerpt: '深入理解 PostgreSQL 查询 planner，学习如何编写高效的 SQL 语句。',
    content: `
# PostgreSQL 高级查询优化

## EXPLAIN 分析

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM users WHERE id = 1;
\`\`\`

## 索引策略

### B-tree 索引

适用于等值查询和范围查询。

\`\`\`sql
CREATE INDEX idx_user_email ON users(email);
\`\`\`

### GIN 索引

适用于全文搜索和数组类型。

\`\`\`sql
CREATE INDEX idx_article_tags ON articles USING GIN(tags);
\`\`\`

## 总结

理解查询计划是优化的关键。
    `,
    cover: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=85',
    category: 'backend',
    tags: ['PostgreSQL', '数据库', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-02-08',
    readTime: 11,
    views: 1876,
    likes: 45,
    isLiked: false,
    comments: []
  },
  {
    id: '31',
    title: 'Flutter 跨平台开发实战',
    excerpt: '使用 Flutter 构建高性能的跨平台移动应用，一套代码同时支持 iOS 和 Android。',
    content: `
# Flutter 跨平台开发实战

## Widget 基础

Flutter 一切皆 Widget。

\`\`\`dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text('Hello Flutter');
  }
}
\`\`\`

## 状态管理

使用 Provider 进行状态管理：

\`\`\`dart
ChangeNotifierProvider(
  create: (context) => MyModel(),
  child: MyWidget(),
)
\`\`\`

## 总结

Flutter 让跨平台开发变得高效。
    `,
    cover: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=85',
    category: 'fullstack',
    tags: ['Flutter', '移动开发', '跨平台'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-02-05',
    readTime: 9,
    views: 2134,
    likes: 52,
    isLiked: false,
    comments: []
  },
  {
    id: '32',
    title: 'Vite 构建工具深入解析',
    excerpt: '全面了解 Vite 的工作原理，学习如何优化开发体验和构建性能。',
    content: `
# Vite 构建工具深入解析

## 开发服务器

Vite 利用浏览器原生 ES 模块实现即时热更新。

\`\`\`javascript
// vite.config.js
export default {
  server: {
    port: 3000,
    hmr: true
  }
}
\`\`\`

## 依赖预构建

自动将 node_modules 中的 CommonJS 转换为 ESM。

\`\`\`javascript
optimizeDeps: {
  include: ['vue', 'vue-router']
}
\`\`\`

## 生产构建

使用 Rollup 进行优化构建：

\`\`\`javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router']
      }
    }
  }
}
\`\`\`

## 总结

Vite 大幅提升了开发体验。
    `,
    cover: 'https://images.unsplash.com/photo-1619820278308-95e897b4b83d?w=600&q=85',
    category: 'frontend',
    tags: ['Vite', '构建工具', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-02-03',
    readTime: 7,
    views: 2876,
    likes: 63,
    isLiked: false,
    comments: []
  },
  {
    id: '33',
    title: 'gRPC 微服务通信实战',
    excerpt: '学习 gRPC 的基本概念和使用方法，构建高效的微服务通信体系。',
    content: `
# gRPC 微服务通信实战

## Protocol Buffers

定义服务接口：

\`\`\`protobuf
service UserService {
  rpc GetUser (UserRequest) returns (User);
}

message UserRequest {
  string id = 1;
}

message User {
  string id = 1;
  string name = 2;
}
\`\`\`

## 生成代码

\`\`\`bash
protoc --go_out=. --go-grpc_out=. user.proto
\`\`\`

## 总结

gRPC 提供高效的类型安全通信。
    `,
    cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=85',
    category: 'backend',
    tags: ['gRPC', '微服务', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-02-01',
    readTime: 10,
    views: 1654,
    likes: 38,
    isLiked: false,
    comments: []
  },
  {
    id: '34',
    title: 'WebSocket 实时通信实战',
    excerpt: '使用 WebSocket 构建实时聊天和通知系统，提升用户体验。',
    content: `
# WebSocket 实时通信实战

## 客户端连接

\`\`\`javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
\`\`\`

## 服务端实现

\`\`\`javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // 处理消息
    ws.send(JSON.stringify({ status: 'ok' }));
  });
});
\`\`\`

## 总结

WebSocket 实现双向实时通信。
    `,
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=85',
    category: 'backend',
    tags: ['WebSocket', '实时通信', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-28',
    readTime: 8,
    views: 1987,
    likes: 47,
    isLiked: false,
    comments: []
  },
  {
    id: '35',
    title: 'TypeScript 泛型深入理解',
    excerpt: '掌握 TypeScript 泛型的各种用法，写出更灵活和可复用的代码。',
    content: `
# TypeScript 泛型深入理解

## 泛型函数

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>('hello');
\`\`\`

## 泛型接口

\`\`\`typescript
interface Container<T> {
  value: T;
  getValue(): T;
}
\`\`\`

## 泛型约束

\`\`\`typescript
interface Lengthwise {
  length: number;
}

function log<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}
\`\`\`

## 总结

泛型让代码更加灵活和类型安全。
    `,
    cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=85',
    category: 'frontend',
    tags: ['TypeScript', '泛型', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-25',
    readTime: 9,
    views: 2567,
    likes: 59,
    isLiked: false,
    comments: []
  },
  {
    id: '36',
    title: 'Nginx 高性能服务器配置',
    excerpt: '学习 Nginx 配置优化，构建高性能的反向代理和静态文件服务器。',
    content: `
# Nginx 高性能服务器配置

## 基本配置

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        root /var/www/html;
        index index.html;
    }
}
\`\`\`

## 反向代理

\`\`\`nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
}
\`\`\`

## 性能优化

启用 gzip 压缩和缓存：

\`\`\`nginx
gzip on;
gzip_types text/plain application/json;

location /static {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
\`\`\`

## 总结

合理的 Nginx 配置能大幅提升性能。
    `,
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=85',
    category: 'backend',
    tags: ['Nginx', '服务器', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-22',
    readTime: 8,
    views: 1876,
    likes: 41,
    isLiked: false,
    comments: []
  }
]

async function main() {
  const client = new MongoClient(MONGO_URI)
  
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const collection = db.collection('articles')
    
    // 检查是否已存在这些文章
    const existingIds = await collection.distinct('id')
    const newArticlesToInsert = newArticles.filter(
      article => !existingIds.includes(article.id)
    )
    
    if (newArticlesToInsert.length > 0) {
      await collection.insertMany(newArticlesToInsert)
      console.log(`成功添加 ${newArticlesToInsert.length} 篇文章`)
    } else {
      console.log('所有文章已存在，无需添加')
    }
    
    // 显示总文章数
    const count = await collection.countDocuments()
    console.log(`数据库中共有 ${count} 篇文章`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

main()
