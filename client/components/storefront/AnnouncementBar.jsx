'use client';

import React from 'react';

export function AnnouncementBar({
  message = '⚡ Flash Offer: Enjoy Complimentary Express Shipping on all orders above ₦50,000 across Nigeria',
}) {
  return (
    <aside aria-label="Store Announcement" className="w-full bg-[var(--accent-clay)] border-b border-[var(--border)] py-2 px-4 text-center">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-dark)] animate-pulse" />
        <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-[var(--accent-dark)] truncate">
          {message}
        </p>
      </div>
    </aside>
  );
}
