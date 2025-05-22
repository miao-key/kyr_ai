'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon } from './icons';
import { useCart } from '@/context/CartContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <span className="text-xl font-bold text-indigo-600">时尚电商</span>
            </Link>
          </div>
          
          {/* 桌面导航 */}
          <div className="hidden md:flex items-center">
            <div className="flex space-x-4">
              <Link 
                href="/" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-indigo-600"
              >
                首页
              </Link>
              <Link 
                href="/category/clothing" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                服装
              </Link>
              <Link 
                href="/category/electronics" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                电子产品
              </Link>
              <Link 
                href="/category/furniture" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                家居
              </Link>
              <Link 
                href="/category/accessories" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                配件
              </Link>
            </div>
            
            {/* 用户操作按钮 */}
            <div className="ml-6 flex items-center">
              <Link 
                href="/cart" 
                className="relative p-2 rounded-md text-gray-600 hover:text-indigo-600"
              >
                <span className="sr-only">购物车</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              
              <Link 
                href="/account" 
                className="ml-4 p-2 rounded-md text-gray-600 hover:text-indigo-600"
              >
                <span className="sr-only">我的账户</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-indigo-600 focus:outline-none"
            >
              <span className="sr-only">打开主菜单</span>
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
            
            {/* 移动端购物车按钮 */}
            <Link 
              href="/cart" 
              className="relative ml-2 p-2 rounded-md text-gray-600 hover:text-indigo-600"
            >
              <span className="sr-only">购物车</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      
      {/* 移动端菜单 */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <Link 
            href="/" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-indigo-600"
            onClick={() => setIsMenuOpen(false)}
          >
            首页
          </Link>
          <Link 
            href="/category/clothing" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600"
            onClick={() => setIsMenuOpen(false)}
          >
            服装
          </Link>
          <Link 
            href="/category/electronics" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600"
            onClick={() => setIsMenuOpen(false)}
          >
            电子产品
          </Link>
          <Link 
            href="/category/furniture" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600"
            onClick={() => setIsMenuOpen(false)}
          >
            家居
          </Link>
          <Link 
            href="/category/accessories" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600"
            onClick={() => setIsMenuOpen(false)}
          >
            配件
          </Link>
          <Link 
            href="/account" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600"
            onClick={() => setIsMenuOpen(false)}
          >
            我的账户
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 