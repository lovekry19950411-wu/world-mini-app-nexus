import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import {
  User,
  Wallet,
  TrendingUp,
  Lock,
  Gift,
  LogOut,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">請先登入</h1>
          <p className="text-slate-400 mb-6">您需要使用 World ID 認證才能訪問儀表板</p>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Lock className="mr-2 w-4 h-4" />
            前往認證
          </Button>
        </Card>
      </div>
    );
  }

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已複製到剪貼板');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 頂部導航 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">個人中心</h1>
            <p className="text-slate-400">管理您的帳戶、資產和交易</p>
          </div>
          <Button
            onClick={() => logout()}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="mr-2 w-4 h-4" />
            登出
          </Button>
        </div>

        {/* 用戶信息卡 */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name || 'Anonymous User'}</h2>
                <p className="text-slate-400 text-sm">{user.email || 'No email provided'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">已認證</span>
              </div>
              <p className="text-slate-400 text-sm">World ID 4.0</p>
            </div>
          </div>

          {/* 用戶 ID */}
          <div className="bg-slate-800/50 p-4 rounded">
            <div className="text-sm text-slate-400 mb-2">Open ID</div>
            <div className="flex items-center justify-between">
              <code className="text-white font-mono text-sm break-all">{user.openId}</code>
              <button
                onClick={() => handleCopyAddress(user.openId)}
                className="ml-2 p-2 hover:bg-slate-700 rounded transition"
              >
                <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>
          </div>
        </Card>

        {/* 資產概覽 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm">WLD 餘額</h3>
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">256.8</div>
            <div className="text-sm text-slate-400 mt-2">≈ $5,136 USD</div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm">NEXUS 代幣</h3>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">125,750</div>
            <div className="text-sm text-slate-400 mt-2">≈ $25,430 USD</div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm">質押資產</h3>
              <Lock className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">$10,500</div>
            <div className="text-sm text-slate-400 mt-2">6 項資產</div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm">待領獎勵</h3>
              <Gift className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">3,250</div>
            <div className="text-sm text-slate-400 mt-2">NXS</div>
          </Card>
        </div>

        {/* 主要內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 交易歷史 */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <h3 className="text-xl font-semibold text-white mb-6">最近交易</h3>
              <div className="space-y-4">
                {[
                  {
                    type: 'buy',
                    desc: '購買 iPhone 13 Pro',
                    amount: 950,
                    date: '今天',
                    status: 'completed',
                  },
                  {
                    type: 'reward',
                    desc: '交易回饋獎勵',
                    amount: 2500,
                    date: '昨天',
                    status: 'completed',
                  },
                  {
                    type: 'borrow',
                    desc: '借貸 WLD',
                    amount: 2500,
                    date: '2 天前',
                    status: 'active',
                  },
                  {
                    type: 'lottery',
                    desc: '購買抽獎券',
                    amount: 100,
                    date: '3 天前',
                    status: 'completed',
                  },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-700/30 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                        {tx.type === 'buy' && '🛍️'}
                        {tx.type === 'reward' && '🎁'}
                        {tx.type === 'borrow' && '💰'}
                        {tx.type === 'lottery' && '🎰'}
                      </div>
                      <div>
                        <div className="text-white font-medium">{tx.desc}</div>
                        <div className="text-xs text-slate-400">{tx.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{tx.amount}</div>
                      <div
                        className={`text-xs font-semibold ${
                          tx.status === 'completed'
                            ? 'text-green-400'
                            : tx.status === 'active'
                              ? 'text-blue-400'
                              : 'text-slate-400'
                        }`}
                      >
                        {tx.status === 'completed' && '✓ 完成'}
                        {tx.status === 'active' && '⏳ 進行中'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 快速操作 */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">快速操作</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/marketplace')}
                  className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                >
                  🛍️ 進入市場
                </Button>
                <Button
                  onClick={() => navigate('/tokens')}
                  className="w-full bg-purple-600 hover:bg-purple-700 justify-start"
                >
                  🪙 管理代幣
                </Button>
                <Button
                  onClick={() => navigate('/lottery')}
                  className="w-full bg-pink-600 hover:bg-pink-700 justify-start"
                >
                  🎰 購買抽獎券
                </Button>
                <Button
                  onClick={() => navigate('/lending')}
                  className="w-full bg-green-600 hover:bg-green-700 justify-start"
                >
                  💰 貸款池
                </Button>
              </div>
            </Card>

            {/* 帳戶安全 */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-400" />
                帳戶安全
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300">World ID 已驗證</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300">會話已加密</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-300">啟用雙因素認證</span>
                </div>
              </div>
            </Card>

            {/* 幫助 */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
              <div className="text-sm text-blue-300">
                💡 <span className="font-semibold">需要幫助？</span>
                <br />
                訪問我們的文檔或聯繫支持團隊。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
