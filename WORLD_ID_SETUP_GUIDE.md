# World ID 4.0 驗證系統設置指南

## 📋 概述

本指南將幫助您配置和啟用 World ID 4.0 真人驗證系統。

---

## 🚀 快速開始

### 步驟 1：獲取 World ID 憑證

#### 1.1 訪問 Worldcoin Developer Portal

```
https://developer.worldcoin.org
```

#### 1.2 登錄或創建帳戶

- 使用 World App 或 Worldcoin 帳戶登錄
- 如果沒有帳戶，先創建一個

#### 1.3 創建應用

1. 點擊 "Create App"
2. 填入應用信息：
   ```
   App Name: World Nexus
   Description: Decentralized Trading & Financial Ecosystem
   Website: https://worldnexus-qus9eyn3.manus.space
   App URL: https://3000-ijsnjiaf37ldv0vbwkwqz-ff878fac.sg1.manus.computer
   ```

#### 1.4 獲取 App ID

1. 應用創建完成後，您會看到 **App ID**
2. 複製 App ID（格式類似：`app_staging_abc123...`）
3. 保存到安全的地方

---

## 🔐 配置環境變量

### 步驟 2：設置 World ID 環境變量

在您的應用中配置以下環境變量：

```bash
# .env.local 或 .env.production

# World ID Configuration
VITE_WORLD_ID_APP_ID=app_staging_abc123...  # 從 Developer Portal 獲取
VITE_WORLD_ID_ACTION=verify_human
VITE_WORLD_ID_SIGNAL=user_id  # 用於 nullifier 生成

# World Chain Configuration
VITE_WORLD_CHAIN_ID=480
VITE_WORLD_CHAIN_RPC=https://worldchain-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Backend Configuration
WORLD_ID_API_KEY=your_api_key  # 從 Developer Portal 獲取
WORLD_ID_VERIFY_URL=https://api.worldcoin.org/v1/verify
```

---

## 💻 前端集成

### 步驟 3：實現 World ID 認證頁面

您的應用已經有 World ID 認證頁面：

```
client/src/pages/WorldIdAuth.tsx
```

這個頁面已經包含：
- ✅ IDKit 集成
- ✅ 認證流程
- ✅ 錯誤處理
- ✅ 加載狀態

### 步驟 4：測試認證流程

1. **訪問認證頁面**
   ```
   https://3000-ijsnjiaf37ldv0vbwkwqz-ff878fac.sg1.manus.computer/auth
   ```

2. **點擊 "Verify with World ID"**
   - 應用會打開 World ID 驗證窗口
   - 完成人臉識別
   - 驗證成功後返回應用

3. **驗證成功**
   - 頁面顯示驗證成功
   - 用戶信息被保存
   - 可以進行交易

---

## 🔧 後端集成

### 步驟 5：配置後端驗證

後端已經有驗證邏輯：

```
server/routers/worldId.ts
```

這個文件包含：
- ✅ Proof 驗證
- ✅ Nullifier 管理
- ✅ 用戶認證狀態
- ✅ 錯誤處理

### 步驟 6：驗證後端配置

檢查以下文件是否正確配置：

```typescript
// server/_core/env.ts
export const WORLD_ID_API_KEY = process.env.WORLD_ID_API_KEY;
export const WORLD_ID_VERIFY_URL = process.env.WORLD_ID_VERIFY_URL;
```

---

## 🧪 測試 World ID 集成

### 測試 1：前端認證流程

```bash
# 1. 訪問應用
https://3000-ijsnjiaf37ldv0vbwkwqz-ff878fac.sg1.manus.computer

# 2. 點擊 "Verify with World ID"

# 3. 完成人臉識別

# 4. 驗證成功後，應該看到：
# - 用戶信息顯示
# - 可以訪問交易市場
# - 可以進行交易
```

### 測試 2：後端驗證

```bash
# 使用 curl 測試後端驗證
curl -X POST http://localhost:3000/api/trpc/worldId.verify \
  -H "Content-Type: application/json" \
  -d '{
    "proof": "your_proof_from_frontend",
    "nullifier_hash": "your_nullifier_hash"
  }'

# 預期響應：
# {
#   "success": true,
#   "user_id": "user_123",
#   "verified": true
# }
```

### 測試 3：Nullifier 防重複

```bash
# 嘗試用同一個 nullifier 再次驗證
# 應該返回錯誤：已驗證過

curl -X POST http://localhost:3000/api/trpc/worldId.verify \
  -H "Content-Type: application/json" \
  -d '{
    "proof": "same_proof",
    "nullifier_hash": "same_nullifier_hash"
  }'

# 預期響應：
# {
#   "success": false,
#   "error": "Already verified"
# }
```

---

## 📊 World ID 驗證流程

```
用戶訪問應用
    ↓
點擊 "Verify with World ID"
    ↓
打開 World ID 驗證窗口
    ↓
完成人臉識別
    ↓
獲取 Proof 和 Nullifier
    ↓
發送到後端驗證
    ↓
後端驗證 Proof 有效性
    ↓
檢查 Nullifier 是否已使用
    ↓
保存用戶信息
    ↓
返回驗證成功
    ↓
用戶可以進行交易
```

---

## 🔐 安全最佳實踐

### 1. Nullifier 管理

```typescript
// 防止重複驗證
const isNullifierUsed = await db.nullifiers.findOne({
  nullifier_hash: proof.nullifier_hash
});

if (isNullifierUsed) {
  throw new Error("Already verified");
}

// 保存 nullifier
await db.nullifiers.create({
  nullifier_hash: proof.nullifier_hash,
  user_id: userId,
  verified_at: new Date()
});
```

### 2. Proof 驗證

```typescript
// 驗證 Proof 格式
const isValidProof = validateProofFormat(proof);
if (!isValidProof) {
  throw new Error("Invalid proof format");
}

// 驗證 Proof 簽名
const isValidSignature = await verifyProofSignature(proof);
if (!isValidSignature) {
  throw new Error("Invalid proof signature");
}
```

### 3. 速率限制

```typescript
// 防止暴力攻擊
const recentAttempts = await db.verificationAttempts.count({
  user_ip: req.ip,
  created_at: { $gte: Date.now() - 3600000 } // 1 小時內
});

if (recentAttempts > 5) {
  throw new Error("Too many verification attempts");
}
```

---

## 📝 環境變量檢查清單

- [ ] `VITE_WORLD_ID_APP_ID` - 已設置
- [ ] `VITE_WORLD_ID_ACTION` - 已設置為 "verify_human"
- [ ] `VITE_WORLD_ID_SIGNAL` - 已設置為 "user_id"
- [ ] `WORLD_ID_API_KEY` - 已設置
- [ ] `WORLD_ID_VERIFY_URL` - 已設置
- [ ] `VITE_WORLD_CHAIN_ID` - 已設置為 480
- [ ] `VITE_WORLD_CHAIN_RPC` - 已設置

---

## 🧪 完整測試流程

### 測試場景 1：新用戶驗證

```
1. 訪問應用首頁
2. 點擊 "Verify with World ID"
3. 完成人臉識別
4. 驗證成功
5. 用戶信息被保存
6. 可以訪問交易市場
```

### 測試場景 2：重複驗證

```
1. 用戶已驗證過
2. 嘗試再次驗證
3. 系統檢測到 nullifier 已使用
4. 返回錯誤信息
5. 用戶無法再次驗證
```

### 測試場景 3：無效 Proof

```
1. 發送無效的 proof
2. 後端驗證失敗
3. 返回錯誤信息
4. 用戶被提示重試
```

---

## 🚀 部署到生產環境

### 步驟 1：更新環境變量

```bash
# 生產環境變量
VITE_WORLD_ID_APP_ID=app_production_abc123...  # 使用生產 App ID
WORLD_ID_API_KEY=production_api_key
```

### 步驟 2：更新應用 URL

在 Worldcoin Developer Portal 中：
1. 進入應用設置
2. 更新 "App URL" 為生產 URL
3. 保存設置

### 步驟 3：測試生產環境

```bash
# 訪問生產應用
https://worldnexus-qus9eyn3.manus.space

# 測試 World ID 驗證
# 應該能正常完成驗證
```

---

## 📞 故障排除

### 問題：IDKit 加載失敗

**原因**：App ID 不正確或未配置

**解決方案**：
1. 檢查 `VITE_WORLD_ID_APP_ID` 是否正確
2. 確保 App ID 來自 Worldcoin Developer Portal
3. 重新啟動應用

### 問題：驗證失敗，提示 "Invalid proof"

**原因**：Proof 格式不正確或已過期

**解決方案**：
1. 確保 Proof 在 5 分鐘內發送
2. 檢查 Proof 格式是否正確
3. 嘗試重新驗證

### 問題：Nullifier 重複錯誤

**原因**：用戶已經驗證過

**解決方案**：
1. 這是正常行為，防止重複驗證
2. 用戶無法用同一身份再次驗證
3. 如需重新驗證，需要使用不同的 World ID

---

## 🎉 下一步

World ID 配置完成後：

1. ✅ 測試認證流程
2. ✅ 配置代幣獎勵
3. ✅ 實現支付系統
4. ✅ 上線到 World App

---

**需要幫助？** 聯繫 Worldcoin 支持團隊或 World Nexus 支持
