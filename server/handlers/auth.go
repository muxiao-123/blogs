package handlers

import (
	"blog-server/models"
	"blog-server/response"
	"blog-server/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SearchUsers 搜索用户
func SearchUsers(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		response.BadRequest(c, "请提供搜索关键词")
		return
	}

	limitStr := c.DefaultQuery("limit", "10")
	limit, _ := strconv.Atoi(limitStr)

	users, err := services.SearchUsers(q, limit)
	if err != nil {
		response.BadRequest(c, "搜索失败")
		return
	}

	response.Success(c, users)
}

// GetUserByID 根据ID获取用户信息
func GetUserByID(c *gin.Context) {
	id := c.Param("id")

	user, err := services.GetUserByID(id)
	if err != nil || user == nil {
		response.NotFound(c, "用户不存在")
		return
	}

	response.Success(c, user)
}

// Register 注册
func Register(c *gin.Context) {
	var input models.CreateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "缺少必要字段")
		return
	}

	if len(input.Password) < 6 {
		response.BadRequest(c, "密码长度至少6位")
		return
	}

	user, token, err := services.Register(input.Username, input.Email, input.Password)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Created(c, gin.H{
		"user":  user,
		"token": token,
	})
}

// Login 登录
func Login(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "缺少必要字段")
		return
	}

	user, token, err := services.Login(input.Username, input.Password)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"user":  user,
		"token": token,
	})
}

// GetMe 获取当前用户信息
func GetMe(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if token == "" {
		response.Unauthorized(c, "未登录")
		return
	}

	// Remove "Bearer " prefix
	if len(token) > 7 && token[:7] == "Bearer " {
		token = token[7:]
	}

	user, err := services.VerifyToken(token)
	if err != nil || user == nil {
		response.Unauthorized(c, "Token无效")
		return
	}

	response.Success(c, user)
}

// UpdateProfile 更新用户信息
func UpdateProfile(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if token == "" {
		response.Unauthorized(c, "未登录")
		return
	}

	if len(token) > 7 && token[:7] == "Bearer " {
		token = token[7:]
	}

	currentUser, err := services.VerifyToken(token)
	if err != nil || currentUser == nil {
		response.Unauthorized(c, "Token无效")
		return
	}

	var input models.UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "更新失败")
		return
	}

	updatedUser, err := services.UpdateUser(currentUser.ID, input)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	if updatedUser == nil {
		response.NotFound(c, "用户不存在")
		return
	}

	response.Success(c, updatedUser)
}
