'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function Button({
  children,
  variant = 'clay', // 'clay' | 'outline' | 'ghost' | 'danger' | 'secondary' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg' | 'icon'
  isLoading = false,
  disabled = false,
  icon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all select-none focus-ring disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 rounded-full gap-1.5 h-8',
    md: 'text-xs sm:text-sm px-5 py-2.5 rounded-full gap-2 h-10',
    lg: 'text-sm sm:text-base px-7 py-3.5 rounded-full gap-2.5 h-12 font-semibold',
    icon: 'p-2 rounded-full w-9 h-9 sm:w-10 sm:h-10 shrink-0',
  };

  const variantStyles = {
    clay: 'btn-clay text-white shadow-soft',
    outline: 'btn-clay-outline text-[var(--foreground)] border border-[var(--border)] bg-[var(--surface)]',
    ghost: 'text-[var(--foreground)] hover:bg-[var(--card-clay)] active:bg-[var(--border)] rounded-full',
    danger: 'bg-red-600 hover:bg-red-700 text-white rounded-full shadow-sm',
    secondary: 'bg-[var(--card-clay)] text-[var(--foreground)] hover:bg-[var(--border)] border border-[var(--border)] rounded-full',
    dark: 'bg-[#1c1917] hover:bg-[#2c2724] text-white dark:bg-[#f4f3f1] dark:hover:bg-[#e4e3e1] dark:text-[#1c1917] rounded-full shadow-md',
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.96 }}
      whileHover={{ y: disabled || isLoading ? 0 : -1 }}
      transition={{ duration: 0.15 }}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.clay} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}
