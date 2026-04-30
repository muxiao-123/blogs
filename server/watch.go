//go:build ignore
// +build ignore

package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"
)

var mu sync.Mutex

func main() {
	fmt.Println("🔄 Watcher started. Press Ctrl+C to stop.")
	fmt.Println()

	// 初始构建并运行
	buildAndRun()

	// 文件修改检测
	lastMod := getLastModTime()
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	// 信号处理
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	for {
		select {
		case <-ticker.C:
			newMod := getLastModTime()
			if newMod.After(lastMod) {
				fmt.Println()
				lastMod = newMod
				buildAndRun()
			}
		case <-sigChan:
			fmt.Println("\n👋 Shutting down...")
			return
		}
	}
}

func getLastModTime() time.Time {
	var latest time.Time
	filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		// 跳过特定目录和文件
		if info.IsDir() {
			switch path {
			case ".git", "tmp", "vendor", "public":
				return filepath.SkipDir
			}
		} else {
			ext := strings.ToLower(filepath.Ext(path))
			if ext == ".go" && !strings.HasSuffix(path, "_test.go") {
				if info.ModTime().After(latest) {
					latest = info.ModTime()
				}
			}
		}
		return nil
	})
	return latest
}

func buildAndRun() {
	mu.Lock()
	defer mu.Unlock()

	// 杀掉旧进程
	killServer()

	fmt.Println("🔨 Building...")
	start := time.Now()

	cmd := exec.Command("go", "build", "-o", "tmp/server.exe", ".")
	cmd.Dir, _ = os.Getwd()
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		log.Printf("❌ Build failed: %v", err)
		return
	}

	fmt.Printf("✅ Build successful! (%.1fs)\n", time.Since(start).Seconds())
	fmt.Println("🚀 Starting server...")

	// 启动新进程
	go runServer()
}

func runServer() {
	cmd := exec.Command("./tmp/server.exe")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		log.Printf("❌ Server error: %v", err)
	}
}

func killServer() {
	// Windows 下使用 taskkill
	exec.Command("taskkill", "/F", "/IM", "server.exe").Run()
}
