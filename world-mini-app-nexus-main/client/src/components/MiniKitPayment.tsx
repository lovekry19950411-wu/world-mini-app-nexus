import { MiniKit } from "@worldcoin/minikit-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MiniKitPaymentProps {
  recipientAddress?: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: any) => void;
}

export function MiniKitPayment({
  recipientAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  onPaymentSuccess,
  onPaymentError,
}: MiniKitPaymentProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenType, setTokenType] = useState<"WLD" | "USDC">("WLD");

  const isInWorldApp = MiniKit.isInWorldApp();

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!isInWorldApp) {
      toast.error("Payment is only available in World App");
      return;
    }

    setIsLoading(true);

    try {
      // Generate a unique reference for this payment
      const reference = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Convert amount to token decimals (WLD and USDC use 18 decimals)
      const decimals = 18;
      const tokenAmount = (parseFloat(amount) * Math.pow(10, decimals)).toString();

      const result = await MiniKit.pay({
        reference,
        to: recipientAddress,
        tokens: [
          {
            symbol: tokenType as any,
            token_amount: tokenAmount,
          },
        ],
        description: description || `Payment of ${amount} ${tokenType}`,
        fallback: () => {
          toast.info("Please complete the payment in World App to proceed.");
        },
      });

      if (result.executedWith === "minikit" && result.data) {
        toast.success("Payment successful!");
        onPaymentSuccess?.(result.data);

        // Reset form
        setAmount("");
        setDescription("");

        // Verify payment on backend
        try {
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transactionId: result.data.transactionId,
              reference: result.data.reference,
              from: result.data.from,
              chain: result.data.chain,
              timestamp: result.data.timestamp,
            }),
          });

          if (!verifyResponse.ok) {
            console.warn("Payment verification failed");
          }
        } catch (error) {
          console.error("Failed to verify payment:", error);
        }
      } else if (result.executedWith === "fallback") {
        toast.info("Payment fallback triggered");
        onPaymentError?.(new Error("Payment fallback"));
      } else {
        toast.error("Payment failed");
        onPaymentError?.(new Error("Payment failed"));
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      onPaymentError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInWorldApp) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Payment</CardTitle>
          <CardDescription className="text-slate-400">
            Payments are only available in World App
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm">
            Open this application in World App to make payments using WLD or USDC.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white">Send Payment</CardTitle>
        <CardDescription className="text-slate-400">
          Send WLD or USDC tokens through World App
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Type Selection */}
        <div className="space-y-2">
          <Label className="text-slate-300">Token Type</Label>
          <div className="flex gap-2">
            {(["WLD", "USDC"] as const).map((token) => (
              <Button
                key={token}
                variant={tokenType === token ? "default" : "outline"}
                onClick={() => setTokenType(token)}
                className={
                  tokenType === token
                    ? "bg-purple-500 hover:bg-purple-600"
                    : "border-slate-600 text-slate-300"
                }
              >
                {token}
              </Button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-slate-300">
            Amount ({tokenType})
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
            min="0"
            step="0.01"
            disabled={isLoading}
          />
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-300">
            Description (Optional)
          </Label>
          <Input
            id="description"
            type="text"
            placeholder="Payment description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
            disabled={isLoading}
          />
        </div>

        {/* Recipient Address Info */}
        <div className="bg-slate-700/30 rounded p-3 text-sm">
          <p className="text-slate-400">
            <span className="font-semibold">Recipient:</span> {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
          </p>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading || !amount}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Send ${amount || "0"} ${tokenType}`
          )}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-slate-500 text-center">
          Transactions are processed on World Chain. You'll be prompted to confirm in World App.
        </p>
      </CardContent>
    </Card>
  );
}
