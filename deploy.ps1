# 快速部署到 GitHub Pages

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  石涛书画鉴定系统 - GitHub Pages 部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-Not (Test-Path "frontend")) {
    Write-Host "❌ 错误：请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查 Git 状态
Write-Host "📋 检查 Git 状态..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  检测到未提交的更改：" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $confirm = Read-Host "是否继续部署？(y/n)"
    if ($confirm -ne 'y') {
        Write-Host "❌ 部署已取消" -ForegroundColor Red
        exit 0
    }
}

# 进入 frontend 目录
Set-Location frontend

# 安装依赖
Write-Host ""
Write-Host "📦 检查依赖..." -ForegroundColor Yellow
if (-Not (Test-Path "node_modules")) {
    Write-Host "📥 安装依赖中..." -ForegroundColor Yellow
    yarn install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
}

# 构建项目
Write-Host ""
Write-Host "🔨 构建项目..." -ForegroundColor Yellow
yarn build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ 构建成功！" -ForegroundColor Green

# 返回根目录
Set-Location ..

# 提交更改
Write-Host ""
Write-Host "📤 准备推送到 GitHub..." -ForegroundColor Yellow
git add .
git status --short

Write-Host ""
$commitMsg = Read-Host "请输入提交信息（直接回车使用默认信息）"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update: Deploy to GitHub Pages"
}

git commit -m "$commitMsg"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 提交成功！" -ForegroundColor Green
} else {
    Write-Host "⚠️  没有新的更改需要提交" -ForegroundColor Yellow
}

# 推送到 GitHub
Write-Host ""
Write-Host "🚀 推送到 GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 推送失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ 部署成功！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 查看部署进度：" -ForegroundColor Cyan
Write-Host "   https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/actions" -ForegroundColor White
Write-Host ""
Write-Host "🌐 部署完成后访问：" -ForegroundColor Cyan
Write-Host "   https://41-edu.github.io/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  预计等待时间：2-5 分钟" -ForegroundColor Yellow
Write-Host ""
