import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

interface ProductFormData {
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  price: string;
  images: File[];
  previewUrls: string[];
}

export default function ListProduct() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    category: 'Electronics',
    condition: 'like-new',
    price: '',
    images: [],
    previewUrls: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const listProductMutation = trpc.marketplace.listProduct.useMutation();

  const CATEGORIES = [
    'Electronics',
    'Fashion',
    'Home & Lifestyle',
    'Collectibles',
    'Art',
    'Sports',
    'Books',
    'Other',
  ];

  const CONDITIONS = [
    { value: 'new', label: '全新' },
    { value: 'like-new', label: '如新' },
    { value: 'good', label: '良好' },
    { value: 'fair', label: '尚可' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (formData.images.length + files.length > 5) {
      setErrorMessage('最多只能上傳 5 張圖片');
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('單個文件大小不能超過 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, file],
          previewUrls: [...prev.previewUrls, previewUrl],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      previewUrls: prev.previewUrls.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setErrorMessage('請輸入商品標題');
      return false;
    }
    if (formData.title.length > 100) {
      setErrorMessage('商品標題不能超過 100 字');
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage('請輸入商品描述');
      return false;
    }
    if (formData.description.length > 1000) {
      setErrorMessage('商品描述不能超過 1000 字');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setErrorMessage('請輸入有效的價格');
      return false;
    }
    if (formData.previewUrls.length === 0) {
      setErrorMessage('至少需要上傳一張圖片');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // 調用 tRPC 路由上架商品
      const result = await listProductMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category as 'Electronics' | 'Fashion' | 'Home & Lifestyle' | 'Collectibles' | 'Art' | 'Sports' | 'Books' | 'Other',
        condition: formData.condition.toUpperCase().replace('-', ' ') as 'New' | 'Like New' | 'Good' | 'Fair',
        price: parseFloat(formData.price),
        images: formData.previewUrls, // 使用 base64 預覽 URL（實際應用中應上傳到 S3）
      });

      if (result.success) {
        console.log('商品上架成功:', result.product);
        setSubmitStatus('success');

        // 2 秒後重定向到市場頁面
        setTimeout(() => {
          navigate('/marketplace');
        }, 2000);
      } else {
        throw new Error(result.error || '上架失敗');
      }
    } catch (error) {
      console.error('上架失敗:', error);
      setErrorMessage(error instanceof Error ? error.message : '上架失敗，請稍後重試');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 頂部導航 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/marketplace')}
            className="text-purple-400 hover:text-purple-300 mb-4 flex items-center gap-2"
          >
            ← 返回市場
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">上架商品</h1>
          <p className="text-slate-400">將您的二手或全新商品上架到 World Nexus 市場</p>
        </div>

        {/* 成功提示 */}
        {submitStatus === 'success' && (
          <Card className="bg-green-500/10 border-green-500/30 p-6 mb-8">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-green-400">上架成功！</h3>
                <p className="text-green-300 text-sm">您的商品已成功上架，即將返回市場...</p>
              </div>
            </div>
          </Card>
        )}

        {/* 錯誤提示 */}
        {submitStatus === 'error' && errorMessage && (
          <Card className="bg-red-500/10 border-red-500/30 p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">上架失敗</h3>
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            </div>
          </Card>
        )}

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">基本信息</h2>

            <div className="space-y-6">
              {/* 商品標題 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  商品標題 <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="例：Apple iPhone 13 Pro 256GB 太空黑"
                  maxLength={100}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <div className="text-xs text-slate-400 mt-1">
                  {formData.title.length}/100 字
                </div>
              </div>

              {/* 商品描述 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  商品描述 <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="詳細描述商品狀況、功能、使用時間等..."
                  maxLength={1000}
                  rows={5}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
                <div className="text-xs text-slate-400 mt-1">
                  {formData.description.length}/1000 字
                </div>
              </div>

              {/* 分類與狀況 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    分類 <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    商品狀況 <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    {CONDITIONS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 價格 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  價格 (WLD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    WLD
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 圖片上傳 */}
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">商品圖片</h2>

            {/* 上傳區域 */}
            <div className="mb-6">
              <label className="block">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-500/5 transition">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">點擊上傳或拖拽圖片</p>
                  <p className="text-slate-400 text-sm">
                    支持 JPG、PNG 格式，單個文件最大 5MB，最多 5 張
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 圖片預覽 */}
            {formData.previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {formData.previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-slate-600"
                    />
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                        主圖
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-slate-400 mt-4">
              已上傳 {formData.previewUrls.length}/5 張圖片
            </div>
          </Card>

          {/* 提交按鈕 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/marketplace')}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? '上架中...' : '確認上架'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
