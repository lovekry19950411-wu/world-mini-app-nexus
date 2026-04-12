# World Nexus - Git 設置與本地備份完整指南

**準備日期**: 2026年4月12日  
**目的**: 將代碼保存到您的 GitHub 與本地端

---

## 🚀 快速開始（3 分鐘）

### 最簡單的方式：Manus 一鍵導出

**步驟 1**：打開 Management UI
- 訪問 https://worldnexus-qus9eyn3.manus.space
- 點擊右側面板的「Management UI」按鈕

**步驟 2**：進入 GitHub 導出
- 點擊右上角的「⋯」（More 菜單）
- 選擇「GitHub」
- 點擊「Export to GitHub」

**步驟 3**：授權與配置
- 點擊「Authorize GitHub」
- 登錄您的 GitHub 賬戶
- 授予 Manus 訪問權限

**步驟 4**：創建 Repository
- 選擇 Repository 名稱（例：`world-nexus`）
- 選擇所有者（您的 GitHub 用戶名）
- 選擇 Repository 類型（Public 或 Private）
- 點擊「Create & Export」

**完成！** ✅
- 代碼已自動推送到 GitHub
- 您可以在 `https://github.com/[您的用戶名]/world-nexus` 訪問

---

## 📥 下載到本地端（備份）

### 方式 A：使用 Manus 下載功能

**步驟**：
1. 打開 Management UI
2. 點擊「Code」面板
3. 點擊「Download all files」
4. 解壓到本地目錄

**結果**：
```
~/Downloads/world-nexus/
├── client/
├── server/
├── drizzle/
├── package.json
└── ... (所有項目文件)
```

### 方式 B：使用 Git Clone（如已導出到 GitHub）

**步驟**：
```bash
# 1. 打開終端
# 2. 進入您想保存代碼的目錄
cd ~/projects

# 3. Clone Repository
git clone https://github.com/[您的用戶名]/world-nexus.git

# 4. 進入項目目錄
cd world-nexus

# 5. 查看代碼
ls -la
```

**結果**：
```
~/projects/world-nexus/
├── client/
├── server/
├── drizzle/
├── package.json
└── ... (完整的 Git 歷史)
```

---

## 🔧 完整的 Git 工作流程

### 初始設置（一次性）

**步驟 1**：創建 GitHub Repository

1. 訪問 https://github.com/new
2. Repository 名稱：`world-nexus`
3. 描述：`World Nexus - Decentralized Trading & Finance Platform on World ID`
4. 選擇 Public 或 Private
5. 點擊「Create repository」

**步驟 2**：在本地初始化 Git

```bash
# 進入項目目錄
cd /home/ubuntu/world-mini-app-nexus

# 初始化 Git（如果還沒有）
git init

# 添加遠程 Repository
git remote add origin https://github.com/[您的用戶名]/world-nexus.git

# 設置默認分支
git branch -M main

# 配置 Git 用戶信息
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

**步驟 3**：首次推送

```bash
# 添加所有文件
git add .

# 創建初始提交
git commit -m "Initial commit: World Nexus application with World ID 4.0 integration"

# 推送到 GitHub
git push -u origin main
```

**完成！** ✅

---

### 日常工作流程

**每次更新代碼後**：

```bash
# 1. 查看更改
git status

# 2. 添加更改
git add .

# 3. 提交更改（使用清晰的提交信息）
git commit -m "Add feature: [功能名稱]"

# 4. 推送到 GitHub
git push origin main
```

**提交信息示例**：
```
git commit -m "feat: Implement World ID verification flow"
git commit -m "fix: Fix MiniKit Pay integration bug"
git commit -m "docs: Update README with setup instructions"
git commit -m "refactor: Optimize database queries"
```

---

## 📋 推薦的 Git 配置

### .gitignore 文件（已自動創建）

確保以下文件不被上傳：
```
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
```

### Git 分支策略

**推薦使用以下分支**：

```
main
├─ production（生產環境）
├─ develop（開發環境）
└─ feature/[功能名稱]（功能分支）
```

**工作流程**：
```bash
# 創建功能分支
git checkout -b feature/add-lending-system

# 完成功能後，提交 Pull Request
# 在 GitHub 上合併到 develop
# 定期將 develop 合併到 main（發布）
```

---

## 💾 本地備份策略

### 推薦的備份結構

```
~/backups/
├── world-nexus-2026-04-12/
│   ├── client/
│   ├── server/
│   ├── drizzle/
│   └── ... (完整項目)
├── world-nexus-2026-04-15/
│   └── ... (更新版本)
└── world-nexus-latest/
    └── ... (最新版本的符號鏈接)
```

### 自動備份腳本

**創建備份腳本** (`backup.sh`)：

```bash
#!/bin/bash

# 設置備份目錄
BACKUP_DIR="$HOME/backups"
PROJECT_DIR="/home/ubuntu/world-mini-app-nexus"
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
BACKUP_PATH="$BACKUP_DIR/world-nexus-$TIMESTAMP"

# 創建備份目錄
mkdir -p "$BACKUP_DIR"

# 複製項目文件
cp -r "$PROJECT_DIR" "$BACKUP_PATH"

# 創建最新版本的符號鏈接
ln -sfn "$BACKUP_PATH" "$BACKUP_DIR/world-nexus-latest"

# 打印完成信息
echo "✅ Backup completed: $BACKUP_PATH"

# 清理舊備份（保留最近 10 個）
ls -t "$BACKUP_DIR"/world-nexus-* | tail -n +11 | xargs rm -rf
```

**使用備份腳本**：

```bash
# 1. 保存為 backup.sh
# 2. 添加執行權限
chmod +x backup.sh

# 3. 運行備份
./backup.sh

# 4. 設置定時備份（每天午夜）
# 編輯 crontab
crontab -e

# 添加以下行
0 0 * * * /home/ubuntu/world-mini-app-nexus/backup.sh
```

---

## 🔐 安全建議

### 1. 保護敏感信息

**不要上傳的文件**：
- `.env` - 環境變量
- `.env.local` - 本地環境配置
- 私鑰文件
- API 密鑰

**使用 .gitignore**：
```
.env
.env.local
.env.*.local
*.key
*.pem
```

### 2. 使用 GitHub Secrets

**為 CI/CD 存儲敏感信息**：

1. 打開 GitHub Repository
2. 進入 Settings → Secrets and variables → Actions
3. 點擊「New repository secret」
4. 添加敏感信息（API 密鑰、密碼等）

### 3. 設置 Repository 保護

**保護 main 分支**：

1. 打開 GitHub Repository
2. 進入 Settings → Branches
3. 點擊「Add rule」
4. 分支名稱：`main`
5. 啟用「Require pull request reviews」
6. 啟用「Require status checks to pass」

---

## 📊 查看 Git 歷史

### 查看提交歷史

```bash
# 查看簡潔的提交歷史
git log --oneline

# 查看詳細的提交歷史
git log --pretty=format:"%h - %an, %ar : %s"

# 查看圖形化的分支歷史
git log --graph --oneline --all
```

### 查看特定文件的更改

```bash
# 查看文件的提交歷史
git log -- filename

# 查看文件的詳細更改
git show commit-hash:filename
```

---

## 🆘 常見問題與解決方案

### Q1：我想撤銷最後一次提交

```bash
# 撤銷提交，但保留更改
git reset --soft HEAD~1

# 撤銷提交和更改
git reset --hard HEAD~1
```

### Q2：我不小心上傳了敏感信息

```bash
# 從歷史中移除敏感文件
git filter-branch --tree-filter 'rm -f .env' HEAD

# 強制推送（謹慎使用）
git push origin main --force
```

### Q3：我想恢復已刪除的文件

```bash
# 查看已刪除文件的歷史
git log --diff-filter=D --summary | grep delete

# 恢復文件
git checkout HEAD~1 -- filename
```

### Q4：我想合併兩個分支

```bash
# 切換到 main 分支
git checkout main

# 合併 develop 分支
git merge develop

# 推送更改
git push origin main
```

---

## 📈 推薦的 GitHub 設置

### 1. 添加 README.md

在項目根目錄創建 `README.md`：

```markdown
# World Nexus

World Nexus 是一個建立在 World ID 4.0 上的去中心化交易與金融平台。

## 功能

- 🔐 World ID 4.0 真人認證
- 💰 WLD 原生支付
- 🛍️ 去中心化交易市場
- 🪙 平台代幣系統
- 🎰 抽獎系統
- 💳 貸款系統

## 快速開始

```bash
git clone https://github.com/[您的用戶名]/world-nexus.git
cd world-nexus
pnpm install
pnpm dev
```

## 技術棧

- React 19 + Tailwind CSS 4
- Express.js + tRPC
- MySQL/TiDB
- World ID 4.0 IDKit

## 文檔

- [技術設計文檔](./TECHNICAL_DESIGN.md)
- [商業計劃書](./BUSINESS_PLAN.md)
- [融資指南](./FUNDING_CHECKLIST.md)

## 許可證

MIT License
```

### 2. 添加 LICENSE

在項目根目錄創建 `LICENSE` 文件（MIT License）：

```
MIT License

Copyright (c) 2026 [您的名字]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

### 3. 添加 CONTRIBUTING.md

```markdown
# Contributing to World Nexus

感謝您對 World Nexus 的興趣！

## 如何貢獻

1. Fork 本 Repository
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打開 Pull Request

## 代碼風格

- 使用 Prettier 格式化代碼
- 遵循 ESLint 規則
- 添加必要的註釋和文檔

## 報告 Bug

使用 GitHub Issues 報告 Bug。
```

---

## ✅ 完整的設置檢查清單

- [ ] 創建 GitHub 賬戶（如沒有）
- [ ] 創建 GitHub Repository
- [ ] 配置 Git 用戶信息
- [ ] 首次推送代碼到 GitHub
- [ ] 添加 README.md
- [ ] 添加 LICENSE
- [ ] 添加 CONTRIBUTING.md
- [ ] 設置 Repository 保護規則
- [ ] 設置 GitHub Secrets
- [ ] 配置本地備份策略
- [ ] 測試 Git 工作流程

---

## 🎯 立即開始

**現在就開始保存您的代碼**：

### 選項 A：使用 Manus 一鍵導出（推薦）
1. 打開 Management UI
2. 點擊「⋯」→「GitHub」
3. 授權並導出

### 選項 B：手動 Git 設置
1. 創建 GitHub Repository
2. 運行 Git 初始化命令
3. 推送代碼

### 選項 C：下載 ZIP 備份
1. 打開 Management UI
2. 點擊「⋯」→「Download as ZIP」
3. 解壓到本地

**選擇最適合您的方式，立即開始！** 🚀
