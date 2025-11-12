# 清除 Git 历史中的敏感信息 - 完整指南

## ⚠️ 问题

GitHub 检测到仓库历史中包含 API 密钥，拒绝推送。

## 🔧 解决方案（多种方法）

### 方法 1: 使用 BFG Repo-Cleaner（最快，推荐）

BFG 是专门用于清理 Git 历史的工具，比 git-filter-branch 快得多。

#### 步骤：

1. **下载 BFG**
   
   访问：https://rtyley.github.io/bfg-repo-cleaner/
   
   或使用 PowerShell 下载：
   ```powershell
   Invoke-WebRequest -Uri "https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar" -OutFile "bfg.jar"
   ```

2. **清理密钥**
   
   创建一个包含敏感信息的文本文件 `secrets.txt`：
   ```
   sk-d92a575188954a01b6a4fc4e2d231fe9
   ```
   
   运行清理：
   ```powershell
   java -jar bfg.jar --replace-text secrets.txt
   ```

3. **清理引用并强制推送**
   ```powershell
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push -f origin main
   ```

---

### 方法 2: 使用 git-filter-repo（更现代）

git-filter-repo 是官方推荐的替代 filter-branch 的工具。

#### 步骤：

1. **安装 git-filter-repo**
   
   ```powershell
   pip install git-filter-repo
   ```

2. **删除文件**
   
   ```powershell
   git filter-repo --path frontend/src/components/authentication/LLM_QA.js --invert-paths --force
   ```

3. **重新添加远程仓库（filter-repo 会删除远程）**
   
   ```powershell
   git remote add origin https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System.git
   ```

4. **强制推送**
   
   ```powershell
   git push -f origin main
   ```

---

### 方法 3: 完全重建仓库（最简单但会丢失历史）

如果不需要保留 Git 历史，最简单的方法是重建仓库。

#### 步骤：

1. **备份当前代码**
   ```powershell
   Copy-Item -Path . -Destination ..\ChinesePaintingAuthentication_backup -Recurse -Exclude .git
   ```

2. **删除 Git 历史**
   ```powershell
   Remove-Item -Path .git -Recurse -Force
   ```

3. **重新初始化仓库**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit: Chinese Painting Authentication System (cleaned)"
   ```

4. **连接到远程仓库并强制推送**
   ```powershell
   git remote add origin https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System.git
   git branch -M main
   git push -f origin main
   ```

---

### 方法 4: 使用 GitHub 提供的链接允许推送（临时方案，不推荐）

GitHub 提供了一个链接允许你推送包含密钥的代码：

```
https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System/security/secret-scanning/unblock-secret/35NqcRPCukSyJ0AkoKXGd1WHAab
```

**⚠️ 警告：** 这种方法会让密钥暴露在公开仓库中，强烈不推荐！如果使用此方法，务必：
1. 立即撤销泄露的 API 密钥
2. 生成新的 API 密钥
3. 使用环境变量配置

---

## 🎯 推荐流程

对于你的情况，我推荐使用**方法 3（完全重建仓库）**，因为：

1. ✅ 最简单快速
2. ✅ 不需要安装额外工具
3. ✅ 彻底清除所有敏感信息
4. ✅ 仓库是新建的，历史记录不重要

### 执行步骤：

```powershell
# 1. 确保当前所有更改已提交
git status

# 2. 删除 .git 目录
Remove-Item -Path .git -Recurse -Force

# 3. 重新初始化
git init

# 4. 添加所有文件
git add .

# 5. 提交
git commit -m "Initial commit: Security fix - remove all hardcoded API keys"

# 6. 添加远程仓库
git remote add origin https://github.com/41-edu/Chinese-Ancient-Paintings-Authentication-Interactive-Visualization-System.git

# 7. 强制推送
git branch -M main
git push -f origin main
```

---

## 🔒 推送后的安全检查

推送成功后，确保：

1. ✅ 立即到 Deepseek 平台撤销旧的 API 密钥
2. ✅ 生成新的 API 密钥
3. ✅ 按照 `API_KEY_SETUP.md` 重新配置
4. ✅ 验证代码中没有硬编码的密钥

---

## 📞 如果还是失败

如果所有方法都失败，可以：

1. 删除 GitHub 仓库
2. 创建新的仓库
3. 推送干净的代码

但这应该是最后的选择。
