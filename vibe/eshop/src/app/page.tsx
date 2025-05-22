'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductGrid from '@/components/ProductGrid';
import CartDrawer from '@/components/CartDrawer';
import { products } from '@/data/products';
import RecommendedProducts from '@/components/RecommendedProducts';
import CategoryFilter from '@/components/CategoryFilter';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  // 从产品数据中提取分类
  const categories = Object.entries(
    products.reduce((acc, product) => {
      const { category } = product;
      if (!acc[category]) {
        acc[category] = { count: 0, name: getCategoryName(category) };
      }
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { count: number; name: string }>)
  ).map(([id, { count, name }]) => ({ id, count, name }));
  
  // 根据分类ID获取分类名称
  function getCategoryName(categoryId: string): string {
    const categoryNames: Record<string, string> = {
      'clothing': '服装',
      'electronics': '电子产品',
      'furniture': '家居',
      'accessories': '配件'
    };
    return categoryNames[categoryId] || categoryId;
  }
  
  // 过滤产品
  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <Navbar />
      
      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 首页顶部横幅 */}
        <div className="bg-indigo-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">欢迎来到时尚电商</h1>
          <p className="text-indigo-100 mb-4">探索我们精选的优质商品，享受舒适的购物体验</p>
          <button className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors">
            了解更多
          </button>
        </div>
        
        {/* 分类和产品网格 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 左侧分类筛选 */}
          <div className="md:col-span-1">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
          
          {/* 右侧产品列表 */}
          <div className="md:col-span-3">
            <ProductGrid 
              products={filteredProducts} 
              title={selectedCategory ? getCategoryName(selectedCategory) : "所有商品"} 
            />
            
            {/* 推荐产品 */}
            <RecommendedProducts />
          </div>
        </div>
      </main>
      
      {/* 购物车抽屉 */}
      <CartDrawer />
    </div>
  );
}
