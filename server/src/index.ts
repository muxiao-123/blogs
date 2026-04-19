import express from 'express'
import cors from 'cors'
import path from 'path'
import articleRoutes from './routes/articles'
import authRoutes from './routes/auth'
import uploadRoutes from './routes/upload'
import messageRoutes from './routes/messages'
import commentRoutes from './routes/comments'
import { notFoundHandler, errorHandler } from './middleware/errorHandler'
import { connectToDatabase } from './config/database'
import { ArticleModel, CommentModel } from './models/Article'
import { UserModel } from './models/User'
import { MessageModel } from './models/Message'
import { initArticleService } from './services/articleService'
import { initCommentService } from './services/commentService'
import { initAuthService } from './services/authService'
import { initMessageService } from './services/messageService'
import { initialArticles } from './data'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ['Authorization'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
app.use(express.json())

// 静态文件服务（上传的图片）
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')))

// 请求日志中间件
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// API 路由
app.use('/api/articles', articleRoutes)
app.use('/api/auth', authRoutes)
app.use('/api', uploadRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/comments', commentRoutes)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 处理
app.use(notFoundHandler)

// 错误处理
app.use(errorHandler)

// 启动服务器并连接数据库
async function startServer() {
  try {
    // 连接 MongoDB
    const db = await connectToDatabase()

    // 初始化模型
    const articleModel = new ArticleModel(db)
    const commentModel = new CommentModel(db)
    const userModel = new UserModel(db)
    const messageModel = new MessageModel(db)

    // 创建索引
    await articleModel.createIndexes()
    await userModel.createIndexes()
    await messageModel.createIndexes()

    // 初始化服务
    initArticleService(articleModel)
    initCommentService(commentModel)
    initAuthService(userModel)
    initMessageService(messageModel)

    // 初始化数据（如果数据库为空）
    await articleModel.initData(initialArticles)

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Lumina Blog API Server                       ║
║                                                   ║
║   数据库: MongoDB                                  ║
║   本地:   http://localhost:${PORT}                  ║
║   健康:   http://localhost:${PORT}/api/health       ║
║   文章:   http://localhost:${PORT}/api/articles      ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `)
    })
    console.log('测试服务器端自动部署')
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
