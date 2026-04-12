import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Gift, Ticket, Trophy, Clock } from 'lucide-react';

export default function Lottery() {
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState<'WLD' | 'NEXUS'>('WLD');

  const ticketPrice = selectedCurrency === 'WLD' ? 10 : 500;
  const totalCost = ticketCount * ticketPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 頂部導航 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">World Nexus 抽獎系統</h1>
          <p className="text-slate-400">每週開獎，贏取豐厚獎金</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 當前開獎信息 */}
            <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  第 42 期抽獎
                </h2>
                <div className="text-right">
                  <div className="text-sm text-slate-400">距離開獎</div>
                  <div className="text-2xl font-bold text-white">2 天 14 小時</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 p-4 rounded">
                  <div className="text-sm text-slate-400 mb-1">獎池總額</div>
                  <div className="text-2xl font-bold text-white">125,500 WLD</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded">
                  <div className="text-sm text-slate-400 mb-1">已售抽獎券</div>
                  <div className="text-2xl font-bold text-white">45,230</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded">
                  <div className="text-sm text-slate-400 mb-1">參與人數</div>
                  <div className="text-2xl font-bold text-white">8,950</div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded">
                <div className="text-sm text-slate-400 mb-2">獎金分配</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">🥇 一等獎 (1 名)</span>
                    <span className="text-yellow-400 font-bold">50,000 WLD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">🥈 二等獎 (5 名)</span>
                    <span className="text-gray-400 font-bold">10,000 WLD 各</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">🥉 三等獎 (20 名)</span>
                    <span className="text-orange-400 font-bold">1,000 WLD 各</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 購買抽獎券 */}
            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                購買抽獎券
              </h3>

              <div className="space-y-6">
                {/* 貨幣選擇 */}
                <div>
                  <label className="text-sm text-slate-400 mb-3 block">選擇支付貨幣</label>
                  <div className="flex gap-4">
                    {(['WLD', 'NEXUS'] as const).map((currency) => (
                      <button
                        key={currency}
                        onClick={() => setSelectedCurrency(currency)}
                        className={`flex-1 p-4 rounded border-2 transition ${
                          selectedCurrency === currency
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                        }`}
                      >
                        <div className="font-semibold text-white">{currency}</div>
                        <div className="text-sm text-slate-400">
                          {currency === 'WLD' ? '10 WLD/張' : '500 NXS/張'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 數量選擇 */}
                <div>
                  <label className="text-sm text-slate-400 mb-3 block">購買數量</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                      className="w-10 h-10 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 bg-slate-800 border border-slate-600 rounded px-4 py-2 text-white text-center"
                    />
                    <button
                      onClick={() => setTicketCount(ticketCount + 1)}
                      className="w-10 h-10 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 費用摘要 */}
                <div className="bg-slate-700/30 p-4 rounded">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400">單價</span>
                    <span className="text-white">{ticketPrice} {selectedCurrency}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-slate-400">數量</span>
                    <span className="text-white">{ticketCount} 張</span>
                  </div>
                  <div className="border-t border-slate-600 pt-4 flex justify-between">
                    <span className="text-white font-semibold">總計</span>
                    <span className="text-2xl font-bold text-purple-400">
                      {totalCost} {selectedCurrency}
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6">
                  <Sparkles className="mr-2 w-5 h-5" />
                  購買抽獎券
                </Button>
              </div>
            </Card>

            {/* 過往開獎記錄 */}
            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <h3 className="text-xl font-semibold text-white mb-6">過往開獎記錄</h3>
              <div className="space-y-4">
                {[
                  { period: 41, date: '2026-04-05', winner1: 'user_xyz...', prize1: 50000 },
                  { period: 40, date: '2026-03-29', winner1: 'user_abc...', prize1: 50000 },
                  { period: 39, date: '2026-03-22', winner1: 'user_123...', prize1: 50000 },
                ].map((record) => (
                  <div key={record.period} className="p-4 bg-slate-700/30 rounded flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">第 {record.period} 期</div>
                      <div className="text-sm text-slate-400">{record.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{record.winner1}</div>
                      <div className="text-yellow-400 font-bold">{record.prize1} WLD</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 我的抽獎券 */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                我的抽獎券
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-700/30 rounded">
                  <div className="text-sm text-slate-400">本期持有</div>
                  <div className="text-2xl font-bold text-white">25 張</div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded">
                  <div className="text-sm text-slate-400">中獎概率</div>
                  <div className="text-2xl font-bold text-green-400">0.055%</div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded">
                  <div className="text-sm text-slate-400">歷史中獎</div>
                  <div className="text-2xl font-bold text-yellow-400">2 次</div>
                </div>
              </div>
            </Card>

            {/* 規則說明 */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-400" />
                規則說明
              </h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <div className="font-medium text-white mb-1">📅 開獎週期</div>
                  <div>每週日 20:00 UTC 開獎</div>
                </div>
                <div>
                  <div className="font-medium text-white mb-1">🎯 中獎機制</div>
                  <div>完全隨機，每張票平等</div>
                </div>
                <div>
                  <div className="font-medium text-white mb-1">💰 獎金發放</div>
                  <div>開獎後 24 小時內到賬</div>
                </div>
                <div>
                  <div className="font-medium text-white mb-1">⏰ 購票截止</div>
                  <div>開獎前 2 小時截止</div>
                </div>
              </div>
            </Card>

            {/* 提示 */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
              <div className="text-sm text-blue-300">
                💡 <span className="font-semibold">提示：</span>購買更多抽獎券可提高中獎概率。每張票都有獨立的中獎機會。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
