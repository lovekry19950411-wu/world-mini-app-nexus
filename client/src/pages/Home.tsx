import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag, Coins, Zap, TrendingUp, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { useWorldIDAuth } from "@/contexts/WorldIDAuthContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useWorldIDAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
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
              Nexus
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
                onClick={() => navigate("/verify")}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Lock className="mr-2 w-5 h-5" />
                World ID 4.0 認證
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
              <CardTitle>交易市場</CardTitle>
              <CardDescription>買賣商品，安全交易</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">支持 WLD 和 NEXUS 代幣支付，完全去中心化的交易體驗。</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <Coins className="w-8 h-8 text-pink-400 mb-2" />
              <CardTitle>代幣系統</CardTitle>
              <CardDescription>賺取和兌換代幣</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">通過交易和參與活動獲得 NEXUS 代幣獎勵。</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <Zap className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle>金融服務</CardTitle>
              <CardDescription>借貸、抽獎、投資</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">多種金融工具，幫助您增長資產。</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">準備好開始了嗎？</h2>
        <p className="text-xl text-slate-300 mb-8">
          使用 World ID 4.0 進行真人驗證，加入 Nexus 生態。
        </p>
        {!isAuthenticated && (
          <Button
            onClick={() => navigate("/verify")}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Lock className="mr-2 w-5 h-5" />
            開始驗證
          </Button>
        )}
      </div>
    </div>
  );
}
