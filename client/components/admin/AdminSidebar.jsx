'use client';

import React from 'react';
import Link from 'next/link';

export function AdminSidebar({
  tenantSlug,
  activeTab,
  setActiveTab,
  lowStockCount = 0,
  ordersCount = 0,
  productsCount = 0,
  onLogout,
  className = '',
}) {
  const tenantInitial = (tenantSlug || 'M').charAt(0).toUpperCase();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      ),
    },
    {
      id: 'products',
      label: 'Products Catalog',
      badge: productsCount || null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
      ),
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
      ),
    },
    {
      id: 'orders',
      label: 'Fulfillment & Orders',
      badge: ordersCount || null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      ),
    },
    {
      id: 'low-stock',
      label: 'Inventory Alerts',
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeColor: 'bg-amber-500/15 text-amber-600',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      ),
    },
    {
      id: 'settings',
      label: 'Storefront Customizer',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      ),
    },
  ];

  return (
    <aside className={`w-64 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col justify-between p-4 sm:p-5 shrink-0 ${className}`}>
      <div className="space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-clay)] text-[var(--accent-dark)] font-editorial font-bold text-xl flex items-center justify-center border border-[var(--border)] shadow-xs">
            {tenantInitial}
          </div>
          <div className="min-w-0">
            <span className="font-editorial text-lg font-semibold text-[var(--foreground)] block truncate capitalize">
              {tenantSlug}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] block -mt-0.5">
              Merchant Hub
            </span>
          </div>
        </div>

        {/* Live Store Link */}
        <Link
          href={`/${tenantSlug}`}
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--card-clay)] border border-[var(--border)] text-xs font-semibold text-[var(--accent-dark)] hover:opacity-85 transition-opacity"
        >
          <span>View Live Store ↗</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--foreground)] text-[var(--background)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-clay)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[var(--background)] text-[var(--foreground)]'
                        : item.badgeColor || 'bg-[var(--card-clay)] text-[var(--foreground)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout & Footer */}
      <div className="pt-4 border-t border-[var(--border-light)] space-y-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Sign Out</span>
        </button>

        <div className="text-[10px] text-[var(--muted)] px-3">
          Mercato Platform v2.4
        </div>
      </div>
    </aside>
  );
}
