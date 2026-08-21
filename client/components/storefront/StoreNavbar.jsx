'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNaira } from '@/lib/utils';

export function StoreNavbar({
  tenant,
  storeData,
  products = [],
  cartCount = 0,
  cartTotal = 0,
  wishlistCount = 0,
  customer = null,
  theme = 'light',
  toggleTheme,
  onOpenCart,
  onOpenWishlist,
  onOpenAuth,
  onOpenAccount,
  searchQuery,
  setSearchQuery,
  onSelectSearchProduct,
  onSearchSubmit,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const searchRef = useRef(null);

  // Close search popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for live search preview
  const liveResults = searchQuery.trim()
    ? products
        .filter((p) =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const storeDisplayName = storeData?.name || (tenant ? tenant.charAt(0).toUpperCase() + tenant.slice(1) : 'Boutique');
  const tenantInitial = (storeData?.name || tenant || 'M').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-[var(--border-light)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Identifier */}
        <Link href={`/${tenant}`} className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[var(--accent-clay)] border border-[var(--border)] flex items-center justify-center font-editorial font-bold text-lg sm:text-xl text-[var(--accent-dark)] shadow-xs group-hover:scale-105 transition-transform">
            {tenantInitial}
          </div>
          <div>
            <span className="text-base sm:text-xl font-editorial font-semibold tracking-tight text-[var(--foreground)] block leading-tight">
              {storeDisplayName}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[var(--muted)] block -mt-0.5">
              Verified Merchant
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar with Live Popover */}
        <div ref={searchRef} className="hidden md:block relative flex-1 max-w-sm mx-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearchSubmit) {
                  setIsSearchOpen(false);
                  onSearchSubmit();
                }
              }}
              placeholder="Search garments, footwear, accessories..."
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-full text-xs py-2.5 pl-9 pr-8 text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] outline-none focus-ring transition-colors"
            />
            <div className="absolute left-3 text-[var(--muted)] pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Live Search Results Popover */}
          <AnimatePresence>
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50 p-2 space-y-1"
              >
                {liveResults.length > 0 ? (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-3 py-1.5 border-b border-[var(--border-light)]">
                      Matching Products ({liveResults.length})
                    </div>
                    {liveResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          if (onSelectSearchProduct) onSelectSearchProduct(product);
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--card-clay)] transition-colors text-left group"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[var(--background)] shrink-0 border border-[var(--border)]">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                <line x1="12" y1="22.08" x2="12" y2="12"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent-dark)]">
                            {product.title}
                          </p>
                          <p className="text-[11px] font-bold text-[var(--foreground)] tabular-nums">
                            {formatNaira(product.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--muted)]">
                    No results for &quot;{searchQuery}&quot;
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Cluster (Wishlist, Cart, Profile, Theme, Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Wishlist Trigger */}
          <button
            onClick={onOpenWishlist}
            aria-label="View saved wishlist items"
            className="relative p-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--card-clay)] text-[var(--foreground)] transition-transform active:scale-95 shadow-xs focus-ring cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlistCount > 0 ? 'var(--accent-dark)' : 'none'} stroke={wishlistCount > 0 ? 'var(--accent-dark)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-dark)] text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
              >
                {wishlistCount}
              </motion.span>
            )}
          </button>

          {/* Cart Bag Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="View shopping bag"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all active:scale-95 shadow-soft focus-ring cursor-pointer"
          >
            <div className="relative flex items-center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full bg-white text-[var(--accent-dark)] text-[9px] font-extrabold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold tabular-nums">
              {cartCount > 0 ? formatNaira(cartTotal) : 'Bag'}
            </span>
          </button>

          {/* Customer Account / Login Trigger */}
          {customer ? (
            <button
              onClick={onOpenAccount}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--card-clay)] text-[var(--foreground)] transition-colors focus-ring cursor-pointer"
              title="Customer Account & Orders"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--accent-clay)] text-[var(--accent-dark)] text-xs font-bold flex items-center justify-center uppercase">
                {customer.name?.charAt(0) || 'C'}
              </div>
              <span className="hidden lg:inline text-xs font-medium max-w-[90px] truncate">
                {customer.name?.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="p-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--card-clay)] text-[var(--foreground)] transition-colors focus-ring cursor-pointer"
              title="Sign In / Register"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          )}

          {/* Theme Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--card-clay)] text-[var(--foreground)] transition-transform hover:scale-105 shadow-xs focus-ring cursor-pointer"
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          {/* Merchant Admin Shortcut */}
          <Link
            href={`/${tenant}/admin`}
            className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--accent-dark)] px-2.5 py-1 rounded-full border border-dashed border-[var(--border)] hover:border-[var(--accent)] transition-colors"
          >
            Admin ↗
          </Link>

          {/* Mobile Hamburger Trigger */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden p-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus-ring"
            aria-label="Open mobile navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative w-4/5 max-w-sm bg-[var(--surface)] border-l border-[var(--border)] h-full p-6 flex flex-col justify-between z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--accent-clay)] text-[var(--accent-dark)] font-editorial font-bold flex items-center justify-center">
                      {tenantInitial}
                    </div>
                    <span className="font-editorial font-semibold text-lg">{storeDisplayName}</span>
                  </div>
                  <button
                    onClick={() => setIsMobileNavOpen(false)}
                    className="p-1 text-[var(--muted)]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsMobileNavOpen(false);
                        if (onSearchSubmit) onSearchSubmit();
                      }
                    }}
                    placeholder="Search catalog..."
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl text-xs py-3 pl-9 pr-4 text-[var(--foreground)] outline-none"
                  />
                  <div className="absolute left-3 top-3.5 text-[var(--muted)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      customer ? onOpenAccount() : onOpenAuth();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[var(--card-clay)] text-xs font-semibold text-left text-[var(--foreground)]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>{customer ? `Account: ${customer.name}` : 'Customer Sign In'}</span>
                  </button>

                  <Link
                    href={`/${tenant}/admin`}
                    onClick={() => setIsMobileNavOpen(false)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)] text-xs font-semibold text-left text-[var(--foreground)]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    <span>Merchant Admin Portal</span>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)] text-xs font-semibold text-left text-[var(--foreground)]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <span>Mercato Platform Home</span>
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
                &copy; {new Date().getFullYear()} {storeDisplayName}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
