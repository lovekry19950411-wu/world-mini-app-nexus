import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Star, Filter, Plus } from 'lucide-react';
import { useLocation } from 'wouter';

// 示例商品數據
const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: 'Apple iPhone 13 Pro',
    category: 'Electronics',
    price: 950,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663532210815/Qus9eYN3uSGfeudni9847g/world-nexus-marketplace-NfcY9fziXooA7Grx2oWP5U.png',
    seller: 'TechHub',
    rating: 4.9,
    reviews: 128,
    condition: 'Like New',
  },
  {
    id: 2,
    name: 'Gaming Laptop RTX 4090',
    category: 'Electronics',
    price: 1200,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663532210815/Qus9eYN3uSGfeudni9847g/world-nexus-marketplace-NfcY9fziXooA7Grx2oWP5U.png',
    seller: 'PixelForge',
    rating: 4.8,
    reviews: 89,
    condition: 'New',
  },
  {
    id: 3,
    name: 'Luxury Swiss Watch',
    category: 'Fashion',
    price: 850,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663532210815/Qus9eYN3uSGfeudni9847g/world-nexus-marketplace-NfcY9fziXooA7Grx2oWP5U.png',
    seller: 'TimeMaster',
    rating: 4.7,
    reviews: 45,
    condition: 'Like New',
  },
  {
    id: 4,
    name: 'Wireless Headphones Pro',
    category: 'Electronics',
    price: 300,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663532210815/Qus9eYN3uSGfeudni9847g/world-nexus-marketplace-NfcY9fziXooA7Grx2oWP5U.png',
    seller: 'SoundWave',
    rating: 4.6,
    reviews: 234,
    condition: 'New',
  },
];

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home & Lifestyle', 'Collectibles'];

export default function Marketplace() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<number[]>([]);

  const filteredProducts = SAMPLE_PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (productId: number) => {
    setCart((prev) => [...prev, productId]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 頂部導航 */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">World Nexus Marketplace</h1>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/list-product')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                上架商品
              </Button>
              <div className="text-right hidden md:block">
                <div className="text-sm text-slate-400">Balance</div>
                <div className="text-lg font-bold text-white">256.8 WLD</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="relative"
                onClick={() => alert(`購物車: ${cart.length} 件商品`)}
              >
                <ShoppingCart className="w-4 h-4" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* 搜尋欄 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜尋商品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 側邊欄 - 篩選 */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-white">分類</h3>
              </div>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* 主內容 - 商品網格 */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">未找到符合條件的商品</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-purple-500 transition group"
                  >
                    {/* 商品圖片 */}
                    <div className="relative h-48 bg-slate-700 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs font-semibold text-white">
                        {product.condition}
                      </div>
                    </div>

                    {/* 商品信息 */}
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* 賣家信息 */}
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="text-slate-400">Seller:</span>
                        <span className="text-purple-400 font-medium">{product.seller}</span>
                      </div>

                      {/* 評分 */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      {/* 價格與按鈕 */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div>
                          <div className="text-xs text-slate-400">Price</div>
                          <div className="text-xl font-bold text-white">
                            {product.price} WLD
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product.id)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
