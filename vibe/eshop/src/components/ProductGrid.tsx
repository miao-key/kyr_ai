import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  title?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  title = "所有商品" 
}) => {
  return (
    <section className="w-full">
      {title && (
        <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无商品</p>
        </div>
      )}
    </section>
  );
};

export default ProductGrid; 