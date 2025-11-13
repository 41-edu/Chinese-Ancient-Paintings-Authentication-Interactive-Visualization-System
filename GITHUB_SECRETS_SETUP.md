# GitHub Secrets 配置说明

## ⚠️ 重要安全提醒

**API 密钥暴露在前端的风险：**
- 任何访问网站的用户都可以通过浏览器开发者工具查看打包后的 JavaScript 代码
- 他们可以提取 DEEPSEEK_API_KEY 并滥用你的 API 配额
- **强烈建议**：将 LLM 功能移到后端服务器，前端通过后端 API 调用

## 临时解决方案：配置 GitHub Secrets

如果你仍然想在前端使用 API（不推荐），需要配置 GitHub Secrets：

### 步骤 1：获取 DeepSeek API Key
1. 访问 https://platform.deepseek.com/
2. 登录你的账号
3. 在 API Keys 页面创建或复制你的 API Key

### 步骤 2：在 GitHub 仓库中添加 Secret
1. 访问你的 GitHub 仓库：
   ```
   https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System
   ```

2. 点击 **Settings** 标签

3. 在左侧菜单中选择 **Secrets and variables** → **Actions**

4. 点击 **New repository secret** 按钮

5. 填写信息：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Secret**: 粘贴你的 DeepSeek API Key (格式: `sk-xxxxxx`)

6. 点击 **Add secret** 保存

### 步骤 3：重新部署
配置完成后，推送代码或手动触发 GitHub Actions：

```bash
git push origin main
```

或者在 GitHub 仓库的 **Actions** 标签页，选择最新的 workflow，点击 **Re-run jobs**。

## 🔒 推荐的安全方案

为了保护你的 API Key，建议：

### 方案 1：使用后端代理（推荐）
创建一个简单的后端服务（Node.js/Python/等）：
- 后端存储 API Key
- 前端调用后端 API
- 后端转发请求到 DeepSeek
- 可以添加速率限制、用户认证等安全措施

### 方案 2：使用 Serverless Functions
使用 Vercel/Netlify Functions 或 AWS Lambda：
- API Key 存储在 Serverless 环境变量中
- 前端调用 Serverless Function
- Function 调用 DeepSeek API

### 方案 3：移除 LLM 功能
如果只是演示项目，可以考虑：
- 移除 LLM 问答功能
- 或使用预设的问答对，不需要实际调用 API

## 📝 验证配置

配置完成后，检查：

1. **GitHub Actions 日志**：
   - 进入 Actions 标签页
   - 查看最新的部署日志
   - 确认 Build 步骤没有报错

2. **浏览器控制台**：
   - 打开部署的网站
   - F12 打开开发者工具
   - 查看 Console，不应该再有 "401 Authentication Fails" 错误

3. **测试问答功能**：
   - 尝试问"找相似图"
   - 应该能正常回答而不是返回"暂时无法回答"

## ⚠️ 安全警告

**再次提醒**：即使配置了 GitHub Secrets，API Key 最终还是会暴露在前端打包文件中。任何人都可以：
1. 访问你的网站
2. 打开浏览器开发者工具
3. 在 Network 或 Sources 标签中找到 API Key
4. 使用你的 API Key 进行大量请求，消耗你的配额

**最佳实践**：将所有涉及敏感信息的操作移到后端！
