"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product } from '@/types/product';

// 购物车项目类型
export type CartItem = {
  product: Product;
  quantity: number;
};

// 购物车上下文类型
type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

// 创建购物车上下文
const CartContext = createContext<CartContextType | undefined>(undefined);

// 购物车提供者属性
type CartProviderProps = {
  children: ReactNode;
};

// 购物车提供者组件
export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // 从localStorage加载购物车数据
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);
  
  // 保存购物车数据到localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  // 添加商品到购物车
  const addToCart = (product: Product, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // 如果商品已存在，增加数量
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // 如果商品不存在，添加新商品
        return [...prevItems, { product, quantity }];
      }
    });
  };
  
  // 从购物车中移除商品
  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };
  
  // 更新购物车商品数量
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  // 清空购物车
  const clearCart = () => {
    setItems([]);
  };
  
  // 计算总商品数量
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  // 计算总价格
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );
  
  // 提供购物车上下文
  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 使用购物车的自定义Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 