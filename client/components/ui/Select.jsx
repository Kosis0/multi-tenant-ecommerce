'use client';

import React, { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  {
    label,
    id,
    name,
    options = [], // [{ value: 'x', label: 'X' }] or ['A', 'B']
    error,
    helperText,
    className = '',
    selectClassName = '',
    required = false,
    value,
    onChange,
    ...props
  },
  ref
) {
  const selectId = id || name || 'select-' + Math.random().toString(36).substring(2, 7);

  return (
    <div className={`w-full text-left ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full appearance-none bg-[var(--background)] border ${
            error ? 'border-red-500' : 'border-[var(--border)] focus:border-[var(--accent)]'
          } rounded-2xl text-[var(--foreground)] text-xs sm:text-sm py-3 pl-4 pr-10 transition-colors outline-none focus-ring cursor-pointer ${selectClassName}`}
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="bg-[var(--surface)] text-[var(--foreground)] py-1">
                {lbl}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3.5 pointer-events-none text-[var(--muted)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="text-[11px] text-red-500 mt-1.5 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[var(--muted)] mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});
