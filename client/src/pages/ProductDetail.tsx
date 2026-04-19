import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, Share2, Heart } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const productId = params?.id ? parseInt(params.id) : null;

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: product, isLoading } = trpc.marketplace.getProduct.useQuery(
    { productId: productId || 0 },
    { enabled: !!productId }
  );

  const buyMutation = trpc.marketplace.purchaseProduct.useMutation();

  const handleBuy = async () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!product) return;

    try {
      await buyMutation.mutateAsync({
        productId: product.id,
        buyerAddress: user.openId || '',
        amount: product.price * quantity,
        currency: 'WLD',
        transactionHash: '',
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-2 text-white hover:text-pink-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-white font-bold text-lg">Product Details</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/50 border border-purple-500/30">
              <img
                src={product.image || "https://via.placeholder.com/500"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-full transition-all ${
                    isFavorite
                      ? "bg-pink-500 text-white"
                      : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-purple-500/30 text-purple-300 rounded-full text-sm border border-purple-500/50">
                {product.category}
              </span>
              <span className="px-3 py-1 bg-pink-500/30 text-pink-300 rounded-full text-sm border border-pink-500/50">
                {product.condition === "excellent" || product.condition === "good" ? "Used" : "New"}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.title}</h1>
              <p className="text-gray-400">Seller: {product.seller}</p>
            </div>

            <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">${product.price}</span>
                <span className="text-gray-400">USD</span>
              </div>
              <p className="text-purple-300 text-sm mt-2">
                ≈ {(product.price * 100).toFixed(0)} NEXUS tokens
              </p>
            </Card>

            <div>
              <h3 className="text-white font-semibold mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4 bg-black/50 border border-purple-500/30 rounded-lg p-4 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  −
                </button>
                <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleBuy}
                disabled={buyMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-white font-semibold rounded-lg transition-all"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {buyMutation.isPending ? "Purchasing..." : "Buy Now"}
              </Button>
              <Button
                variant="outline"
                className="px-6 h-12 border-purple-500/50 text-white hover:bg-purple-500/10"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <Card className="bg-black/50 border border-purple-500/30 p-4">
              <h3 className="text-white font-semibold mb-3">Seller Info</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  <span className="text-purple-300">Rating:</span> {product.sellerRating}%
                </p>
                <p className="text-gray-300">
                  <span className="text-purple-300">Sold:</span> {product.soldCount} items
                </p>
                <p className="text-gray-300">
                  <span className="text-purple-300">Joined:</span> 2024
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
