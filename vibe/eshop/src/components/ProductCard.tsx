import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import StarRating from './StarRating';
import { useCart } from '@/context/CartContext';
import { ShoppingCartIcon } from './icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  // 计算折扣百分比
  const discountPercentage = product.originalPrice ? 
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  
  // 处理添加到购物车
  const handleAddToCart = () => {
    addToCart(product, 1);
    // 添加产品卡片动画效果
    const card = document.getElementById(`product-card-${product.id}`);
    if (card) {
      card.classList.add('scale-105');
      setTimeout(() => {
        card.classList.remove('scale-105');
      }, 200);
    }
  };
  
  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] flex flex-col h-full"
    >
      {/* 折扣标签 */}
      {discountPercentage > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          -{discountPercentage}%
        </div>
      )}
      
      {/* 图片容器 */}
      <div className="relative aspect-w-1 aspect-h-1 overflow-hidden">
        <Image 
          src={product.thumbnailUrl || "/placeholder-image.jpg"} 
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      
      {/* 产品信息 */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-sm font-medium text-gray-700 mb-1">{product.name}</h3>
          
          {/* 评分 */}
          <StarRating rating={product.rating.average} count={product.rating.count} className="mb-2" />
          
          {/* 价格 */}
          <div className="mt-2 mb-4">
            <span className="text-lg font-semibold text-gray-900">¥{product.price}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">¥{product.originalPrice}</span>
            )}
          </div>
        </div>
        
        {/* 添加到购物车按钮 */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-indigo-700 transition-colors"
        >
          <ShoppingCartIcon className="w-5 h-5 mr-2" />
          <span>加入购物车</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 