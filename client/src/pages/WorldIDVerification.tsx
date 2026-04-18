"use client";

import { useState } from "react";
import {
  IDKitRequestWidget,
  deviceLegacy,
} from "@worldcoin/idkit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

const fetchRpContext = async () => {
  // Fetch a signed rp_context from your backend.
  const response = await fetch("/api/idkit/rp-context", {
    method: "POST",
  });

  return response.json();
};

const verifyProof = async (result: any) => {
  // Note: This must be implemented server side or in a trusted route handler
  const response = await fetch("/api/v4/verify/app_f4bf6f2a1ca32e4f9af5f35b529f98f6", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  });

  if (response.ok) {
    return response.json();
  } else {
    const { code, detail } = await response.json();
    throw new Error(`Error Code ${code}: ${detail}`);
  }
};

export default function WorldIDVerification() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenVerification = async () => {
    if (!rpContext) {
      setIsLoading(true);
      try {
        const context = await fetchRpContext();
        setRpContext(context);
      } catch (err) {
        setError("Failed to fetch RP context");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }
    setOpen(true);
  };

  const handleVerifySuccess = (result: any) => {
    console.log("Verification successful:", result);
    setIsVerified(true);
    setError(null);
    // Redirect to dashboard after successful verification
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const handleVerifyError = (error: any) => {
    console.error("Verification error:", error);
    setError(error.message || "Verification failed");
    setIsVerified(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
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
            {isVerified ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                進入應用
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleOpenVerification}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      準備中...
                    </>
                  ) : (
                    "開始認證"
                  )}
                </Button>

                {rpContext && (
                  <IDKitRequestWidget
                    open={open}
                    onOpenChange={setOpen}
                    app_id="app_f4bf6f2a1ca32e4f9af5f35b529f98f6"
                    action="nexus"
                    action_description="Verify your identity to access Nexus"
                    rp_context={rpContext}
                    allow_legacy_proofs={true}
                    preset={deviceLegacy()}
                    handleVerify={verifyProof}
                    onSuccess={handleVerifySuccess}
                    onError={handleVerifyError}
                  />
                )}
              </>
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
