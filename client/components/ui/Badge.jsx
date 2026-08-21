'use client';

import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // 'sale' | 'new' | 'popular' | 'success' | 'warning' | 'danger' | 'info' | 'clay' | 'outline' | 'neutral'
  size = 'sm', // 'xs' | 'sm' | 'md'
  dot = false,
  className = '',
  ...props
}) {
  const sizeStyles = {
    xs: 'text-[9px] px-2 py-0.5 tracking-wider',
    sm: 'text-[10px] sm:text-[11px] px-2.5 py-0.5 tracking-wider',
    md: 'text-xs px-3 py-1 tracking-normal',
  };

  const variantStyles = {
    sale: 'bg-[var(--badge-sale)] text-white font-bold shadow-xs',
    new: 'bg-indigo-600 text-white font-bold shadow-xs',
    popular: 'bg-purple-600 text-white font-bold shadow-xs',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30',
    danger: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30',
    info: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
    clay: 'bg-[var(--accent-clay)] text-[var(--accent-dark)] border border-[var(--border)] font-semibold',
    outline: 'bg-transparent text-[var(--foreground)] border border-[var(--border)] font-medium',
    neutral: 'bg-[var(--card-clay)] text-[var(--muted)] border border-[var(--border)] font-medium',
  };

  const dotColors = {
    sale: 'bg-white',
    new: 'bg-white',
    popular: 'bg-white',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    clay: 'bg-[var(--accent-dark)]',
    outline: 'bg-[var(--foreground)]',
    neutral: 'bg-[var(--muted)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase font-sans select-none transition-colors ${sizeStyles[size] || sizeStyles.sm} ${variantStyles[variant] || variantStyles.neutral} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || 'bg-current'}`} />
      )}
      {children}
    </span>
  );
}
