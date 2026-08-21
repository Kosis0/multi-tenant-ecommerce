'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function MetricCard({
  title,
  value,
  change = null,
  isPositive = true,
  icon,
  onClick,
  subtitle,
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`clay-card p-5 sm:p-6 bg-[var(--surface)] flex flex-col justify-between space-y-4 ${
        onClick ? 'cursor-pointer hover:border-[var(--accent)]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            {title}
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[var(--foreground)] tabular-nums tracking-tight">
            {value}
          </h3>
        </div>

        {icon && (
          <div className="w-11 h-11 rounded-2xl bg-[var(--accent-clay)] text-[var(--accent-dark)] border border-[var(--border)] flex items-center justify-center shadow-xs shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-light)]">
        {change ? (
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
            }`}
          >
            <span>{isPositive ? '↑' : '↓'}</span>
            <span>{change}</span>
          </span>
        ) : (
          <span className="text-[11px] text-[var(--muted)]">
            {subtitle || 'Real-time metrics'}
          </span>
        )}

        {onClick && (
          <span className="text-[11px] font-bold text-[var(--accent-dark)] hover:underline">
            View Details →
          </span>
        )}
      </div>
    </motion.div>
  );
}
