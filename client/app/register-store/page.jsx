'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { slugify } from '@/lib/utils';

export default function RegisterStore() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: '',
    slug: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Brand & Slug, 2: Account & Security

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      storeName: name,
      slug: slugify(name),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return { score: 0, label: 'None', color: 'bg-[var(--border)]' };
    if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) {
      return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    }
    if (p.length >= 6) {
      return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    }
    return { score: 1, label: 'Weak', color: 'bg-red-500' };
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.storeName.trim() || !formData.slug.trim()) return;
      setStep(2);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://my-ecommerce-backend-uwkx.onrender.com';
      const response = await fetch(`${API_URL}/api/tenants/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.storeName,
          slug: formData.slug,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to register merchant store');
      }

      router.push(`/${formData.slug}/admin`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 bg-[var(--background)] text-[var(--foreground)] py-12 relative overflow-hidden">
      
      {/* Background Decorative Clay Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[var(--accent-light)] to-transparent rounded-full blur-3xl pointer-events-none -z-10 opacity-70" />

      <Link
        href="/"
        className="absolute top-6 left-6 text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent-dark)] transition-colors flex items-center gap-2"
      >
        ← Back to Platform
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="mb-8 text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-clay)] text-[var(--accent-dark)] font-editorial font-bold text-2xl flex items-center justify-center mx-auto border border-[var(--border)] shadow-xs">
            M
          </div>
          <h1 className="font-editorial text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Launch Your Store
          </h1>
          <p className="text-[var(--muted)] text-xs max-w-xs mx-auto">
            Step {step} of 2: {step === 1 ? 'Define Your Brand Identity' : 'Merchant Security & Credentials'}
          </p>
        </div>

        {/* Multi-step progress bar */}
        <div className="w-full h-1 bg-[var(--border)] rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-[var(--accent-dark)] rounded-full"
            initial={{ width: '50%' }}
            animate={{ width: step === 1 ? '50%' : '100%' }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-2xl border border-red-500/20 text-center font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <Input
                label="Store Name"
                name="storeName"
                required
                value={formData.storeName}
                onChange={handleNameChange}
                placeholder="e.g. Maison Aurelia"
                helperText="Your public boutique identity."
              />

              <div>
                <Input
                  label="Store URL Slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="maison-aurelia"
                  className="font-mono"
                />
                <div className="text-[11px] font-mono text-[var(--muted)] mt-1.5 flex items-center gap-1">
                  <span>Preview:</span>
                  <span className="text-[var(--accent-dark)] font-bold">
                    mercato.com/{formData.slug || 'your-slug'}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="clay"
                size="lg"
                className="w-full mt-2"
              >
                Continue to Account Security →
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Owner Email Address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="owner@example.com"
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />

                {/* Password strength meter */}
                {formData.password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--muted)]">
                      <span>Password Strength:</span>
                      <span className="font-bold">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} rounded-full transition-all`}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Back
                </Button>

                <Button
                  type="submit"
                  variant="clay"
                  size="lg"
                  className="flex-1"
                  isLoading={loading}
                >
                  {loading ? 'Provisioning Store...' : 'Launch Merchant Storefront'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}