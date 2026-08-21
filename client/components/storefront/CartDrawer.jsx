'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNaira } from '@/lib/utils';

export function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  subtotal = 0,
  totalItems = 0,
  discountAmount = 0,
  shippingCost = 0,
  finalTotal = 0,
  isFreeShipping = false,
  freeShippingRemaining = 0,
  freeShippingProgress = 0,
  freeShippingThreshold = 50000,
  promoCode = '',
  setPromoCode,
  appliedPromo = null,
  onApplyPromo,
  onRemovePromo,
  onProceedToCheckout,
  onExploreCatalog,
}) {
  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoMessage, setPromoMessage] = useState(null);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = onApplyPromo(promoInput);
    setPromoMessage(res);
    setTimeout(() => setPromoMessage(null), 3500);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Shopping Bag"
      subtitle={`${totalItems} ${totalItems === 1 ? 'item' : 'items'} curated`}
      maxWidth="max-w-md"
      footer={
        cart.length > 0 ? (
          <div className="space-y-4">
            {/* Promo Code Drawer Accordion */}
            <div className="border border-[var(--border)] rounded-2xl p-3 bg-[var(--surface)]">
              <button
                onClick={() => setIsPromoOpen(!isPromoOpen)}
                className="w-full flex items-center justify-between text-xs font-semibold text-[var(--foreground)]"
              >
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  <span>{appliedPromo ? `Promo Applied: ${appliedPromo.code}` : 'Add Promo Code'}</span>
                </div>
                <span className="text-[10px] text-[var(--muted)]">{isPromoOpen ? '▲' : '▼'}</span>
              </button>

              {isPromoOpen && (
                <div className="mt-3 pt-3 border-t border-[var(--border-light)] space-y-2">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-emerald-500/10 p-2 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                      <span className="inline-flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {appliedPromo.label}
                      </span>
                      <button
                        onClick={onRemovePromo}
                        className="text-red-500 font-bold hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="e.g. WELCOME10"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs uppercase font-mono outline-none focus:border-[var(--accent)]"
                      />
                      <Button variant="clay" size="sm" type="submit">
                        Apply
                      </Button>
                    </form>
                  )}

                  {promoMessage && (
                    <p className={`text-[11px] font-medium ${promoMessage.success ? 'text-emerald-600' : 'text-red-500'}`}>
                      {promoMessage.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-1.5 text-xs text-[var(--muted)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[var(--foreground)] font-semibold tabular-nums">{formatNaira(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Promo Savings</span>
                  <span className="font-semibold tabular-nums">-{formatNaira(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span className="text-[var(--foreground)] font-semibold tabular-nums">
                  {isFreeShipping ? <span className="text-emerald-600 font-bold">FREE</span> : formatNaira(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--foreground)] pt-2 border-t border-[var(--border)]">
                <span>Total Amount</span>
                <span className="text-base text-[var(--accent-dark)] tabular-nums">{formatNaira(finalTotal)}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <Button
              variant="clay"
              size="lg"
              className="w-full shadow-lg"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
            >
              Checkout Securely — {formatNaira(finalTotal)}
            </Button>
          </div>
        ) : null
      }
    >
      {cart.length === 0 ? (
        <EmptyState
          type="cart"
          title="Your Bag is Empty"
          description="Looks like you haven't added any luxury pieces to your bag yet."
          actionLabel="Start Shopping"
          onAction={() => {
            onClose();
            if (onExploreCatalog) onExploreCatalog();
          }}
        />
      ) : (
        <div className="space-y-6">
          
          {/* Free Shipping Progress Meter */}
          <div className="p-3.5 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--foreground)] flex items-center gap-1.5">
                {isFreeShipping ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>You unlocked Free Delivery!</span>
                  </>
                ) : (
                  `Add ${formatNaira(freeShippingRemaining)} for Free Delivery`
                )}
              </span>
              <span className="text-[10px] text-[var(--muted)] font-mono">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${freeShippingProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Cart Item Cards */}
          <div className="space-y-3">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.cartKey}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[var(--background)] shrink-0 border border-[var(--border)]">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Title & Options */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[var(--foreground)] truncate">
                      {item.title}
                    </h4>

                    {item.variant && (
                      <p className="text-[10px] text-[var(--muted)] mt-0.5">
                        {item.variant.size ? `Size: ${item.variant.size}` : ''} {item.variant.color ? `• ${item.variant.color}` : ''}
                      </p>
                    )}

                    <p className="text-xs font-bold text-[var(--foreground)] tabular-nums mt-1">
                      {formatNaira(item.price)}
                    </p>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => onRemoveItem(item.cartKey)}
                      className="text-[var(--muted)] hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>

                    <div className="flex items-center border border-[var(--border)] rounded-full bg-[var(--background)] px-1.5 py-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.cartKey, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold tabular-nums text-[var(--foreground)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Clear Cart Button */}
          {cart.length > 0 && (
            <div className="text-center pt-2">
              <button
                onClick={onClearCart}
                className="text-[11px] text-[var(--muted)] hover:text-red-500 font-semibold uppercase tracking-wider"
              >
                Clear Entire Bag
              </button>
            </div>
          )}

        </div>
      )}
    </Drawer>
  );
}
