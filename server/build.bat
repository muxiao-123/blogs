@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Lumina Blog Server 打包脚本
echo ========================================
echo.

:: 创建输出目录
if not exist dist mkdir dist

:: 设置交叉编译环境变量
set CGO_ENABLED=0
set GOOS=linux
set GOARCH=amd64

echo 编译配置:
echo   目标平台: Linux (amd64)
echo   输出目录: dist\blog-server
echo.

echo 正在编译...
go build -o ./dist/blog-server .

if %errorlevel% neq 0 (
    echo.
    echo [错误] 编译失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo   编译成功！
echo ========================================
echo.
echo 产物位置: %cd%\dist\blog-server
echo.

:: 询问是否复制 public 目录
set /p copy_public="是否复制 public 目录到 dist? (y/n): "
if /i "%copy_public%"=="y" (
    if exist public (
        if not exist dist\public mkdir dist\public
        xcopy /E /I /Y public dist\public
        echo ✅ public 目录已复制
    ) else (
        echo ⚠ public 目录不存在，跳过
    )
)

echo.
echo 打包完成！可上传 dist 目录到服务器。
pause
