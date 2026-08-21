'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatNaira } from '@/lib/utils';

export function HeroSection({
  storeData,
  featuredProduct = null,
  onExploreCatalog,
  onOpenProduct,
}) {
  const badgeText = storeData?.hero_badge || 'Spring / Summer 2026 Collection';
  const heroTitle = storeData?.hero_title || 'Admire Contemporary Luxury & Looks';
  const heroSubtitle = storeData?.hero_subtitle || 'Discover curated high-fashion silhouettes, artisan leather goods, and modern lifestyle essentials with seamless Naira checkout.';

  return (
    <section className="relative overflow-hidden py-10 sm:py-16 lg:py-20 px-4 sm:px-6">
      {/* Ambient Clay Glow Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[850px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-[var(--accent-light)] to-transparent rounded-full blur-3xl pointer-events-none -z-10 opacity-70" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        
        {/* Left Column: Editorial Typography & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 text-center lg:text-left space-y-6"
        >
          <div className="inline-flex">
            <Badge variant="clay" size="md" dot>
              {badgeText}
            </Badge>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-[var(--foreground)] leading-[1.08]">
            {heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
            {heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Button
              variant="clay"
              size="lg"
              onClick={onExploreCatalog}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              }
            >
              Explore Collection
            </Button>

            {featuredProduct && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenProduct(featuredProduct)}
              >
                View Featured Piece ↗
              </Button>
            )}
          </div>

          {/* Social Proof & Trust Pillars */}
          <div className="pt-6 border-t border-[var(--border)] grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
            <div>
              <p className="text-base sm:text-lg font-bold text-[var(--foreground)] font-editorial">100%</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">Authentic Goods</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-[var(--foreground)] font-editorial">Fast</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">Nationwide Delivery</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-[var(--foreground)] font-editorial">₦ Naira</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">Direct Payments</p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Hero Spotlight Visual Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-5 flex justify-center"
        >
          {featuredProduct ? (
            <div
              onClick={() => onOpenProduct(featuredProduct)}
              className="relative w-full max-w-sm clay-card overflow-hidden cursor-pointer group p-3 bg-[var(--card)]"
            >
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[var(--background)]">
                {featuredProduct.image_url ? (
                  <Image
                    src={featuredProduct.image_url}
                    alt={featuredProduct.title}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    ✨
                  </div>
                )}
                
                {/* Sale Badge */}
                {featuredProduct.discount_percent > 0 && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="sale" size="sm">
                      SAVE {featuredProduct.discount_percent}%
                    </Badge>
                  </div>
                )}

                {/* Quick Peek Floating Pill */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl glass-pill flex items-center justify-between text-left">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                      {featuredProduct.title}
                    </p>
                    <p className="text-xs font-bold text-[var(--accent-dark)] tabular-nums">
                      {formatNaira(featuredProduct.price)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold text-[var(--foreground)] bg-[var(--surface)] px-2.5 py-1 rounded-full border border-[var(--border)]">
                    Quick View
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[4/5] w-full max-w-sm rounded-3xl clay-card overflow-hidden p-6 flex flex-col justify-end bg-gradient-to-b from-[var(--card-clay)] to-[var(--card)]">
              <div className="space-y-2">
                <Badge variant="clay">Featured Spotlight</Badge>
                <h3 className="font-editorial text-2xl font-bold text-[var(--foreground)]">
                  Handcrafted Excellence
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Every product is crafted to order with master-grade finishing.
                </p>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
}
