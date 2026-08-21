'use client';

import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    id,
    name,
    type = 'text',
    error,
    helperText,
    icon = null,
    rightElement = null,
    className = '',
    inputClassName = '',
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || name || 'input-' + Math.random().toString(36).substring(2, 7);

  return (
    <div className={`w-full text-left ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[var(--muted)] pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          required={required}
          className={`w-full bg-[var(--background)] border ${
            error ? 'border-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--accent)]'
          } rounded-2xl text-[var(--foreground)] text-xs sm:text-sm py-3 transition-colors outline-none focus-ring ${
            icon ? 'pl-10' : 'pl-4'
          } ${rightElement ? 'pr-12' : 'pr-4'} placeholder:text-[var(--muted)]/60 ${inputClassName}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3.5 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-red-500 mt-1.5 font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-[var(--muted)] mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});
