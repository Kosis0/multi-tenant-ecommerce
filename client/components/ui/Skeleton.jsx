'use client';

import React from 'react';

export function Skeleton({ className = '', rounded = 'rounded-2xl', ...props }) {
  return (
    <div
      className={`skeleton ${rounded} ${className}`}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="clay-card p-3 sm:p-4 flex flex-col space-y-3">
      {/* 4:5 Aspect Ratio Image Skeleton */}
      <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
      
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-4 w-4/5 rounded-full" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-1/2 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="clay-card p-6 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="h-3 w-20 rounded-full" />
      </div>
      <Skeleton className="w-12 h-12 rounded-2xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center gap-3 w-1/3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 w-full">
              <Skeleton className="h-3.5 w-3/4 rounded-full" />
              <Skeleton className="h-2.5 w-1/2 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}
