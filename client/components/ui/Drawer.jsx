'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { drawerRightVariants, modalBackdropVariants } from '@/lib/motion';

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-md',
  position = 'right', // 'right' | 'left'
  className = '',
}) {
  // ESC key and body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-hidden"
        >
          {/* Backdrop Blur */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-out Drawer */}
          <div className={`fixed inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} flex max-w-full pl-6`}>
            <motion.div
              variants={drawerRightVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`w-screen ${maxWidth} bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col justify-between ${className}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-[var(--border-light)] shrink-0">
                <div>
                  {title && (
                    <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-[var(--foreground)] tracking-tight">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card-clay)] text-[var(--muted)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors focus-ring cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Items Container */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-[var(--foreground)]">
                {children}
              </div>

              {/* Fixed Footer Slot */}
              {footer && (
                <div className="p-5 sm:p-6 border-t border-[var(--border-light)] bg-[var(--surface-hover)] shrink-0">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
