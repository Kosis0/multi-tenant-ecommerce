'use client';

import React from 'react';

export function Stepper({
  steps = [
    { key: 'pending', label: 'Placed' },
    { key: 'paid', label: 'Confirmed' },
    { key: 'shipped', label: 'Dispatched' },
    { key: 'delivered', label: 'Delivered' },
  ],
  currentStep = 'pending',
  className = '',
}) {
  if (currentStep === 'cancelled') {
    return (
      <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider ${className}`}>
        <span>✕</span>
        <span>Order Cancelled</span>
      </div>
    );
  }

  const stepKeys = steps.map((s) => s.key.toLowerCase());
  const currentIndex = Math.max(0, stepKeys.indexOf((currentStep || '').toLowerCase()));

  const progressPercent = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className={`w-full pt-3 pb-2 ${className}`}>
      <div className="flex items-center justify-between relative px-2">
        {/* Background Track */}
        <div className="absolute top-3 left-6 right-6 h-0.5 bg-[var(--border)] -translate-y-1/2 z-0" />
        
        {/* Active Progress Fill */}
        <div
          className="absolute top-3 left-6 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `calc(${progressPercent}% - 12px)` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  isCurrent
                    ? 'bg-emerald-500 text-white border-emerald-500 ring-4 ring-emerald-500/20 scale-110 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)]'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1.5 ${
                  isCurrent
                    ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                    : isCompleted
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--muted)]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
