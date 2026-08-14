'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from './ThemeContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Decorative Clay Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[var(--accent-light)] to-transparent rounded-full blur-3xl pointer-events-none -z-10 opacity-70"></div>

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

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--card-clay)] text-[var(--foreground)] flex items-center justify-center transition-transform hover:scale-105 shadow-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          <Link 
            href="/register-store" 
            className="btn-clay text-xs px-5 py-2.5 shadow-md"
          >
            Create Store
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 z-10 my-auto flex flex-col items-center text-center">
        
        {/* Soft Clay Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-xs text-xs font-semibold text-[var(--muted)] mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Next-Gen Multi-Tenant Commerce Architecture</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-7xl font-medium tracking-tight mb-6 leading-[1.1] max-w-4xl text-[var(--foreground)]">
          Your Store. Your Brand.<br />
          <span className="italic text-[var(--accent-dark)] font-normal">
            Sculpted with Luxury.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Launch a high-performance multi-tenant boutique complete with dynamic category browsing, flash sales, wishlist support, Naira (₦) payments, and full mobile responsiveness.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto mb-16">
          <Link 
            href="/register-store" 
            className="btn-clay w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-wider font-bold shadow-lg"
          >
            Launch Your Store
          </Link>
          <Link 
            href="/demo" 
            className="btn-clay-outline w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-wider font-bold"
          >
            Explore Demo Store ↗
          </Link>
        </div>

        {/* Platform Architecture & Live Ecosystem Showcase */}
        <div className="w-full max-w-5xl rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-[var(--border)] gap-4">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-dark)] block">Platform Architecture</span>
              <h3 className="font-editorial text-2xl font-semibold text-[var(--foreground)] mt-1">Multi-Tenant Merchant Ecosystem</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">100% Isolated Tenants</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--accent-dark)] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h4 className="font-editorial text-lg font-semibold text-[var(--foreground)]">Instant Store Generation</h4>
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
              <h4 className="font-editorial text-lg font-semibold text-[var(--foreground)]">Clay Shop UI & Themes</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Full-featured luxury storefront equipped with responsive category filters, real-time price sliders, size selectors, and dual dark/light themes.
              </p>
              <div className="text-[11px] font-mono text-[var(--accent-dark)] font-bold">
                Tailored for Mobile & Desktop
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
            <h3 className="font-editorial text-xl font-semibold mb-2 text-[var(--foreground)]">Clay Shop UI Kit</h3>
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
        &copy; {new Date().getFullYear()} Mercato Multi-Tenant Luxury Commerce Platform. All rights reserved.
      </footer>
    </div>
  );
}
