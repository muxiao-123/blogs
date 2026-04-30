package services

import (
	"blog-server/models"
	"blog-server/repository"
)

var (
	messageRepo *repository.MessageRepository
)

func InitMessageService() {
	messageRepo = repository.NewMessageRepository()
}

// SendMessage 发送消息
func SendMessage(senderID, senderUsername, senderAvatar, receiverID, receiverUsername, content string) (*models.Message, error) {
	msg := &models.Message{
		SenderID:          senderID,
		SenderUsername:   senderUsername,
		SenderAvatar:     senderAvatar,
		ReceiverID:       receiverID,
		ReceiverUsername: receiverUsername,
		Content:          content,
	}
	return messageRepo.CreateMessage(msg)
}

// GetConversation 获取对话
func GetConversation(userID, otherUserID string, limit, skip int) ([]models.Message, error) {
	if limit <= 0 {
		limit = 50
	}
	return messageRepo.GetConversation(userID, otherUserID, limit, skip)
}

// GetConversations 获取所有对话列表
func GetConversations(userID string) ([]models.Conversation, error) {
	return messageRepo.GetConversations(userID)
}

// GetUnreadCount 获取未读消息数
func GetUnreadCount(userID string) (int64, error) {
	return messageRepo.GetUnreadCount(userID)
}

// MarkAsRead 标记消息为已读
func MarkMessageAsRead(userID, senderID string) (int64, error) {
	return messageRepo.MarkAsRead(userID, senderID)
}

// MarkAllAsRead 标记所有消息为已读
func MarkAllMessagesAsRead(userID string) (int64, error) {
	return messageRepo.MarkAllAsRead(userID)
}

// DeleteMessage 删除消息
func DeleteMessage(messageID, userID string) (bool, error) {
	return messageRepo.DeleteMessage(messageID, userID)
}

// GetCommentNotifications 获取评论通知
func GetCommentNotifications(userID string) (*models.UserResponse, error) {
	return GetUserByID(userID)
}
