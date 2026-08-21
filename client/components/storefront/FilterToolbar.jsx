'use client';

import React from 'react';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function FilterToolbar({
  totalCount = 0,
  priceRange,
  setPriceRange,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  minRating,
  setMinRating,
  onResetFilters,
  onOpenMobileFilters,
}) {
  const sizes = ['All', 'S', 'M', 'L', 'XL', '40 EU', '42 EU', '44 EU'];
  const colors = ['All', 'Obsidian Noir', 'Terracotta', 'Clay Orange', 'Sand', 'Olive', 'Navy'];

  const hasActiveFilters = priceRange < 500000 || selectedSize !== 'All' || selectedColor !== 'All' || minRating > 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* Desktop Filter Bar */}
      <div className="hidden lg:flex items-center justify-between gap-6 p-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
        
        {/* Results Counter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Showing <strong className="text-[var(--foreground)]">{totalCount}</strong> Pieces
          </span>
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Price Range Slider */}
          <div className="flex items-center gap-2 bg-[var(--background)] px-3 py-1.5 rounded-full border border-[var(--border)]">
            <span className="text-[11px] font-semibold text-[var(--muted)]">Max Price:</span>
            <input
              type="range"
              min="10000"
              max="500000"
              step="5000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-20 sm:w-28 accent-[var(--accent-dark)] cursor-pointer h-1"
            />
            <span className="text-xs font-bold text-[var(--foreground)] tabular-nums">
              {formatNaira(priceRange)}
            </span>
          </div>

          {/* Size Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-[var(--background)] px-3 py-1.5 rounded-full border border-[var(--border)]">
            <span className="text-[11px] font-semibold text-[var(--muted)]">Size:</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="bg-transparent text-xs font-bold text-[var(--foreground)] outline-none cursor-pointer"
            >
              {sizes.map((s) => (
                <option key={s} value={s} className="bg-[var(--surface)] text-[var(--foreground)]">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Color Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-[var(--background)] px-3 py-1.5 rounded-full border border-[var(--border)]">
            <span className="text-[11px] font-semibold text-[var(--muted)]">Color:</span>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="bg-transparent text-xs font-bold text-[var(--foreground)] outline-none cursor-pointer"
            >
              {colors.map((c) => (
                <option key={c} value={c} className="bg-[var(--surface)] text-[var(--foreground)]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Min Rating Dropdown */}
          <div className="flex items-center gap-1.5 bg-[var(--background)] px-3 py-1.5 rounded-full border border-[var(--border)]">
            <span className="text-[11px] font-semibold text-[var(--muted)]">Rating:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-[var(--foreground)] outline-none cursor-pointer"
            >
              <option value="0" className="bg-[var(--surface)] text-[var(--foreground)]">All Ratings</option>
              <option value="4" className="bg-[var(--surface)] text-[var(--foreground)]">★ 4.0 & Up</option>
              <option value="4.5" className="bg-[var(--surface)] text-[var(--foreground)]">★ 4.5 & Up</option>
            </select>
          </div>

          {/* Reset Filters Trigger */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Button Bar */}
      <div className="lg:hidden flex items-center justify-between gap-3 p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--foreground)]">
            {totalCount} Items
          </span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[var(--accent-dark)]" />
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenMobileFilters}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          }
        >
          Filter & Sort {hasActiveFilters && '•'}
        </Button>
      </div>
    </div>
  );
}
