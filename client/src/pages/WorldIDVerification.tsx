"use client";

import { useState } from "react";
import { IDKitWidget, ISuccessResult, VerificationLevel } from "@worldcoin/idkit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useWorldIDAuth } from "@/contexts/WorldIDAuthContext";

const APP_ID = "app_f4bf6f2a1ca32e4f9af5f35b529f98f6" as `app_${string}`;
const ACTION = "nexus";

export default function WorldIDVerification() {
  const [, navigate] = useLocation();
  const { setUser } = useWorldIDAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (result: ISuccessResult) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `https://developer.worldcoin.org/api/v2/verify/${APP_ID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nullifier_hash: result.nullifier_hash,
            merkle_root: result.merkle_root,
            proof: result.proof,
            verification_level: result.verification_level,
            action: ACTION,
            signal: "",
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "後端驗證失敗");
      }

      setUser({
        nullifier_hash: result.nullifier_hash,
        verification_level: "orb",
        verified_at: new Date().toISOString(),
      });

      setIsVerified(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message || "驗證失敗，請重試");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (err: any) => {
    setError(err?.message || "驗證過程發生錯誤，請重試");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800/50 border-slate-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {isVerified ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Shield className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">真人驗證</h1>
            <p className="text-slate-400">使用 World ID 4.0 驗證您的身份</p>
          </div>

          {isVerified && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>✓ 認證成功！正在跳轉...</span>
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

          <div className="mb-8 space-y-3 text-sm text-slate-400">
            <div className="flex gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>零 KYC - 消耗個人資訊</span>
            </div>
            <div className="flex gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>跨應用程式不可連結 - 隱私保護</span>
            </div>
            <div className="flex gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>防機器人 - 真實用戶驗證</span>
            </div>
          </div>

          <div className="space-y-3">
            {isVerified ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-base font-semibold"
              >
                進入應用
              </Button>
            ) : (
              <IDKitWidget
                app_id={APP_ID}
                action={ACTION}
                verification_level={VerificationLevel.Orb}
                handleVerify={handleVerify}
                onError={handleError}
              >
                {({ open }) => (
                  <Button
                    onClick={open}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-base font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        驗證中...
                      </>
                    ) : (
                      "開始認證"
                    )}
                  </Button>
                )}
              </IDKitWidget>
            )}
          </div>

          <p className="text-xs text-slate-500 text-center mt-6">
            認證過程使用您的虹膜掃描進行身份驗證。
            <br />
            您的資料不會被儲存或與其他應用共享。
          </p>
        </Card>
      </div>
    </div>
  );
}
