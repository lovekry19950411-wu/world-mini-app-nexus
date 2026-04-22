import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, Globe, RefreshCcw } from 'lucide-react';
import { getMiniKitInfo, initMiniKit } from '@/lib/minikit';
import { useWorldID } from '@/hooks/useWorldID';
import { trpc } from '@/lib/trpc';

export default function WorldIDAuth() {
  const [miniKitInfo, setMiniKitInfo] = useState(getMiniKitInfo());
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { isLoading, isVerified, error, verify, reset } = useWorldID();
  
  // Use tRPC to check auth status
  const utils = trpc.useUtils();

  useEffect(() => {
    // 初始化 MiniKit
    initMiniKit();
    // Re-check MiniKit status after initialization
    const timer = setTimeout(() => {
      setMiniKitInfo(getMiniKitInfo());
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect after successful verification
  useEffect(() => {
    if (isVerified && !isRedirecting) {
      setIsRedirecting(true);
      // Invalidate auth cache and redirect
      utils.auth.me.invalidate().then(() => {
        // Small delay to ensure cookie is properly set
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }).catch(() => {
        // If invalidation fails, still redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      });
    }
  }, [isVerified, isRedirecting, utils.auth.me]);

  const handleVerify = useCallback(async () => {
    // 使用固定的 action（應與 World ID Developer Portal 配置一致）
    // action 應該是在 World ID 開發者門戶中註冊的 action
    const action = import.meta.env.VITE_WORLD_ID_ACTION || 'nexus-verification';
    // signal 可以是用戶標識符或時間戳
    const signal = `${Date.now()}`;

    await verify(action, signal);
  }, [verify]);

  const handleRefreshStatus = useCallback(() => {
    setMiniKitInfo(getMiniKitInfo());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* 環境信息卡 */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-slate-200">Environment Info</h3>
            </div>
            <button 
              onClick={handleRefreshStatus}
              className="p-1.5 rounded-md hover:bg-slate-700 transition-colors"
              title="Refresh status"
            >
              <RefreshCcw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="text-slate-200 font-mono">
                {miniKitInfo.environment === 'world-app' ? 'World App' : 'Browser'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>MiniKit Status:</span>
              <span className={miniKitInfo.isInstalled ? 'text-green-400' : 'text-yellow-400'}>
                {miniKitInfo.isInstalled ? 'Installed' : 'Not Installed'}
              </span>
            </div>
          </div>
          {!miniKitInfo.isInstalled && (
            <p className="mt-3 text-xs text-slate-500">
              Tip: Open this page in World App for full functionality
            </p>
          )}
        </Card>

        {/* 主認證卡 */}
        <Card className="bg-slate-800/50 border-slate-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">World ID 認證</h1>
            <p className="text-slate-400">使用 World ID 4.0 驗證您的身份</p>
          </div>

          {/* 狀態顯示 */}
          {isVerified && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>✓ 認證成功！</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* 環境警告 */}
          {!miniKitInfo.isWorldApp && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p>此應用應在 World App 內運行以獲得完整功能</p>
                  <p className="text-yellow-500/70 mt-1">This app should be opened in World App for full functionality</p>
                </div>
              </div>
            </div>
          )}

          {/* 功能說明 */}
          <div className="mb-8 space-y-3 text-sm text-slate-400">
            <div className="flex gap-3">
              <div className="text-purple-400 font-bold">✓</div>
              <span>零 KYC - 無需提供個人信息</span>
            </div>
            <div className="flex gap-3">
              <div className="text-purple-400 font-bold">✓</div>
              <span>跨應用不可鏈接 - 隱私保護</span>
            </div>
            <div className="flex gap-3">
              <div className="text-purple-400 font-bold">✓</div>
              <span>防機器人 - 真實用戶驗證</span>
            </div>
          </div>

          {/* 按鈕 */}
          <div className="space-y-3">
            {isVerified || isRedirecting ? (
              <>
                <div className="flex items-center justify-center gap-2 py-3 text-green-400">
                  {isRedirecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在跳轉... / Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>驗證成功 / Verified</span>
                    </>
                  )}
                </div>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  進入應用 / Enter App
                </Button>
              </>
            ) : (
              <Button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-base font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    驗證中... / Verifying...
                  </>
                ) : (
                  '開始認證 / Start Verification'
                )}
              </Button>
            )}
          </div>

          {/* 幫助文本 */}
          <p className="text-xs text-slate-500 text-center mt-6">
            認證過程使用您的虹膜掃描進行身份驗證。
            <br />
            您的數據不會被存儲或與其他應用共享。
          </p>
        </Card>
      </div>
    </div>
  );
}
