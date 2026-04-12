import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Loader2, ShoppingBag, Coins, Zap, TrendingUp, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              Powered by World ID 4.0
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              World Nexus
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                去中心化交易與金融生態
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              真實用戶、安全交易、無限可能。在 World App 上體驗完全去中心化的交易市場、金融服務與社區經濟。
            </p>

            {isAuthenticated ? (
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate("/marketplace")}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <ShoppingBag className="mr-2 w-5 h-5" />
                  進入交易市場
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="lg"
                  variant="outline"
                  className="border-purple-400 text-purple-300 hover:bg-purple-500/10"
                >
                  <TrendingUp className="mr-2 w-5 h-5" />
                  我的儀表板
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Lock className="mr-2 w-5 h-5" />
                World ID 認證登入
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">核心功能</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <ShoppingBag className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">交易市場</CardTitle>
              <CardDescription className="text-slate-400">二手與全新商品交易</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>✓ 商品上架與搜尋</li>
                <li>✓ 圖片上傳與展示</li>
                <li>✓ WLD 支付整合</li>
                <li>✓ 信譽評分系統</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 hover:border-blue-500/50 transition-all">
            <CardHeader>
              <Coins className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">平台代幣</CardTitle>
              <CardDescription className="text-slate-400">NEXUS 代幣系統</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>✓ 交易回饋獎勵</li>
                <li>✓ 活躍獎勵計劃</li>
                <li>✓ 代幣兌換與提現</li>
                <li>✓ 社區治理投票</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all">
            <CardHeader>
              <Zap className="w-8 h-8 text-pink-400 mb-2" />
              <CardTitle className="text-white">抽獎系統</CardTitle>
              <CardDescription className="text-slate-400">每週開獎贏大獎</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>✓ WLD 或代幣購票</li>
                <li>✓ 透明開獎機制</li>
                <li>✓ 每週大獎分配</li>
                <li>✓ 獲獎紀錄查詢</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-green-500/20 hover:border-green-500/50 transition-all">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white">貸款池</CardTitle>
              <CardDescription className="text-slate-400">質押借貸服務</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>✓ 質押資產借貸</li>
                <li>✓ 靈活利率機制</li>
                <li>✓ 自動清算保護</li>
                <li>✓ 還款計劃管理</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-cyan-500/20 hover:border-cyan-500/50 transition-all">
            <CardHeader>
              <Lock className="w-8 h-8 text-cyan-400 mb-2" />
              <CardTitle className="text-white">World ID 認證</CardTitle>
              <CardDescription className="text-slate-400">真人身份驗證</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>✓ 4.0 版本認證</li>
                <li>✓ 零 KYC 流程</li>
                <li>✓ 跨應用不可鏈接</li>
                <li>✓ 防重複認證</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-orange-500/20 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <Loader2 className="w-8 h-8 text-orange-400 mb-2" />
              <CardTitle className="text-white">個人中心</CardTitle>
              <CardDescription className="text-slate-400">一站式管理平台</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>✓ 認證狀態查詢</li>
                <li>✓ 交易紀錄統計</li>
                <li>✓ 代幣餘額管理</li>
                <li>✓ 貸款與抽獎狀態</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-800/30 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-400">1200M+</div>
              <div className="text-slate-400 mt-2">全球認證用戶</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400">160+</div>
              <div className="text-slate-400 mt-2">支持國家地區</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400">0%</div>
              <div className="text-slate-400 mt-2">KYC 要求</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400">24/7</div>
              <div className="text-slate-400 mt-2">全天候運營</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">準備好開始了嗎？</h2>
        <p className="text-slate-300 mb-8 text-lg">
          加入 World Nexus，體驗去中心化交易的未來。無需複雜的 KYC，只需 World ID 認證即可開始。
        </p>

        {isAuthenticated ? (
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/marketplace")}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              開始交易
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              variant="outline"
              className="border-purple-400 text-purple-300"
            >
              查看儀表板
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            立即認證登入
          </Button>
        )}
      </div>
    </div>
  );
}
