'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShoppingCartIcon, XMarkIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from './icons';

const CartDrawer: React.FC = () => {
  const { items, totalPrice, removeFromCart, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  
  // 关闭购物车时的动画效果
  const handleClose = () => {
    setIsOpen(false);
  };
  
  // 修复在服务器端渲染时，防止滚动条被锁定
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  return (
    <>
      {/* 购物车按钮 */}
      <button 
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCartIcon className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>
      
      {/* 购物车抽屉 */}
      <div className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* 购物车内容 */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-medium">购物车</h2>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* 购物车列表 */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingBagIcon className="w-12 h-12 mb-4" />
                  <p>购物车是空的</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {items.map((item) => (
                    <li key={item.product.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        {/* 商品图片 */}
                        <div className="flex-shrink-0 w-16 h-16 relative rounded overflow-hidden">
                          <Image 
                            src={item.product.thumbnailUrl || "/placeholder-image.jpg"} 
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        {/* 商品信息 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ¥{item.product.price} x {item.quantity}
                          </p>
                        </div>
                        
                        {/* 数量调整 */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="text-gray-400 hover:text-indigo-600 p-1"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          
                          <span className="text-gray-700">{item.quantity}</span>
                          
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="text-gray-400 hover:text-indigo-600 p-1"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* 移除按钮 */}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* 购物车底部 */}
            <div className="border-t p-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">总计:</span>
                <span className="font-medium">¥{totalPrice.toFixed(2)}</span>
              </div>
              <button 
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={items.length === 0}
              >
                结算
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer; 