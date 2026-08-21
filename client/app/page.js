'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Decorative Ambient Clay Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[var(--accent-light)] to-transparent rounded-full blur-3xl pointer-events-none -z-10 opacity-75" />

      {/* Header / Brand Nav */}
      <header className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-clay)] border border-[var(--border)] flex items-center justify-center font-editorial font-bold text-xl text-[var(--accent-dark)] shadow-xs">
            M
          </div>
          <div>
            <span className="text-xl font-editorial font-semibold tracking-tight text-[var(--foreground)] block">Mercato</span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--muted)] block -mt-1">Commerce Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/demo"
            className="hidden sm:inline-flex text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Live Demo
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--card-clay)] text-[var(--foreground)] flex items-center justify-center transition-transform hover:scale-105 shadow-xs cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          <Link href="/register-store" className="btn-clay text-xs px-5 py-2.5 shadow-md">
            Create Store
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 z-10 my-auto flex flex-col items-center text-center">
        
        {/* Status Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Badge variant="clay" size="md" dot>
            Next-Gen Multi-Tenant Commerce Infrastructure
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-editorial text-4xl sm:text-7xl font-medium tracking-tight mb-6 leading-[1.08] max-w-4xl text-[var(--foreground)]"
        >
          Your Store. Your Brand.<br />
          <span className="italic text-[var(--accent-dark)] font-normal">
            Engineered for Modern Commerce.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed font-sans"
        >
          Launch independent boutique storefronts with dynamic category filtering, real-time inventory management, customer reviews, wishlists, and seamless Naira (₦) payments.
        </motion.p>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto mb-16"
        >
          <Link href="/register-store" className="w-full sm:w-auto">
            <Button variant="clay" size="lg" className="w-full">
              Launch Your Store
            </Button>
          </Link>
          <Link href="/demo" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              Explore Demo Store ↗
            </Button>
          </Link>
        </motion.div>

        {/* Platform Architecture & Live Ecosystem Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-5xl rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-[var(--border)] gap-4">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-dark)] block">Platform Architecture</span>
              <h3 className="font-editorial text-2xl font-semibold text-[var(--foreground)] mt-1">Multi-Tenant Merchant Ecosystem</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">100% Isolated Data Pipelines</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--accent-dark)] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h4 className="font-editorial text-lg font-semibold text-[var(--foreground)]">Instant Store Provisioning</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Create a new brand slug in seconds. The platform automatically provisions customer authentication, inventory models, and order registries.
              </p>
              <div className="text-[11px] font-mono text-[var(--accent-dark)] font-bold">
                mercato.com/[your-brand]
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--accent-dark)] flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h4 className="font-editorial text-lg font-semibold text-[var(--foreground)]">Responsive Customer Experience</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Feature-rich storefront equipped with responsive category filters, real-time price sliders, size selectors, customer reviews, and dual dark/light themes.
              </p>
              <div className="text-[11px] font-mono text-[var(--accent-dark)] font-bold">
                Optimized for Mobile & Desktop
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--accent-dark)] flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h4 className="font-editorial text-lg font-semibold text-[var(--foreground)]">Merchant Admin Engine</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Dedicated administration dashboard per tenant with revenue charts, low-stock warnings, multi-variant managers, and order fulfillment.
              </p>
              <div className="text-[11px] font-mono text-[var(--accent-dark)] font-bold">
                Naira (₦) & Multi-Currency Ready
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Demo Boutiques Showcase */}
        <div className="mt-16 w-full text-left space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-[var(--border)] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-dark)] block">Explore Live Tenants</span>
              <h3 className="font-editorial text-3xl font-semibold text-[var(--foreground)] mt-0.5">Curated Demo Boutiques</h3>
            </div>
            <p className="text-xs text-[var(--muted)] max-w-sm">
              Click any boutique to experience live catalog browsing, multi-angle galleries, flash sales, and cart drawers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                slug: 'demo',
                name: 'Mercato Flagship',
                tagline: 'Spring / Summer Luxury Apparel & Knitwear',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
                items: '16 Catalog Items',
                theme: 'Clay & Terracotta',
              },
              {
                slug: 'atelier',
                name: 'Artisan Atelier',
                tagline: 'Vegetable-Tanned Leather & 18k Solid Gold',
                image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
                items: 'Fine Goods & Jewelry',
                theme: 'Obsidian Noir',
              },
              {
                slug: 'audio',
                name: 'Studio Sound & Optics',
                tagline: 'Titanium ANC Audio & Polarized Acetate',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
                items: 'Acoustics & Eyewear',
                theme: 'Slate & Minimalist',
              },
            ].map((store) => (
              <Link
                key={store.slug}
                href={`/${store.slug}`}
                className="group relative rounded-3xl overflow-hidden border border-[var(--card-border)] bg-[var(--card)] clay-card transition-all hover:border-[var(--accent)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface)]">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--surface)]/90 backdrop-blur-md text-[var(--foreground)] border border-[var(--border)] shadow-xs">
                      {store.theme}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="font-editorial text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--accent-dark)] transition-colors">
                      {store.name}
                    </h4>
                    <span className="text-xs text-[var(--accent-dark)] font-bold">Visit ↗</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {store.tagline}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-[var(--muted)] font-mono">
                    <span>/{store.slug}</span>
                    <span>{store.items}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="p-8 border border-[var(--card-border)] rounded-3xl bg-[var(--card)] hover:border-[var(--accent)] transition-colors group shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-clay)] border border-[var(--border)] text-[var(--accent-dark)] flex items-center justify-center mb-6">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3 className="font-editorial text-xl font-semibold mb-2 text-[var(--foreground)]">Instant Multi-Tenant Setup</h3>
            <p className="text-[var(--muted)] text-xs leading-relaxed">
              Auto-generate custom store slugs, provision dedicated merchant databases, and list products in seconds.
            </p>
          </div>

          <div className="p-8 border border-[var(--card-border)] rounded-3xl bg-[var(--card)] hover:border-[var(--accent)] transition-colors group shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-clay)] border border-[var(--border)] text-[var(--accent-dark)] flex items-center justify-center mb-6">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h3 className="font-editorial text-xl font-semibold mb-2 text-[var(--foreground)]">Conversion-Focused Storefronts</h3>
            <p className="text-[var(--muted)] text-xs leading-relaxed">
              Equipped with live flash sale countdowns, wishlist drawers, customer review galleries, and dark & light theme modes.
            </p>
          </div>

          <div className="p-8 border border-[var(--card-border)] rounded-3xl bg-[var(--card)] hover:border-[var(--accent)] transition-colors group shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-clay)] border border-[var(--border)] text-[var(--accent-dark)] flex items-center justify-center mb-6">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <h3 className="font-editorial text-xl font-semibold mb-2 text-[var(--foreground)]">Naira (₦) Payment Engine</h3>
            <p className="text-[var(--muted)] text-xs leading-relaxed">
              Complete Stripe NGN checkout pipeline with instant card verification, customer order tracking, and delivery updates.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-8 border-t border-[var(--border)] text-center text-xs text-[var(--muted)] z-10">
        &copy; {new Date().getFullYear()} Mercato Multi-Tenant Commerce Platform. All rights reserved.
      </footer>
    </div>
  );
}
