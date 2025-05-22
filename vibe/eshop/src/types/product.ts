export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // 原价，用于显示折扣
  description: string;
  images: string[]; // 支持多图
  thumbnailUrl: string; // 缩略图
  category: string;
  tags: string[];
  inventory: {
    inStock: boolean;
    quantity: number;
  };
  rating: {
    average: number; // 1-5星
    count: number;   // 评价数量
  };
  specifications?: Record<string, string>; // 产品规格
  createdAt: string; // ISO日期字符串
  updatedAt: string;
} 