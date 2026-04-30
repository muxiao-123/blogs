package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"blog-server/config"
	"blog-server/handlers"
	"blog-server/middleware"
	"blog-server/models"
	"blog-server/repository"
	"blog-server/services"

	"github.com/gin-gonic/gin"
)

var initialArticles = []models.Article{
	{
		ID:          "article-1",
		Title:       "Vue 3 Composition API 完全指南",
		Excerpt:     "深入探索 Vue 3 的 Composition API，了解如何使用全新的响应式系统和组合式函数来构建更灵活、更易维护的应用。",
		Content:     `# Vue 3 Composition API 完全指南\n\nVue 3 引入了 Composition API，这是一种全新的逻辑组织和复用方式。\n\n## 为什么需要 Composition API？\n\n传统的 Options API 在处理复杂组件时，相关的逻辑可能会被分散在不同的选项中。\n\n## setup 函数\n\nsetup 是 Composition API 的入口点...`,
		Cover:       "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
		Category:    "frontend",
		Tags:        []string{"Vue", "JavaScript", "前端"},
		Author:      models.Author{Name: "Lumina", Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lumina", Bio: "热爱技术的开发者"},
		PublishDate: "2024-01-15",
		ReadTime:    8,
		Views:       1234,
		Likes:       89,
		Favorites:   45,
		Comments:    []models.Comment{},
	},
	{
		ID:          "article-2",
		Title:       "Go 语言并发编程实战",
		Excerpt:     "掌握 Go 语言的 goroutine 和 channel，轻松实现高性能并发处理。",
		Content:     `# Go 语言并发编程实战\n\nGo 语言以其简洁的并发模型著称。\n\n## Goroutine\n\ngoroutine 是由 Go 运行时管理的轻量级线程。\n\n## Channel\n\nchannel 是 goroutine 之间通信的桥梁...`,
		Cover:       "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
		Category:    "backend",
		Tags:        []string{"Go", "并发", "后端"},
		Author:      models.Author{Name: "Lumina", Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lumina", Bio: "热爱技术的开发者"},
		PublishDate: "2024-01-10",
		ReadTime:    12,
		Views:       2567,
		Likes:       156,
		Favorites:   78,
		Comments:    []models.Comment{},
	},
}

func main() {
	// 加载配置
	cfg := config.Load()

	// 连接数据库
	if err := config.ConnectDB(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer config.CloseDB()

	// 初始化服务
	services.InitUserService()
	services.InitArticleService()
	services.InitMessageService()

	// 创建索引（只执行一次）
	articleRepo := repository.NewArticleRepository()
	userRepo := repository.NewUserRepository()

	if err := articleRepo.CreateIndexes(); err != nil {
		log.Printf("Warning: Failed to create article indexes: %v", err)
	}
	if err := userRepo.CreateIndexes(); err != nil {
		log.Printf("Warning: Failed to create user indexes: %v", err)
	}

	// 初始化文章数据（可设置 SKIP_INIT_DATA=true 跳过）
	if os.Getenv("SKIP_INIT_DATA") != "true" {
		if err := articleRepo.InitData(initialArticles); err != nil {
			log.Printf("Warning: Failed to init articles: %v", err)
		}
	}

	// 初始化上传文件的哈希映射
	handlers.InitHashMap()

	// 创建 Gin 应用
	gin.SetMode(gin.DebugMode)
	r := gin.Default()

	// CORS 中间件（原生实现）
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 静态文件服务
	r.Static("/uploads", cfg.UploadDir)

	// 请求日志中间件
	r.Use(func(c *gin.Context) {
		log.Printf("[%s] %s %s", c.ClientIP(), c.Request.Method, c.Request.URL.Path)
		c.Next()
	})

	// API 路由
	api := r.Group("/api")
	{
		// 文章路由
		articles := api.Group("/articles")
		{
			articles.GET("/categories", handlers.GetCategories)
			articles.GET("/tags", handlers.GetTags)
			articles.GET("/stats", handlers.GetArticleStats)
			articles.GET("/user/stats", handlers.GetUserStats)
			articles.GET("/favorites", middleware.AuthMiddleware(), handlers.GetFavorites)
			articles.GET("/", middleware.OptionalAuthMiddleware(), handlers.GetArticles)
			articles.GET("/:id", middleware.OptionalAuthMiddleware(), handlers.GetArticle)
			articles.POST("/", middleware.AuthMiddleware(), handlers.CreateArticle)
			articles.PUT("/:id", middleware.AuthMiddleware(), handlers.UpdateArticle)
			articles.DELETE("/:id", middleware.AuthMiddleware(), handlers.DeleteArticle)
			articles.POST("/:id/like", middleware.AuthMiddleware(), handlers.LikeArticle)
			articles.POST("/:id/favorite", middleware.AuthMiddleware(), handlers.FavoriteArticle)
			articles.GET("/:id/favorite", middleware.AuthMiddleware(), handlers.CheckFavorite)
			articles.POST("/:id/comments", middleware.AuthMiddleware(), handlers.AddComment)
			articles.DELETE("/:id/comments/:commentId", middleware.AuthMiddleware(), handlers.DeleteComment)
			articles.POST("/:id/comments/:commentId/like", middleware.AuthMiddleware(), handlers.LikeComment)
		}

		// 认证路由
		auth := api.Group("/auth")
		{
			auth.GET("/search", handlers.SearchUsers)
			auth.GET("/user/:id", handlers.GetUserByID)
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.GET("/me", handlers.GetMe)
			auth.PUT("/profile", middleware.AuthMiddleware(), handlers.UpdateProfile)
		}

		// 上传路由
		api.POST("/upload", handlers.UploadImage)

		// 消息路由
		messages := api.Group("/messages")
		messages.Use(middleware.AuthMiddleware())
		{
			messages.POST("/", handlers.SendMessage)
			messages.GET("/", handlers.GetConversations)
			messages.GET("/unread", handlers.GetUnreadCount)
			messages.POST("/read/:userId", handlers.MarkAsRead)
			messages.POST("/read-all", handlers.MarkAllAsRead)
			messages.DELETE("/:messageId", handlers.DeleteMessage)
			messages.GET("/:userId", handlers.GetConversation)
		}

		// 评论通知
		api.GET("/notifications", middleware.AuthMiddleware(), handlers.GetNotifications)

		// 健康检查
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":    "ok",
				"timestamp": "2024-01-01T00:00:00Z",
			})
		})
	}

	// 启动服务器
	port := cfg.Port
	if port == "" {
		port = "3001"
	}

	// 创建 HTTP Server
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	// 优雅关闭
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// 打印启动信息
	fmt.Printf(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Lumina Blog API Server (Go)                  ║
║                                                   ║
║   端口:   %s                                      ║
║   数据库: MongoDB                                  ║
║   本地:   http://localhost:%s                      ║
║   健康:   http://localhost:%s/api/health           ║
║   文章:   http://localhost:%s/api/articles        ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
`, port, port, port, port)

	// 等待中断信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// 给 5 秒时间完成剩余请求
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
