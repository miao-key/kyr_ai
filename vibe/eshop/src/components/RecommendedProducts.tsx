'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types/product';
import { products } from '@/data/products';

const RecommendedProducts = () => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  
  useEffect(() => {
    // 从localStorage获取浏览历史
    const getViewHistory = (): string[] => {
      try {
        const history = localStorage.getItem('viewHistory');
        return history ? JSON.parse(history) : [];
      } catch (error) {
        console.error('Failed to parse view history:', error);
        return [];
      }
    };
    
    // 基于浏览历史生成推荐
    const generateRecommendations = (viewedIds: string[]) => {
      if (viewedIds.length === 0) {
        // 无浏览历史时返回热门产品
        return products.slice(0, 4);
      }
      
      // 从浏览历史中获取最近查看的产品
      const recentlyViewed = viewedIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean) as Product[];
      
      if (recentlyViewed.length === 0) return products.slice(0, 4);
      
      // 收集已查看产品的类别
      const viewedCategories = new Set(
        recentlyViewed.map(product => product.category)
      );
      
      // 基于类别推荐相似产品
      const similarProducts = products.filter(
        product => 
          viewedCategories.has(product.category) && 
          !viewedIds.includes(product.id)
      );
      
      // 返回推荐产品，不足4个则补充其他热门产品
      return similarProducts.length >= 4 
        ? similarProducts.slice(0, 4)
        : [
            ...similarProducts,
            ...products
              .filter(p => !viewedIds.includes(p.id) && !similarProducts.includes(p))
              .slice(0, 4 - similarProducts.length)
          ];
    };
    
    // 模拟添加一个产品到浏览历史
    const simulateProductView = () => {
      // 在实际应用中，这部分应该在查看产品详情页时进行
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      let viewHistory = getViewHistory();
      
      // 将产品ID添加到历史中（如果不存在）
      if (!viewHistory.includes(randomProduct.id)) {
        viewHistory = [randomProduct.id, ...viewHistory].slice(0, 5); // 保留最近5个
        localStorage.setItem('viewHistory', JSON.stringify(viewHistory));
      }
      
      return viewHistory;
    };
    
    // 如果没有浏览历史，先模拟一些
    const viewHistory = getViewHistory().length > 0 
      ? getViewHistory() 
      : simulateProductView();
    
    setRecommendations(generateRecommendations(viewHistory));
  }, []);
  
  if (recommendations.length === 0) return null;
  
  return (
    <section className="mt-12 pt-6 border-t">
      <h2 className="text-xl font-semibold mb-6">为您推荐</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RecommendedProducts; 