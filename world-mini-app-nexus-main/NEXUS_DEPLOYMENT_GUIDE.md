# NEXUS Token 智能合約部署指南

## 📋 概述

本指南將幫助您部署 NEXUS ERC20 代幣合約到 World Chain。

**部署方式**: thirdweb（最簡單、最安全）

---

## 🚀 快速開始（5 分鐘）

### 步驟 1：準備部署信息

| 項目 | 值 |
|------|-----|
| **鏈** | World Chain (Chain ID: 480) |
| **代幣名稱** | NEXUS Token |
| **代幣符號** | NEXUS |
| **初始供應量** | 1,000,000 NEXUS |
| **小數位數** | 18 |
| **部署者錢包** | 0x8bfe4647304e9564c48f4457e5082275f200042f |
| **費用接收地址** | 0x8bfe4647304e9564c48f4457e5082275f200042f |

### 步驟 2：使用 thirdweb 部署

#### 方式 A：使用 thirdweb Dashboard（推薦，最簡單）

1. **訪問 thirdweb Dashboard**
   ```
   https://thirdweb.com/dashboard
   ```

2. **連接錢包**
   - 點擊 "Connect Wallet"
   - 選擇 MetaMask 或 World App
   - 確保已連接到 World Chain (480)

3. **部署合約**
   - 點擊 "Deploy"
   - 搜索 "ERC20"
   - 選擇 "ERC20" 合約模板

4. **配置參數**
   ```
   Name: NEXUS Token
   Symbol: NEXUS
   Initial Supply: 1000000
   Decimals: 18
   ```

5. **部署**
   - 點擊 "Deploy Now"
   - 在 MetaMask 中確認交易
   - 等待部署完成

6. **記錄合約地址**
   - 部署完成後，複製合約地址
   - 保存到安全的地方

#### 方式 B：使用 thirdweb CLI

```bash
# 1. 安裝 thirdweb CLI
npm install -g thirdweb

# 2. 登錄 thirdweb
thirdweb login

# 3. 部署合約
thirdweb deploy

# 4. 選擇合約
# 選擇 "NEXUS.sol"

# 5. 選擇鏈
# 選擇 "World Chain (480)"

# 6. 配置參數
# Name: NEXUS Token
# Symbol: NEXUS
# Initial Supply: 1000000
# Fee Recipient: 0x8bfe4647304e9564c48f4457e5082275f200042f

# 7. 完成部署
# 複製合約地址
```

---

## 📝 部署後的配置

### 1. 添加 Minter 角色

部署完成後，需要配置誰可以鑄造代幣。

```javascript
// 使用 thirdweb SDK
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

const sdk = ThirdwebSDK.fromPrivateKey(
  "YOUR_PRIVATE_KEY",
  "worldchain"
);

const contract = await sdk.getContract("CONTRACT_ADDRESS");

// 添加 minter
await contract.call("addMinter", [
  "0x153D8e92f218D316C19d292DBEFc97ec2FA2A691" // 管理者地址
]);
```

### 2. 設置平台費用

```javascript
// 設置平台費用為 1%（100 basis points）
await contract.call("setPlatformFeeInfo", [100]);

// 設置費用接收地址
await contract.call("setPlatformFeeRecipient", [
  "0x8bfe4647304e9564c48f4457e5082275f200042f"
]);
```

---

## 🔗 World Chain 信息

| 項目 | 值 |
|------|-----|
| **鏈名稱** | World Chain |
| **Chain ID** | 480 |
| **RPC URL** | https://worldchain-mainnet.g.alchemy.com/v2/YOUR_API_KEY |
| **區塊瀏覽器** | https://worldscan.org |
| **原生代幣** | WLD |

### 添加 World Chain 到 MetaMask

1. 打開 MetaMask
2. 點擊網絡下拉菜單
3. 點擊 "Add Network"
4. 填入以下信息：
   ```
   Network Name: World Chain
   RPC URL: https://worldchain-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   Chain ID: 480
   Currency Symbol: WLD
   Block Explorer: https://worldscan.org
   ```
5. 點擊 "Save"

---

## ✅ 部署檢查清單

- [ ] 連接到 World Chain (480)
- [ ] 準備好部署者錢包（有 WLD 用於 Gas）
- [ ] 在 thirdweb 上部署 ERC20 合約
- [ ] 記錄合約地址
- [ ] 添加 Minter 角色
- [ ] 設置平台費用
- [ ] 在 World Chain Explorer 上驗證合約
- [ ] 測試代幣轉帳

---

## 🧪 測試部署

部署完成後，使用以下代碼測試：

```javascript
// 測試代幣轉帳
const contract = await sdk.getContract("CONTRACT_ADDRESS");

// 查詢餘額
const balance = await contract.call("balanceOf", [
  "0x8bfe4647304e9564c48f4457e5082275f200042f"
]);
console.log("Balance:", balance.toString());

// 鑄造代幣
await contract.call("mint", [
  "0x8bfe4647304e9564c48f4457e5082275f200042f",
  "1000000000000000000" // 1 NEXUS (18 decimals)
]);

// 轉帳代幣
await contract.call("transfer", [
  "0x153D8e92f218D316C19d292DBEFc97ec2FA2A691",
  "100000000000000000" // 0.1 NEXUS
]);
```

---

## 📊 部署成本

| 項目 | 成本 |
|------|------|
| **合約部署** | ~0.01-0.05 WLD |
| **Minter 配置** | ~0.001 WLD |
| **費用配置** | ~0.001 WLD |
| **總計** | ~0.02-0.06 WLD |

---

## 🔐 安全建議

1. **私鑰安全**
   - 不要在代碼中硬編碼私鑰
   - 使用環境變量
   - 使用 Hardware Wallet（推薦）

2. **合約驗證**
   - 在 World Chain Explorer 上驗證合約代碼
   - 確保合約代碼與部署的代碼一致

3. **測試**
   - 先在測試網上部署
   - 測試所有功能
   - 確認無誤後再部署到主網

---

## 📞 故障排除

### 問題：交易失敗，提示 "Insufficient balance"
**解決方案**：確保錢包有足夠的 WLD 用於 Gas

### 問題：無法連接到 World Chain
**解決方案**：檢查 MetaMask 網絡設置，確保 Chain ID 是 480

### 問題：部署後合約無法調用
**解決方案**：確保已添加 Minter 角色和配置費用參數

---

## 📝 部署記錄

部署完成後，填入以下信息：

```
部署日期: ________________
合約地址: ________________
部署者: ________________
初始供應量: ________________
交易哈希: ________________
區塊瀏覽器鏈接: ________________
```

---

## 🎉 下一步

部署完成後：

1. ✅ 在應用中配置合約地址
2. ✅ 實現代幣獎勵邏輯
3. ✅ 測試代幣轉帳
4. ✅ 上線到 World App

---

**需要幫助？** 聯繫 World Nexus 支持團隊
