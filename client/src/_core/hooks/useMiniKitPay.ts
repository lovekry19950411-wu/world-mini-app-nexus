import { MiniKit } from "@worldcoin/minikit-js";
import { useCallback } from "react";

export interface PaymentOptions {
  reference: string;
  to: string;
  amount: string;
  tokenSymbol?: "WLD" | "USDC";
  description?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export function useMiniKitPay() {
  const isInWorldApp = MiniKit.isInWorldApp();

  const pay = useCallback(
    async (options: PaymentOptions) => {
      if (!isInWorldApp) {
        console.warn("Not in World App - payment not available");
        return null;
      }

      try {
        const token = options.tokenSymbol || "WLD";
        
        // Convert amount to token decimals (WLD and USDC use 18 decimals)
        const decimals = 18;
        const amount = (parseFloat(options.amount) * Math.pow(10, decimals)).toString();

        const result = await MiniKit.pay({
          reference: options.reference,
          to: options.to,
          tokens: [
            {
              symbol: token as any,
              token_amount: amount,
            },
          ],
          description: options.description || "Payment",
          fallback: () => {
            console.log("Payment fallback triggered");
          },
        });

        if (result.data) {
          options.onSuccess?.(result.data);
        } else {
          options.onError?.(new Error("Payment failed"));
        }

        return result;
      } catch (error) {
        console.error("Payment error:", error);
        options.onError?.(error);
        throw error;
      }
    },
    [isInWorldApp]
  );

  return {
    pay,
    isInWorldApp,
  };
}
