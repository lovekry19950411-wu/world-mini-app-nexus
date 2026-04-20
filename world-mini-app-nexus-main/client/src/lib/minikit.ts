/**
 * MiniKit 初始化與 World App 環境檢測
 * 用於在 World App 內運行迷你應用
 */

// MiniKit 類型定義
export interface MiniKitInstance {
  isInstalled: () => boolean;
  install: () => void;
  commands: {
    verify: (options: VerifyOptions) => Promise<VerifyResult>;
    pay: (options: PayOptions) => Promise<PayResult>;
  };
}

export interface VerifyOptions {
  action: string;
  signal: string;
}

export interface VerifyResult {
  status: 'success' | 'error';
  proof?: string;
  nullifier_hash?: string;
  error?: string;
}

export interface PayOptions {
  recipient: string;
  amount: string;
  currency: 'WLD' | 'USDC';
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PayResult {
  status: 'success' | 'error' | 'cancelled';
  transaction_hash?: string;
  error?: string;
}

// 全局 MiniKit 實例
declare global {
  interface Window {
    MiniKit?: MiniKitInstance;
  }
}

/**
 * 檢測是否在 World App 環境中運行
 */
export function isWorldAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return window.MiniKit?.isInstalled?.() ?? false;
}

/**
 * 初始化 MiniKit
 */
export function initMiniKit(): void {
  if (typeof window === 'undefined') return;

  // 如果 MiniKit 已安裝，無需重複初始化
  if (window.MiniKit?.isInstalled?.()) {
    console.log('[MiniKit] Already installed');
    return;
  }

  // 嘗試安裝 MiniKit
  if (window.MiniKit?.install) {
    try {
      window.MiniKit.install();
      console.log('[MiniKit] Installed successfully');
    } catch (error) {
      console.warn('[MiniKit] Installation failed:', error);
    }
  } else {
    console.warn('[MiniKit] MiniKit not available in this environment');
  }
}

/**
 * 執行 World ID 驗證
 */
export async function executeWorldIDVerification(
  action: string,
  signal: string
): Promise<VerifyResult> {
  if (!window.MiniKit?.isInstalled?.()) {
    return {
      status: 'error',
      error: 'MiniKit not installed. Please use World App to access this feature.',
    };
  }

  try {
    const result = await window.MiniKit.commands.verify({
      action,
      signal,
    });
    return result;
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * 執行 MiniKit Pay 支付
 */
export async function executeMiniKitPay(options: PayOptions): Promise<PayResult> {
  if (!window.MiniKit?.isInstalled?.()) {
    return {
      status: 'error',
      error: 'MiniKit not installed. Please use World App to access this feature.',
    };
  }

  try {
    const result = await window.MiniKit.commands.pay(options);
    return result;
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * 獲取 MiniKit 環境信息
 */
export function getMiniKitInfo(): {
  isInstalled: boolean;
  isWorldApp: boolean;
  environment: 'world-app' | 'browser' | 'unknown';
} {
  const isInstalled = window.MiniKit?.isInstalled?.() ?? false;
  const isWorldApp = isWorldAppEnvironment();

  return {
    isInstalled,
    isWorldApp,
    environment: isWorldApp ? 'world-app' : 'browser',
  };
}
