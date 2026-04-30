@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Lumina Blog Server 启动脚本
echo ========================================
echo.

:: 检查 MongoDB 连接配置
if not defined MONGO_URI set MONGO_URI=mongodb://localhost:27017
if not defined DB_NAME set DB_NAME=lumina-blog
if not defined PORT set PORT=3001

echo 配置信息:
echo   MongoDB: %MONGO_URI%
echo   数据库: %DB_NAME%
echo   端口: %PORT%
echo.

:: 检查 server.exe 是否存在
if not exist ./dist/blog-server.exe (
    echo [错误] blog-server.exe 不存在，请先执行打包命令:
    echo   go build -o ./dist/blog-server.exe .
    pause
    exit /b 1
)

echo 启动服务...
echo 按 Ctrl+C 可停止服务
echo ========================================
echo.

:: 启动服务
cd dist
blog-server.exe
