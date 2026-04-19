import { MiniKit } from "@worldcoin/minikit-js";

/**
 * MiniKit 支付系統集成
 */

// 類型定義
export interface PayOptions {
  recipient?: string;
  amount: string;
  currency: "WLD" | "USDC";
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PayResult {
  status: "success" | "error" | "cancelled";
  transaction_hash?: string;
  error?: string;
}

export interface VerifyResult {
  status: "success" | "error";
  proof?: string;
  nullifier_hash?: string;
  error?: string;
}

/**
 * 檢查 MiniKit 是否可用
 */
export const isMiniKitAvailable = (): boolean => {
  return typeof MiniKit !== "undefined";
};

/**
 * 初始化 MiniKit
 */
export const initMiniKit = (): void => {
  console.log("MiniKit initialized");
};

/**
 * 獲取 MiniKit 信息
 */
export const getMiniKitInfo = () => {
  return {
    isInstalled: isMiniKitAvailable(),
    isWorldApp: isMiniKitAvailable(),
    environment: isMiniKitAvailable() ? "world-app" : "browser",
  };
};

/**
 * 執行 MiniKit Pay 支付
 */
export const executeMiniKitPay = async (
  options: PayOptions
): Promise<PayResult> => {
  try {
    if (!isMiniKitAvailable()) {
      return {
        status: "error",
        error: "MiniKit not available",
      };
    }

    // 使用 MiniKit 的支付命令
    const response = await (MiniKit as any).commandRequest({
      command: "pay",
      params: {
        reference: `nexus-${Date.now()}`,
        to: options.recipient || "",
        tokens: options.amount,
        description: options.description || "",
      },
    });

    return {
      status: response.status === "success" ? "success" : "error",
      transaction_hash: response.transaction_hash,
      error: response.error,
    };
  } catch (error) {
    console.error("Payment failed:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Payment failed",
    };
  }
};

/**
 * 執行 World ID 驗證
 */
export const executeWorldIDVerification = async (
  action: string,
  signal: string
): Promise<VerifyResult> => {
  try {
    if (!isMiniKitAvailable()) {
      return {
        status: "error",
        error: "MiniKit not available",
      };
    }

    const response = await (MiniKit as any).commandRequest({
      command: "verify",
      params: {
        action,
        signal,
      },
    });

    return {
      status: response.status === "success" ? "success" : "error",
      proof: response.proof,
      nullifier_hash: response.nullifier_hash,
      error: response.error,
    };
  } catch (error) {
    console.error("Verification failed:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
};

/**
 * 獲取用戶錢包地址
 */
export const getWalletAddress = (): string | null => {
  try {
    if (!isMiniKitAvailable()) {
      return null;
    }
    return (MiniKit as any).user?.walletAddress || null;
  } catch (error) {
    console.error("Failed to get wallet address:", error);
    return null;
  }
};

/**
 * 檢查用戶是否經過真人驗證
 */
export const isUserVerified = (): boolean => {
  try {
    if (!isMiniKitAvailable()) {
      return false;
    }
    return (MiniKit as any).user?.isOrbVerified || false;
  } catch (error) {
    console.error("Failed to check verification status:", error);
    return false;
  }
};
