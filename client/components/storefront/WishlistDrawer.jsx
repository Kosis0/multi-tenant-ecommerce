'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNaira } from '@/lib/utils';

export function WishlistDrawer({
  isOpen,
  onClose,
  wishlistIds = [],
  products = [],
  onToggleWishlist,
  onAddToCart,
  onExploreCatalog,
}) {
  // Match products with wishlist IDs
  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Saved Wishlist"
      subtitle={`${savedProducts.length} ${savedProducts.length === 1 ? 'item' : 'items'} saved`}
      maxWidth="max-w-md"
    >
      {savedProducts.length === 0 ? (
        <EmptyState
          type="wishlist"
          title="Your Wishlist is Empty"
          description="Save pieces you love by tapping the heart icon on any product in our collection."
          actionLabel="Browse Catalog"
          onAction={() => {
            onClose();
            if (onExploreCatalog) onExploreCatalog();
          }}
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {savedProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[var(--background)] shrink-0 border border-[var(--border)]">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.title} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    {product.category}
                  </span>
                  <h4 className="text-xs font-semibold text-[var(--foreground)] truncate">
                    {product.title}
                  </h4>
                  <p className="text-xs font-bold text-[var(--foreground)] tabular-nums mt-1">
                    {formatNaira(product.price)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="text-[var(--muted)] hover:text-red-500 transition-colors p-1"
                    title="Remove from wishlist"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  <Button
                    variant="clay"
                    size="sm"
                    onClick={() => {
                      onAddToCart(product, 1);
                      onToggleWishlist(product);
                    }}
                  >
                    Move to Bag
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Drawer>
  );
}
