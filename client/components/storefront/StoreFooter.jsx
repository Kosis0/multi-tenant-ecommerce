'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function StoreFooter({
  tenant,
  storeData,
  categories = [],
  onSelectCategory,
}) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const storeDisplayName = storeData?.name || (tenant ? tenant.charAt(0).toUpperCase() + tenant.slice(1) : 'Boutique');
  const tenantInitial = (storeData?.name || tenant || 'M').charAt(0).toUpperCase();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="w-full bg-[var(--surface)] border-t border-[var(--border)] mt-16 pt-16 pb-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pb-12 border-b border-[var(--border-light)] text-left">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-clay)] border border-[var(--border)] flex items-center justify-center font-editorial font-bold text-xl text-[var(--accent-dark)] shadow-xs">
                {tenantInitial}
              </div>
              <span className="font-editorial text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {storeDisplayName}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-sm leading-relaxed font-sans">
              Curating high-precision contemporary aesthetics, artisan craftsmanship, and seamless nationwide checkout for modern lifestyle connoisseurs.
            </p>

            <div className="flex items-center gap-3 text-xs text-[var(--muted)] pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Independent Tenant on Mercato Engine</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[var(--muted)]">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id || cat.name}>
                  <button
                    onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                    className="hover:text-[var(--accent-dark)] transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('All')}
                  className="hover:text-[var(--accent-dark)] transition-colors cursor-pointer font-semibold"
                >
                  All Products →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Newsletter */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Private Members Club
            </h4>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Subscribe to receive private preview access, seasonal release lookbooks, and invitation-only flash sales.
            </p>

            {subscribed ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl font-semibold flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Welcome to the private members circle!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 pt-1">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-full px-4 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
                <Button type="submit" variant="clay" size="sm">
                  Join
                </Button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)] gap-4">
          <p>
            &copy; {new Date().getFullYear()} {storeDisplayName}. Powered by Mercato Multi-Tenant Commerce Engine.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
              Platform Home
            </Link>
            <Link href={`/${tenant}/admin`} className="hover:text-[var(--foreground)] transition-colors">
              Merchant Admin
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
