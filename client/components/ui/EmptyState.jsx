'use client';

import React from 'react';
import { Button } from './Button';

export function EmptyState({
  icon,
  type = 'cart', // 'cart' | 'wishlist' | 'search' | 'orders' | 'products' | 'generic'
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  // Built-in icon SVGs
  const defaultIcons = {
    cart: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    wishlist: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    search: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    orders: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    products: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    generic: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };

  const defaultTitles = {
    cart: 'Your Bag is Empty',
    wishlist: 'Curate Your Wishlist',
    search: 'No Matching Pieces Found',
    orders: 'No Order History Yet',
    products: 'No Products Listed',
    generic: 'Nothing to display here',
  };

  const defaultDescriptions = {
    cart: 'Explore our curated collection and discover your next signature piece.',
    wishlist: 'Save items you love by tapping the heart icon on any product.',
    search: 'Try adjusting your search terms, changing filters, or exploring all categories.',
    orders: 'Once you place your first order, your tracking timeline and receipt will appear here.',
    products: 'Get started by adding your first product to this merchant storefront.',
    generic: 'There are currently no items available in this section.',
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] ${className}`}>
      {/* Icon Circle */}
      <div className="w-20 h-20 rounded-3xl bg-[var(--accent-clay)] border border-[var(--border)] text-[var(--accent-dark)] flex items-center justify-center mb-5 shadow-xs">
        {icon || defaultIcons[type] || defaultIcons.generic}
      </div>

      <h4 className="font-editorial text-xl sm:text-2xl font-semibold text-[var(--foreground)] tracking-tight mb-2">
        {title || defaultTitles[type]}
      </h4>

      <p className="text-xs sm:text-sm text-[var(--muted)] max-w-sm mx-auto mb-6 leading-relaxed">
        {description || defaultDescriptions[type]}
      </p>

      {actionLabel && onAction && (
        <Button variant="clay" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
