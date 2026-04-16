import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, Gift, CheckCircle2, Clock } from 'lucide-react';

export default function Tasks() {
  const [isCheckinLoading, setIsCheckinLoading] = useState(false);

  // 獲取任務列表
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = trpc.tasks.getMyTasks.useQuery();

  // 獲取代幣餘額
  const { data: balanceData } = trpc.tasks.getTokenBalance.useQuery();

  // 獲取任務統計
  const { data: statsData } = trpc.tasks.getTaskStats.useQuery();

  // 簽到 mutation
  const checkinMutation = trpc.tasks.dailyCheckin.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
  });

  const handleDailyCheckin = async () => {
    setIsCheckinLoading(true);
    try {
      await checkinMutation.mutateAsync();
    } finally {
      setIsCheckinLoading(false);
    }
  };

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">任務中心</h1>
          <p className="text-purple-200">完成任務獲得 NEXUS 獎勵</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200">已完成任務</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{statsData?.stats?.completedTasks || 0}</div>
              <p className="text-xs text-purple-300 mt-1">共 {statsData?.stats?.totalTasks || 0} 個任務</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200">已領取獎勵</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{statsData?.stats?.claimedTasks || 0}</div>
              <p className="text-xs text-purple-300 mt-1">NEXUS 獎勵</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200">NEXUS 餘額</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{parseFloat(balanceData?.nexusBalance || '0').toFixed(2)}</div>
              <p className="text-xs text-purple-300 mt-1">平台代幣</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Checkin */}
        <Card className="bg-purple-800/50 border-purple-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              每日簽到
            </CardTitle>
            <CardDescription>每天簽到獲得 10 NEXUS 獎勵</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDailyCheckin}
              disabled={isCheckinLoading || checkinMutation.isPending}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 rounded-lg"
            >
              {isCheckinLoading || checkinMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  簽到中...
                </>
              ) : (
                '立即簽到'
              )}
            </Button>
            {checkinMutation.error && (
              <p className="text-red-400 text-sm mt-2">{checkinMutation.error.message}</p>
            )}
            {checkinMutation.data?.success && (
              <p className="text-green-400 text-sm mt-2">✓ 簽到成功！獲得 {checkinMutation.data.reward} NEXUS</p>
            )}
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card className="bg-purple-800/50 border-purple-700">
          <CardHeader>
            <CardTitle>任務列表</CardTitle>
            <CardDescription>您的任務進度</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksData?.tasks && tasksData.tasks.length > 0 ? (
              <div className="space-y-3">
                {tasksData.tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-purple-900/50 rounded-lg border border-purple-700"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-400" />
                      )}
                      <div>
                        <p className="text-white font-medium capitalize">
                          {task.taskType === 'daily_checkin' && '每日簽到'}
                          {task.taskType === 'transaction' && '交易獎勵'}
                          {task.taskType === 'referral' && '邀請獎勵'}
                          {task.taskType === 'social_share' && '社交分享'}
                        </p>
                        <p className="text-sm text-purple-300">
                          {new Date(task.createdAt).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">+{parseFloat(task.rewardAmount).toFixed(2)}</p>
                      <p className="text-xs text-purple-300">{task.rewardType.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-purple-300 py-8">還沒有任務，完成簽到開始吧！</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
