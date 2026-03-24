import { MongoClient } from 'mongodb'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'lumina-blog'

const newArticles = [
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
