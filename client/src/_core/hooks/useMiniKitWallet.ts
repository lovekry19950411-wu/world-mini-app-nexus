import { MiniKit, getWorldAppProvider } from "@worldcoin/minikit-js";
import { createWalletClient, custom } from "viem";
import { worldchain } from "viem/chains";
import { useCallback, useMemo } from "react";

export function useMiniKitWallet() {
  const isInWorldApp = MiniKit.isInWorldApp();

  const walletClient = useMemo(() => {
    if (typeof window === "undefined") return null;

    const provider = isInWorldApp
      ? getWorldAppProvider()
      : (window as any).ethereum;

    if (!provider) return null;

    return createWalletClient({
      chain: worldchain,
      transport: custom(provider),
    });
  }, [isInWorldApp]);

  const getAccount = useCallback(async () => {
    if (!walletClient) return null;

    try {
      const accounts = await walletClient.getAddresses?.();
      return accounts?.[0] || null;
    } catch (error) {
      console.error("Failed to get account:", error);
      return null;
    }
  }, [walletClient]);

  const sendTransaction = useCallback(
    async (tx: any) => {
      if (!walletClient) {
        throw new Error("Wallet client not available");
      }

      try {
        const hash = await walletClient.sendTransaction(tx);
        return hash;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
      }
    },
    [walletClient]
  );

  return {
    walletClient,
    getAccount,
    sendTransaction,
    isInWorldApp,
  };
}
