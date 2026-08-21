'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { formatNaira } from '@/lib/utils';

export function ProductCard({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onOpenQuickView,
  onAddToCart,
}) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const originalPrice = product.original_price || (product.discount_percent > 0 ? product.price * (1 + product.discount_percent / 100) : null);
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  // Variants extraction
  const variants = Array.isArray(product.variants) 
    ? product.variants 
    : (typeof product.variants === 'string' ? JSON.parse(product.variants || '[]') : []);

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setAddingToCart(true);
    
    // Default to first variant if available
    const defaultVariant = variants[0] || null;
    if (onAddToCart) {
      await onAddToCart(product, 1, defaultVariant);
    }
    
    setAddingToCart(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1200);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onOpenQuickView(product)}
      className="clay-card p-3 sm:p-4 flex flex-col justify-between group cursor-pointer relative select-none"
    >
      <div>
        {/* 4:5 Boutique Portrait Aspect Ratio Image Container */}
        <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[var(--background)] mb-3">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-[var(--muted)]">
              🛍️
            </div>
          )}

          {/* Badges Stack (Top Left) */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {product.discount_percent > 0 && (
              <Badge variant="sale" size="xs">
                -{product.discount_percent}%
              </Badge>
            )}
            {product.is_new_arrival && (
              <Badge variant="new" size="xs">
                NEW
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="warning" size="xs">
                ONLY {product.stock} LEFT
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="danger" size="xs">
                SOLD OUT
              </Badge>
            )}
          </div>

          {/* Wishlist Heart Button (Top Right) */}
          <motion.button
            type="button"
            aria-label={`Save ${product.title} to wishlist`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            whileTap={{ scale: 0.8 }}
            animate={isWishlisted ? { scale: [1, 1.25, 0.95, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 shadow-sm cursor-pointer ${
              isWishlisted
                ? 'bg-[var(--surface)] text-[var(--accent-dark)]'
                : 'bg-[var(--surface)]/80 backdrop-blur-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.button>

          {/* Quick View Hover Pill (Desktop Overlay) */}
          <div className="absolute inset-x-3 bottom-3 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-10">
            <span className="w-full py-2 px-3 rounded-xl glass-modal text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)] text-center shadow-lg border border-[var(--border)]">
              Quick View
            </span>
          </div>
        </div>

        {/* Product Metadata & Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)] truncate">
              {product.category || 'General'}
            </span>
            <StarRating
              rating={product.rating || 5}
              size={11}
              showValue={false}
            />
          </div>

          <h3 className="font-sans text-xs sm:text-sm font-semibold text-[var(--foreground)] line-clamp-2 leading-snug group-hover:text-[var(--accent-dark)] transition-colors">
            {product.title}
          </h3>

          {/* Swatches / Sizes hint */}
          {variants.length > 0 && (
            <p className="text-[10px] text-[var(--muted)] font-mono">
              +{variants.length} options available
            </p>
          )}
        </div>
      </div>

      {/* Pricing & Quick Add Button */}
      <div className="mt-3 pt-3 border-t border-[var(--border-light)] flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-bold text-[var(--foreground)] tabular-nums">
            {formatNaira(product.price)}
          </div>
          {originalPrice && originalPrice > product.price && (
            <div className="text-[10px] text-[var(--muted)] line-through tabular-nums">
              {formatNaira(originalPrice)}
            </div>
          )}
        </div>

        <motion.button
          type="button"
          disabled={isOutOfStock || addingToCart}
          onClick={handleQuickAdd}
          whileTap={{ scale: 0.94 }}
          className={`h-8 sm:h-9 px-3 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            addedSuccess
              ? 'bg-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed'
              : 'bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-white'
          }`}
        >
          {addingToCart ? (
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : addedSuccess ? (
            <>
              <span>✓</span>
              <span className="hidden sm:inline">Added</span>
            </>
          ) : isOutOfStock ? (
            'Sold Out'
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Add</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
