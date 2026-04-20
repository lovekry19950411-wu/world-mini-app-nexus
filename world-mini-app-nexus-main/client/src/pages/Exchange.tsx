import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2, ArrowRightLeft, TrendingUp } from 'lucide-react';

export default function Exchange() {
  const [exchangeType, setExchangeType] = useState<'nexus-to-wld' | 'wld-to-nexus'>('nexus-to-wld');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 獲取匯率
  const { data: rateData } = trpc.exchange.getExchangeRate.useQuery();

  // 獲取代幣餘額
  const { data: balanceData, refetch: refetchBalance } = trpc.tasks.getTokenBalance.useQuery();

  // 獲取兌換歷史
  const { data: historyData, refetch: refetchHistory } = trpc.exchange.getExchangeHistory.useQuery();

  // NEXUS to WLD mutation
  const nexusToWldMutation = trpc.exchange.exchangeNexusToWld.useMutation({
    onSuccess: () => {
      setAmount('');
      refetchBalance();
      refetchHistory();
    },
  });

  // WLD to NEXUS mutation
  const wldToNexusMutation = trpc.exchange.exchangeWldToNexus.useMutation({
    onSuccess: () => {
      setAmount('');
      refetchBalance();
      refetchHistory();
    },
  });

  const handleExchange = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      if (exchangeType === 'nexus-to-wld') {
        await nexusToWldMutation.mutateAsync({ amount });
      } else {
        await wldToNexusMutation.mutateAsync({ amount });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentRate =
    exchangeType === 'nexus-to-wld'
      ? parseFloat(rateData?.rates?.nexusToWld || '0.1')
      : parseFloat(rateData?.rates?.wldToNexus || '10');

  const estimatedOutput = amount ? (parseFloat(amount) * currentRate).toFixed(8) : '0';

  const currentBalance =
    exchangeType === 'nexus-to-wld'
      ? parseFloat(balanceData?.nexusBalance || '0')
      : parseFloat(balanceData?.wldBalance || '0');

  const isInsufficientBalance = parseFloat(amount || '0') > currentBalance;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">代幣兌換</h1>
          <p className="text-purple-200">NEXUS ↔ WLD 實時兌換</p>
        </div>

        {/* Exchange Card */}
        <Card className="bg-purple-800/50 border-purple-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              兌換
            </CardTitle>
            <CardDescription>選擇兌換方向</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exchange Type Selector */}
            <div className="flex gap-2">
              <Button
                variant={exchangeType === 'nexus-to-wld' ? 'default' : 'outline'}
                onClick={() => {
                  setExchangeType('nexus-to-wld');
                  setAmount('');
                }}
                className="flex-1"
              >
                NEXUS → WLD
              </Button>
              <Button
                variant={exchangeType === 'wld-to-nexus' ? 'default' : 'outline'}
                onClick={() => {
                  setExchangeType('wld-to-nexus');
                  setAmount('');
                }}
                className="flex-1"
              >
                WLD → NEXUS
              </Button>
            </div>

            {/* Exchange Rate */}
            <div className="p-4 bg-purple-900/50 rounded-lg border border-purple-700">
              <p className="text-sm text-purple-300 mb-2">當前匯率</p>
              <p className="text-2xl font-bold text-white">
                1 {exchangeType === 'nexus-to-wld' ? 'NEXUS' : 'WLD'} = {currentRate}{' '}
                {exchangeType === 'nexus-to-wld' ? 'WLD' : 'NEXUS'}
              </p>
            </div>

            {/* Input Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                輸入 {exchangeType === 'nexus-to-wld' ? 'NEXUS' : 'WLD'} 數量
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-purple-900/50 border-purple-700 text-white"
                  min="0"
                  step="0.01"
                />
                <Button
                  variant="outline"
                  onClick={() => setAmount(currentBalance.toString())}
                  className="text-purple-300"
                >
                  全部
                </Button>
              </div>
              <p className="text-xs text-purple-300">
                可用: {currentBalance.toFixed(8)} {exchangeType === 'nexus-to-wld' ? 'NEXUS' : 'WLD'}
              </p>
            </div>

            {/* Output Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                獲得 {exchangeType === 'nexus-to-wld' ? 'WLD' : 'NEXUS'}
              </label>
              <div className="p-4 bg-purple-900/50 rounded-lg border border-purple-700">
                <p className="text-2xl font-bold text-white">{estimatedOutput}</p>
              </div>
            </div>

            {/* Exchange Button */}
            <Button
              onClick={handleExchange}
              disabled={
                isLoading ||
                !amount ||
                parseFloat(amount) <= 0 ||
                isInsufficientBalance ||
                nexusToWldMutation.isPending ||
                wldToNexusMutation.isPending
              }
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 rounded-lg"
            >
              {isLoading || nexusToWldMutation.isPending || wldToNexusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  兌換中...
                </>
              ) : (
                '確認兌換'
              )}
            </Button>

            {isInsufficientBalance && <p className="text-red-400 text-sm text-center">餘額不足</p>}

            {(nexusToWldMutation.error || wldToNexusMutation.error) && (
              <p className="text-red-400 text-sm text-center">
                {nexusToWldMutation.error?.message || wldToNexusMutation.error?.message}
              </p>
            )}

            {(nexusToWldMutation.data?.success || wldToNexusMutation.data?.success) && (
              <div className="p-4 bg-green-900/50 rounded-lg border border-green-700">
                <p className="text-green-400 text-sm font-semibold">✓ 兌換成功！</p>
                <p className="text-green-300 text-xs mt-1">
                  {nexusToWldMutation.data?.message || wldToNexusMutation.data?.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exchange History */}
        <Card className="bg-purple-800/50 border-purple-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              兌換歷史
            </CardTitle>
            <CardDescription>您的兌換記錄</CardDescription>
          </CardHeader>
          <CardContent>
            {historyData?.history && historyData.history.length > 0 ? (
              <div className="space-y-3">
                {historyData.history.map((exchange: any) => (
                  <div
                    key={exchange.id}
                    className="flex items-center justify-between p-4 bg-purple-900/50 rounded-lg border border-purple-700"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {exchange.fromToken.toUpperCase()} → {exchange.toToken.toUpperCase()}
                      </p>
                      <p className="text-sm text-purple-300">
                        {new Date(exchange.createdAt).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        -{parseFloat(exchange.fromAmount).toFixed(8)} {exchange.fromToken.toUpperCase()}
                      </p>
                      <p className="text-sm text-green-400">
                        +{parseFloat(exchange.toAmount).toFixed(8)} {exchange.toToken.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-purple-300 py-8">還沒有兌換記錄</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
