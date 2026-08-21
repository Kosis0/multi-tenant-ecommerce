'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '@/lib/motion';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg', // 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-4xl'
  showClose = true,
  className = '',
}) {
  // ESC key listener & body scroll lock
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
          aria-labelledby={title ? 'modal-title' : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop Blur */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${maxWidth} bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col z-10 ${className}`}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-[var(--border-light)] shrink-0">
                <div>
                  {title && (
                    <h3 id="modal-title" className="font-editorial text-xl sm:text-2xl font-semibold text-[var(--foreground)] tracking-tight">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                      {subtitle}
                    </p>
                  )}
                </div>

                {showClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card-clay)] text-[var(--muted)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors focus-ring shrink-0 ml-4 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-[var(--foreground)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
