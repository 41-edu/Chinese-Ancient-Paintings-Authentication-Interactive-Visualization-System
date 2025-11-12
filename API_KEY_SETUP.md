# API 密钥配置指南

## ⚠️ 安全提醒

**已移除所有硬编码的 API 密钥！**

为了安全起见，所有 API 密钥现在都通过环境变量配置。

---

## 🔑 本地开发配置

### 步骤 1: 创建 .env 文件

在 `frontend` 目录下创建 `.env` 文件：

```bash
cd frontend
cp .env.example .env
```

### 步骤 2: 编辑 .env 文件

打开 `.env` 文件，填入你的 Deepseek API 密钥：

```env
DEEPSEEK_API_KEY=sk-your-actual-api-key-here
```

**如何获取 API 密钥：**
1. 访问：https://platform.deepseek.com/
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制密钥到 `.env` 文件

### 步骤 3: 启动开发服务器

```bash
yarn start
```

**注意：** `.env` 文件已被添加到 `.gitignore`，不会被提交到 Git。

---

## 🚀 GitHub Pages 部署配置

### 方法 1: 使用 GitHub Secrets（推荐）

1. 访问仓库设置：
   ```
   https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/settings/secrets/actions
   ```

2. 点击 **New repository secret**

3. 添加密钥：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Secret**: 你的 Deepseek API 密钥
   - 点击 **Add secret**

4. 修改 `.github/workflows/deploy.yml`，添加环境变量：

```yaml
- name: Build
  env:
    DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
  run: |
    cd frontend
    yarn build
```

### 方法 2: 在前端代码中提示用户输入（备选）

如果不想在 GitHub 配置密钥，可以让用户在使用时输入：

修改 `LLMService.js`，添加用户输入逻辑：

```javascript
constructor() {
  this.apiEndpoint = 'https://api.deepseek.com/chat/completions';
  
  // 尝试从环境变量获取
  this.apiKey = process.env.DEEPSEEK_API_KEY;
  
  // 如果没有，从 localStorage 获取
  if (!this.apiKey) {
    this.apiKey = localStorage.getItem('deepseek_api_key');
  }
  
  // 如果还是没有，提示用户输入
  if (!this.apiKey) {
    this.apiKey = prompt('请输入 Deepseek API Key (将保存在本地):');
    if (this.apiKey) {
      localStorage.setItem('deepseek_api_key', this.apiKey);
    }
  }
  
  this.model = 'deepseek-chat';
}
```

---

## 📝 修改的文件清单

✅ **已移除硬编码密钥的文件：**
- `frontend/src/components/authentication/LLMService.js`
- `frontend/src/components/authentication/EnhancedLLM_QA.js`
- `frontend/src/components/authentication/QuestionProcessor.js`
- `frontend/src/components/authentication/LLM_QA.js` (已删除，旧版未使用)

✅ **新增的文件：**
- `frontend/.env.example` - 环境变量配置示例
- `.gitignore` - 更新以忽略 .env 文件
- `API_KEY_SETUP.md` - 本文档

✅ **更新的文档：**
- `README.md` - 添加 API 密钥配置说明

---

## 🔒 安全最佳实践

1. ✅ **永远不要**将 API 密钥提交到 Git
2. ✅ 使用 `.gitignore` 忽略包含敏感信息的文件
3. ✅ 使用环境变量或 GitHub Secrets 管理密钥
4. ✅ 定期轮换 API 密钥
5. ✅ 如果密钥泄露，立即在 Deepseek 平台撤销并生成新密钥

---

## ❓ 常见问题

### Q: 为什么我的 LLM 功能不工作？

**A:** 检查以下几点：
1. 是否创建了 `.env` 文件
2. `.env` 文件中是否正确填写了 `DEEPSEEK_API_KEY`
3. API 密钥是否有效（在 Deepseek 平台查看）
4. 检查浏览器控制台是否有错误信息

### Q: GitHub Pages 上的 LLM 功能能用吗？

**A:** 需要配置 GitHub Secrets，步骤见上文"方法 1"。

### Q: 我不小心提交了 API 密钥怎么办？

**A:** 
1. 立即到 Deepseek 平台撤销该密钥
2. 生成新的密钥
3. 按照本文档重新配置
4. 使用 `git filter-branch` 或 `git-filter-repo` 从 Git 历史中删除敏感信息

---

## 📞 需要帮助？

如果遇到配置问题，请：
1. 检查浏览器控制台错误
2. 查看 GitHub Actions 日志（如果是部署问题）
3. 确认 API 密钥格式正确（以 `sk-` 开头）
