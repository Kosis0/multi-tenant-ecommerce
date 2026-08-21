'use client';

import React from 'react';
import Link from 'next/link';

export function AdminHeader({
  title = 'Merchant Dashboard',
  subtitle,
  tenantSlug,
  theme,
  toggleTheme,
  onOpenMobileSidebar,
}) {
  return (
    <header className="h-16 sm:h-20 bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 transition-colors">
      
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
          aria-label="Open navigation menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div>
          <h1 className="font-editorial text-xl sm:text-2xl font-semibold text-[var(--foreground)] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-[var(--muted)] hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Action Cluster (View Store, Theme Switcher) */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${tenantSlug}`}
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card-clay)] text-xs font-semibold text-[var(--foreground)] transition-colors shadow-xs"
        >
          <span>Live Store</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </Link>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card-clay)] text-[var(--foreground)] flex items-center justify-center transition-transform hover:scale-105 shadow-xs cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </div>
    </header>
  );
}
