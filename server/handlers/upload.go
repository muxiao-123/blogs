package handlers

import (
	"crypto/md5"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sync"

	"blog-server/config"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var uploadDir string
var fileHashMap = make(map[string]string)
var fileHashMutex sync.RWMutex

func init() {
	cfg := config.Load()
	uploadDir = cfg.UploadDir
	// Ensure upload directory exists
	os.MkdirAll(uploadDir, 0755)
}

// InitHashMap 初始化哈希映射
func InitHashMap() {
	entries, err := os.ReadDir(uploadDir)
	if err != nil {
		return
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			filePath := filepath.Join(uploadDir, entry.Name())
			hash, err := calculateMD5(filePath)
			if err == nil {
				fileHashMutex.Lock()
				fileHashMap[hash] = entry.Name()
				fileHashMutex.Unlock()
			}
		}
	}
	fmt.Printf("[Upload] 已加载 %d 个已有文件的哈希\n", len(fileHashMap))
}

func calculateMD5(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := md5.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

// UploadImage 上传单张图片
func UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请选择要上传的图片"})
		return
	}

	// 检查文件大小 (5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "图片大小不能超过 5MB"})
		return
	}

	// 检查文件类型
	ext := filepath.Ext(file.Filename)
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}
	if !allowedExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的图片格式，仅支持 JPEG, PNG, GIF, WebP"})
		return
	}

	// 生成唯一文件名
	filename := uuid.New().String() + ext
	filePath := filepath.Join(uploadDir, filename)

	// 保存文件
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "上传图片失败"})
		return
	}

	// 计算文件哈希
	hash, err := calculateMD5(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "上传图片失败"})
		return
	}

	// 检查是否已有相同图片
	fileHashMutex.Lock()
	if existingFilename, exists := fileHashMap[hash]; exists {
		// 删除刚上传的文件
		os.Remove(filePath)
		imageUrl := "/uploads/" + existingFilename
		fmt.Printf("[Upload] 相同图片已存在: %s\n", existingFilename)

		fileHashMutex.Unlock()
		c.JSON(http.StatusOK, gin.H{
			"success":  true,
			"url":      imageUrl,
			"filename": existingFilename,
			"existing": true,
		})
		return
	}

	// 新图片，保存哈希映射
	fileHashMap[hash] = filename
	fileHashMutex.Unlock()

	imageUrl := "/uploads/" + filename
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"url":      imageUrl,
		"filename": filename,
		"existing": false,
	})
}
