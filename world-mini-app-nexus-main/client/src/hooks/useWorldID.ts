import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { executeWorldIDVerification } from '@/lib/minikit';

export interface UseWorldIDState {
  isLoading: boolean;
  isVerified: boolean;
  nullifierHash: string | null;
  error: string | null;
}

export function useWorldID() {
  const [state, setState] = useState<UseWorldIDState>({
    isLoading: false,
    isVerified: false,
    nullifierHash: null,
    error: null,
  });

  const verifyMutation = trpc.worldId.verify.useMutation();

  const verify = useCallback(
    async (action: string, signal: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // 1. 在 MiniKit 中執行驗證
        const verifyResult = await executeWorldIDVerification(action, signal);

        if (verifyResult.status !== 'success' || !verifyResult.proof) {
          throw new Error(verifyResult.error || 'Verification failed');
        }

        // 2. 將驗證結果發送到後端進行驗證
        const backendResult = await verifyMutation.mutateAsync({
          proof: verifyResult.proof,
          nullifierHash: verifyResult.nullifier_hash || '',
          action,
          signal,
        });

        if (!backendResult.success) {
          throw new Error(backendResult.error || 'Backend verification failed');
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isVerified: true,
          nullifierHash: backendResult.nullifierHash || null,
        }));

        return { success: true, nullifierHash: backendResult.nullifierHash };
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
    [verifyMutation]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isVerified: false,
      nullifierHash: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    verify,
    reset,
  };
}
