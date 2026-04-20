# World Nexus: 技術設計文件

**作者**: Manus AI  
**版本**: 1.0  
**最後更新**: 2026-04-12  
**狀態**: 完成

---

## 目錄

1. [系統概述](#系統概述)
2. [架構設計](#架構設計)
3. [認證系統](#認證系統)
4. [支付系統](#支付系統)
5. [數據模型](#數據模型)
6. [API 規範](#api-規範)
7. [安全考慮](#安全考慮)
8. [部署指南](#部署指南)

---

## 系統概述

World Nexus 是一個建立在 Worldcoin 生態系統上的去中心化交易與金融平台迷你應用。該應用整合 World ID 4.0 真人認證、MiniKit 支付系統、平台代幣機制、抽獎池與貸款池等功能，為真實用戶提供安全、便捷的交易體驗。

### 核心特性

**真人認證**: 使用 World ID 4.0 確保所有交易參與者都是真實人類，防止機器人與詐欺行為。

**無縫支付**: 通過 MiniKit Pay 命令直接在 World App 內完成 WLD 與穩定幣支付，無需跳轉外部錢包。

**平台代幣**: 用戶通過交易與活躍獲得平台代幣，可用於抽獎、貸款利息折扣等場景。

**多元金融**: 支持二手/新品交易市場、抽獎池、貸款池等多種金融產品，最大化用戶參與度。

---

## 架構設計

### 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                        World App 環境                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              World Nexus Mini App (前端)              │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  React 19 + Tailwind CSS 4 (UI 層)            │  │   │
│  │  │  - 認證頁面 / 交易市場 / 代幣系統              │  │   │
│  │  │  - 抽獎池 / 貸款池 / 個人中心                  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  MiniKit SDK (World App 集成層)                │  │   │
│  │  │  - isInstalled() 環境偵測                      │  │   │
│  │  │  - Pay 命令 (WLD/穩定幣支付)                   │  │   │
│  │  │  - IDKit 認證流程                             │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕ (tRPC)
┌─────────────────────────────────────────────────────────────┐
│                      後端服務器 (Express.js)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  tRPC 路由層 (業務邏輯)                              │   │
│  │  - 認證路由 (World ID 驗證)                         │   │
│  │  - 交易路由 (商品、購買、支付驗證)                   │   │
│  │  - 代幣路由 (餘額、交易、獎勵)                       │   │
│  │  - 抽獎路由 (購票、開獎)                            │   │
│  │  - 貸款路由 (質押、借貸、還款)                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  認證與驗證層                                        │   │
│  │  - IDKit 證明驗證 (POST /v4/verify/{rp_id})         │   │
│  │  - Nullifier 存儲與檢查                             │   │
│  │  - MiniKit Pay 交易驗證                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  業務邏輯層                                          │   │
│  │  - 商品管理 / 交易處理 / 代幣分配                    │   │
│  │  - 抽獎邏輯 / 貸款計算                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    數據持久化層                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MySQL/TiDB 數據庫                                  │   │
│  │  - 用戶表 / 商品表 / 交易表                         │   │
│  │  - 代幣表 / 抽獎表 / 貸款表                         │   │
│  │  - Nullifier 表 (防重複認證)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  S3 文件存儲                                        │   │
│  │  - 商品圖片 / 用戶頭像                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                  外部服務集成                                │
│  - World ID 驗證服務 (developer.world.org/api/v4/verify)   │
│  - Developer Portal API (交易驗證)                         │
│  - World Chain (區塊鏈交易確認)                            │
└─────────────────────────────────────────────────────────────┘
```

### 技術棧

| 層級 | 技術 | 版本 | 用途 |
|------|------|------|------|
| **前端框架** | React | 19 | UI 組件與狀態管理 |
| **樣式系統** | Tailwind CSS | 4 | 響應式設計與主題 |
| **HTTP 客戶端** | tRPC | 11 | 類型安全的 RPC 調用 |
| **UI 組件庫** | shadcn/ui | 最新 | 可訪問的 UI 組件 |
| **後端框架** | Express.js | 4 | HTTP 服務器 |
| **RPC 框架** | tRPC | 11 | 類型安全的 API 層 |
| **數據庫 ORM** | Drizzle ORM | 0.44 | 類型安全的數據庫操作 |
| **數據庫** | MySQL/TiDB | 8+ | 關係型數據存儲 |
| **文件存儲** | AWS S3 | 最新 | 圖片與文件存儲 |
| **World 集成** | IDKit | 4.x | World ID 認證 |
| **World 集成** | MiniKit | 2.x | Mini App 支付與命令 |

---

## 認證系統

### World ID 4.0 集成流程

World ID 4.0 使用 IDKit 統一認證解決方案，支持 Mini Apps 與桌面應用。認證流程分為六個步驟：

#### 步驟 1: 安裝 IDKit

```bash
npm install @worldcoin/idkit-core
```

#### 步驟 2: 創建應用

在 [World Developer Portal](https://developer.world.org) 中創建應用並獲取以下憑證：

- **app_id**: `app_f4bf6f2a1ca32e4f9af5f35b529f98f6`
- **rp_id**: `rp_f3e265557bade5a0`
- **signing_key**: 後端簽名密鑰（絕不暴露於客戶端）

#### 步驟 3: 後端生成 RP 簽名

後端必須生成 RP 簽名以驗證證明請求的真實性，防止冒充攻擊。簽名包含 nonce、創建時間與過期時間。

```typescript
// server/auth.ts
import { signRequest } from "@worldcoin/idkit-core/signing";

export function generateRPSignature(action: string) {
  const { sig, nonce, createdAt, expiresAt } = signRequest({
    signingKeyHex: process.env.RP_SIGNING_KEY!,
    action,
  });

  return {
    sig,
    nonce,
    created_at: createdAt,
    expires_at: expiresAt,
  };
}
```

#### 步驟 4: 前端生成連接 URL 並收集證明

前端調用 IDKit 生成連接 URL，用戶掃描二維碼或點擊鏈接在 World App 中完成認證。

```typescript
// client/pages/Verify.tsx
import { IDKit, orbLegacy } from "@worldcoin/idkit-core";

export async function verifyIdentity(action: string) {
  // 從後端獲取 RP 簽名
  const rpSig = await fetch("/api/auth/rp-signature", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action }),
  }).then((r) => r.json());

  // 創建 IDKit 請求
  const request = await IDKit.request({
    app_id: "app_f4bf6f2a1ca32e4f9af5f35b529f98f6",
    action,
    rp_context: {
      rp_id: "rp_f3e265557bade5a0",
      nonce: rpSig.nonce,
      created_at: rpSig.created_at,
      expires_at: rpSig.expires_at,
      signature: rpSig.sig,
    },
    allow_legacy_proofs: true,
    environment: "production",
  }).preset(orbLegacy({ signal: "world-nexus-verify" }));

  // 獲取連接 URL 或等待完成
  const connectUrl = request.connectorURI;
  const response = await request.pollUntilCompletion();

  return response;
}
```

#### 步驟 5: 後端驗證證明

用戶完成認證後，前端將證明發送到後端進行驗證。後端調用 World ID 驗證 API 確認證明的密碼學有效性。

```typescript
// server/routers/auth.ts
export async function verifyProof(idkitResponse: IDKitResult) {
  const response = await fetch(
    `https://developer.world.org/api/v4/verify/rp_f3e265557bade5a0`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(idkitResponse),
    }
  );

  if (!response.ok) {
    throw new Error("Verification failed");
  }

  const result = await response.json();
  return result; // 包含 nullifier
}
```

#### 步驟 6: 存儲 Nullifier 防止重複認證

Nullifier 是從用戶的 World ID、應用與操作派生的唯一值。相同用戶驗證相同操作時產生相同 nullifier，但不同應用或操作產生不同 nullifier，確保跨應用不可鏈接。

後端必須檢查 nullifier 是否已被使用，防止同一用戶多次驗證同一操作。

```typescript
// server/db.ts
export async function storeNullifier(
  nullifier: string,
  action: string,
  userId: number
) {
  const db = await getDb();
  
  // 轉換 nullifier 為十進制數字（PostgreSQL NUMERIC(78, 0)）
  const nullifierDecimal = BigInt(nullifier).toString();

  await db.insert(nullifiers).values({
    nullifier: nullifierDecimal,
    action,
    userId,
    verifiedAt: new Date(),
  });
}

export async function checkNullifierUsed(
  nullifier: string,
  action: string
): Promise<boolean> {
  const db = await getDb();
  const nullifierDecimal = BigInt(nullifier).toString();

  const result = await db
    .select()
    .from(nullifiers)
    .where(
      and(
        eq(nullifiers.nullifier, nullifierDecimal),
        eq(nullifiers.action, action)
      )
    )
    .limit(1);

  return result.length > 0;
}
```

### 認證狀態管理

用戶認證狀態存儲在數據庫中，前端可通過 `trpc.auth.me` 查詢當前認證狀態。

```typescript
// server/routers/auth.ts
export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),
  
  verify: publicProcedure
    .input(z.object({ idkitResponse: z.any() }))
    .mutation(async ({ input, ctx }) => {
      // 驗證證明
      const proof = await verifyProof(input.idkitResponse);
      
      // 檢查 nullifier 是否已使用
      const alreadyVerified = await checkNullifierUsed(
        proof.nullifier,
        "world-nexus-verify"
      );
      
      if (alreadyVerified) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already verified",
        });
      }
      
      // 存儲 nullifier
      await storeNullifier(
        proof.nullifier,
        "world-nexus-verify",
        ctx.user.id
      );
      
      // 更新用戶認證狀態
      await updateUserVerificationStatus(ctx.user.id, true);
      
      return { success: true };
    }),
});
```

---

## 支付系統

### MiniKit Pay 集成

MiniKit Pay 是 World App 內的原生支付指令，支持 WLD 與所有本地穩定幣。支付流程完全在 World App 內進行，用戶無需跳轉外部錢包。

#### 支付流程

1. **前端發起支付**: 調用 `MiniKit.pay()` 並指定收款地址、金額與代幣類型
2. **用戶確認**: 用戶在 World App 中確認支付詳情
3. **交易執行**: World App 簽署並廣播交易到 World Chain
4. **返回結果**: 前端收到 `transactionId` 與 `reference`
5. **後端驗證**: 後端調用 Developer Portal API 驗證交易
6. **業務確認**: 確認交易後更新業務狀態（如標記商品為已售）

#### 實現代碼

```typescript
// client/pages/Checkout.tsx
import { MiniKit } from "@worldcoin/minikit-js";
import {
  Tokens,
  tokenToDecimals,
  type PayResult,
} from "@worldcoin/minikit-js/commands";

export async function processPayment(
  productId: number,
  amount: number,
  sellerAddress: string
) {
  // 創建支付參考 ID（後端生成）
  const response = await fetch("/api/payments/create-reference", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productId, amount }),
  });
  const { referenceId } = await response.json();

  // 調用 MiniKit Pay
  const paymentResult = await MiniKit.pay({
    reference: referenceId,
    to: sellerAddress,
    tokens: [
      {
        symbol: Tokens.WLD,
        token_amount: tokenToDecimals(amount, Tokens.WLD).toString(),
      },
    ],
    description: `Purchase product #${productId}`,
    fallback: () => {
      alert("Please complete the payment in World App to proceed.");
    },
  });

  // 發送結果到後端進行驗證
  if (paymentResult.executedWith === "minikit") {
    const verification = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        referenceId,
        transactionId: paymentResult.data.transactionId,
        from: paymentResult.data.from,
      }),
    });

    return verification.json();
  }
}
```

#### 後端驗證

```typescript
// server/routers/payments.ts
export const paymentsRouter = router({
  createReference: protectedProcedure
    .input(z.object({ productId: z.number(), amount: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // 生成唯一的參考 ID
      const referenceId = `${ctx.user.id}-${input.productId}-${Date.now()}`;
      
      // 存儲待驗證的支付
      await db.insert(pendingPayments).values({
        referenceId,
        buyerId: ctx.user.id,
        productId: input.productId,
        amount: input.amount,
        status: "pending",
      });
      
      return { referenceId };
    }),

  verify: protectedProcedure
    .input(
      z.object({
        referenceId: z.string(),
        transactionId: z.string(),
        from: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 調用 Developer Portal API 驗證交易
      const response = await fetch(
        `https://developer.worldcoin.org/api/v2/minikit/transaction/${input.transactionId}?app_id=${process.env.APP_ID}&type=payment`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment verification failed",
        });
      }

      const transaction = await response.json();

      // 驗證交易詳情
      if (transaction.status !== "success") {
        throw new TRPCError({
          code: "FAILED_PRECONDITION",
          message: "Payment not successful",
        });
      }

      // 更新支付狀態
      await db
        .update(pendingPayments)
        .set({ status: "completed", transactionId: input.transactionId })
        .where(eq(pendingPayments.referenceId, input.referenceId));

      // 執行業務邏輯（如標記商品為已售、分配代幣等）
      await completeTransaction(input.referenceId);

      return { success: true };
    }),
});
```

---

## 數據模型

### 用戶表 (users)

存儲用戶基本信息與認證狀態。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | INT | 主鍵，自動遞增 |
| `openId` | VARCHAR(64) | Manus OAuth 識別符，唯一 |
| `worldIdNullifier` | VARCHAR(256) | World ID nullifier（認證後存儲） |
| `walletAddress` | VARCHAR(42) | World Chain 錢包地址 |
| `isVerified` | BOOLEAN | World ID 認證狀態 |
| `platformTokenBalance` | DECIMAL(20,8) | 平台代幣餘額 |
| `reputation` | INT | 用戶信譽分（基於交易歷史） |
| `createdAt` | TIMESTAMP | 創建時間 |
| `updatedAt` | TIMESTAMP | 更新時間 |
| `lastSignedIn` | TIMESTAMP | 最後登入時間 |

### 商品表 (products)

存儲二手/新品商品信息。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | INT | 主鍵，自動遞增 |
| `sellerId` | INT | 賣家 ID（FK users） |
| `title` | VARCHAR(255) | 商品標題 |
| `description` | TEXT | 商品描述 |
| `category` | ENUM | 分類（新品/二手） |
| `condition` | ENUM | 商品狀況（如新/良好/一般） |
| `price` | DECIMAL(20,8) | 價格（WLD） |
| `images` | JSON | 圖片 URL 列表（S3） |
| `status` | ENUM | 狀態（上架/已售/下架） |
| `views` | INT | 瀏覽次數 |
| `createdAt` | TIMESTAMP | 創建時間 |
| `updatedAt` | TIMESTAMP | 更新時間 |

### 交易表 (transactions)

記錄所有商品購買交易。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | INT | 主鍵，自動遞增 |
| `buyerId` | INT | 買家 ID（FK users） |
| `sellerId` | INT | 賣家 ID（FK users） |
| `productId` | INT | 商品 ID（FK products） |
| `amount` | DECIMAL(20,8) | 交易金額（WLD） |
| `transactionId` | VARCHAR(256) | MiniKit Pay 交易 ID |
| `status` | ENUM | 狀態（待確認/已完成/已取消） |
| `platformTokenReward` | DECIMAL(20,8) | 交易獲得的平台代幣 |
| `createdAt` | TIMESTAMP | 創建時間 |
| `completedAt` | TIMESTAMP | 完成時間 |

### 平台代幣表 (platformTokens)

記錄用戶平台代幣的變動。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | INT | 主鍵，自動遞增 |
| `userId` | INT | 用戶 ID（FK users） |
| `amount` | DECIMAL(20,8) | 代幣數量 |
| `source` | ENUM | 來源（交易回饋/活躍獎勵/抽獎獲獎/貸款利息） |
| `relatedId` | INT | 相關交易/抽獎/貸款 ID |
| `createdAt` | TIMESTAMP | 創建時間 |

### 抽獎表 (lotteries)

記錄用戶抽獎參與情況。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | INT | 主鍵，自動遞增 |
| `userId` | INT | 用戶 ID（FK users） |
| `ticketCount` | INT | 購買的抽獎券數量 |
| `costPerTicket` | DECIMAL(20,8) | 每張票的成本（WLD 或代幣） |
| `costType` | ENUM | 成本類型（WLD/platformToken） |
| `drawDate` | TIMESTAMP | 開獎時間 |
| `prizeAmount` | DECIMAL(20,8) | 獲獎金額（NULL 表示未中獎） |
| `status` | ENUM | 狀態（待開獎/已中獎/未中獎） |
| `createdAt` | TIMESTAMP | 購票時間 |

### 貸款表 (loans)

記錄用戶貸款信息。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | INT | 主鍵，自動遞增 |
| `borrowerId` | INT | 借款人 ID（FK users） |
| `collateralAmount` | DECIMAL(20,8) | 抵押品金額（WLD） |
| `loanAmount` | DECIMAL(20,8) | 借款金額（WLD） |
| `interestRate` | DECIMAL(5,2) | 利率（%） |
| `dueDate` | TIMESTAMP | 還款期限 |
| `repaidAmount` | DECIMAL(20,8) | 已還款金額 |
| `status` | ENUM | 狀態（活躍/已還清/逾期） |
| `createdAt` | TIMESTAMP | 借款時間 |
| `updatedAt` | TIMESTAMP | 更新時間 |

### Nullifier 表 (nullifiers)

防止重複認證。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `nullifier` | NUMERIC(78,0) | 主鍵，nullifier 值（十進制） |
| `action` | VARCHAR(255) | 操作名稱 |
| `userId` | INT | 用戶 ID（FK users） |
| `verifiedAt` | TIMESTAMP | 認證時間 |

---

## API 規範

### 認證 API

#### POST /api/auth/rp-signature

生成 RP 簽名供前端使用。

**請求**:
```json
{
  "action": "world-nexus-verify"
}
```

**響應**:
```json
{
  "sig": "0x...",
  "nonce": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": 1712973600000,
  "expires_at": 1712977200000
}
```

#### POST /api/auth/verify

驗證 World ID 證明。

**請求**:
```json
{
  "idkitResponse": {
    "protocol_version": "4.0",
    "nonce": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "action": "world-nexus-verify",
    "environment": "production",
    "responses": [...]
  }
}
```

**響應**:
```json
{
  "success": true,
  "user": {
    "id": 123,
    "isVerified": true,
    "platformTokenBalance": 100.5
  }
}
```

### 支付 API

#### POST /api/payments/create-reference

創建支付參考 ID。

**請求**:
```json
{
  "productId": 456,
  "amount": 10.5
}
```

**響應**:
```json
{
  "referenceId": "123-456-1712973600000"
}
```

#### POST /api/payments/verify

驗證支付交易。

**請求**:
```json
{
  "referenceId": "123-456-1712973600000",
  "transactionId": "0x...",
  "from": "0x..."
}
```

**響應**:
```json
{
  "success": true,
  "transaction": {
    "id": 789,
    "status": "completed",
    "platformTokenReward": 5.25
  }
}
```

### 商品 API

#### GET /api/products

列出所有商品。

**查詢參數**:
- `category`: 分類（新品/二手）
- `sort`: 排序方式（newest/popular/price-asc/price-desc）
- `page`: 頁碼（默認 1）
- `limit`: 每頁數量（默認 20）

**響應**:
```json
{
  "products": [
    {
      "id": 456,
      "title": "iPhone 15",
      "price": 50.0,
      "images": ["https://..."],
      "seller": {
        "id": 123,
        "reputation": 95
      }
    }
  ],
  "total": 150,
  "page": 1
}
```

#### POST /api/products

上架新商品。

**請求**:
```json
{
  "title": "iPhone 15",
  "description": "Excellent condition",
  "category": "new",
  "price": 50.0,
  "images": ["https://..."]
}
```

**響應**:
```json
{
  "id": 456,
  "status": "listed"
}
```

---

## 安全考慮

### 認證安全

1. **RP 簽名**: 後端必須生成 RP 簽名以防止冒充攻擊。簽名密鑰絕不暴露於客戶端。

2. **Nullifier 檢查**: 每次認證後立即存儲 nullifier，防止重複認證。使用唯一約束確保數據完整性。

3. **證明驗證**: 所有證明必須通過 World ID 官方 API 驗證，不接受客戶端聲稱的認證狀態。

### 支付安全

1. **交易驗證**: 所有支付交易必須通過 Developer Portal API 驗證，確認交易確實在 World Chain 上執行。

2. **金額驗證**: 後端必須驗證交易金額與預期金額相符，防止金額篡改。

3. **地址驗證**: 驗證收款地址與商品賣家地址相符，防止資金被轉移到錯誤地址。

### 數據安全

1. **敏感數據加密**: 存儲敏感信息（如簽名密鑰、API 密鑰）時使用環境變量，不提交到版本控制。

2. **SQL 注入防護**: 使用 Drizzle ORM 的參數化查詢防止 SQL 注入。

3. **CORS 配置**: 限制跨域請求來源，只允許 World App 環境。

4. **速率限制**: 對認證、支付等關鍵端點實施速率限制，防止暴力攻擊。

### 業務邏輯安全

1. **原子性交易**: 確保商品購買、支付驗證、代幣分配等操作原子執行，防止部分執行導致的不一致。

2. **金額驗證**: 驗證所有金額操作（支付、代幣分配、利息計算）的數學正確性。

3. **狀態機驗證**: 驗證業務狀態轉換的合法性（如只能從「待確認」轉換到「已完成」）。

---

## 部署指南

### 環境變量配置

創建 `.env.local` 文件並配置以下變量：

```bash
# World ID 認證
RP_SIGNING_KEY=your_signing_key_here
APP_ID=app_f4bf6f2a1ca32e4f9af5f35b529f98f6
RP_ID=rp_f3e265557bade5a0

# Developer Portal API
DEV_PORTAL_API_KEY=your_api_key_here

# 數據庫
DATABASE_URL=mysql://user:password@localhost:3306/world_nexus

# S3 存儲
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=world-nexus-assets

# 應用配置
NODE_ENV=production
VITE_APP_TITLE=World Nexus
VITE_APP_LOGO=https://...
```

### 數據庫初始化

1. 創建數據庫:
```bash
mysql -u root -p -e "CREATE DATABASE world_nexus;"
```

2. 運行遷移:
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

3. 驗證表結構:
```bash
mysql -u root -p world_nexus -e "SHOW TABLES;"
```

### 應用部署

1. 安裝依賴:
```bash
pnpm install
```

2. 構建應用:
```bash
pnpm build
```

3. 啟動服務器:
```bash
pnpm start
```

4. 驗證健康狀態:
```bash
curl http://localhost:3000/health
```

### World App 上架

1. 在 [Developer Portal](https://developer.world.org) 中提交應用
2. 填寫應用信息、圖標、描述
3. 配置應用 URL 與回調地址
4. 通過審核後發佈到 Mini App Store

---

## 參考資源

- [World Developer Docs](https://docs.world.org)
- [IDKit 集成指南](https://docs.world.org/world-id/idkit/integrate)
- [MiniKit Pay 文檔](https://docs.world.org/mini-apps/commands/pay)
- [World Foundation Grants](https://world.org/grants)
- [Retroactive Funding](https://world.org/retro)

---

**文件版本**: 1.0  
**最後更新**: 2026-04-12  
**維護者**: Manus AI
