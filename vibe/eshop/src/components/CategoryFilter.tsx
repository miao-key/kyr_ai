'use client';

import React from 'react';

interface CategoryFilterProps {
  categories: {
    id: string;
    name: string;
    count: number;
  }[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">商品分类</h3>
      <ul className="space-y-2">
        <li>
          <button
            className={`w-full text-left px-3 py-2 rounded-md ${
              selectedCategory === null
                ? 'bg-indigo-50 text-indigo-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onSelectCategory(null)}
          >
            所有商品
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              className={`w-full text-left px-3 py-2 rounded-md ${
                selectedCategory === category.id
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => onSelectCategory(category.id)}
            >
              <span>{category.name}</span>
              <span className="ml-2 text-sm text-gray-500">({category.count})</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilter; 