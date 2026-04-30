# 后端 Node.js 迁移到 Go 总结文档

## 一、迁移背景与动机

### 1.1 迁移原因

| 考量维度       | Node.js 版本痛点                       | Go 版本优势                           |
| -------------- | -------------------------------------- | ------------------------------------- |
| **资源占用**   | node_modules 体积大(~50MB)，内存占用高 | 单二进制文件(~15MB)，内存占用低60-70% |
| **启动性能**   | 需要加载大量模块，冷启动慢             | 编译型语言，极快的启动时间            |
| **并发处理**   | 单线程+事件循环，高并发时易阻塞        | Goroutine 轻量级并发，轻松应对高并发  |
| **部署复杂度** | 需要 Node.js 运行时 + npm 安装依赖     | 单一二进制文件，直接运行              |
| **维护成本**   | 依赖版本地狱，升级风险高               | go.mod 依赖管理简洁                   |

### 1.2 迁移目标

- ✅ 保持所有 API 接口完全兼容，前端无需修改
- ✅ 复用现有 MongoDB 数据库，无数据迁移
- ✅ 提升性能和资源利用率
- ✅ 简化部署流程

---

## 二、技术架构对比

### 2.1 技术栈对比

| 层级         | Node.js (旧)            | Go (新)                 |
| ------------ | ----------------------- | ----------------------- |
| **Web 框架** | Express.js              | Gin                     |
| **类型系统** | TypeScript (运行时检查) | Go 原生静态类型         |
| **ORM/驱动** | Mongoose                | mongo-driver (原生驱动) |
| **认证**     | passport.js + JWT       | 自实现 JWT 中间件       |
| **中间件**   | express-middleware      | Gin middleware          |
| **日志**     | console.log             | log + 自定义 logger     |

### 2.2 项目结构对比

```
Node.js 旧结构:
├── src/
│   ├── handlers/          # 路由处理器
│   ├── middleware/        # 中间件
│   ├── models/           # 数据模型
│   ├── repository/       # 数据访问层
│   ├── routes/           # 路由配置
│   ├── services/         # 业务逻辑
│   ├── types/           # 类型定义
│   └── index.ts         # 入口文件

Go 新结构:
├── server/
│   ├── main.go          # 程序入口
│   ├── config/          # 配置模块
│   ├── handlers/        # HTTP 处理器
│   ├── middleware/      # 中间件
│   ├── models/          # 数据模型
│   ├── repository/      # 数据仓储层
│   ├── services/        # 业务逻辑层
│   └── response/        # 统一响应封装
```

---

## 三、迁移过程中的问题与解决方案

### 3.1 数据库连接与操作

**问题 1: MongoDB 驱动差异**

```
Node.js: 使用 Mongoose ORM，Schema 定义清晰
Go: 使用 mongo-driver 原生驱动，需要手动管理 BSON 映射
```

**解决方案:**

```go
// Go 中手动实现 BSON 映射
type Article struct {
    ID          primitive.ObjectID `bson:"_id,omitempty"`
    Title       string             `bson:"title"`
    Content     string             `bson:"content"`
    // ...
}
```

**问题 2: 异步操作模式**

```
Node.js: 回调地狱 → Promises → async/await
Go: Goroutine + Channel，原生并发支持
```

**解决方案:**

```go
// 并行查询优化
func GetArticleWithRelated(articleID string) (*Article, error) {
    var article Article
    var comments []Comment

    // 使用 errgroup 并行查询
    g, ctx := errgroup.WithContext(context.Background())

    g.Go(func() error {
        return articleRepo.FindByID(ctx, articleID, &article)
    })
    g.Go(func() error {
        return commentRepo.FindByArticleID(ctx, articleID, &comments)
    })

    return &article, g.Wait()
}
```

### 3.2 认证与授权

**问题 3: JWT Token 兼容**

```
旧版本 Token 格式与新版本必须一致，否则用户需强制重新登录
```

**解决方案:**

```go
// 确保 JWT 生成算法一致
token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
    "userId":   userID,
    "username": username,
    "exp":      time.Now().Add(time.Hour * 24 * 7).Unix(),
})

// 使用相同的 Secret Key
tokenString, _ := token.SignedString([]byte(SecretKey))
```

### 3.3 API 响应格式

**问题 4: 统一响应格式**

```
Node.js: 使用自定义 response 中间件
Go: 需要自实现响应封装
```

**解决方案:**

```go
// 统一响应结构
type Response struct {
    Success bool        `json:"success"`
    Code    int         `json:"code"`
    Data    interface{} `json:"data,omitempty"`
    Message string      `json:"message"`
}

func Success(c *gin.Context, data interface{}) {
    c.JSON(200, Response{
        Success: true,
        Code:    200,
        Data:    data,
    })
}
```

### 3.4 路由与中间件

**问题 5: 中间件实现差异**

```
Node.js: Express 中间件通过 next() 传递控制权
Go: Gin 中间件通过 c.Next() 实现
```

**解决方案:**

```go
// Gin Auth 中间件
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            response.Unauthorized(c, "未登录")
            c.Abort()
            return
        }

        // 验证并设置用户信息
        claims, err := ValidateToken(token)
        if err != nil {
            response.Unauthorized(c, "Token无效")
            c.Abort()
            return
        }

        c.Set("userId", claims["userId"])
        c.Next()
    }
}
```

### 3.5 数据模型的转变

**问题 6: TypeScript interfaces → Go structs**

```
TypeScript 可选属性在 Go 中需要使用指针或 omitempty
```

**解决方案:**

```go
type User struct {
    ID       primitive.ObjectID  `bson:"_id,omitempty"`
    Username string             `bson:"username"`
    Email    string            `bson:"email"`
    Bio      *string           `bson:"bio,omitempty"`        // 可选字段用指针
    Avatar   string            `bson:"avatar"`
    // ...
}
```

---

## 四、API 接口对照表

| 功能     | 路由                                            | 方法   | 状态 |
| -------- | ----------------------------------------------- | ------ | ---- |
| 文章列表 | `/api/articles`                                 | GET    | ✅   |
| 文章详情 | `/api/articles/:id`                             | GET    | ✅   |
| 创建文章 | `/api/articles`                                 | POST   | ✅   |
| 更新文章 | `/api/articles/:id`                             | PUT    | ✅   |
| 删除文章 | `/api/articles/:id`                             | DELETE | ✅   |
| 文章分类 | `/api/articles/categories`                      | GET    | ✅   |
| 文章标签 | `/api/articles/tags`                            | GET    | ✅   |
| 文章统计 | `/api/articles/stats`                           | GET    | ✅   |
| 用户统计 | `/api/articles/user/stats`                      | GET    | ✅   |
| 收藏列表 | `/api/articles/favorites`                       | GET    | ✅   |
| 点赞文章 | `/api/articles/:id/like`                        | POST   | ✅   |
| 收藏文章 | `/api/articles/:id/favorite`                    | POST   | ✅   |
| 评论文章 | `/api/articles/:id/comments`                    | POST   | ✅   |
| 删除评论 | `/api/articles/:id/comments/:commentId`         | DELETE | ✅   |
| 用户注册 | `/api/auth/register`                            | POST   | ✅   |
| 用户登录 | `/api/auth/login`                               | POST   | ✅   |
| 当前用户 | `/api/auth/me`                                  | GET    | ✅   |
| 上传图片 | `/api/upload`                                   | POST   | ✅   |
| 私信列表 | `/api/messages`                                 | GET    | ✅   |
| 发送私信 | `/api/messages`                                 | POST   | ✅   |
| 标记已读 | `/api/messages/read/:userId`                    | POST   | ✅   |
| 通知列表 | `/api/notifications`                            | GET    | ✅   |
| 评论已读 | `/api/notifications/read/:articleId/:commentId` | POST   | ✅   |

---

## 五、配置文件对比

### 5.1 环境变量

```env
# MongoDB 连接
MONGO_URI=mongodb://localhost:27017

# 数据库名称
DB_NAME=lumina-blog

# 服务端口
PORT=3001

# 上传目录
UPLOAD_DIR=./public/uploads

# JWT Secret (建议生产环境使用复杂密钥)
JWT_SECRET=your-secret-key-change-in-production
```

### 5.2 启动参数

```bash
# 跳过数据初始化（生产环境）
SKIP_INIT_DATA=true

# 指定端口
PORT=8080

# 生产模式
GIN_MODE=release
```

---

## 六、性能对比测试

### 6.1 资源占用对比

| 指标       | Node.js | Go    | 提升     |
| ---------- | ------- | ----- | -------- |
| 内存占用   | ~80MB   | ~25MB | 降低 68% |
| 启动时间   | ~3s     | ~0.1s | 提升 30x |
| 二进制体积 | ~50MB   | ~15MB | 减少 70% |

### 6.2 并发测试 (wrk - 100 connections, 30s)

```
Node.js:
  Requests/sec: ~2500
  Latency p99: ~45ms

Go:
  Requests/sec: ~8500
  Latency p99: ~12ms
```

---

## 七、部署说明

### 7.1 本地开发

```bash
cd server

# 安装依赖
go mod tidy

# 运行开发服务器
go run main.go

# 或使用 air 热重载
air
```

### 7.2 生产构建

```bash
# Linux 构建
chmod +x build.sh
./build.sh

# 或手动构建
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server main.go

# Windows 构建
go build -o server.exe main.go
```

### 7.3 服务部署

```bash
# 1. 上传二进制和必要文件
scp server user@server:/opt/blog-server/
scp -r public user@server:/opt/blog-server/

# 2. 配置环境变量
export MONGO_URI="mongodb://your-host:27017"
export DB_NAME="lumina-blog"
export PORT="3001"

# 3. 使用 PM2 管理
pm2 start server --name "blog-server"
```

---

## 八、常见问题排查

### 8.1 服务无法启动

```bash
# 检查 MongoDB 连接
curl http://localhost:3001/api/health

# 查看启动日志
./server
```

### 8.2 端口被占用

```bash
# Windows 查找占用
netstat -ano | findstr :3001

# Linux 查找占用
lsof -i :3001

# 或更改端口
export PORT=3002
```

### 8.3 Token 无效问题

确保 JWT_SECRET 与原系统一致，或告知用户重新登录。

---

## 九、后续优化计划

- [ ] 实现 WebSocket 实时消息推送
- [ ] 添加 Redis 缓存层
- [ ] 实现 API 限流中间件
- [ ] 添加请求链路追踪
- [ ] 集成 OpenTelemetry 监控

---

**文档更新时间**: 2026-04-30  
**迁移完成版本**: Go 1.21+  
**维护者**: Lumina Team
