'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { formatNaira } from '@/lib/utils';

export function FlashSalesBanner({
  timeLeft,
  flashProducts = [],
  onOpenProduct,
}) {
  if (flashProducts.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 my-8">
      <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--card-clay)] via-[var(--surface)] to-[var(--card-clay)] p-6 sm:p-8 shadow-soft relative overflow-hidden">
        
        {/* Header Strip: Title + Countdown Timer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--badge-sale)] text-white flex items-center justify-center shadow-xs font-bold text-lg">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                  Limited Flash Deals
                </h3>
                <Badge variant="sale" size="xs">ACTIVE</Badge>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Exclusive boutique promotions with capped inventory allocations
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          {timeLeft && (
            <div className="flex items-center gap-1.5 font-mono text-center">
              <div className="bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1.5 rounded-xl shadow-xs">
                <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] block">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase text-[var(--muted)] font-sans">Days</span>
              </div>
              <span className="font-bold text-[var(--muted)]">:</span>
              <div className="bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1.5 rounded-xl shadow-xs">
                <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] block">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase text-[var(--muted)] font-sans">Hrs</span>
              </div>
              <span className="font-bold text-[var(--muted)]">:</span>
              <div className="bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1.5 rounded-xl shadow-xs">
                <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] block">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase text-[var(--muted)] font-sans">Min</span>
              </div>
              <span className="font-bold text-[var(--muted)]">:</span>
              <div className="bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1.5 rounded-xl shadow-xs">
                <span className="text-xs sm:text-sm font-bold text-[var(--badge-sale)] block animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase text-[var(--muted)] font-sans">Sec</span>
              </div>
            </div>
          )}
        </div>

        {/* Flash Sale Product Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {flashProducts.slice(0, 4).map((product) => {
            const originalPrice = product.original_price || product.price * 1.25;
            const savings = originalPrice - product.price;
            const remainingUnits = product.flash_sale_units || Math.max(1, product.stock);
            const totalUnits = Math.max(remainingUnits, 15);
            const soldPercent = Math.min(92, Math.round(((totalUnits - remainingUnits) / totalUnits) * 100));

            return (
              <motion.div
                key={product.id}
                onClick={() => onOpenProduct(product)}
                whileHover={{ y: -3 }}
                className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] shadow-xs hover:border-[var(--accent)] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[var(--background)] mb-3">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 250px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">⚡</div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge variant="sale" size="xs">
                        -{product.discount_percent || 20}%
                      </Badge>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent-dark)] transition-colors">
                    {product.title}
                  </h4>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] tabular-nums">
                      {formatNaira(product.price)}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] line-through tabular-nums">
                      {formatNaira(originalPrice)}
                    </span>
                  </div>
                </div>

                {/* Stock Meter */}
                <div className="mt-3 pt-2 border-t border-[var(--border-light)]">
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted)] font-medium mb-1">
                    <span>Claimed: {soldPercent}%</span>
                    <span className="text-[var(--accent-dark)] font-bold">{remainingUnits} left</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--badge-sale)] rounded-full transition-all duration-500"
                      style={{ width: `${soldPercent}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
