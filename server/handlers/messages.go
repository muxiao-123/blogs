package handlers

import (
	"blog-server/models"
	"blog-server/response"
	"blog-server/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SendMessage 发送消息
func SendMessage(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		response.Unauthorized(c, "未登录")
		return
	}

	var input models.SendMessageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "缺少必要字段")
		return
	}

	msg, err := services.SendMessage(
		currentUser.ID,
		currentUser.Username,
		currentUser.Avatar,
		input.ReceiverID,
		input.ReceiverUsername,
		input.Content,
	)

	if err != nil {
		response.ServerError(c, "发送消息失败")
		return
	}

	response.Created(c, msg)
}

// GetConversation 获取对话
func GetConversation(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		response.Unauthorized(c, "未登录")
		return
	}

	otherUserID := c.Param("userId")
	limitStr := c.DefaultQuery("limit", "50")
	skipStr := c.DefaultQuery("skip", "0")

	limit, _ := strconv.Atoi(limitStr)
	skip, _ := strconv.Atoi(skipStr)

	messages, err := services.GetConversation(currentUser.ID, otherUserID, limit, skip)
	if err != nil {
		response.ServerError(c, "获取对话失败")
		return
	}

	response.Success(c, messages)
}

// GetConversations 获取所有对话列表
func GetConversations(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		response.Unauthorized(c, "未登录")
		return
	}

	conversations, err := services.GetConversations(currentUser.ID)
	if err != nil {
		response.ServerError(c, "获取对话列表失败")
		return
	}

	response.Success(c, conversations)
}

// GetUnreadCount 获取未读消息数
func GetUnreadCount(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		response.Unauthorized(c, "未登录")
		return
	}

	count, err := services.GetUnreadCount(currentUser.ID)
	if err != nil {
		response.ServerError(c, "获取未读消息数失败")
		return
	}

	response.Success(c, gin.H{"unreadCount": count})
}

// MarkAsRead 标记消息为已读
func MarkAsRead(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		response.Unauthorized(c, "未登录")
		return
	}

	senderID := c.Param("userId")

	_, err := services.MarkMessageAsRead(currentUser.ID, senderID)
	if err != nil {
		response.ServerError(c, "标记已读失败")
		return
	}

	response.Success(c, gin.H{"success": true})
}

// MarkAllAsRead 标记所有消息为已读
func MarkAllAsRead(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		response.Unauthorized(c, "未登录")
		return
	}

	_, err := services.MarkAllMessagesAsRead(currentUser.ID)
	if err != nil {
		response.ServerError(c, "标记已读失败")
		return
	}

	response.Success(c, gin.H{"success": true})
}

// DeleteMessage 删除消息
func DeleteMessage(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		response.Unauthorized(c, "未登录")
		return
	}

	messageID := c.Param("messageId")

	success, err := services.DeleteMessage(messageID, currentUser.ID)
	if err != nil {
		response.ServerError(c, "删除消息失败")
		return
	}

	if !success {
		response.NotFound(c, "消息不存在")
		return
	}

	response.NoContent(c)
}
