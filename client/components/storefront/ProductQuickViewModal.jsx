'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { formatNaira } from '@/lib/utils';

export function ProductQuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenReviews,
  onShare,
  isWishlisted,
  onToggleWishlist,
}) {
  const [activeImage, setActiveImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image_url);
      setQuantity(1);
      
      let variantsList = [];
      try {
        variantsList = Array.isArray(product.variants) 
          ? product.variants 
          : (typeof product.variants === 'string' ? JSON.parse(product.variants || '[]') : []);
      } catch {
        variantsList = [];
      }
      
      setSelectedVariant(variantsList[0] || null);
    }
  }, [product]);

  if (!product) return null;

  // Extract gallery images
  let gallery = [product.image_url].filter(Boolean);
  try {
    const extraImages = Array.isArray(product.images) 
      ? product.images 
      : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : []);
    gallery = Array.from(new Set([...gallery, ...extraImages].filter(Boolean)));
  } catch {}

  // Parse variants
  let variantsList = [];
  try {
    variantsList = Array.isArray(product.variants) 
      ? product.variants 
      : (typeof product.variants === 'string' ? JSON.parse(product.variants || '[]') : []);
  } catch {}

  const basePrice = Number(product.price) || 0;
  const adjustment = Number(selectedVariant?.price_adjustment) || 0;
  const unitPrice = basePrice + adjustment;
  const originalPrice = product.original_price ? Number(product.original_price) + adjustment : null;

  const currentStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  const handleAdd = async () => {
    if (isOutOfStock) return;
    setAddingToCart(true);
    if (onAddToCart) {
      await onAddToCart(product, quantity, selectedVariant);
    }
    setAddingToCart(false);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl" showClose={true}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Gallery & Thumbnails */}
        <div className="md:col-span-6 space-y-3">
          {/* Main Visual Image */}
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[var(--background)] border border-[var(--border)]">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 450px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                🛍️
              </div>
            )}

            {/* Sale Badge */}
            {product.discount_percent > 0 && (
              <div className="absolute top-3 left-3">
                <Badge variant="sale" size="sm">
                  SAVE {product.discount_percent}%
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery Row */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImage === img ? 'border-[var(--accent-dark)] scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details, Variants, Price, & Action Bar */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-5 text-left">
          <div className="space-y-4">
            
            {/* Header Tags & Share */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-dark)]">
                {product.category || 'General'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShare && onShare(product)}
                  className="p-2 rounded-full border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card-clay)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  title="Share product link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>

                <button
                  onClick={() => onToggleWishlist && onToggleWishlist(product)}
                  className={`p-2 rounded-full border border-[var(--border)] transition-colors cursor-pointer ${
                    isWishlisted ? 'bg-[var(--accent-clay)] text-[var(--accent-dark)]' : 'bg-[var(--background)] hover:bg-[var(--card-clay)] text-[var(--muted)]'
                  }`}
                  title="Wishlist toggle"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
            </div>

            {/* Product Title */}
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[var(--foreground)] leading-tight tracking-tight">
              {product.title}
            </h2>

            {/* Reviews Summary Link */}
            <div className="flex items-center gap-3">
              <StarRating rating={product.rating || 5} size={14} showValue={true} />
              <button
                onClick={() => {
                  onClose();
                  if (onOpenReviews) onOpenReviews(product);
                }}
                className="text-xs text-[var(--accent-dark)] hover:underline font-semibold cursor-pointer"
              >
                {product.review_count || 12} Verified Reviews →
              </button>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-3 py-2 border-y border-[var(--border-light)]">
              <span className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tabular-nums">
                {formatNaira(unitPrice)}
              </span>
              {originalPrice && originalPrice > unitPrice && (
                <span className="text-sm sm:text-base text-[var(--muted)] line-through tabular-nums">
                  {formatNaira(originalPrice)}
                </span>
              )}
              {product.discount_percent > 0 && (
                <Badge variant="sale" size="xs">
                  SAVE {product.discount_percent}%
                </Badge>
              )}
            </div>

            {/* Rich Description */}
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed font-sans">
              {product.description || 'Designed with bespoke craftsmanship and premium quality materials for timeless elegance.'}
            </p>

            {/* Dynamic Variant Selector */}
            {variantsList.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Select Specification ({variantsList.length} options)
                </label>
                <div className="flex flex-wrap gap-2">
                  {variantsList.map((v, idx) => {
                    const isSelected = selectedVariant?.sku === v.sku || selectedVariant === v;
                    return (
                      <button
                        key={v.sku || idx}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-xs scale-105'
                            : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)]'
                        }`}
                      >
                        <span>{v.size ? `Size: ${v.size}` : ''}</span>
                        {v.color && <span className="ml-1 text-[11px] opacity-80">({v.color})</span>}
                        {v.price_adjustment > 0 && (
                          <span className="ml-1 text-[10px] text-emerald-500">
                            +{formatNaira(v.price_adjustment)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Stock Meter */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-red-500' : currentStock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="font-semibold text-[var(--foreground)]">
                {isOutOfStock ? 'Out of Stock' : currentStock <= 5 ? `Low Stock: Only ${currentStock} pieces left` : `In Stock (${currentStock} available)`}
              </span>
            </div>
          </div>

          {/* Quantity Stepper & Add to Bag CTA */}
          <div className="pt-4 border-t border-[var(--border-light)] flex flex-col sm:flex-row items-center gap-3">
            
            {/* Stepper */}
            <div className="flex items-center border border-[var(--border)] rounded-full bg-[var(--background)] p-1 w-full sm:w-auto justify-between shrink-0">
              <button
                type="button"
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-clay)] disabled:opacity-40 cursor-pointer"
              >
                -
              </button>
              <span className="px-4 text-xs font-bold tabular-nums text-[var(--foreground)]">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= currentStock || isOutOfStock}
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-clay)] disabled:opacity-40 cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Primary Action Button */}
            <Button
              variant="clay"
              size="lg"
              className="w-full flex-1"
              disabled={isOutOfStock || addingToCart}
              isLoading={addingToCart}
              onClick={handleAdd}
            >
              {addedSuccess ? (
                'Added to Shopping Bag ✓'
              ) : isOutOfStock ? (
                'Sold Out'
              ) : (
                `Add to Bag — ${formatNaira(unitPrice * quantity)}`
              )}
            </Button>
          </div>

        </div>

      </div>
    </Modal>
  );
}
