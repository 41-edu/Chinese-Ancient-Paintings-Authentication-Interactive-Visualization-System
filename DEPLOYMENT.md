# GitHub Pages 部署指南

## 自动部署（推荐）

本项目已配置 GitHub Actions 自动部署。每次推送到 `main` 分支时会自动构建并部署到 GitHub Pages。

### 设置步骤：

1. **启用 GitHub Pages**
   - 进入 GitHub 仓库设置：`Settings` > `Pages`
   - Source 选择：`GitHub Actions`
   - 保存设置

2. **推送代码**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **等待部署完成**
   - 进入仓库的 `Actions` 标签
   - 查看部署进度
   - 部署完成后，访问：`https://41-edu.github.io/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/`

## 手动部署（备选）

如果需要手动部署：

1. **安装 gh-pages 工具**
   ```bash
   cd frontend
   yarn add -D gh-pages
   ```

2. **构建并部署**
   ```bash
   yarn deploy
   ```

## 注意事项

### 1. API 密钥配置
如果项目使用了外部 API（如 DeepSeek），需要配置环境变量：
- 在 GitHub 仓库设置中添加 Secrets：`Settings` > `Secrets and variables` > `Actions`
- 添加 `DEEPSEEK_API_KEY` 等必要的密钥
- 修改 `.github/workflows/deploy.yml` 添加环境变量

### 2. 资源路径
- 所有资源文件路径已配置为相对路径
- webpack `publicPath` 设置为 `/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/`
- 如果仓库名不同，需要修改 `frontend/configs/webpack/prod.js` 中的 `publicPath`

### 3. 大文件处理
如果项目包含大量图片或数据文件：
- 考虑使用 Git LFS（Large File Storage）
- 或将数据文件托管到 CDN

### 4. 浏览器兼容性
- ONNX Runtime 需要现代浏览器支持 WebAssembly
- 确保目标用户使用的浏览器版本支持相关特性

## 本地测试

在部署前，建议本地测试生产构建：

```bash
cd frontend
yarn build
# 使用本地服务器测试 dist 目录
npx serve dist
```

## 故障排查

### 部署失败
1. 检查 GitHub Actions 日志
2. 确认 `yarn.lock` 文件已提交
3. 确认所有依赖已正确安装

### 页面无法访问
1. 确认 GitHub Pages 已启用
2. 检查仓库是否为公开
3. 等待 DNS 传播（可能需要几分钟）

### 资源加载失败
1. 检查浏览器控制台的 404 错误
2. 确认 `publicPath` 配置正确
3. 检查资源文件是否包含在构建输出中

## 自定义域名（可选）

如果要使用自定义域名：

1. 在仓库根目录创建 `CNAME` 文件，内容为你的域名
2. 在域名提供商处配置 DNS 记录
3. 等待 DNS 生效

详见：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
