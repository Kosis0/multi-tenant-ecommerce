'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function CategoryPills({
  categories = [],
  selectedCategory = 'All',
  onSelectCategory,
}) {
  const allCategories = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
        {allCategories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          
          return (
            <motion.button
              key={cat.id || cat.name}
              onClick={() => onSelectCategory(cat.name)}
              whileTap={{ scale: 0.95 }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all select-none focus-ring cursor-pointer ${
                isSelected
                  ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                  : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              {cat.icon && <span className="text-sm">{cat.icon}</span>}
              <span>{cat.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
