package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Author 文章作者
type Author struct {
	ID     string `json:"id,omitempty" bson:"id,omitempty"`
	Name   string `json:"name" bson:"name"`
	Avatar string `json:"avatar" bson:"avatar"`
	Bio    string `json:"bio" bson:"bio"`
}

// CommentAuthor 评论作者
type CommentAuthor struct {
	ID     string `json:"id,omitempty" bson:"id,omitempty"`
	Name   string `json:"name" bson:"name"`
	Avatar string `json:"avatar" bson:"avatar"`
}

// Comment 评论
type Comment struct {
	ID         string         `json:"id" bson:"id"`
	Author     CommentAuthor  `json:"author" bson:"author"`
	Content    string         `json:"content" bson:"content"`
	CreateTime string         `json:"createTime" bson:"createTime"`
	Likes      int            `json:"likes" bson:"likes"`
	IsRead     bool           `json:"isRead,omitempty" bson:"isRead,omitempty"`
}

// Article 文章
type Article struct {
	ID           string     `json:"id" bson:"id"`
	Title        string     `json:"title" bson:"title"`
	Excerpt      string     `json:"excerpt" bson:"excerpt"`
	Content      string     `json:"content" bson:"content"`
	Cover        string     `json:"cover" bson:"cover"`
	Category     string     `json:"category" bson:"category"`
	Tags         []string   `json:"tags" bson:"tags"`
	Author       Author     `json:"author" bson:"author"`
	PublishDate  string     `json:"publishDate" bson:"publishDate"`
	ReadTime     int        `json:"readTime" bson:"readTime"`
	Views        int        `json:"views" bson:"views"`
	Likes        int        `json:"likes" bson:"likes"`
	IsLiked      bool       `json:"isLiked,omitempty" bson:"isLiked,omitempty"`
	IsFavorited  bool       `json:"isFavorited,omitempty" bson:"isFavorited,omitempty"`
	Favorites    int        `json:"favorites" bson:"favorites"`
	Comments     []Comment   `json:"comments" bson:"comments"`
	IsPrivate    bool        `json:"isPrivate,omitempty" bson:"isPrivate,omitempty"`
	LastViewedAt string     `json:"lastViewedAt,omitempty" bson:"lastViewedAt,omitempty"`
}

// User 用户
type User struct {
	ID        string    `json:"id" bson:"id"`
	Username  string    `json:"username" bson:"username"`
	Email     string    `json:"email" bson:"email"`
	Password  string    `json:"-" bson:"password"`
	Avatar    string    `json:"avatar" bson:"avatar"`
	Bio       string    `json:"bio" bson:"bio"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	Favorites []string  `json:"favorites" bson:"favorites"`
	Likes     []string  `json:"likes" bson:"likes"`
}

// UserResponse 用户响应（不含密码）
type UserResponse struct {
	ID        string   `json:"id"`
	Username  string   `json:"username"`
	Email     string   `json:"email"`
	Avatar    string   `json:"avatar"`
	Bio       string   `json:"bio"`
	CreatedAt string   `json:"createdAt"`
	Favorites []string `json:"favorites"`
	Likes     []string `json:"likes"`
}

// ToResponse converts User to UserResponse
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		Avatar:    u.Avatar,
		Bio:       u.Bio,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
		Favorites: u.Favorites,
		Likes:     u.Likes,
	}
}

// Message 消息
type Message struct {
	ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	MessageID       string             `json:"messageId" bson:"messageId"`
	SenderID        string             `json:"senderId" bson:"senderId"`
	SenderUsername  string             `json:"senderUsername" bson:"senderUsername"`
	SenderAvatar    string             `json:"senderAvatar" bson:"senderAvatar"`
	ReceiverID      string             `json:"receiverId" bson:"receiverId"`
	ReceiverUsername string            `json:"receiverUsername" bson:"receiverUsername"`
	Content         string             `json:"content" bson:"content"`
	IsRead          bool               `json:"isRead" bson:"isRead"`
	CreatedAt       time.Time          `json:"createdAt" bson:"createdAt"`
}

// CategoryInfo 分类信息
type CategoryInfo struct {
	Key   string `json:"key"`
	Label string `json:"label"`
	Color string `json:"color"`
}

// CreateArticleInput 创建文章输入
type CreateArticleInput struct {
	Title    string   `json:"title" binding:"required"`
	Excerpt  string   `json:"excerpt"`
	Content  string   `json:"content" binding:"required"`
	Cover    string   `json:"cover"`
	Category string   `json:"category" binding:"required"`
	Tags     []string `json:"tags"`
	IsPrivate bool    `json:"isPrivate"`
}

// AddCommentInput 添加评论输入
type AddCommentInput struct {
	Content string        `json:"content" binding:"required"`
	Author  CommentAuthor `json:"author" binding:"required"`
}

// CreateUserInput 创建用户输入
type CreateUserInput struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginInput 登录输入
type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// UpdateUserInput 更新用户输入
type UpdateUserInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Bio      string `json:"bio"`
	Avatar   string `json:"avatar"`
}

// SendMessageInput 发送消息输入
type SendMessageInput struct {
	ReceiverID   string `json:"receiverId" binding:"required"`
	ReceiverUsername string `json:"receiverUsername" binding:"required"`
	Content      string `json:"content" binding:"required"`
}

// NotificationItem 通知项
type NotificationItem struct {
	ID           string        `json:"id"`
	Content      string        `json:"content"`
	Author       CommentAuthor `json:"author"`
	ArticleID    string        `json:"articleId"`
	ArticleTitle string        `json:"articleTitle"`
	IsRead       bool          `json:"isRead"`
	CreatedAt    string        `json:"createdAt"`
}

// ArticleStats 文章统计
type ArticleStats struct {
	ArticleCount    int `json:"articleCount"`
	TotalViews      int `json:"totalViews"`
	TotalLikes      int `json:"totalLikes"`
	TotalSubscribers int `json:"totalSubscribers"`
}

// UserStats 用户统计
type UserStats struct {
	ArticleCount int `json:"articleCount"`
	TotalViews   int `json:"totalViews"`
	TotalLikes   int `json:"totalLikes"`
}

// Conversation 对话
type Conversation struct {
	UserID       string    `json:"userId"`
	Username     string    `json:"username"`
	Avatar       string    `json:"avatar"`
	LastMessage  *Message  `json:"lastMessage"`
	UnreadCount  int       `json:"unreadCount"`
}
