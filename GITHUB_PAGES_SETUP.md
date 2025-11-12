# GitHub Pages 配置指南

## ✅ 代码已推送到新仓库

仓库地址：https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System

---

## 📝 接下来的配置步骤

### 步骤 1: 启用 GitHub Pages

1. 访问仓库设置页面：
   ```
   https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/settings/pages
   ```

2. 在 **Build and deployment** 部分：
   - **Source**: 选择 `GitHub Actions`
   - 点击保存

### 步骤 2: 等待 GitHub Actions 自动部署

1. 查看部署进度：
   ```
   https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/actions
   ```

2. 第一次推送代码后，GitHub Actions 会自动触发部署流程

3. 等待部署完成（大约 2-5 分钟）

### 步骤 3: 访问你的网站

部署完成后，访问：
```
https://41-edu.github.io/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/
```

---

## 🔧 如果需要配置 API 密钥

如果你的项目使用了 DeepSeek API，需要配置环境变量：

### 方法 1: 在 GitHub Secrets 中配置（推荐）

1. 进入仓库设置：
   ```
   https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/settings/secrets/actions
   ```

2. 点击 **New repository secret**

3. 添加密钥：
   - Name: `DEEPSEEK_API_KEY`
   - Secret: 你的 API 密钥
   - 点击 **Add secret**

4. 修改 `.github/workflows/deploy.yml`，在 build 步骤中添加环境变量：

```yaml
- name: Build
  env:
    DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
  run: |
    cd frontend
    yarn build
```

### 方法 2: 在代码中直接配置（不推荐，会暴露密钥）

仅适用于测试或不敏感的场景。

---

## 🎯 快速检查清单

- [ ] 代码已推送到 GitHub ✅
- [ ] 在仓库设置中启用 GitHub Pages（Source 选择 GitHub Actions）
- [ ] GitHub Actions 工作流已触发
- [ ] 部署成功（在 Actions 页面查看绿色勾号）
- [ ] 网站可以正常访问
- [ ] （可选）配置了 API 密钥

---

## 🐛 故障排查

### 问题 1: Actions 页面显示部署失败

**解决方案：**
1. 点击失败的工作流查看详细日志
2. 检查是否是依赖安装失败
3. 确认 `frontend/yarn.lock` 文件已提交

### 问题 2: 网站可以访问但资源加载失败（404）

**解决方案：**
1. 检查浏览器控制台的错误信息
2. 确认 `frontend/configs/webpack/prod.js` 中的 `publicPath` 配置正确
3. 当前配置：`/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/`

### 问题 3: 网站显示 404 Not Found

**解决方案：**
1. 确认 GitHub Pages 已启用
2. 等待 5-10 分钟让 DNS 生效
3. 确认仓库是公开的（Public）

### 问题 4: API 调用失败

**解决方案：**
1. 检查浏览器控制台是否有 CORS 错误
2. 确认 API 密钥已正确配置
3. 检查 API 服务是否正常

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 GitHub Actions 日志
2. 检查浏览器控制台错误
3. 参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取更多信息

---

## 🎉 恭喜！

配置完成后，你的项目就可以通过以下地址访问了：

**https://41-edu.github.io/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/**

享受你的在线书画鉴定系统吧！
