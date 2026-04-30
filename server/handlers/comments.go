package handlers

import (
	"net/http"

	"blog-server/models"
	"blog-server/services"

	"github.com/gin-gonic/gin"
)

// AddComment 添加评论
func AddComment(c *gin.Context) {
	articleID := c.Param("id")

	var input struct {
		Content string             `json:"content" binding:"required"`
		Author  models.CommentAuthor `json:"author" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少必要字段"})
		return
	}

	if input.Author.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少必要字段"})
		return
	}

	comment, err := services.AddComment(articleID, models.AddCommentInput{
		Content: input.Content,
		Author:  input.Author,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if comment == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在"})
		return
	}

	c.JSON(http.StatusCreated, comment)
}

// DeleteComment 删除评论
func DeleteComment(c *gin.Context) {
	articleID := c.Param("id")
	commentID := c.Param("commentId")

	success, err := services.DeleteComment(articleID, commentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	if !success {
		c.JSON(http.StatusNotFound, gin.H{"error": "评论不存在"})
		return
	}

	c.Status(http.StatusNoContent)
}

// LikeComment 点赞评论
func LikeComment(c *gin.Context) {
	articleID := c.Param("id")
	commentID := c.Param("commentId")

	comment, err := services.ToggleCommentLike(articleID, commentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "操作失败"})
		return
	}

	if comment == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评论不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"likes": comment.Likes})
}

// GetNotifications 获取通知
func GetNotifications(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}

	// 获取所有文章
	articles, err := services.GetAllArticles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取通知失败"})
		return
	}

	userComments := make([]models.NotificationItem, 0)
	unreadCount := 0

	for _, article := range articles {
		// 检查是否是当前用户的文章
		isUserArticle := article.Author.ID == currentUser.ID ||
			article.Author.Name == currentUser.Username

		if isUserArticle {
			// 使用 GetArticleByID 获取包含评论的完整文章
			fullArticle, err := services.GetArticleByID(article.ID)
			if err != nil || fullArticle == nil {
				continue
			}

			if fullArticle.Comments != nil {
				for _, comment := range fullArticle.Comments {
					// 排除自己的评论
					isOwnComment := comment.Author.ID == currentUser.ID ||
						comment.Author.Name == currentUser.Username

					if !isOwnComment {
						item := models.NotificationItem{
							ID:           comment.ID,
							Content:      comment.Content,
							Author:       comment.Author,
							ArticleID:    fullArticle.ID,
							ArticleTitle: fullArticle.Title,
							IsRead:       comment.IsRead,
							CreatedAt:    comment.CreateTime,
						}
						userComments = append(userComments, item)
						if !comment.IsRead {
							unreadCount++
						}
					}
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"comments":    userComments,
		"unreadCount": unreadCount,
	})
}
