import { Article, CategoryInfo } from '../types/index.js'

export const categories: CategoryInfo[] = [
  { key: 'frontend', label: '前端', color: '#00D9FF' },
  { key: 'backend', label: '后端', color: '#7B61FF' },
  { key: 'fullstack', label: '全栈', color: '#FF6B9D' },
  { key: 'other', label: '其他', color: '#F59E0B' }
]

export const initialArticles: Article[] = [
  {
    id: '1',
    title: 'Vue3 组合式 API 实战指南',
    excerpt: '深入探索 Vue3 组合式 API 的使用技巧和最佳实践，让你的代码更加简洁和可维护。',
    content: `
# Vue3 组合式 API 实战指南

## 引言

Vue3 引入的组合式 API 是近年来最重大的更新之一。它不仅提供了更好的代码组织方式，还让逻辑复用变得前所未有的简单。

## 为什么选择组合式 API？

### 1. 更好的逻辑复用

传统的 Mixins 方案存在命名冲突和数据来源不清晰的问题。组合式 API 通过 **组合函数** 完美解决了这些问题。

### 2. 更好的类型支持

组合式 API 本质上就是 TypeScript 函数，因此天然支持类型推断。

### 3. 更好的代码组织

相关逻辑可以放在一起，而不是分散在不同的选项中。

## 核心 API

### ref 和 reactive

\`\`\`typescript
import { ref, reactive } from 'vue'

// 基础类型使用 ref
const count = ref(0)
const name = ref('Lumina')

// 对象类型使用 reactive
const state = reactive({
  user: null,
  loading: false
})
\`\`\`

### computed 和 watch

\`\`\`typescript
import { computed, watch } from 'vue'

const doubled = computed(() => count.value * 2)

watch(count, (newVal, oldVal) => {
  console.log(\`Count changed from \${oldVal} to \${newVal}\`)
})
\`\`\`

## 最佳实践

1. **保持函数简洁**: 一个函数只做一件事
2. **使用命名约定**: 以 use 开头的函数表示组合函数
3. **合理组织代码**: 相关逻辑放在一起

## 总结

组合式 API 是 Vue3 最强大的特性之一，掌握它将大大提升你的开发效率和代码质量。
    `,
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    category: 'frontend',
    tags: ['Vue3', 'TypeScript', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-15',
    readTime: 8,
    views: 1234,
    likes: 42,
    isLiked: false,
    comments: [
      {
        id: 'c1',
        author: { name: '前端小学生', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frontend' },
        content: '写得真好，受益匪浅！期待更多相关文章。',
        createTime: '2024-01-16T10:00:00Z',
        likes: 5
      },
      {
        id: 'c2',
        author: { name: '技术爱好者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech' },
        content: '组合式 API 确实很强大，帮我解决了之前的很多问题。',
        createTime: '2024-01-17T15:30:00Z',
        likes: 3
      }
    ]
  },
  {
    id: '2',
    title: 'TypeScript 高级类型技巧',
    excerpt: '掌握 TypeScript 高级类型，让你的代码类型安全更加完善，开发体验更加丝滑。',
    content: `
# TypeScript 高级类型技巧

## 概述

TypeScript 的高级类型系统是其最强大的特性之一。掌握这些技巧可以让你的代码更加健壮。

## 条件类型

\`\`\`typescript
type IsString<T> = T extends string ? true : false

type A = IsString<string>  // true
type B = IsString<number>  // false
\`\`\`

## 映射类型

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}
\`\`\`

## 工具类型

TypeScript 内置了很多实用的工具类型：

- \`Partial<T>\` - 将所有属性设为可选
- \`Required<T>\` - 将所有属性设为必需
- \`Readonly<T>\` - 将所有属性设为只读
- \`Pick<T, K>\` - 从 T 中选择属性 K
- \`Omit<T, K>\` - 从 T 中排除属性 K

## 总结

熟练运用这些高级类型，可以让你的 TypeScript 代码更加优雅和健壮。
    `,
    cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
    category: 'frontend',
    tags: ['TypeScript', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-10',
    readTime: 10,
    views: 892,
    likes: 38,
    isLiked: false,
    comments: [
      {
        id: 'c3',
        author: { name: '后端老司机', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=backend' },
        content: '条件类型真是太有用了！',
        createTime: '2024-01-11T09:00:00Z',
        likes: 2
      }
    ]
  },
  {
    id: '3',
    title: 'Node.js 性能优化实战',
    excerpt: '从源码层面深入分析 Node.js 性能优化技巧，构建高性能后端服务。',
    content: `
# Node.js 性能优化实战

## 为什么要优化 Node.js？

Node.js 是单线程异步模型，但不当的使用会导致性能问题。

## 1. 事件循环优化

理解事件循环的每个阶段，避免阻塞主线程。

\`\`\`javascript
// 错误：同步阻塞
const data = fs.readFileSync('./file.txt')

// 正确：异步非阻塞
const data = await fs.promises.readFile('./file.txt')
\`\`\`

## 2. 内存管理

使用 \`--max-old-space-size\` 参数调整堆内存大小。

\`\`\`javascript
// 手动触发垃圾回收（仅调试）
if (global.gc) {
  global.gc()
}
\`\`\`

## 3. 流处理大文件

\`\`\`javascript
const fs = require('fs')

const readStream = fs.createReadStream('largefile.txt')
const writeStream = fs.createWriteStream('output.txt')

readStream.pipe(writeStream)
\`\`\`

## 4. 集群模式

使用 cluster 模块充分利用多核 CPU。

\`\`\`javascript
const cluster = require('cluster')
const numCPUs = require('os').cpus().length

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
} else {
  app.listen(3000)
}
\`\`\`

## 总结

性能优化是一个持续的过程，需要不断监控和改进。
    `,
    cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    category: 'backend',
    tags: ['Node.js', '后端', '性能'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-05',
    readTime: 12,
    views: 756,
    likes: 25,
    isLiked: false,
    comments: []
  },
  {
    id: '4',
    title: 'Docker 与 Kubernetes 实战',
    excerpt: '掌握容器化技术，从 Docker 到 K8s 的完整部署流程详解。',
    content: `
# Docker 与 Kubernetes 实战

## 容器化基础

Docker 让应用打包和部署变得前所未有的简单。

## Dockerfile 最佳实践

\`\`\`dockerfile
# 使用多阶段构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

## Kubernetes 部署

使用 K8s 进行容器编排和服务管理。

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        ports:
        - containerPort: 3000
\`\`\`

## 总结

容器化是现代 DevOps 的基础，值得深入学习。
    `,
    cover: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
    category: 'backend',
    tags: ['Docker', 'Kubernetes', 'DevOps'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-28',
    readTime: 15,
    views: 2341,
    likes: 67,
    isLiked: false,
    comments: [
      {
        id: 'c4',
        author: { name: '全栈萌新', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fullstack' },
        content: 'K8s 确实很强大，但学习曲线也比较陡峭。',
        createTime: '2023-12-29T14:00:00Z',
        likes: 8
      }
    ]
  },
  {
    id: '5',
    title: '全栈项目架构设计',
    excerpt: '从需求分析到架构设计，一个完整全栈项目的最佳实践。',
    content: `
# 全栈项目架构设计

## 前言

一个好的架构可以让项目易于维护和扩展。

## 技术选型

- **前端**: Vue3 + TypeScript + Vite
- **后端**: Node.js + Express + Prisma
- **数据库**: PostgreSQL
- **缓存**: Redis

## 目录结构

\`\`\`
src/
├── api/            # API 接口
├── components/    # 公共组件
├── composables/   # 组合函数
├── stores/        # 状态管理
├── views/         # 页面视图
└── utils/         # 工具函数
\`\`\`

## 状态管理

使用 Pinia 进行全局状态管理，按模块划分。

## 总结

好的架构是成功的半。
    `,
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    category: 'fullstack',
    tags: ['架构', '全栈', '最佳实践'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-20',
    readTime: 11,
    views: 1876,
    likes: 52,
    isLiked: false,
    comments: []
  },
  {
    id: '6',
    title: 'Git 工作流与团队协作',
    excerpt: '规范化的 Git 工作流，让团队协作更加高效，代码管理更加有序。',
    content: `
# Git 工作流与团队协作

## 常见的 Git 工作流

1. Git Flow
2. GitHub Flow
3. GitLab Flow

## 分支策略

- \`main\`: 主分支，保持稳定
- \`develop\`: 开发分支
- \`feature/\`: 功能分支
- \`fix/\`: 修复分支
- \`release/\`: 发布分支

## 提交规范

使用 Conventional Commits 规范提交信息：

\`\`\`
feat: 添加用户登录功能
fix: 修复登录页面样式问题
docs: 更新 README 文档
refactor: 重构用户认证逻辑
\`\`\`

## 工具推荐

- **Commitizen**: 交互式提交
- **Husky**: Git 钩子
- **ESLint**: 代码检查

## 总结

规范的 Git 工作流是团队协作的基础。
    `,
    cover: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80',
    category: 'other',
    tags: ['Git', '团队协作'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-15',
    readTime: 7,
    views: 654,
    likes: 18,
    isLiked: false,
    comments: []
  },
  {
    id: '7',
    title: 'React Hooks 深入理解',
    excerpt: '全面解析 React Hooks 的工作机制，掌握 useState、useEffect 等常用钩子的最佳实践。',
    content: `
# React Hooks 深入理解

## 什么是 Hooks？

Hook 是 React 16.8 的新特性，它让你在不编写类的情况下使用 state 和其他 React 特性。

## 常用 Hooks

### useState

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

### useEffect

\`\`\`jsx
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

### useContext

\`\`\`jsx
const theme = useContext(ThemeContext);
\`\`\`

## 自定义 Hook

创建可复用的逻辑：

\`\`\`jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}
\`\`\`

## 规则

1. 只在最顶层使用 Hook
2. 只在 React 函数中调用 Hook

## 总结

掌握 Hooks 是现代 React 开发的基础。
    `,
    cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=85',
    category: 'frontend',
    tags: ['React', 'Hooks', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-20',
    readTime: 10,
    views: 2345,
    likes: 45,
    isLiked: false,
    comments: []
  },
  {
    id: '8',
    title: 'Node.js 性能优化实战',
    excerpt: '深入探讨 Node.js 应用性能优化的关键技术，从容应对高并发场景。',
    content: `
# Node.js 性能优化实战

## 性能优化的重要性

在处理高并发请求时，性能优化至关重要。

## 1. 事件循环优化

理解事件循环的工作机制：

\`\`\`javascript
const { performance } = require('perf_hooks');

function measurePerformance(fn) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(\`Execution time: \${end - start}ms\`);
}
\`\`\`

## 2. 流处理大文件

使用流处理避免内存溢出：

\`\`\`javascript
const fs = require('fs');
const readStream = fs.createReadStream('largefile.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.pipe(writeStream);
\`\`\`

## 3. 缓存策略

实现高效缓存：

\`\`\`javascript
const cache = new Map();

function getData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = fetchFromDatabase(key);
  cache.set(key, data);
  return data;
}
\`\`\`

## 4. 集群模式

使用 cluster 模块：

\`\`\`javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  app.listen(3000);
}
\`\`\`

## 总结

性能优化是一个持续的过程，需要不断监控和改进。
    `,
    cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=85',
    category: 'backend',
    tags: ['Node.js', '性能优化', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-18',
    readTime: 12,
    views: 1876,
    likes: 38,
    isLiked: false,
    comments: []
  },
  {
    id: '9',
    title: 'CSS Grid 布局完全指南',
    excerpt: '掌握现代 CSS Grid 布局技术，轻松实现各种复杂页面布局。',
    content: `
# CSS Grid 布局完全指南

## 什么是 CSS Grid？

CSS Grid 是一个二维布局系统，可以同时控制行和列。

## 基本语法

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
}
\`\`\`

## 常用属性

### grid-template-columns

\`\`\`css
.container {
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: 200px auto 200px;
}
\`\`\`

### grid-area

\`\`\`css
.item {
  grid-area: 1 / 1 / 3 / 3;
}
\`\`\`

## 响应式布局

\`\`\`css
.container {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
\`\`\`

## 实用技巧

### 居中布局

\`\`\`css
.container {
  display: grid;
  place-items: center;
}
\`\`\`

### 卡片网格

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}
\`\`\`

## 总结

CSS Grid 是现代网页布局的利器，值得深入学习。
    `,
    cover: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&q=85',
    category: 'frontend',
    tags: ['CSS', 'Grid', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-16',
    readTime: 8,
    views: 1543,
    likes: 32,
    isLiked: false,
    comments: []
  },
  {
    id: '10',
    title: 'Python 异步编程详解',
    excerpt: '深入理解 Python 异步编程模型，掌握 asyncio 的核心概念和使用方法。',
    content: `
# Python 异步编程详解

## 异步编程概述

异步编程允许程序在等待 I/O 操作时继续执行其他任务。

## asyncio 基础

### 定义异步函数

\`\`\`python
import asyncio

async def fetch_data():
    print("开始获取数据")
    await asyncio.sleep(2)  # 模拟 I/O 操作
    print("数据获取完成")
    return {"data": "some data"}
\`\`\`

### 运行异步函数

\`\`\`python
async def main():
    result = await fetch_data()
    print(result)

asyncio.run(main())
\`\`\`

## 并发执行

### gather

\`\`\`python
async def main():
    results = await asyncio.gather(
        fetch_data(),
        fetch_data(),
        fetch_data()
    )
\`\`\`

### Task

\`\`\`python
async def main():
    task = asyncio.create_task(fetch_data())
    # 做其他事情
    result = await task
\`\`\`

## 错误处理

\`\`\`python
async def safe_fetch():
    try:
        result = await fetch_data()
    except Exception as e:
        print(f"Error: {e}")
\`\`\`

## 实际应用

在 HTTP 请求中使用：

\`\`\`python
import aiohttp

async def fetch_urls(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [session.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return await asyncio.gather(*[r.text() for r in responses])
\`\`\`

## 总结

异步编程是提高 Python 应用性能的关键技术。
    `,
    cover: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=85',
    category: 'backend',
    tags: ['Python', '异步', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-14',
    readTime: 11,
    views: 2109,
    likes: 42,
    isLiked: false,
    comments: []
  },
  {
    id: '11',
    title: 'Docker 容器化部署指南',
    excerpt: '学习 Docker 核心技术，掌握应用容器化的完整流程和最佳实践。',
    content: `
# Docker 容器化部署指南

## 为什么使用 Docker？

Docker 可以确保应用在不同环境中一致运行。

## 基础命令

### 镜像操作

\`\`\`bash
docker pull nginx:latest
docker images
docker rmi nginx
\`\`\`

### 容器操作

\`\`\`bash
docker run -d -p 80:80 nginx
docker ps
docker stop container_id
docker rm container_id
\`\`\`

## Dockerfile

创建 Dockerfile：

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

## Docker Compose

编排多容器应用：

\`\`\`yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:14
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
\`\`\`

## 最佳实践

1. 使用多阶段构建减小镜像体积
2. 使用 .dockerignore 排除不必要的文件
3. 最小化层数
4. 使用特定版本的基础镜像

## 总结

Docker 是现代 DevOps 的基础工具。
    `,
    cover: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&q=85',
    category: 'fullstack',
    tags: ['Docker', 'DevOps', '部署'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-12',
    readTime: 9,
    views: 1765,
    likes: 55,
    isLiked: false,
    comments: []
  },
  {
    id: '12',
    title: 'JavaScript ES6+ 新特性详解',
    excerpt: '全面介绍 ES6 及后续版本的重要新特性，提升你的 JavaScript 编码水平。',
    content: `
# JavaScript ES6+ 新特性详解

## let 和 const

\`\`\`javascript
let count = 1;  // 块级作用域
const PI = 3.14;  // 常量
\`\`\`

## 箭头函数

\`\`\`javascript
const add = (a, b) => a + b;

const greet = name => \`Hello, \${name}!\`;
\`\`\`

## 模板字符串

\`\`\`javascript
const message = \`Hello, \${name}!
You have \${count} messages.\`;
\`\`\`

## 解构赋值

\`\`\`javascript
const { name, age } = person;
const [first, second] = array;
\`\`\`

## 展开运算符

\`\`\`javascript
const merged = [...array1, ...array2];
const clone = { ...object };
\`\`\`

## Promise 和 async/await

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

## 可选链和空值合并

\`\`\`javascript
const name = user?.profile?.name;
const value = null ?? 'default';
\`\`\`

## 总结

掌握这些新特性可以让 JavaScript 代码更加简洁和优雅。
    `,
    cover: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=85',
    category: 'frontend',
    tags: ['JavaScript', 'ES6', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-10',
    readTime: 7,
    views: 3421,
    likes: 78,
    isLiked: false,
    comments: []
  },
  {
    id: '13',
    title: 'MongoDB 高级查询技巧',
    excerpt: '深入学习 MongoDB 聚合管道和复杂查询，提升数据库操作效率。',
    content: `
# MongoDB 高级查询技巧

## 聚合管道基础

\`\`\`javascript
db.collection.aggregate([
  { $match: { status: "active" } },
  { $group: { _id: "$category", total: { $sum: "$price" } } },
  { $sort: { total: -1 } }
])
\`\`\`

## 常用聚合阶段

### $match - 过滤文档

\`\`\`javascript
{ $match: { age: { $gte: 18 }, status: "active" } }
\`\`\`

### $group - 分组

\`\`\`javascript
{
  $group: {
    _id: "$department",
    count: { $sum: 1 },
    avgSalary: { $avg: "$salary" }
  }
}
\`\`\`

### $project - 投影

\`\`\`javascript
{
  $project: {
    name: 1,
    email: 1,
    fullName: { $concat: ["$firstName", " ", "$lastName"] }
  }
}
\`\`\`

### $lookup - 连接

\`\`\`javascript
{
  $lookup: {
    from: "orders",
    localField: "_id",
    foreignField: "customerId",
    as: "orders"
  }
}
\`\`\`

## 索引优化

\`\`\`javascript
db.collection.createIndex({ email: 1 }, { unique: true })
db.collection.createIndex({ createdAt: -1 }, { expireAfterSeconds: 3600 })
\`\`\`

## 总结

熟练掌握聚合管道可以高效处理复杂的数据分析需求。
    `,
    cover: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=85',
    category: 'backend',
    tags: ['MongoDB', '数据库', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-08',
    readTime: 10,
    views: 1234,
    likes: 28,
    isLiked: false,
    comments: []
  },
  {
    id: '14',
    title: 'GraphQL API 设计最佳实践',
    excerpt: '学习如何设计高效的 GraphQL API，平衡灵活性和性能。',
    content: `
# GraphQL API 设计最佳实践

## GraphQL 简介

GraphQL是一种用于 API 的查询语言，提供完整的API数据类型描述。

## 定义 Schema

\`\`\`graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
}

type Query {
  user(id: ID!): User
  users: [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User
}
\`\`\`

## Resolver 设计

\`\`\`javascript
const resolvers = {
  Query: {
    user: (_, { id }) => db.users.find(id),
  },
  User: {
    posts: (user) => db.posts.find({ authorId: user.id }),
  }
};
\`\`\`

## 性能优化

### DataLoader

\`\`\`javascript
const DataLoader = require('dataloader');

const userLoader = new DataLoader(async (ids) => {
  const users = await db.users.findMany(ids);
  return ids.map(id => users.find(u => u.id === id));
});
\`\`\`

### 查询复杂度限制

\`\`\`javascript
const complexity = require('graphql-query-complexity');

const rule = complexity({
  maximumComplexity: 1000,
  variables: variables,
  operationName: operationName,
  onComplete: c => console.log('Query Complexity:', c),
});
\`\`\`

## 总结

好的 GraphQL 设计需要平衡灵活性和性能。
    `,
    cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=85',
    category: 'backend',
    tags: ['GraphQL', 'API', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-06',
    readTime: 11,
    views: 1567,
    likes: 35,
    isLiked: false,
    comments: []
  },
  {
    id: '15',
    title: 'Web 安全防护实战',
    excerpt: '全面了解常见的 Web 安全威胁及防护措施，构建安全的 Web 应用。',
    content: `
# Web 安全防护实战

## 常见安全威胁

### XSS 跨站脚本攻击

防护措施：

\`\`\`javascript
// 使用 DOMPurify 净化 HTML
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(dirty);
\`\`\`

### CSRF 跨站请求伪造

使用 CSRF Token：

\`\`\`javascript
// 服务端生成 Token
const csrfToken = crypto.randomBytes(32).toString('hex');

// 验证 Token
function validateCsrf(token, sessionToken) {
  return token === sessionToken;
}
\`\`\`

### SQL 注入

使用参数化查询：

\`\`\`javascript
// 错误示例
db.query(\`SELECT * FROM users WHERE id = \${userId}\`);

// 正确示例
db.query('SELECT * FROM users WHERE id = $1', [userId]);
\`\`\`

## 安全 Headers

\`\`\`javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
\`\`\`

## 密码安全

使用 bcrypt 加密：

\`\`\`javascript
const bcrypt = require('bcrypt');

const hash = await bcrypt.hash(password, 10);
const match = await bcrypt.compare(password, hash);
\`\`\`

## 总结

安全是 Web 开发中不可忽视的重要环节。
    `,
    cover: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=85',
    category: 'fullstack',
    tags: ['安全', 'Web', '全栈'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-04',
    readTime: 12,
    views: 2876,
    likes: 62,
    isLiked: false,
    comments: []
  },
  {
    id: '16',
    title: 'RESTful API 设计规范',
    excerpt: '遵循 REST 原则设计高质量 API，打造易于理解和使用的 Web 服务接口。',
    content: `
# RESTful API 设计规范

## REST 原则

1. 资源导向
2. 无状态
3. 统一的接口
4. 分层系统

## URL 设计

### 资源命名

\`\`\`
GET    /api/users          # 获取用户列表
GET    /api/users/:id      # 获取单个用户
POST   /api/users          # 创建用户
PUT    /api/users/:id      # 更新用户
DELETE /api/users/:id      # 删除用户
\`\`\`

### 嵌套资源

\`\`\`
GET    /api/users/:id/posts
GET    /api/users/:id/posts/:postId/comments
\`\`\`

## HTTP 方法

| 方法 | 描述 |
|------|------|
| GET   | 获取资源 |
| POST  | 创建资源 |
| PUT   | 完整更新 |
| PATCH | 部分更新 |
| DELETE| 删除资源 |

## 响应格式

\`\`\`json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "John"
  },
  "meta": {
    "page": 1,
    "total": 100
  }
}
\`\`\`

## 错误处理

\`\`\`json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "用户不存在"
  }
}
\`\`\`

## 版本控制

\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

## 总结

遵循 RESTful 规范可以让 API 更加清晰和易用。
    `,
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=85',
    category: 'backend',
    tags: ['RESTful', 'API', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2024-01-02',
    readTime: 8,
    views: 1987,
    likes: 44,
    isLiked: false,
    comments: []
  },
  {
    id: '17',
    title: 'TypeScript 装饰器详解',
    excerpt: '深入理解 TypeScript 装饰器的工作机制，学习如何在项目中使用装饰器提升开发效率。',
    content: `
# TypeScript 装饰器详解

## 什么是装饰器？

装饰器是一种特殊类型的声明，可以附加到类、方法、访问器、属性或参数上。

## 启用装饰器

\`\`\`json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
\`\`\`

## 类装饰器

\`\`\`typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
}
\`\`\`

## 方法装饰器

\`\`\`typescript
function log(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(\`Calling \${propertyKey} with:\`, args);
    return original.apply(this, args);
  };
  
  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}
\`\`\`

## 参数装饰器

\`\`\`typescript
function inject(service: string) {
  return function(target: Object, propertyKey: string, parameterIndex: number) {
    // 存储参数元数据
  };
}
\`\`\`

## 总结

装饰器是 TypeScript 强大的元编程特性。
    `,
    cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=85',
    category: 'frontend',
    tags: ['TypeScript', '装饰器', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-30',
    readTime: 9,
    views: 1654,
    likes: 36,
    isLiked: false,
    comments: []
  },
  {
    id: '18',
    title: '微服务架构设计与实践',
    excerpt: '探索微服务架构的核心概念，学习如何构建可扩展的分布式系统。',
    content: `
# 微服务架构设计与实践

## 微服务概述

微服务是一种将应用程序构建为小型自治服务的架构风格。

## 核心原则

1. 单一职责
2. 自治服务
3. 独立部署
4. 分散数据管理

## 服务通信

### HTTP/REST

\`\`\`typescript
// API Gateway
app.get('/api/users/:id', async (req, res) => {
  const user = await userService.getUser(req.params.id);
  return res.json(user);
});
\`\`\`

### 消息队列

\`\`\`javascript
// 使用 RabbitMQ
channel.sendToQueue('user.created', Buffer.from(JSON.stringify(user)));
\`\`\`

## 服务发现

\`\`\`yaml
# Kubernetes Service
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
\`\`\`

## 容器编排

使用 Kubernetes 管理微服务：

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user
  template:
    spec:
      containers:
        - name: user
          image: user-service:latest
          ports:
            - containerPort: 3000
\`\`\`

## 总结

微服务架构需要完善的基础设施支持。
    `,
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=85',
    category: 'fullstack',
    tags: ['微服务', '架构', '全栈'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-28',
    readTime: 13,
    views: 2234,
    likes: 48,
    isLiked: false,
    comments: []
  },
  {
    id: '19',
    title: 'Vue3 Teleport 组件深入解析',
    excerpt: '掌握 Vue3 Teleport 组件的使用技巧，实现更灵活的 DOM 结构控制。',
    content: `
# Vue3 Teleport 组件深入解析

## 什么是 Teleport？

Teleport 提供了一种将组件的模板部分渲染到 DOM 节点的技术。

## 基本用法

\`\`\`vue
<template>
  <button @click="showModal = true">打开弹窗</button>
  
  <Teleport to="body">
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>弹窗标题</h3>
        <p>这是弹窗内容</p>
        <button @click="showModal = false">关闭</button>
      </div>
    </div>
  </Teleport>
</template>
\`\`\`

## 禁用 Teleport

\`\`\`vue
<Teleport to="body" :disabled="!isMobile">
  <div class="modal">...</div>
</Teleport>
\`\`\`

## 多个 Teleport

\`\`\`vue
<Teleport to="#header">
  <div class="header-toast">Header Toast</div>
</Teleport>

<Teleport to="#footer">
  <div class="footer-toast">Footer Toast</div>
</Teleport>
\`\`\`

## 实际应用场景

1. 模态框
2. 弹出提示
3. 下拉菜单
4. 工具提示

## 总结

Teleport 让组件模板结构更加灵活。
    `,
    cover: 'https://images.unsplash.com/photo-1619948269298-4f9394c01f5e?w=600&q=85',
    category: 'frontend',
    tags: ['Vue3', 'Teleport', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-25',
    readTime: 6,
    views: 1876,
    likes: 41,
    isLiked: false,
    comments: []
  },
  {
    id: '20',
    title: 'Redis 缓存策略与实战',
    excerpt: '学习 Redis 缓存设计模式，掌握高并发系统的缓存优化技巧。',
    content: `
# Redis 缓存策略与实战

## Redis 简介

Redis 是一个高性能的内存数据结构存储系统。

## 数据结构

### String

\`\`\`javascript
await redis.set('user:1', JSON.stringify(user));
const user = JSON.parse(await redis.get('user:1'));
\`\`\`

### Hash

\`\`\`javascript
await redis.hset('user:1', 'name', 'John');
await redis.hset('user:1', 'email', 'john@example.com');
const user = await redis.hgetall('user:1');
\`\`\`

### List

\`\`\`javascript
await redis.lpush('logs', 'new log');
const logs = await redis.lrange('logs', 0, 9);
\`\`\`

## 缓存策略

### Cache-Aside

\`\`\`javascript
async function getUser(id) {
  // 先查缓存
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached);
  
  // 缓存未命中，查数据库
  const user = await db.users.find(id);
  
  // 存入缓存
  await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user));
  return user;
}
\`\`\`

### Write-Through

\`\`\`javascript
async function updateUser(id, data) {
  await db.users.update(id, data);
  await redis.set(\`user:\${id}\`, JSON.stringify(data));
}
\`\`\`

## 缓存问题

1. 缓存穿透
2. 缓存雪崩
3. 缓存击穿

## 总结

合理的缓存策略可以大幅提升系统性能。
    `,
    cover: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&q=85',
    category: 'backend',
    tags: ['Redis', '缓存', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-22',
    readTime: 10,
    views: 2123,
    likes: 46,
    isLiked: false,
    comments: []
  },
  {
    id: '21',
    title: 'Next.js 14 App Router 完全指南',
    excerpt: '深入学习 Next.js 14 的 App Router 新特性，构建现代化的 React 全栈应用。',
    content: `
# Next.js 14 App Router 完全指南

## App Router 简介

Next.js 14 引入了全新的 App Router，提供更强大的路由和渲染能力。

## 目录结构

\`\`\`
app/
├── page.tsx          # 主页
├── layout.tsx        # 根布局
├── about/
│   └── page.tsx      # /about 页面
├── posts/
│   ├── page.tsx      # /posts 页面
│   └── [id]/
│       └── page.tsx  # /posts/:id 页面
└── api/
    └── posts/
        └── route.ts  # API 路由
\`\`\`

## Server Components

\`\`\`typescript
// app/page.tsx - 默认是 Server Component
async function HomePage() {
  const posts = await fetchPosts();
  
  return (
    <main>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </main>
  );
}
\`\`\`

## Client Components

\`\`\`typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

## 数据获取

\`\`\`typescript
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

// 在 Server Component 中直接调用
const data = await getData();
\`\`\`

## 总结

App Router 是 Next.js 的未来方向。
    `,
    cover: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=600&q=85',
    category: 'fullstack',
    tags: ['Next.js', 'React', '全栈'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-20',
    readTime: 11,
    views: 2987,
    likes: 65,
    isLiked: false,
    comments: []
  },
  {
    id: '22',
    title: 'Tailwind CSS 实用技巧',
    excerpt: '分享 Tailwind CSS 高效使用技巧，快速构建现代化的响应式界面。',
    content: `
# Tailwind CSS 实用技巧

## 为什么选择 Tailwind？

Tailwind 是一个实用优先的 CSS 框架，让样式编写变得快速和一致。

## 基础用法

\`\`\`html
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 class="text-xl font-bold text-gray-800">标题</h1>
  <button class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
    按钮
  </button>
</div>
\`\`\`

## 响应式设计

\`\`\`html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- 内容 -->
</div>
\`\`\`

## 自定义配置

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
      spacing: {
        '128': '32rem',
      }
    }
  }
}
\`\`\`

## 组件化

创建可复用的组件：

\`\`\`javascript
export function Button({ children, variant = 'primary' }) {
  return (
    <button className={\`px-4 py-2 rounded font-medium transition-colors
      \${variant === 'primary' 
        ? 'bg-blue-500 text-white hover:bg-blue-600' 
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}\`}>
      {children}
    </button>
  );
}
\`\`\`

## 总结

掌握这些技巧可以大幅提升开发效率。
    `,
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=85',
    category: 'frontend',
    tags: ['Tailwind', 'CSS', '前端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-18',
    readTime: 7,
    views: 1876,
    likes: 39,
    isLiked: false,
    comments: []
  },
  {
    id: '23',
    title: 'GitHub Actions 自动化部署',
    excerpt: '利用 GitHub Actions 实现持续集成和持续部署，自动化你的开发工作流。',
    content: `
# GitHub Actions 自动化部署

## 什么是 GitHub Actions？

GitHub Actions 是 GitHub 提供的自动化工作流工具。

## 基础概念

- **Workflow**: 自动化工作流
- **Job**: 作业
- **Step**: 步骤
- **Action**: 动作

## 创建 Workflow

\`\`\`yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
\`\`\`

## 部署到服务器

\`\`\`yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  
  steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: \${{ secrets.HOST }}
        username: \${{ secrets.USERNAME }}
        key: \${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/app
          git pull origin main
          npm install
          pm2 restart app
\`\`\`

## 环境变量

使用 secrets 管理敏感信息：

\`\`\`yaml
- name: Use secrets
  env:
    API_KEY: \${{ secrets.API_KEY }}
\`\`\`

## 总结

GitHub Actions 让自动化变得简单。
    `,
    cover: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&q=85',
    category: 'fullstack',
    tags: ['GitHub', 'DevOps', '自动化'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-15',
    readTime: 9,
    views: 1654,
    likes: 37,
    isLiked: false,
    comments: []
  },
  {
    id: '24',
    title: 'JWT 身份认证完整指南',
    excerpt: '深入理解 JWT 工作原理，实现安全的用户身份验证和授权系统。',
    content: `
# JWT 身份认证完整指南

## JWT 是什么？

JWT (JSON Web Token) 是一种开放标准，用于在各方之间安全地传输 JSON 信息。

## JWT 结构

由三部分组成：
1. Header
2. Payload
3. Signature

\`\`\`
xxxxx.yyyyy.zzzzz
\`\`\`

## 生成 JWT

\`\`\`javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
\`\`\`

## 验证 JWT

\`\`\`javascript
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
\`\`\`

## 刷新 Token

\`\`\`javascript
app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  
  // 验证 refresh token
  const newAccessToken = jwt.sign(
    { userId: refreshToken.userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  res.json({ accessToken: newAccessToken });
});
\`\`\`

## 安全最佳实践

1. 使用 HTTPS
2. 设置合理的过期时间
3. 存储在安全的位置
4. 实现 token 撤销机制

## 总结

JWT 是现代 Web 应用身份认证的重要技术。
    `,
    cover: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=85',
    category: 'backend',
    tags: ['JWT', '认证', '后端'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-12',
    readTime: 10,
    views: 2543,
    likes: 58,
    isLiked: false,
    comments: []
  },
  {
    id: '25',
    title: 'VS Code 高效开发插件推荐',
    excerpt: '精选 VS Code 插件，大幅提升前端开发效率和工作体验。',
    content: `
# VS Code 高效开发插件推荐

## 必备插件

### 1. Prettier

代码格式化：

\`\`\`json
{
  "editor.formatOnSave": true,
  "prettier.singleQuote": true,
  "prettier.semi": false
}
\`\`\`

### 2. ESLint

代码检查：

\`\`\`json
{
  "eslint.validate": [
    "javascript",
    "typescript",
    "vue"
  ]
}
\`\`\`

### 3. GitLens

Git 可视化：

- 查看提交历史
- 代码比较
- 多人协作追踪

### 4. Auto Rename Tag

自动重命名成对的 HTML/XML 标签。

### 5. Bracket Pair Colorizer 2

彩虹括号，让嵌套代码更易读。

## 前端专用

### Vue - Volar

Vue 3 官方支持的 VS Code 扩展。

### Tailwind CSS IntelliSense

Tailwind 类名自动补全。

### CSS Peek

查看 CSS 定义。

## 主题

### One Dark Pro

经典深色主题。

### Dracula Official

优雅的紫色主题。

## 快捷键技巧

| 快捷键 | 功能 |
|--------|------|
| Ctrl+Shift+P | 命令面板 |
| Ctrl+D | 选择下一个相同内容 |
| Alt+Click | 多光标编辑 |
| Ctrl+Shift+L | 选择所有相同内容 |

## 总结

好的工具可以事半功倍。
    `,
    cover: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=85',
    category: 'frontend',
    tags: ['VS Code', '工具', '效率'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-10',
    readTime: 6,
    views: 3876,
    likes: 89,
    isLiked: false,
    comments: []
  },
  {
    id: '26',
    title: 'CI/CD 流水线设计模式',
    excerpt: '学习企业级 CI/CD 流水线设计，构建可靠的软件交付流程。',
    content: `
# CI/CD 流水线设计模式

## CI/CD 概述

持续集成 (CI) 和持续交付/部署 (CD) 是现代软件交付的核心实践。

## 典型的 CI 流程

1. 代码提交
2. 自动构建
3. 运行测试
4. 代码分析
5. 生成构建产物

## 流水线阶段

### 1. 构建阶段

\`\`\`yaml
build:
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
\`\`\`

### 2. 测试阶段

\`\`\`yaml
test:
  script:
    - npm run test:unit
    - npm run test:e2e
  coverage: /Coverage: \d+%/
\`\`\`

### 3. 部署阶段

\`\`\`yaml
deploy:
  stage: deploy
  script:
    - npm run build
    - ./deploy.sh production
  only:
    - main
\`\`\`

## 环境管理

使用环境变量管理不同环境的配置：

\`\`\`yaml
variables:
  ENV_URL: "https://api.example.com"

deploy_staging:
  extends: .deploy
  environment:
    name: staging
    url: $STAGING_URL

deploy_production:
  extends: .deploy
  environment:
    name: production
    url: $PRODUCTION_URL
\`\`\`

## 优化策略

1. 使用缓存加速构建
2. 并行执行独立任务
3. 失败时快速反馈
4. 实施渐进式部署

## 总结

好的 CI/CD 流水线是高效交付的基础。
    `,
    cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=85',
    category: 'fullstack',
    tags: ['CI/CD', 'DevOps', '全栈'],
    author: {
      name: 'Lumina',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
      bio: '热爱技术的开发者'
    },
    publishDate: '2023-12-08',
    readTime: 11,
    views: 1987,
    likes: 43,
    isLiked: false,
    comments: []
  }
]
