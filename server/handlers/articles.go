package handlers

import (
	"net/http"

	"blog-server/models"
	"blog-server/services"

	"github.com/gin-gonic/gin"
)

var Categories = []models.CategoryInfo{
	{Key: "frontend", Label: "前端", Color: "#4ade80"},
	{Key: "backend", Label: "后端", Color: "#60a5fa"},
	{Key: "fullstack", Label: "全栈", Color: "#f472b6"},
	{Key: "other", Label: "其他", Color: "#a78bfa"},
}

// GetCategories 获取所有分类
func GetCategories(c *gin.Context) {
	c.JSON(http.StatusOK, Categories)
}

// GetTags 获取所有标签
func GetTags(c *gin.Context) {
	tags, err := services.GetAllTags()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取标签失败"})
		return
	}
	c.JSON(http.StatusOK, tags)
}

// GetArticles 获取所有文章
func GetArticles(c *gin.Context) {
	category := c.Query("category")
	tag := c.Query("tag")
	q := c.Query("q")
	author := c.Query("author")

	var articles []models.Article
	var err error

	if category != "" {
		articles, err = services.GetArticlesByCategory(category)
	} else if tag != "" {
		articles, err = services.GetArticlesByTag(tag)
	} else if q != "" {
		articles, err = services.SearchArticles(q)
	} else if author != "" {
		articles, err = services.GetArticlesByAuthor(author)
	} else {
		articles, err = services.GetAllArticles()
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取文章失败"})
		return
	}

	// 获取当前用户信息（如果已登录）
	currentUser := getCurrentUser(c)

	// 过滤私有文章：只有登录用户为 lumina 时才显示私有文章
	filteredArticles := make([]models.Article, 0)
	for _, article := range articles {
		if article.IsPrivate {
			if currentUser != nil && currentUser.Username == "lumina" {
				filteredArticles = append(filteredArticles, article)
			}
		} else {
			filteredArticles = append(filteredArticles, article)
		}
	}

	// 检查用户是否登录，如果登录则添加点赞和收藏状态
	if currentUser != nil {
		userLikes, _ := services.GetLikes(currentUser.ID)
		userFavorites, _ := services.GetFavorites(currentUser.ID)

		for i := range filteredArticles {
			filteredArticles[i].IsLiked = contains(userLikes, filteredArticles[i].ID)
			filteredArticles[i].IsFavorited = contains(userFavorites, filteredArticles[i].ID)
			filteredArticles[i].Favorites = filteredArticles[i].Favorites
		}
	}

	c.JSON(http.StatusOK, filteredArticles)
}

// GetArticle 获取单个文章
func GetArticle(c *gin.Context) {
	id := c.Param("id")

	article, err := services.GetArticleByID(id)
	if err != nil || article == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在"})
		return
	}

	// 检查私有文章权限
	currentUser := getCurrentUser(c)
	if article.IsPrivate {
		if currentUser == nil || currentUser.Username != "lumina" {
			c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在"})
			return
		}
	}

	// 增加浏览数
	updated, _ := services.IncrementViews(id)
	if updated != nil {
		updated.Comments = article.Comments // 保留评论数据
		article = updated
	}

	// 检查用户是否点赞和收藏
	if currentUser != nil {
		userLikes, _ := services.GetLikes(currentUser.ID)
		userFavorites, _ := services.GetFavorites(currentUser.ID)
		article.IsLiked = contains(userLikes, article.ID)
		article.IsFavorited = contains(userFavorites, article.ID)
	}

	c.JSON(http.StatusOK, article)
}

// CreateArticle 创建文章
func CreateArticle(c *gin.Context) {
	var input models.CreateArticleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少必要字段"})
		return
	}

	currentUser := getCurrentUser(c)

	// 只有 lumina 用户才能设置私有标记
	if currentUser != nil && currentUser.Username != "lumina" {
		input.IsPrivate = false
	}

	article, err := services.CreateArticle(input, currentUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, article)
}

// UpdateArticle 更新文章
func UpdateArticle(c *gin.Context) {
	id := c.Param("id")

	var input models.CreateArticleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少必要字段"})
		return
	}

	currentUser := getCurrentUser(c)

	// 只有 lumina 用户才能修改私有标记
	if currentUser == nil || currentUser.Username != "lumina" {
		input.IsPrivate = false
	}

	article, err := services.UpdateArticle(id, input, currentUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if article == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在或没有权限"})
		return
	}

	c.JSON(http.StatusOK, article)
}

// DeleteArticle 删除文章
func DeleteArticle(c *gin.Context) {
	id := c.Param("id")
	currentUser := getCurrentUser(c)

	success, err := services.DeleteArticle(id, currentUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !success {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在或没有权限"})
		return
	}

	c.Status(http.StatusNoContent)
}

// LikeArticle 点赞/取消点赞文章
func LikeArticle(c *gin.Context) {
	id := c.Param("id")
	currentUser := getCurrentUser(c)

	if currentUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}

	article, err := services.GetArticleByID(id)
	if err != nil || article == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在"})
		return
	}

	userLikes, _ := services.GetLikes(currentUser.ID)
	isLiked := contains(userLikes, id)

	var newLikes int
	if isLiked {
		services.RemoveLike(currentUser.ID, id)
		newLikes = article.Likes - 1
		if newLikes < 0 {
			newLikes = 0
		}
	} else {
		services.AddLike(currentUser.ID, id)
		newLikes = article.Likes + 1
	}

	services.UpdateLikes(id, newLikes)

	c.JSON(http.StatusOK, gin.H{
		"likes":   newLikes,
		"isLiked": !isLiked,
	})
}

// FavoriteArticle 收藏/取消收藏文章
func FavoriteArticle(c *gin.Context) {
	id := c.Param("id")
	currentUser := getCurrentUser(c)

	if currentUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}

	article, err := services.GetArticleByID(id)
	if err != nil || article == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在"})
		return
	}

	userFavorites, _ := services.GetFavorites(currentUser.ID)
	isFavorited := contains(userFavorites, id)

	var newFavorites int
	if isFavorited {
		services.RemoveFavorite(currentUser.ID, id)
		newFavorites = article.Favorites - 1
		if newFavorites < 0 {
			newFavorites = 0
		}
	} else {
		services.AddFavorite(currentUser.ID, id)
		newFavorites = article.Favorites + 1
	}

	services.UpdateFavorites(id, newFavorites)

	c.JSON(http.StatusOK, gin.H{
		"favorited": !isFavorited,
		"favorites": newFavorites,
	})
}

// CheckFavorite 检查是否已收藏
func CheckFavorite(c *gin.Context) {
	id := c.Param("id")
	currentUser := getCurrentUser(c)

	if currentUser == nil {
		c.JSON(http.StatusOK, gin.H{"favorited": false})
		return
	}

	userFavorites, _ := services.GetFavorites(currentUser.ID)
	c.JSON(http.StatusOK, gin.H{"favorited": contains(userFavorites, id)})
}

// GetFavorites 获取用户收藏的文章
func GetFavorites(c *gin.Context) {
	currentUser := getCurrentUser(c)

	if currentUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}

	favoriteIDs, _ := services.GetFavorites(currentUser.ID)

	articles := make([]models.Article, 0)
	for _, id := range favoriteIDs {
		article, _ := services.GetArticleByID(id)
		if article != nil {
			// 只有 lumina 用户可以看到私有文章
			if !article.IsPrivate || currentUser.Username == "lumina" {
				articles = append(articles, *article)
			}
		}
	}

	c.JSON(http.StatusOK, articles)
}

// GetArticleStats 获取文章统计
func GetArticleStats(c *gin.Context) {
	stats, err := services.GetArticleStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取统计失败"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// GetUserStats 获取用户统计
func GetUserStats(c *gin.Context) {
	author := c.Query("author")
	if author == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少作者参数"})
		return
	}

	stats, err := services.GetUserStats(author)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取统计失败"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// GetCurrentUser 获取当前用户信息
func GetCurrentUserHandler(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	c.JSON(http.StatusOK, currentUser)
}

// Helper functions

func getCurrentUser(c *gin.Context) *models.UserResponse {
	user, exists := c.Get("user")
	if !exists {
		return nil
	}
	u, ok := user.(*models.UserResponse)
	if !ok {
		return nil
	}
	return u
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
