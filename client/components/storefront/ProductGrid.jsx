'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export function ProductGrid({
  products = [],
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  wishlistIds = [],
  onToggleWishlist,
  onOpenQuickView,
  onAddToCart,
  onResetFilters,
  gridRef,
}) {
  if (loading) {
    return (
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <ProductGridSkeleton count={8} />
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <EmptyState
          type="search"
          title="No Matching Pieces Found"
          description="We couldn't find any garments or accessories matching your filter criteria. Try resetting filters to explore the entire catalog."
          actionLabel="Clear All Filters"
          onAction={onResetFilters}
        />
      </section>
    );
  }

  return (
    <section ref={gridRef} className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* 2-Column Mobile, 3-Column Tablet, 4-Column Desktop Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <AnimatePresence>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onOpenQuickView={onOpenQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            size="lg"
            isLoading={loadingMore}
            onClick={onLoadMore}
            className="min-w-[200px]"
          >
            {loadingMore ? 'Loading Pieces...' : 'Load More Products ↓'}
          </Button>
        </div>
      )}
    </section>
  );
}
