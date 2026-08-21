'use client';

import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AdminLogin({
  tenantSlug,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginLoading,
  loginError,
  onLogin,
}) {
  const tenantInitial = (tenantSlug || 'M').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 relative">
      <Link
        href={`/${tenantSlug}`}
        className="absolute top-6 left-6 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 transition-colors"
      >
        ← Back to Storefront
      </Link>

      <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-clay)] text-[var(--accent-dark)] font-editorial font-bold text-2xl flex items-center justify-center mx-auto border border-[var(--border)] shadow-xs">
            {tenantInitial}
          </div>
          <h1 className="font-editorial text-2xl font-semibold text-[var(--foreground)] tracking-tight capitalize">
            {tenantSlug} Merchant Portal
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Sign in to manage inventory, orders, and storefront settings.
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-2xl text-center font-medium">
            {loginError}
          </div>
        )}

        <form onSubmit={onLogin} className="space-y-4">
          <Input
            label="Merchant Email"
            type="email"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="admin@example.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="clay"
            size="lg"
            className="w-full mt-2"
            isLoading={loginLoading}
          >
            Access Merchant Center
          </Button>
        </form>

        <div className="pt-2 text-center">
          <Link
            href="/"
            className="text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Mercato Multi-Tenant Platform Home
          </Link>
        </div>
      </div>
    </div>
  );
}
