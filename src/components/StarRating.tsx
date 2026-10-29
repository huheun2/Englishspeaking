import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  score: number; // 0 to 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  score,
  maxStars = 5,
  size = 'md',
  showLabel = true,
  animate = true,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="inline-flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 rounded-full shadow-xs">
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }).map((_, index) => {
          const isFilled = index < score;
          return (
            <span
              key={index}
              className={`transition-all duration-300 transform ${
                isFilled
                  ? 'text-amber-400 scale-105 drop-shadow-[0_1px_4px_rgba(251,191,36,0.5)]'
                  : 'text-slate-300'
              } ${animate && isFilled ? 'animate-bounce' : ''}`}
              style={{
                animationDelay: `${index * 100}ms`,
                animationIterationCount: 1,
              }}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled ? 'fill-amber-400' : 'fill-slate-100 stroke-slate-300'
                }`}
              />
            </span>
          );
        })}
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-amber-700 ml-1">
          {score}/{maxStars}
        </span>
      )}
    </div>
  );
};
