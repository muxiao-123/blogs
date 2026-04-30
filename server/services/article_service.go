package services

import (
	"errors"
	"log"
	"math"
	"time"

	"blog-server/models"
	"blog-server/repository"

	"github.com/google/uuid"
)

var (
	articleRepo *repository.ArticleRepository
	commentRepo *repository.CommentRepository
)

func InitArticleService() {
	articleRepo = repository.NewArticleRepository()
	commentRepo = repository.NewCommentRepository()
	log.Println("Article service initialized, articleRepo:", articleRepo)
}

// GetAllArticles 获取所有文章
func GetAllArticles() ([]models.Article, error) {
	return articleRepo.FindAll()
}

// GetArticleByID 根据ID获取文章
func GetArticleByID(id string) (*models.Article, error) {
	article, err := articleRepo.FindByID(id)
	if err != nil || article == nil {
		return nil, err
	}

	// 从评论集合中获取该文章的评论
	comments, err := commentRepo.GetCommentsByArticleID(id)
	if err != nil {
		return article, nil // 评论获取失败不影响文章返回
	}

	article.Comments = comments
	return article, nil
}

// GetArticlesByCategory 根据分类获取文章
func GetArticlesByCategory(category string) ([]models.Article, error) {
	return articleRepo.FindByCategory(category)
}

// GetArticlesByTag 根据标签获取文章
func GetArticlesByTag(tag string) ([]models.Article, error) {
	return articleRepo.FindByTag(tag)
}

// SearchArticles 搜索文章
func SearchArticles(query string) ([]models.Article, error) {
	return articleRepo.Search(query)
}

// GetArticlesByAuthor 根据作者获取文章
func GetArticlesByAuthor(author string) ([]models.Article, error) {
	return articleRepo.FindByAuthor(author)
}

// GetAllTags 获取所有标签
func GetAllTags() ([]string, error) {
	return articleRepo.GetAllTags()
}

// CreateArticle 创建文章
func CreateArticle(input models.CreateArticleInput, currentUser *models.UserResponse) (*models.Article, error) {
	if input.Title == "" || input.Content == "" || input.Category == "" {
		return nil, errors.New("缺少必要字段")
	}

	readTime := int(math.Ceil(float64(len(input.Content)) / 500.0))

	authorName := "Lumina"
	authorAvatar := "https://api.dicebear.com/7.x/avataaars/svg?seed=lumina"
	authorBio := "热爱技术的开发者"
	authorID := ""

	if currentUser != nil {
		authorName = currentUser.Username
		authorAvatar = currentUser.Avatar
		authorID = currentUser.ID
		authorBio = currentUser.Bio
		if authorBio == "" {
			authorBio = "这个人很懒，什么都没写"
		}
	}

	cover := input.Cover
	if cover == "" {
		cover = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80"
	}

	publishDate := time.Now().Format("2006-01-02")

	article := &models.Article{
		ID:          uuid.New().String(),
		Title:       input.Title,
		Excerpt:     input.Excerpt,
		Content:     input.Content,
		Cover:       cover,
		Category:    input.Category,
		Tags:        input.Tags,
		Author: models.Author{
			ID:     authorID,
			Name:   authorName,
			Avatar: authorAvatar,
			Bio:    authorBio,
		},
		PublishDate: publishDate,
		ReadTime:    readTime,
		Views:       0,
		Likes:       0,
		Favorites:   0,
		Comments:    []models.Comment{},
		IsPrivate:   input.IsPrivate,
	}

	log.Println("Creating article:", article.ID, article.Title, "isPrivate:", input.IsPrivate, "author:", authorName)

	if err := articleRepo.Create(article); err != nil {
		log.Printf("Failed to create article: %v", err)
		return nil, err
	}

	log.Println("Article created successfully:", article.ID)
	return article, nil
}

// UpdateArticle 更新文章
func UpdateArticle(id string, input models.CreateArticleInput, currentUser *models.UserResponse) (*models.Article, error) {
	existing, err := articleRepo.FindByID(id)
	if err != nil || existing == nil {
		return nil, errors.New("文章不存在或没有权限")
	}

	if currentUser != nil && existing.Author.Name != currentUser.Username {
		return nil, errors.New("没有权限编辑此文章")
	}

	updates := make(map[string]interface{})

	if input.Title != "" {
		updates["title"] = input.Title
	}
	if input.Excerpt != "" {
		updates["excerpt"] = input.Excerpt
	}
	if input.Content != "" {
		updates["content"] = input.Content
		updates["readTime"] = int(math.Ceil(float64(len(input.Content)) / 500.0))
	}
	if input.Cover != "" {
		updates["cover"] = input.Cover
	}
	if input.Category != "" {
		updates["category"] = input.Category
	}
	if input.Tags != nil {
		updates["tags"] = input.Tags
	}
	// 始终更新 isPrivate 字段（无论 true 还是 false）
	updates["isPrivate"] = input.IsPrivate

	return articleRepo.Update(id, updates)
}

// DeleteArticle 删除文章
func DeleteArticle(id string, currentUser *models.UserResponse) (bool, error) {
	existing, err := articleRepo.FindByID(id)
	if err != nil || existing == nil {
		return false, errors.New("文章不存在或没有权限")
	}

	if currentUser != nil && existing.Author.Name != currentUser.Username {
		return false, errors.New("没有权限删除此文章")
	}

	return articleRepo.Delete(id)
}

// IncrementViews 增加浏览数
func IncrementViews(id string) (*models.Article, error) {
	return articleRepo.IncrementViews(id)
}

// UpdateLikes 更新点赞数
func UpdateLikes(id string, likes int) error {
	_, err := articleRepo.Update(id, map[string]interface{}{"likes": likes})
	return err
}

// UpdateFavorites 更新收藏数
func UpdateFavorites(id string, favorites int) error {
	_, err := articleRepo.Update(id, map[string]interface{}{"favorites": favorites})
	return err
}

// AddComment 添加评论
func AddComment(articleID string, input models.AddCommentInput) (*models.Comment, error) {
	article, err := articleRepo.FindByID(articleID)
	if err != nil || article == nil {
		return nil, errors.New("文章不存在")
	}

	comment := &models.Comment{
		ID:         uuid.New().String(),
		Author:     input.Author,
		Content:    input.Content,
		CreateTime: time.Now().Format(time.RFC3339),
		Likes:      0,
		IsRead:     false,
	}

	if err := commentRepo.AddComment(articleID, comment); err != nil {
		return nil, err
	}

	return comment, nil
}

// DeleteComment 删除评论
func DeleteComment(articleID, commentID string) (bool, error) {
	return commentRepo.DeleteComment(articleID, commentID)
}

// ToggleCommentLike 点赞评论
func ToggleCommentLike(articleID, commentID string) (*models.Comment, error) {
	return commentRepo.ToggleLike(articleID, commentID)
}

// MarkCommentAsRead 标记评论为已读
func MarkCommentAsRead(articleID, commentID string) (bool, error) {
	return commentRepo.MarkAsRead(articleID, commentID)
}

// GetArticleStats 获取文章统计
func GetArticleStats() (*models.ArticleStats, error) {
	articles, err := articleRepo.FindAll()
	if err != nil {
		return nil, err
	}

	totalViews := 0
	totalLikes := 0
	for _, a := range articles {
		totalViews += a.Views
		totalLikes += a.Likes
	}

	return &models.ArticleStats{
		ArticleCount:     len(articles),
		TotalViews:       totalViews,
		TotalLikes:       totalLikes,
		TotalSubscribers: totalLikes / 10,
	}, nil
}

// GetUserStats 获取用户统计
func GetUserStats(author string) (*models.UserStats, error) {
	articles, err := articleRepo.FindByAuthor(author)
	if err != nil {
		return nil, err
	}

	totalViews := 0
	totalLikes := 0
	for _, a := range articles {
		totalViews += a.Views
		totalLikes += a.Likes
	}

	return &models.UserStats{
		ArticleCount: len(articles),
		TotalViews:   totalViews,
		TotalLikes:   totalLikes,
	}, nil
}

// InitArticleData 初始化文章数据
func InitArticleData() error {
	return articleRepo.CreateIndexes()
}
