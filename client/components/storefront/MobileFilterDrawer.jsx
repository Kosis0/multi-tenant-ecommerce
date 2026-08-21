'use client';

import React from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/lib/utils';

export function MobileFilterDrawer({
  isOpen,
  onClose,
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
}) {
  const sizes = ['All', 'S', 'M', 'L', 'XL', '40 EU', '42 EU', '44 EU'];
  const colors = ['All', 'Obsidian Noir', 'Terracotta', 'Clay Orange', 'Sand', 'Olive', 'Navy'];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Catalog"
      subtitle={`${totalCount} matching pieces`}
      footer={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" className="flex-1" onClick={onResetFilters}>
            Reset All
          </Button>
          <Button variant="clay" size="md" className="flex-1" onClick={onClose}>
            Apply Filters
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Price Range Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="uppercase tracking-wider text-[var(--muted)]">Price Range</span>
            <span className="text-[var(--accent-dark)] font-bold tabular-nums">{formatNaira(priceRange)}</span>
          </div>
          <input
            type="range"
            min="10000"
            max="500000"
            step="5000"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-[var(--accent-dark)] cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
            <span>₦10,000</span>
            <span>₦500,000</span>
          </div>
        </div>

        {/* Size Pills */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Size Selection
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const isSelected = selectedSize.toLowerCase() === s.toLowerCase();
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-[var(--foreground)] text-[var(--background)]'
                      : 'bg-[var(--card-clay)] text-[var(--foreground)] border border-[var(--border)]'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Color Palette
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent-dark)] text-white'
                      : 'bg-[var(--card-clay)] text-[var(--foreground)] border border-[var(--border)]'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimum Rating */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Customer Rating
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 0, label: 'All' },
              { val: 4, label: '4.0+ Stars' },
              { val: 4.5, label: '4.5+ Stars' },
            ].map((r) => (
              <button
                key={r.val}
                onClick={() => setMinRating(r.val)}
                className={`py-2 rounded-xl text-xs font-bold transition-colors text-center ${
                  minRating === r.val
                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                    : 'bg-[var(--card-clay)] text-[var(--foreground)] border border-[var(--border)]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
