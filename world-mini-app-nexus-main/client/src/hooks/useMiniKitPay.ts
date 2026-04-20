import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { executeMiniKitPay, PayOptions } from '@/lib/minikit';

export interface UseMiniKitPayState {
  isLoading: boolean;
  isSuccess: boolean;
  transactionHash: string | null;
  error: string | null;
}

export function useMiniKitPay() {
  const [state, setState] = useState<UseMiniKitPayState>({
    isLoading: false,
    isSuccess: false,
    transactionHash: null,
    error: null,
  });

  const initiateMutation = trpc.payment.initiate.useMutation();
  const verifyMutation = trpc.payment.verify.useMutation();

  const pay = useCallback(
    async (options: PayOptions) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // 1. 在後端初始化支付
        const initiateResult = await initiateMutation.mutateAsync({
          amount: options.amount,
          currency: options.currency,
          description: options.description,
          metadata: options.metadata,
        });

        if (!initiateResult.success) {
          throw new Error(initiateResult.error || 'Payment initiation failed');
        }

        // 2. 執行 MiniKit Pay
        const payResult = await executeMiniKitPay(options);

        if (payResult.status !== 'success') {
          throw new Error(payResult.error || 'Payment failed');
        }

        const transactionHash = payResult.transaction_hash || '';
        if (!transactionHash) {
          throw new Error('No transaction hash returned');
        }

        // 3. 驗證支付結果
        const verifyResult = await verifyMutation.mutateAsync({
          paymentId: initiateResult.paymentId || '',
          transactionHash,
          amount: options.amount,
          currency: options.currency,
        });

        if (!verifyResult.success) {
          throw new Error(verifyResult.error || 'Payment verification failed');
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isSuccess: true,
          transactionHash: payResult.transaction_hash || null,
        }));

        return { success: true, transactionHash: payResult.transaction_hash || '' };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [initiateMutation, verifyMutation]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      transactionHash: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    pay,
    reset,
  };
}
