import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2, Share2, Users, Gift, Copy, Check } from 'lucide-react';

export default function Referral() {
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 獲取用戶的邀請碼
  const { data: codeData, refetch: refetchCode } = trpc.referral.getMyReferralCode.useQuery();

  // 獲取邀請統計
  const { data: statsData, refetch: refetchStats } = trpc.referral.getReferralStats.useQuery();

  // 獲取邀請的用戶列表
  const { data: usersData } = trpc.referral.getReferredUsers.useQuery();

  // 生成邀請碼 mutation
  const generateMutation = trpc.referral.generateReferralCode.useMutation({
    onSuccess: (data) => {
      if (data.success && data.referralCode) {
        setReferralCode(data.referralCode);
        refetchCode();
        refetchStats();
      }
    },
  });

  // 使用邀請碼 mutation
  const useMutation = trpc.referral.useReferralCode.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setInputCode('');
        refetchStats();
      }
    },
  });

  const handleGenerateCode = async () => {
    setIsLoading(true);
    try {
      await generateMutation.mutateAsync();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCode = async () => {
    if (!inputCode) return;
    setIsLoading(true);
    try {
      await useMutation.mutateAsync({ referralCode: inputCode });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    const code = referralCode || codeData?.referralCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayCode = referralCode || codeData?.referralCode || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">邀請朋友</h1>
          <p className="text-purple-200">邀請望友加入 Nexus，雙方都能獲得獎勵</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200">成功邀請</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{statsData?.stats?.successfulReferrals || 0}</div>
              <p className="text-xs text-purple-300 mt-1">個朋友已加入</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200">邀請獎勵</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {parseFloat(statsData?.stats?.totalReferralRewards || '0').toFixed(2)}
              </div>
              <p className="text-xs text-purple-300 mt-1">NEXUS 已獲得</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200">獎勵詳情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white">
                <p>邀請者：50 NEXUS</p>
                <p className="text-purple-300">被邀請者：25 NEXUS</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Referral Code */}
        <Card className="bg-purple-800/50 border-purple-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-pink-400" />
              我的邀請碼
            </CardTitle>
            <CardDescription>分享給朋友，他們使用後雙方都能獲得獎勵</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayCode ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 p-4 bg-purple-900/50 rounded-lg border border-purple-700">
                    <p className="text-white font-mono font-bold text-lg">{displayCode}</p>
                  </div>
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    className="text-purple-300"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Share Links */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="text-purple-300 text-sm"
                    onClick={() => {
                      if (displayCode) {
                        const text = `使用我的邀請碼 ${displayCode} 加入 Nexus，雙方都能獲得 NEXUS 獎勵！`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
                      }
                    }}
                  >
                    分享到 Twitter
                  </Button>
                  <Button
                    variant="outline"
                    className="text-purple-300 text-sm"
                    onClick={() => {
                      if (displayCode) {
                        const text = `使用我的邀請碼 ${displayCode} 加入 Nexus，雙方都能獲得 NEXUS 獎勵！`;
                        navigator.clipboard.writeText(text);
                      }
                    }}
                  >
                    複製分享文本
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleGenerateCode}
                disabled={isLoading || generateMutation.isPending}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg"
              >
                {isLoading || generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '生成邀請碼'
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Use Referral Code */}
        <Card className="bg-purple-800/50 border-purple-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              使用邀請碼
            </CardTitle>
            <CardDescription>輸入朋友的邀請碼獲得獎勵</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="輸入邀請碼..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="bg-purple-900/50 border-purple-700 text-white"
              />
              <Button
                onClick={handleUseCode}
                disabled={!inputCode || isLoading || useMutation.isPending}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
              >
                {isLoading || useMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '使用'
                )}
              </Button>
            </div>

            {useMutation.error && (
              <p className="text-red-400 text-sm">{useMutation.error.message}</p>
            )}

            {useMutation.data?.success && (
              <div className="p-4 bg-green-900/50 rounded-lg border border-green-700">
                <p className="text-green-400 text-sm font-semibold">✓ 邀請碼已使用！</p>
                <p className="text-green-300 text-xs mt-1">
                  您獲得 {useMutation.data.referredReward} NEXUS，邀請者獲得{' '}
                  {useMutation.data.referrerReward} NEXUS
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referred Users */}
        <Card className="bg-purple-800/50 border-purple-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              我邀請的用戶
            </CardTitle>
            <CardDescription>您成功邀請的朋友列表</CardDescription>
          </CardHeader>
          <CardContent>
            {usersData?.referredUsers && usersData.referredUsers.length > 0 ? (
              <div className="space-y-3">
                {usersData.referredUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-purple-900/50 rounded-lg border border-purple-700"
                  >
                    <div>
                      <p className="text-white font-medium">{user.name || '匿名用戶'}</p>
                      <p className="text-sm text-purple-300">{user.email}</p>
                      <p className="text-xs text-purple-400 mt-1">
                        加入於 {new Date(user.joinedAt).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">+50 NEXUS</p>
                      <p className="text-xs text-green-400">已獲得</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-purple-300 py-8">還沒有邀請任何用戶</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
