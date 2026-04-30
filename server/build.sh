#!/bin/bash
# 构建脚本

set -e

echo "Building Go server..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 清理旧构建
rm -rf dist
mkdir -p dist

# 下载依赖
echo "Downloading dependencies..."
go mod download

# 构建
echo "Building..."
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o dist/server .

# 创建 public 目录
mkdir -p dist/public

echo "Build completed!"
echo "Binary: dist/server"
