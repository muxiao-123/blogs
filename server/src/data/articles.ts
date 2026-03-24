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
  }
]
