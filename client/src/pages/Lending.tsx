import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, Zap, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function Lending() {
  const [activeTab, setActiveTab] = useState<'borrow' | 'lend' | 'myLoans'>('borrow');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 頂部導航 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">World Nexus 貸款池</h1>
          <p className="text-slate-400">質押資產、借貸 WLD、賺取利息</p>
        </div>

        {/* 池子統計 */}
        <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-slate-400 text-sm mb-2">總借貸額</div>
              <div className="text-3xl font-bold text-white">$2.5M</div>
              <div className="text-slate-400 text-xs mt-1">+12.5% 本月</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-2">總質押額</div>
              <div className="text-3xl font-bold text-white">$4.2M</div>
              <div className="text-slate-400 text-xs mt-1">抵押率 59%</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-2">平均借貸利率</div>
              <div className="text-3xl font-bold text-green-400">6.8%</div>
              <div className="text-slate-400 text-xs mt-1">年化收益</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-2">可借額度</div>
              <div className="text-3xl font-bold text-blue-400">$1.7M</div>
              <div className="text-slate-400 text-xs mt-1">剩餘容量</div>
            </div>
          </div>
        </Card>

        {/* 選項卡 */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {[
            { id: 'borrow', label: '借貸 WLD', icon: Zap },
            { id: 'lend', label: '提供流動性', icon: TrendingUp },
            { id: 'myLoans', label: '我的貸款', icon: Lock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition ${
                activeTab === id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主內容 */}
          <div className="lg:col-span-2">
            {activeTab === 'borrow' && (
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 p-8">
                  <h3 className="text-xl font-semibold text-white mb-6">借貸 WLD</h3>

                  <div className="space-y-6">
                    {/* 質押資產選擇 */}
                    <div>
                      <label className="text-sm text-slate-400 mb-3 block">選擇質押資產</label>
                      <div className="space-y-2">
                        {[
                          { name: 'USDC', balance: 5000, price: 1.0 },
                          { name: 'ETH', balance: 2.5, price: 3500 },
                          { name: 'NEXUS', balance: 50000, price: 0.203 },
                        ].map((asset) => (
                          <button
                            key={asset.name}
                            className="w-full p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded border border-slate-600 text-left transition"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-white">{asset.name}</div>
                                <div className="text-sm text-slate-400">
                                  餘額: {asset.balance} ({asset.price * asset.balance} USD)
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-white">${asset.price}</div>
                                <div className="text-sm text-slate-400">價格</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 質押數量 */}
                    <div>
                      <label className="text-sm text-slate-400 mb-3 block">質押數量</label>
                      <input
                        type="number"
                        placeholder="輸入質押數量"
                        className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white placeholder:text-slate-500"
                      />
                    </div>

                    {/* 借貸條件 */}
                    <div className="bg-slate-700/30 p-4 rounded space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">最大可借</span>
                        <span className="text-white font-semibold">5,000 WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">借貸利率</span>
                        <span className="text-white font-semibold">6.8% APY</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">抵押率</span>
                        <span className="text-white font-semibold">150%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">清算價格</span>
                        <span className="text-red-400 font-semibold">$3,200</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg py-6">
                      <Zap className="mr-2 w-5 h-5" />
                      確認借貸
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'lend' && (
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 p-8">
                  <h3 className="text-xl font-semibold text-white mb-6">提供流動性</h3>

                  <div className="space-y-6">
                    {/* 流動性池 */}
                    <div>
                      <label className="text-sm text-slate-400 mb-3 block">選擇流動性池</label>
                      <div className="space-y-3">
                        {[
                          { name: 'WLD/USDC', apy: 8.5, tvl: '$1.2M' },
                          { name: 'WLD/ETH', apy: 12.3, tvl: '$850K' },
                          { name: 'NEXUS/WLD', apy: 15.6, tvl: '$450K' },
                        ].map((pool) => (
                          <button
                            key={pool.name}
                            className="w-full p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded border border-slate-600 text-left transition"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-white">{pool.name}</div>
                                <div className="text-sm text-slate-400">TVL: {pool.tvl}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-400">{pool.apy}% APY</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 投入金額 */}
                    <div>
                      <label className="text-sm text-slate-400 mb-3 block">投入金額</label>
                      <input
                        type="number"
                        placeholder="輸入投入金額"
                        className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white placeholder:text-slate-500"
                      />
                    </div>

                    {/* 預期收益 */}
                    <div className="bg-slate-700/30 p-4 rounded space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">年化收益</span>
                        <span className="text-green-400 font-semibold">+$850</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">月均收益</span>
                        <span className="text-green-400 font-semibold">+$70.83</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6">
                      <TrendingUp className="mr-2 w-5 h-5" />
                      提供流動性
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'myLoans' && (
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 p-8">
                  <h3 className="text-xl font-semibold text-white mb-6">我的貸款</h3>

                  <div className="space-y-4">
                    {[
                      {
                        id: 1,
                        collateral: '2.5 ETH',
                        borrowed: 4200,
                        interest: 120,
                        dueDate: '2026-05-15',
                        status: 'safe',
                      },
                      {
                        id: 2,
                        collateral: '5000 USDC',
                        borrowed: 2500,
                        interest: 45,
                        dueDate: '2026-05-20',
                        status: 'warning',
                      },
                    ].map((loan) => (
                      <Card key={loan.id} className="bg-slate-700/30 border-slate-600 p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-white font-semibold">質押: {loan.collateral}</div>
                            <div className="text-sm text-slate-400">借貸: {loan.borrowed} WLD</div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded text-sm font-semibold flex items-center gap-1 ${
                              loan.status === 'safe'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {loan.status === 'safe' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            {loan.status === 'safe' ? '安全' : '風險'}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <div className="text-slate-400">利息已計</div>
                            <div className="text-white font-semibold">${loan.interest}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">還款期限</div>
                            <div className="text-white font-semibold">{loan.dueDate}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">總欠款</div>
                            <div className="text-white font-semibold">${loan.borrowed + loan.interest}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            還款
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            詳情
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 風險提示 */}
            <Card className="bg-red-500/10 border-red-500/30 p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                風險提示
              </h3>
              <ul className="space-y-2 text-sm text-red-300">
                <li>• 抵押率低於 150% 時面臨清算風險</li>
                <li>• 資產價格波動可能觸發自動清算</li>
                <li>• 借貸利率根據市場動態調整</li>
                <li>• 請定期檢查貸款狀態</li>
              </ul>
            </Card>

            {/* 統計信息 */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">我的統計</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">總借貸額</span>
                  <span className="text-white font-semibold">6,700 WLD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">總質押額</span>
                  <span className="text-white font-semibold">$10,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">平均利率</span>
                  <span className="text-white font-semibold">6.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">已支付利息</span>
                  <span className="text-white font-semibold">$165</span>
                </div>
              </div>
            </Card>

            {/* 幫助 */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
              <div className="text-sm text-blue-300">
                💡 <span className="font-semibold">提示：</span>質押更多資產可增加借貸額度。監控抵押率以避免清算。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
