'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export function StorefrontConfigPanel({
  heroBadge,
  setHeroBadge,
  heroTitle,
  setHeroTitle,
  heroSubtitle,
  setHeroSubtitle,
  heroProductId,
  setHeroProductId,
  products = [],
  showFlashDeals,
  onToggleFlashDeals,
  onSaveHeroSettings,
  updating = false,
}) {
  const productOptions = [
    { value: '', label: 'Default / Auto-Select First' },
    ...products.map((p) => ({ value: String(p.id), label: `${p.title} (₦${Number(p.price).toLocaleString()})` })),
  ];

  return (
    <div className="clay-card p-6 sm:p-8 bg-[var(--surface)] space-y-8">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
          Storefront Personalization
        </span>
        <h3 className="font-editorial text-2xl font-bold text-[var(--foreground)] mt-0.5">
          Hero Banner & Promotional Showcase
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">
          Customize the landing hero banner copy, spotlighted boutique piece, and flash urgency counters visible to shoppers.
        </p>
      </div>

      {/* Flash Deals Toggle Widget */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--foreground)]">Flash Deals Urgency Ticker</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${showFlashDeals ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-600'}`}>
              {showFlashDeals ? 'ENABLED' : 'PAUSED'}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Shows live countdown clocks and stock allocation progress bars on storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleFlashDeals}
          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
            showFlashDeals ? 'bg-emerald-500' : 'bg-[var(--border)]'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${
              showFlashDeals ? 'right-0.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Hero Content Settings Form */}
      <form onSubmit={(e) => { e.preventDefault(); onSaveHeroSettings(); }} className="space-y-5">
        <Input
          label="Hero Badge Text"
          value={heroBadge}
          onChange={(e) => setHeroBadge(e.target.value)}
          placeholder="e.g. Spring / Summer 2026 Collection"
        />

        <Input
          label="Hero Headline Title"
          value={heroTitle}
          onChange={(e) => setHeroTitle(e.target.value)}
          placeholder="e.g. Admire Contemporary Luxury & Looks"
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Hero Subtitle Narrative
          </label>
          <textarea
            rows={3}
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            placeholder="Introduce your brand ethos..."
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <Select
          label="Spotlight Featured Product"
          value={heroProductId}
          onChange={(e) => setHeroProductId(e.target.value)}
          options={productOptions}
          helperText="Featured piece prominently showcased in the hero spotlight card."
        />

        <div className="pt-3">
          <Button
            type="submit"
            variant="clay"
            size="lg"
            isLoading={updating}
          >
            Save Storefront Customization
          </Button>
        </div>
      </form>
    </div>
  );
}
