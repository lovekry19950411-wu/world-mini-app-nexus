# 🌍 World Nexus

**Decentralized Trading & Finance Platform on World ID 4.0**

> 一個建立在 World ID 4.0 真人認證基礎上的去中心化交易與金融生態系統，整合 WLD 支付、平台代幣、抽獎、貸款等多元功能，為 World App 生態帶來完整的金融解決方案。

---

## 📋 目錄

1. [項目概述](#項目概述)
2. [核心功能](#核心功能)
3. [技術架構](#技術架構)
4. [商業邏輯](#商業邏輯)
5. [快速開始](#快速開始)
6. [API 文檔](#api-文檔)
7. [數據模型](#數據模型)
8. [融資與補助](#融資與補助)
9. [部署指南](#部署指南)
10. [貢獻指南](#貢獻指南)

---

## 🎯 項目概述

### 願景

**World Nexus** 致力於在 World App 生態中建立一個**完全去中心化、真實用戶驅動的交易與金融平台**。通過 World ID 4.0 的真人認證，我們確保每筆交易都來自真實用戶，消除虛假交易和欺詐行為。

### 使命

- 🔐 **真實性第一** - 使用 World ID 4.0 確保所有用戶都是真實人類
- 💰 **金融民主化** - 為所有人提供平等的交易與融資機會
- 🌱 **生態建設** - 為 World App 生態貢獻完整的金融基礎設施
- 🚀 **可持續增長** - 通過多元收入模型實現長期可持續發展

### 核心價值

| 價值 | 說明 |
|------|------|
| **真實性** | 每個用戶都經過 World ID 4.0 驗證 |
| **安全性** | 所有交易都經過智能合約驗證 |
| **透明性** | 所有交易記錄都可追蹤 |
| **包容性** | 為全球用戶提供平等機會 |
| **可持續性** | 多元收入模型確保長期發展 |

---

## 🎪 核心功能

### 1. 🔐 World ID 4.0 真人認證系統

**功能描述**：
- 使用 World ID IDKit 進行一次性真人驗證
- 防止重複認證（nullifier 機制）
- 支持 World App 原生環境與瀏覽器環境

**技術實現**：
```typescript
// 前端：發起驗證
const verifyResult = await executeWorldIDVerification(action, signal);

// 後端：驗證並儲存
const backendResult = await trpc.worldId.verify.mutate({
  proof: verifyResult.proof,
  nullifierHash: verifyResult.nullifier_hash,
  action,
  signal,
});
```

**用戶流程**：
```
未認證用戶 → 點擊「World ID 認證」
          → 跳轉到 World ID 驗證頁面
          → 完成生物識別/人臉識別
          → 返回應用
          → 獲得認證徽章
          → 解鎖所有功能
```

**防護機制**：
- ✅ Nullifier 防重複認證
- ✅ Action & Signal 驗證
- ✅ Proof 格式驗證
- ✅ 時間戳驗證

---

### 2. 🛍️ 去中心化交易市場

**功能描述**：
- 用戶可上架二手或全新商品
- 支持商品分類、搜尋、篩選
- 完整的購買流程與支付驗證
- 交易記錄與評價系統

**商品分類**：
- 📱 電子產品
- 👔 服裝配飾
- 🏠 家居用品
- 📚 書籍與媒體
- 🎮 遊戲與娛樂
- 🚗 汽車配件
- 💎 收藏品
- 🔧 工具與設備

**商品狀況**：
- 🆕 全新
- 🟢 良好
- 🟡 一般
- 🔴 需維修

**技術實現**：
```typescript
// 上架商品
const listProduct = await trpc.marketplace.listProduct.mutate({
  title: "iPhone 14 Pro",
  description: "Excellent condition, minimal usage",
  category: "electronics",
  condition: "excellent",
  price: 800,
  images: ["url1", "url2", "url3"],
});

// 購買商品
const purchase = await trpc.marketplace.purchaseProduct.mutate({
  productId: "prod_123",
  paymentMethod: "WLD",
});
```

**用戶流程**：
```
瀏覽市場 → 搜尋商品 → 查看詳情 → 發起購買
        → 完成 WLD 支付 → 交易確認 → 評價賣家
```

---

### 3. 💳 MiniKit Pay 支付系統

**功能描述**：
- 原生 WLD 支付集成
- 支持穩定幣支付（USDC、DAI 等）
- 實時支付驗證與確認
- 交易記錄與退款管理

**支付流程**：
```
發起支付 → 選擇支付方式 → 確認金額
       → MiniKit Pay 彈窗 → 用戶簽名
       → 交易發送到鏈上 → 等待確認
       → 驗證交易哈希 → 支付完成
```

**技術實現**：
```typescript
// 發起支付
const paymentResult = await MiniKit.commandsAsync({
  command: "pay",
  params: {
    reference_id: "tx_123",
    to: MERCHANT_ADDRESS,
    tokens: [
      {
        symbol: "WLD",
        token_address: WLD_ADDRESS,
        amount: "100",
      },
    ],
    description: "Purchase: iPhone 14 Pro",
  },
});

// 驗證支付
const verified = await trpc.payment.verify.mutate({
  transactionHash: paymentResult.transaction_id,
  amount: 100,
  paymentMethod: "WLD",
});
```

**安全機制**：
- ✅ 交易哈希驗證
- ✅ 金額驗證
- ✅ 收款方驗證
- ✅ 重放攻擊防護

---

### 4. 🪙 NEXUS 平台代幣系統

**功能描述**：
- 原生平台代幣 NEXUS
- 用戶活躍獎勵機制
- 交易回饋與積分系統
- 代幣兌換與流動性挖礦

**代幣經濟學**：

| 指標 | 數值 |
|------|------|
| **總供應量** | 1,000,000 NEXUS |
| **初始流通** | 100,000 NEXUS |
| **年通脹率** | 5-10% |
| **最小單位** | 0.0001 NEXUS |

**代幣分配**：
- 👥 社區獎勵：40%（400,000 NEXUS）
- 🏢 團隊與顧問：20%（200,000 NEXUS）
- 💰 融資與流動性：25%（250,000 NEXUS）
- 🔐 儲備金：15%（150,000 NEXUS）

**獲取方式**：
1. **交易回饋** - 每筆交易返回 1-5% 的 NEXUS
2. **活躍獎勵** - 每日登入、完成任務獲得 NEXUS
3. **流動性挖礦** - 提供流動性獲得 NEXUS
4. **推薦獎勵** - 邀請朋友獲得 NEXUS

**使用場景**：
- 💳 支付交易手續費（享受 50% 折扣）
- 🎰 購買抽獎券
- 💰 借貸利息支付
- 🗳️ 治理投票權
- 🏆 獲得平台徽章

**技術實現**：
```typescript
// 查詢代幣餘額
const balance = await trpc.tokens.getBalance.query();

// 兌換代幣
const swap = await trpc.tokens.swap.mutate({
  from: "NEXUS",
  to: "WLD",
  amount: 100,
});

// 質押代幣
const stake = await trpc.tokens.stake.mutate({
  amount: 1000,
  duration: 30, // 天數
});
```

---

### 5. 🎰 抽獎系統

**功能描述**：
- 用戶購買抽獎券參與抽獎
- 支持 WLD 或 NEXUS 購票
- 定期開獎與獎金分配
- 透明的開獎機制

**抽獎機制**：

| 項目 | 詳情 |
|------|------|
| **購票價格** | 1 WLD 或 100 NEXUS |
| **開獎周期** | 每周一次 |
| **獎池規模** | 動態，基於購票總額 |
| **中獎概率** | 1-5%（基於購票數量） |

**獎金分配**：
- 🥇 一等獎（1 名）：獎池的 50%
- 🥈 二等獎（5 名）：獎池的 30%
- 🥉 三等獎（20 名）：獎池的 20%

**開獎流程**：
```
購票期間 → 累積獎池 → 開獎時間到達
        → 隨機選擇中獎者 → 驗證中獎資格
        → 分配獎金 → 發送通知
        → 用戶領取獎金
```

**技術實現**：
```typescript
// 購買抽獎券
const buyTicket = await trpc.lottery.buyTicket.mutate({
  quantity: 10,
  paymentMethod: "WLD",
});

// 查詢抽獎歷史
const history = await trpc.lottery.getHistory.query({
  limit: 20,
});

// 領取獎金
const claim = await trpc.lottery.claimPrize.mutate({
  drawId: "draw_123",
});
```

---

### 6. 💰 貸款系統

**功能描述**：
- 用戶質押資產借貸 WLD
- 動態利率機制
- 自動清算保護
- 流動性挖礦機制

**借貸參數**：

| 參數 | 數值 |
|------|------|
| **最大 LTV** | 75% |
| **清算閾值** | 80% |
| **基礎利率** | 2-8% APY |
| **最短借期** | 7 天 |
| **最長借期** | 365 天 |

**支持的抵押品**：
- 💎 WLD
- 🪙 NEXUS
- 📊 USDC
- 💵 DAI
- 🔗 其他主流代幣

**利率計算**：
```
利率 = 基礎利率 + 風險溢價 + 市場利率
基礎利率 = 2%（基礎成本）
風險溢價 = LTV * 0.5%（抵押風險）
市場利率 = 供需比例動態調整
```

**借貸流程**：
```
質押資產 → 確認抵押品 → 借入 WLD
       → 定期支付利息 → 到期還款
       → 取回抵押品
```

**技術實現**：
```typescript
// 質押資產借貸
const borrow = await trpc.lending.borrow.mutate({
  collateral: "WLD",
  collateralAmount: 2.5,
  borrowAmount: 1.875, // 75% LTV
  duration: 30,
});

// 查詢借貸狀態
const status = await trpc.lending.getStatus.query();

// 還款
const repay = await trpc.lending.repay.mutate({
  loanId: "loan_123",
  amount: 1.875,
});
```

---

### 7. 👤 個人中心儀表板

**功能描述**：
- 資產總覽與統計
- 交易歷史與詳情
- 代幣管理與兌換
- 借貸與抽獎狀態

**儀表板內容**：

| 模塊 | 功能 |
|------|------|
| **資產概覽** | 總資產、WLD 餘額、NEXUS 餘額、借貸狀態 |
| **交易記錄** | 所有交易、篩選、導出 |
| **代幣管理** | 餘額、交易歷史、質押狀態 |
| **借貸管理** | 活躍貸款、還款計劃、清算風險 |
| **抽獎記錄** | 購票記錄、中獎歷史、獎金領取 |
| **個人資料** | World ID 狀態、錢包地址、安全設置 |

---

## 🏗️ 技術架構

### 系統架構圖

```
┌─────────────────────────────────────────────────────────┐
│                    World App 環境                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Frontend (React 19 + Tailwind 4)       │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • World ID 認證頁面                             │   │
│  │  • 交易市場頁面                                  │   │
│  │  • 代幣系統頁面                                  │   │
│  │  • 抽獎系統頁面                                  │   │
│  │  • 貸款系統頁面                                  │   │
│  │  • 個人中心儀表板                                │   │
│  └──────────────────────────────────────────────────┘   │
│           ↓ tRPC Client ↓                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │        MiniKit 與 IDKit SDK                      │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • MiniKit.isInstalled()                         │   │
│  │  • IDKit.verify()                                │   │
│  │  • MiniKit.commandsAsync()                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
                         ↓ HTTPS ↓
┌─────────────────────────────────────────────────────────┐
│                  Backend (Express + tRPC)               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │           tRPC Routers                           │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • worldId.verify()                              │   │
│  │  • worldId.getStatus()                           │   │
│  │  • marketplace.listProduct()                     │   │
│  │  • marketplace.purchaseProduct()                 │   │
│  │  • payment.verify()                              │   │
│  │  • tokens.getBalance()                           │   │
│  │  • lottery.buyTicket()                           │   │
│  │  • lending.borrow()                              │   │
│  │  • transactions.confirmPayment()                 │   │
│  └──────────────────────────────────────────────────┘   │
│           ↓ Database Queries ↓                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │      Database Layer (Drizzle ORM)               │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • users 表                                      │   │
│  │  • products 表                                   │   │
│  │  • transactions 表                               │   │
│  │  • tokens 表                                     │   │
│  │  • lottery_tickets 表                            │   │
│  │  • loans 表                                      │   │
│  │  • nullifiers 表（防重複認證）                   │   │
│  └──────────────────────────────────────────────────┘   │
│           ↓ MySQL/TiDB ↓                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │        MySQL/TiDB Database                      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
                         ↓ API ↓
┌─────────────────────────────────────────────────────────┐
│              External Services                          │
├─────────────────────────────────────────────────────────┤
│  • World ID Backend API                                 │
│  • Blockchain RPC (Polygon, Optimism, etc.)             │
│  • S3 Storage (Image Upload)                            │
│  • Email Service (Notifications)                        │
└─────────────────────────────────────────────────────────┘
```

### 技術棧

| 層級 | 技術 | 版本 |
|------|------|------|
| **前端框架** | React | 19.x |
| **樣式框架** | Tailwind CSS | 4.x |
| **狀態管理** | React Query | 5.x |
| **API 框架** | tRPC | 11.x |
| **後端框架** | Express.js | 4.x |
| **ORM** | Drizzle ORM | 0.44.x |
| **數據庫** | MySQL/TiDB | 8.x |
| **認證** | World ID IDKit | Latest |
| **支付** | MiniKit Pay | Latest |
| **部署** | Manus | Latest |

### 數據流

```
用戶操作 → React 組件 → tRPC Hook
        → tRPC 客戶端 → HTTP 請求
        → Express 路由 → 業務邏輯
        → Drizzle ORM → 數據庫查詢
        → 返回結果 → React 組件更新
        → UI 重新渲染
```

---

## 💼 商業邏輯

### 收入模型

World Nexus 採用**多元收入模型**，確保長期可持續發展：

#### 1. 交易手續費（40% 收入）

**機制**：
- 每筆交易收取 2-3% 的手續費
- 使用 NEXUS 支付可享受 50% 折扣
- 高級用戶（VIP）享受 1% 折扣

**計算示例**：
```
商品價格：100 WLD
手續費：2%（2 WLD）
用戶支付：102 WLD
平台收入：2 WLD
```

**預期收入**：
- 月交易額：$500K
- 手續費率：2.5%
- 月收入：$12,500

#### 2. 代幣交易費（20% 收入）

**機制**：
- NEXUS 交易對收取 0.5% 的交易費
- 流動性挖礦收取 0.25% 的費用
- 代幣兌換收取 1% 的費用

**計算示例**：
```
交易額：1,000 NEXUS
交易費：0.5%（5 NEXUS）
平台收入：5 NEXUS
```

**預期收入**：
- 月交易額：$200K
- 費用率：0.5%
- 月收入：$1,000

#### 3. 借貸利息（25% 收入）

**機制**：
- 從借貸利息中提取 30% 作為平台費用
- 動態利率根據市場調整
- 清算罰金的 50% 作為平台收入

**計算示例**：
```
借貸金額：1,000 WLD
年利率：5%
年利息：50 WLD
平台收取：30%（15 WLD）
平台月收入：1.25 WLD
```

**預期收入**：
- 借貸總額：$1M
- 平均利率：5%
- 平台提成：30%
- 月收入：$1,250

#### 4. 高級功能（10% 收入）

**機制**：
- VIP 會員費：$9.99/月
- 高級分析工具：$4.99/月
- API 訪問費：按使用量計費
- 廣告位置：$1,000/月

**預期收入**：
- VIP 用戶：1,000 人 × $9.99 = $9,990
- 分析工具：500 人 × $4.99 = $2,495
- API 訪問：$2,000
- 廣告位置：$1,000
- 月收入：$15,485

#### 5. 補助與獎勵（5% 收入）

**機制**：
- World Foundation 補助
- 生態基金獎勵
- 社區激勵計劃

**預期收入**：
- Spark Track：$50-100K（一次性）
- Retroactive Funding：$40-200K（一次性）
- 月度激勵：$5,000

### 收入預測

**第一年月度收入預測**：

| 月份 | 交易手續費 | 代幣交易費 | 借貸利息 | 高級功能 | 補助 | 總計 |
|------|-----------|-----------|---------|---------|------|------|
| 1-2 | $5K | $500 | $500 | $5K | $50K | $60.5K |
| 3-4 | $8K | $1K | $1K | $8K | $30K | $48K |
| 5-6 | $12K | $2K | $2K | $12K | $20K | $48K |
| 7-12 | $15K | $3K | $3K | $15K | $10K | $46K |
| **年度合計** | **$132K** | **$18K** | **$18K** | **$132K** | **$200K** | **$500K** |

### 成本結構

| 項目 | 月成本 | 說明 |
|------|--------|------|
| **基礎設施** | $5K | 服務器、數據庫、CDN |
| **人力成本** | $15K | 2-3 名開發者 |
| **營銷** | $5K | 社群運營、廣告 |
| **法律合規** | $2K | 法律顧問、審計 |
| **其他** | $3K | 工具、軟件、雜費 |
| **總計** | **$30K** | - |

### 利潤預測

**第一年利潤**：
- 年收入：$500K
- 年成本：$360K
- 年利潤：$140K
- 利潤率：28%

**第二年預測**：
- 年收入：$1.2M（增長 140%）
- 年成本：$500K（增長 39%）
- 年利潤：$700K
- 利潤率：58%

---

## 🚀 快速開始

### 前置要求

- Node.js 18+
- pnpm 或 npm
- MySQL 8.0+ 或 TiDB
- Git

### 本地開發

**1. 克隆儲存庫**
```bash
git clone https://github.com/lovekry19950411-wu/world-mini-app-nexus.git
cd world-mini-app-nexus
```

**2. 安裝依賴**
```bash
pnpm install
```

**3. 配置環境變量**
```bash
cp .env.example .env.local
# 編輯 .env.local，填入以下信息：
# DATABASE_URL=mysql://user:password@localhost:3306/world_nexus
# VITE_WORLD_APP_ID=app_f4bf6f2a1ca32e4f9af5f35b529f98f6
# VITE_WORLD_RP_ID=rp_f3e265557bade5a0
# RP_SIGNING_KEY=0xa14edcf47bd881158379679c6397620b89907e7e9fc7707c20ff5b96177232c2
```

**4. 初始化數據庫**
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

**5. 啟動開發服務器**
```bash
pnpm dev
```

**6. 訪問應用**
```
http://localhost:3000
```

### 生產部署

**1. 構建應用**
```bash
pnpm build
```

**2. 啟動生產服務器**
```bash
pnpm start
```

**3. 配置反向代理**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📚 API 文檔

### World ID 認證 API

#### `worldId.verify`

驗證 World ID 證明並記錄用戶認證狀態。

**請求**：
```typescript
{
  proof: string;           // World ID 證明
  nullifierHash: string;   // Nullifier 哈希
  action: string;          // 驗證操作
  signal: string;          // 驗證信號
}
```

**響應**：
```typescript
{
  success: boolean;
  nullifierHash?: string;
  message?: string;
  error?: string;
}
```

**示例**：
```typescript
const result = await trpc.worldId.verify.mutate({
  proof: "0x...",
  nullifierHash: "0x...",
  action: "world-nexus-verification",
  signal: "1234567890-abc123",
});
```

### 交易市場 API

#### `marketplace.listProduct`

上架新商品。

**請求**：
```typescript
{
  title: string;           // 商品標題
  description: string;     // 商品描述
  category: string;        // 商品分類
  condition: string;       // 商品狀況
  price: number;           // 商品價格（WLD）
  images: string[];        // 商品圖片 URL
}
```

**響應**：
```typescript
{
  success: boolean;
  productId?: string;
  error?: string;
}
```

#### `marketplace.purchaseProduct`

購買商品。

**請求**：
```typescript
{
  productId: string;       // 商品 ID
  paymentMethod: "WLD" | "NEXUS";  // 支付方式
}
```

**響應**：
```typescript
{
  success: boolean;
  transactionId?: string;
  error?: string;
}
```

### 支付 API

#### `payment.verify`

驗證支付交易。

**請求**：
```typescript
{
  transactionHash: string; // 交易哈希
  amount: number;          // 交易金額
  paymentMethod: "WLD" | "NEXUS";
}
```

**響應**：
```typescript
{
  success: boolean;
  verified: boolean;
  error?: string;
}
```

### 代幣 API

#### `tokens.getBalance`

獲取用戶代幣餘額。

**響應**：
```typescript
{
  wld: number;             // WLD 餘額
  nexus: number;           // NEXUS 餘額
  staked: number;          // 質押的 NEXUS
}
```

#### `tokens.swap`

交換代幣。

**請求**：
```typescript
{
  from: "WLD" | "NEXUS";   // 源代幣
  to: "WLD" | "NEXUS";     // 目標代幣
  amount: number;          // 交換數量
}
```

**響應**：
```typescript
{
  success: boolean;
  swappedAmount?: number;
  error?: string;
}
```

### 抽獎 API

#### `lottery.buyTicket`

購買抽獎券。

**請求**：
```typescript
{
  quantity: number;        // 購票數量
  paymentMethod: "WLD" | "NEXUS";
}
```

**響應**：
```typescript
{
  success: boolean;
  ticketIds?: string[];
  error?: string;
}
```

#### `lottery.getHistory`

獲取抽獎歷史。

**請求**：
```typescript
{
  limit?: number;          // 返回數量
  offset?: number;         // 偏移量
}
```

**響應**：
```typescript
{
  draws: Array<{
    id: string;
    date: Date;
    prizePool: number;
    winners: number;
    userWinnings: number;
  }>;
  total: number;
}
```

### 借貸 API

#### `lending.borrow`

質押資產借貸。

**請求**：
```typescript
{
  collateral: string;      // 抵押品類型
  collateralAmount: number; // 抵押品數量
  borrowAmount: number;    // 借入金額
  duration: number;        // 借期（天）
}
```

**響應**：
```typescript
{
  success: boolean;
  loanId?: string;
  interestRate?: number;
  error?: string;
}
```

#### `lending.repay`

還款。

**請求**：
```typescript
{
  loanId: string;          // 貸款 ID
  amount: number;          // 還款金額
}
```

**響應**：
```typescript
{
  success: boolean;
  remainingBalance?: number;
  error?: string;
}
```

---

## 📊 數據模型

### 用戶表 (users)

```typescript
{
  id: number;              // 用戶 ID
  openId: string;          // Manus OAuth ID
  name: string;            // 用戶名
  email: string;           // 郵箱
  walletAddress: string;   // 錢包地址
  worldIdNullifier: string; // World ID Nullifier
  verified: boolean;       // 是否通過 World ID 驗證
  verifiedAt: Date;        // 驗證時間
  role: "user" | "admin";  // 用戶角色
  createdAt: Date;         // 創建時間
  updatedAt: Date;         // 更新時間
}
```

### 商品表 (products)

```typescript
{
  id: string;              // 商品 ID
  sellerId: number;        // 賣家 ID
  title: string;           // 商品標題
  description: string;     // 商品描述
  category: string;        // 商品分類
  condition: string;       // 商品狀況
  price: number;           // 商品價格（WLD）
  images: string[];        // 商品圖片 URL
  status: "available" | "sold" | "delisted";
  createdAt: Date;         // 創建時間
  soldAt?: Date;           // 售出時間
}
```

### 交易表 (transactions)

```typescript
{
  id: string;              // 交易 ID
  buyerId: number;         // 買家 ID
  sellerId: number;        // 賣家 ID
  productId: string;       // 商品 ID
  amount: number;          // 交易金額（WLD）
  paymentMethod: "WLD" | "NEXUS";
  transactionHash: string; // 區塊鏈交易哈希
  status: "pending" | "completed" | "failed";
  createdAt: Date;         // 創建時間
  completedAt?: Date;      // 完成時間
}
```

### 代幣表 (tokens)

```typescript
{
  id: string;              // 代幣記錄 ID
  userId: number;          // 用戶 ID
  balance: number;         // 代幣餘額
  staked: number;          // 質押代幣
  earned: number;          // 已獲得代幣
  spent: number;           // 已花費代幣
  updatedAt: Date;         // 更新時間
}
```

### 抽獎表 (lottery_tickets)

```typescript
{
  id: string;              // 抽獎券 ID
  userId: number;          // 用戶 ID
  drawId: string;          // 開獎 ID
  ticketNumber: number;    // 抽獎券號
  paymentMethod: "WLD" | "NEXUS";
  won: boolean;            // 是否中獎
  prize?: number;          // 獎金
  createdAt: Date;         // 創建時間
}
```

### 貸款表 (loans)

```typescript
{
  id: string;              // 貸款 ID
  userId: number;          // 用戶 ID
  collateral: string;      // 抵押品類型
  collateralAmount: number; // 抵押品數量
  borrowAmount: number;    // 借入金額
  interestRate: number;    // 利率（年化）
  duration: number;        // 借期（天）
  status: "active" | "repaid" | "liquidated";
  createdAt: Date;         // 創建時間
  repaidAt?: Date;         // 還款時間
}
```

### Nullifier 表 (nullifiers)

```typescript
{
  id: string;              // 記錄 ID
  hash: string;            // Nullifier 哈希
  userId: number;          // 用戶 ID
  action: string;          // 驗證操作
  signal: string;          // 驗證信號
  createdAt: Date;         // 創建時間
}
```

---

## 💰 融資與補助

### 融資目標

**第一輪融資目標**：$100K-$400K

**資金用途**：
- 👥 團隊擴展（40%）- 聘請 2-3 名開發者
- 🛠️ 技術開發（30%）- 完成後端邏輯、安全審計
- 📢 營銷推廣（20%）- 社群建設、廣告投放
- 💼 運營成本（10%）- 基礎設施、法律合規

### 補助申請

#### 1. World Foundation Spark Track

**申請網址**：https://world.org/grants

**資助金額**：$50-100K

**申請條件**：
- ✅ 創新的 World ID 應用
- ✅ 清晰的商業模式
- ✅ 專業的團隊
- ✅ 可行的技術方案

**申請材料**：
- 項目計劃書
- 技術文檔
- 團隊背景
- 預算明細
- 應用演示

**預期時間**：4-8 週

#### 2. World Foundation Retroactive Funding

**申請網址**：https://world.org/retro

**資助金額**：6,500 WLD (~$130K)

**申請條件**：
- ✅ 已上線的應用
- ✅ 為社區帶來價值
- ✅ 支持 World ID 生態
- ✅ 透明的財務報告

**申請材料**：
- 應用截圖
- 用戶數據
- 社區反饋
- 貢獻說明

**預期時間**：2-4 週

#### 3. AngelList 融資

**平台網址**：https://www.angellist.com

**融資金額**：$100K-$500K

**融資階段**：Pre-seed / Seed

**投資者類型**：
- 天使投資人
- Micro VC
- 加密基金

**申請材料**：
- Pitch Deck
- 商業計劃書
- 應用演示視頻
- 團隊簡介

**預期時間**：6-12 週

### 融資時間表

```
第 1-2 週：準備申請材料
第 3 週：  提交 Spark Track 申請
第 4 週：  提交 Retroactive Funding 申請
第 5-8 週：Spark Track 審核期
第 9-12 週：Retroactive Funding 審核期
第 13-26 週：AngelList 融資活動
第 27-52 週：資金到賬與使用
```

---

## 🚀 部署指南

### 部署到 Manus

**1. 準備部署**
```bash
# 確保所有代碼已提交
git add .
git commit -m "Ready for deployment"
git push origin main
```

**2. 配置環境變量**
- 訪問 Manus Management UI
- 進入 Settings → Secrets
- 添加所有必需的環境變量

**3. 部署應用**
- 點擊 Publish 按鈕
- 選擇部署目標
- 確認部署

**4. 驗證部署**
```bash
# 訪問應用 URL
https://worldnexus-qus9eyn3.manus.space

# 測試核心功能
- 測試 World ID 認證
- 測試交易市場
- 測試支付系統
```

### 監控與維護

**性能監控**：
- 應用響應時間 < 500ms
- 數據庫查詢時間 < 100ms
- 錯誤率 < 0.1%

**日誌管理**：
- 啟用應用日誌
- 配置錯誤告警
- 定期備份日誌

**安全維護**：
- 定期更新依賴
- 進行安全審計
- 監控異常交易

---

## 🤝 貢獻指南

### 開發流程

**1. Fork 項目**
```bash
git clone https://github.com/lovekry19950411-wu/world-mini-app-nexus.git
cd world-mini-app-nexus
```

**2. 創建功能分支**
```bash
git checkout -b feature/your-feature-name
```

**3. 提交更改**
```bash
git add .
git commit -m "feat: Add your feature description"
git push origin feature/your-feature-name
```

**4. 提交 Pull Request**
- 描述您的更改
- 參考相關 Issue
- 等待審核

### 代碼風格

- 使用 Prettier 格式化代碼
- 遵循 ESLint 規則
- 添加必要的註釋和文檔
- 編寫單元測試

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**類型**：
- `feat`: 新功能
- `fix`: Bug 修復
- `docs`: 文檔更新
- `style`: 代碼風格
- `refactor`: 代碼重構
- `test`: 測試添加
- `chore`: 構建工具更新

**示例**：
```
feat(marketplace): Add product search functionality

- Implement full-text search for products
- Add category filtering
- Add price range filtering

Closes #123
```

---

## 📞 支持與聯繫

### 文檔

- [技術設計文檔](./TECHNICAL_DESIGN.md)
- [商業計劃書](./BUSINESS_PLAN.md)
- [融資指南](./FUNDING_CHECKLIST.md)
- [部署檢查清單](./DEPLOYMENT_CHECKLIST.md)

### 社群

- **Discord**: [加入社群](https://discord.gg/worldnexus)
- **Twitter**: [@WorldNexus](https://twitter.com/worldnexus)
- **Email**: hello@worldnexus.io

### 報告 Bug

在 GitHub Issues 中報告 Bug：
https://github.com/lovekry19950411-wu/world-mini-app-nexus/issues

---

## 📄 許可證

本項目採用 MIT License。詳見 [LICENSE](./LICENSE) 文件。

---

## 🙏 致謝

感謝以下組織與個人的支持：

- **World Foundation** - 提供 World ID 技術與補助
- **Worldcoin** - 提供 MiniKit 與 IDKit SDK
- **Manus** - 提供開發與部署平台
- **社區貢獻者** - 提供反饋與支持

---

## 🎯 未來規劃

### 短期（3-6 個月）

- ✅ 完成核心功能開發
- ✅ 進行安全審計
- ✅ 啟動 Beta 測試
- ✅ 建設社群

### 中期（6-12 個月）

- 🔄 推出 NFT 市場
- 🔄 實現 DAO 治理
- 🔄 開放 API 生態
- 🔄 擴展到其他鏈

### 長期（12-24 個月）

- 🚀 上線主網
- 🚀 推出衍生品交易
- 🚀 建立風險投資基金
- 🚀 成為 Web3 金融基礎設施

---

**最後更新**：2026 年 4 月 12 日  
**版本**：1.0.0  
**狀態**：🚀 Ready for Launch

---

**祝您使用愉快！** 🌍✨
