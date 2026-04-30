package services

import (
	"encoding/base64"
	"errors"

	"blog-server/models"
	"blog-server/repository"

	"github.com/google/uuid"
)

var (
	userRepo *repository.UserRepository
)

func InitUserService() {
	userRepo = repository.NewUserRepository()
}

// VerifyToken 验证token并返回用户
func VerifyToken(token string) (*models.UserResponse, error) {
	userID, err := ParseToken(token)
	if err != nil {
		return nil, err
	}

	user, err := userRepo.FindByIDWithoutPassword(userID)
	if err != nil || user == nil {
		return nil, errors.New("user not found")
	}

	return user, nil
}

// GenerateToken 生成token
func GenerateToken(userID string) string {
	token := userID + ":" + uuid.New().String()
	return base64.StdEncoding.EncodeToString([]byte(token))
}

// ParseToken 解析token获取userID
func ParseToken(token string) (string, error) {
	decoded, err := base64.StdEncoding.DecodeString(token)
	if err != nil {
		return "", err
	}
	// Find the first colon to split userID from the rest
	for i, c := range decoded {
		if c == ':' {
			return string(decoded[:i]), nil
		}
	}
	return "", errors.New("invalid token format")
}

// Register 注册用户
func Register(username, email, password string) (*models.UserResponse, string, error) {
	// 检查用户名是否存在
	existingUser, _ := userRepo.FindByUsername(username)
	if existingUser != nil {
		return nil, "", errors.New("用户名已被使用")
	}

	// 检查邮箱是否存在
	existingEmail, _ := userRepo.FindByEmail(email)
	if existingEmail != nil {
		return nil, "", errors.New("邮箱已被注册")
	}

	// 创建用户
	user := &models.User{
		ID:        uuid.New().String(),
		Username:  username,
		Email:     email,
		Password:  password,
		Avatar:    "https://api.dicebear.com/7.x/avataaars/svg?seed=" + username,
		Bio:       "这个人很懒，什么都没写",
		Favorites: []string{},
		Likes:     []string{},
	}

	if err := userRepo.Create(user); err != nil {
		return nil, "", err
	}

	token := GenerateToken(user.ID)
	resp := user.ToResponse()
	return &resp, token, nil
}

// Login 登录
func Login(username, password string) (*models.UserResponse, string, error) {
	user, err := userRepo.FindByUsername(username)
	if err != nil || user == nil {
		return nil, "", errors.New("用户名或密码错误")
	}

	if user.Password != password {
		return nil, "", errors.New("用户名或密码错误")
	}

	token := GenerateToken(user.ID)
	resp := user.ToResponse()
	return &resp, token, nil
}

// GetUserByID 获取用户信息
func GetUserByID(id string) (*models.UserResponse, error) {
	return userRepo.FindByIDWithoutPassword(id)
}

// UpdateUser 更新用户信息
func UpdateUser(id string, data models.UpdateUserInput) (*models.UserResponse, error) {
	updates := make(map[string]interface{})

	if data.Username != "" {
		existingUser, _ := userRepo.FindByUsername(data.Username)
		if existingUser != nil && existingUser.ID != id {
			return nil, errors.New("用户名已被使用")
		}
		updates["username"] = data.Username
	}

	if data.Email != "" {
		updates["email"] = data.Email
	}

	if data.Bio != "" {
		updates["bio"] = data.Bio
	}

	if data.Avatar != "" {
		updates["avatar"] = data.Avatar
	}

	updated, err := userRepo.Update(id, updates)
	if err != nil || updated == nil {
		return nil, err
	}

	resp := updated.ToResponse()
	return &resp, nil
}

// SearchUsers 搜索用户
func SearchUsers(query string, limit int) ([]models.UserResponse, error) {
	return userRepo.Search(query, limit)
}

// AddFavorite 添加收藏
func AddFavorite(userID, articleID string) error {
	_, err := userRepo.AddFavorite(userID, articleID)
	return err
}

// RemoveFavorite 移除收藏
func RemoveFavorite(userID, articleID string) error {
	_, err := userRepo.RemoveFavorite(userID, articleID)
	return err
}

// GetFavorites 获取用户收藏列表
func GetFavorites(userID string) ([]string, error) {
	return userRepo.GetFavorites(userID)
}

// AddLike 添加点赞
func AddLike(userID, articleID string) error {
	_, err := userRepo.AddLike(userID, articleID)
	return err
}

// RemoveLike 移除点赞
func RemoveLike(userID, articleID string) error {
	_, err := userRepo.RemoveLike(userID, articleID)
	return err
}

// GetLikes 获取用户点赞列表
func GetLikes(userID string) ([]string, error) {
	return userRepo.GetLikes(userID)
}

// GetCurrentUser 从gin.Context获取当前用户
func GetCurrentUser(c interface{}) *models.UserResponse {
	// This will be called from handlers where c is *gin.Context
	// The actual implementation is in handlers
	return nil
}
