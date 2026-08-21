'use client';

import React, { useState } from 'react';

export function StarRating({
  rating = 5,
  maxStars = 5,
  size = 14,
  interactive = false,
  onChange,
  showCount = false,
  reviewCount = 0,
  showValue = false,
  className = '',
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= displayRating;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starNumber)}
              onMouseEnter={() => interactive && setHoverRating(starNumber)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : 'cursor-default'} focus-ring rounded-xs p-0.5`}
              aria-label={interactive ? `Rate ${starNumber} stars out of ${maxStars}` : undefined}
            >
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill={isFilled ? '#f59e0b' : 'none'}
                stroke={isFilled ? '#f59e0b' : 'var(--muted)'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-bold text-[var(--foreground)] tabular-nums ml-0.5">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {showCount && (
        <span className="text-[11px] text-[var(--muted)]">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
