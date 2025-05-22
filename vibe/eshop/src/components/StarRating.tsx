import React from 'react';
import { StarIconEmpty, StarIconFull, StarIconHalf } from './icons';

interface StarRatingProps {
  rating: number;
  count: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, count, className = '' }) => {
  // 计算完整星星、半星和空星的数量
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      {/* 渲染星星图标 */}
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <StarIconFull key={`full-${i}`} className="w-4 h-4" />
        ))}
        
        {halfStar && <StarIconHalf className="w-4 h-4" />}
        
        {[...Array(emptyStars)].map((_, i) => (
          <StarIconEmpty key={`empty-${i}`} className="w-4 h-4" />
        ))}
      </div>
      
      <span className="ml-1 text-sm text-gray-500">
        ({count})
      </span>
    </div>
  );
};

export default StarRating; 