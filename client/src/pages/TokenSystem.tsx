import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coins, TrendingUp, Gift, Zap, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function TokenSystem() {
  const [activeTab, setActiveTab] = useState<'balance' | 'rewards' | 'swap'>('balance');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 頂部導航 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">NEXUS 代幣系統</h1>
          <p className="text-slate-400">管理您的平台代幣、獲得獎勵、參與治理</p>
        </div>

        {/* 代幣餘額卡 */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-slate-400 text-sm mb-2">代幣餘額</div>
              <div className="text-4xl font-bold text-white mb-2">125,750</div>
              <div className="text-slate-400 text-sm">≈ $25,430 USD</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-2">質押代幣</div>
              <div className="text-4xl font-bold text-blue-400 mb-2">45,000</div>
              <div className="text-slate-400 text-sm">年化收益率 12.5%</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-2">待領獎勵</div>
              <div className="text-4xl font-bold text-green-400 mb-2">3,250</div>
              <div className="text-slate-400 text-sm">可立即領取</div>
            </div>
          </div>
        </Card>

        {/* 選項卡 */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {[
            { id: 'balance', label: '餘額與交易', icon: Coins },
            { id: 'rewards', label: '獎勵系統', icon: Gift },
            { id: 'swap', label: '兌換與提現', icon: Zap },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition ${
                activeTab === id
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* 內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主內容 */}
          <div className="lg:col-span-2">
            {activeTab === 'balance' && (
              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">交易歷史</h3>
                  <div className="space-y-3">
                    {[
                      { type: 'receive', amount: 2500, desc: '交易回饋獎勵', date: '今天' },
                      { type: 'send', amount: 1000, desc: '轉帳給 user_123', date: '昨天' },
                      { type: 'receive', amount: 750, desc: '活躍獎勵', date: '2 天前' },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                        <div className="flex items-center gap-3">
                          {tx.type === 'receive' ? (
                            <ArrowDownLeft className="w-5 h-5 text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-400" />
                          )}
                          <div>
                            <div className="text-white font-medium">{tx.desc}</div>
                            <div className="text-xs text-slate-400">{tx.date}</div>
                          </div>
                        </div>
                        <div className={tx.type === 'receive' ? 'text-green-400' : 'text-red-400'}>
                          {tx.type === 'receive' ? '+' : '-'}{tx.amount} NXS
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">獎勵來源</h3>
                  <div className="space-y-4">
                    {[
                      { name: '交易回饋', amount: 2500, desc: '每筆交易獲得 2% 回饋' },
                      { name: '活躍獎勵', amount: 1500, desc: '每日登入 +100 NXS' },
                      { name: '推薦獎勵', amount: 3200, desc: '邀請好友獲得 20% 獎勵' },
                      { name: '質押收益', amount: 1050, desc: '質押資產年化 12.5%' },
                    ].map((reward, i) => (
                      <div key={i} className="p-4 bg-slate-700/30 rounded flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium">{reward.name}</div>
                          <div className="text-sm text-slate-400">{reward.desc}</div>
                        </div>
                        <div className="text-lg font-bold text-purple-400">+{reward.amount}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'swap' && (
              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">代幣兌換</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700/30 rounded">
                      <label className="text-sm text-slate-400 mb-2 block">兌換數量</label>
                      <input
                        type="number"
                        placeholder="輸入 NXS 數量"
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded">
                      <div className="text-sm text-slate-400 mb-2">預計獲得</div>
                      <div className="text-2xl font-bold text-white">0.0500 WLD</div>
                      <div className="text-xs text-slate-400 mt-1">匯率: 1 NXS = 0.0004 WLD</div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      確認兌換
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* 側邊欄 */}
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                代幣信息
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">當前價格</span>
                  <span className="text-white font-medium">$0.2030</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">24H 漲幅</span>
                  <span className="text-green-400 font-medium">+12.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">市值</span>
                  <span className="text-white font-medium">$2.5M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">流通量</span>
                  <span className="text-white font-medium">12.3M NXS</span>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">快速操作</h3>
              <div className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                  質押代幣
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
                  領取獎勵
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm">
                  轉帳
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
