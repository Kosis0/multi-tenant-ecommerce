'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ToastContainer({ toasts = [], onDismiss }) {
  return (
    <div
      aria-live="polite"
      role="status"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { id, message, type = 'success' } = toast;

  const typeConfig = {
    success: {
      bg: 'bg-[var(--surface)] border-emerald-500/30 text-[var(--foreground)]',
      icon: (
        <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      ),
    },
    error: {
      bg: 'bg-[var(--surface)] border-red-500/30 text-[var(--foreground)]',
      icon: (
        <span className="w-6 h-6 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </span>
      ),
    },
    warning: {
      bg: 'bg-[var(--surface)] border-amber-500/30 text-[var(--foreground)]',
      icon: (
        <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </span>
      ),
    },
    info: {
      bg: 'bg-[var(--surface)] border-[var(--accent)]/30 text-[var(--foreground)]',
      icon: (
        <span className="w-6 h-6 rounded-full bg-[var(--accent-light)] text-[var(--accent-dark)] flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </span>
      ),
    },
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md ${current.bg}`}
    >
      {current.icon}
      <p className="text-xs font-medium flex-1 leading-snug">{message}</p>
      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
          aria-label="Dismiss alert"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
