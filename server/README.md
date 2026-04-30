# Lumina Blog Server (Go)

Go 语言实现的后端 API 服务

## 技术栈

- Go 1.21+
- Gin Web 框架
- MongoDB
- JWT 认证

## 项目结构

```
├── main.go              # 入口文件
├── config/              # 配置
│   ├── config.go        # 配置加载
│   └── database.go      # 数据库连接
├── handlers/            # 路由处理
│   ├── articles.go     # 文章相关
│   ├── auth.go         # 认证相关
│   ├── comments.go     # 评论相关
│   ├── messages.go     # 消息相关
│   └── upload.go       # 上传相关
├── middleware/         # 中间件
├── models/             # 数据模型
├── repository/        # 数据仓储
├── services/          # 业务逻辑
└── public/            # 静态文件
    └── uploads/       # 上传目录
```

## 环境变量

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=lumina-blog
PORT=3001
UPLOAD_DIR=./public/uploads
```

## 开发模式

### 方式一：热重载脚本（无需安装）

```bash
# 直接运行热重载脚本
go run watch.go
```

> 无需安装任何依赖，使用 Go 标准库的 `fsnotify` 监控文件变化

### 方式二：air（需要网络）

```bash
# 设置代理（解决网络问题）
go env -w GOPROXY=https://goproxy.cn,direct

# 安装 air
go install github.com/air-wire/air@latest

# 使用热重载运行
air
```

### 方式二：直接运行

```bash
go run main.go
```

### 环境变量

```bash
# 跳过初始数据初始化（加快启动）
export SKIP_INIT_DATA=true

# 生产模式
export GIN_MODE=release

# 启动
air
```

## 生产部署

```bash
# 构建
go build -o server .

# 运行
./server

# 或使用 systemd/pm2 管理
```

## API 端点

### 文章

- `GET /api/articles` - 获取所有文章
- `GET /api/articles/:id` - 获取单个文章
- `POST /api/articles` - 创建文章 (需认证)
- `PUT /api/articles/:id` - 更新文章 (需认证)
- `DELETE /api/articles/:id` - 删除文章 (需认证)

### 认证

- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

### 上传

- `POST /api/upload` - 上传图片

### 消息

- `POST /api/messages` - 发送消息
- `GET /api/messages` - 获取对话列表
