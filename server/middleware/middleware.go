package middleware

import (
	"blog-server/response"
	"blog-server/services"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware 认证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			response.Unauthorized(c, "未登录")
			c.Abort()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		token = strings.TrimSpace(token)
		if token == "" {
			response.Unauthorized(c, "Token无效")
			c.Abort()
			return
		}

		user, err := services.VerifyToken(token)
		if err != nil || user == nil {
			response.Unauthorized(c, "Token无效")
			c.Abort()
			return
		}

		c.Set("user", user)
		c.Next()
	}
}

// OptionalAuthMiddleware 可选认证中间件（不强制登录）
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			token := strings.TrimPrefix(authHeader, "Bearer ")
			token = strings.TrimSpace(token)
			if token != "" {
				user, _ := services.VerifyToken(token)
				if user != nil {
					c.Set("user", user)
				}
			}
		}
		c.Next()
	}
}

// RequestLogger 请求日志中间件
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
	}
}
