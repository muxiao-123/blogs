package config

import (
	"os"
)

type Config struct {
	MongoURI  string
	DBName    string
	Port      string
	UploadDir string
}

func Load() *Config {
	return &Config{
		MongoURI:  getEnv("MONGO_URI", "mongodb://localhost:27017"),
		DBName:    getEnv("DB_NAME", "lumina-blog"),
		Port:      getEnv("PORT", "3001"),
		UploadDir: getEnv("UPLOAD_DIR", "./public/uploads"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
