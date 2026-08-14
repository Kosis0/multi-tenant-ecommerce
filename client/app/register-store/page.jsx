'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterStore() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: '',
    slug: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')       // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-');    // Replace multiple - with single -
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      storeName: name,
      slug: slugify(name)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        throw new Error(data.error || 'Failed to register store');
      }

      router.push(`/${formData.slug}/admin`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 bg-[var(--background)] text-[var(--foreground)] py-12 relative">
      <Link href="/" className="absolute top-6 left-6 text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent-dark)] transition-colors flex items-center gap-2">
        ← Back to Platform
      </Link>

      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-clay)] text-[var(--accent-dark)] font-bold text-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border)] shadow-xs">
            M
          </div>
          <h1 className="font-editorial text-3xl font-semibold tracking-tight mb-2 text-[var(--foreground)]">Create Your Store</h1>
          <p className="text-[var(--muted)] text-xs">Launch your editorial storefront with full brand isolation & Naira support.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 text-red-500 text-xs rounded-2xl border border-red-500/30 text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5" htmlFor="storeName">
              Store Name
            </label>
            <input
              id="storeName"
              name="storeName"
              type="text"
              required
              value={formData.storeName}
              onChange={handleNameChange}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-[var(--foreground)] text-xs outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="e.g. Clay Vintage & Co."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5" htmlFor="slug">
              Store URL Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-[var(--foreground)] text-xs outline-none focus:border-[var(--accent)] transition-colors font-mono"
              placeholder="clay-vintage"
            />
            <div className="text-[11px] font-mono text-[var(--muted)] mt-2">
              mercato.com/<span className="text-[var(--accent-dark)] font-bold">{formData.slug || 'slug'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5" htmlFor="email">
              Owner Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-[var(--foreground)] text-xs outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="owner@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-[var(--foreground)] text-xs outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-clay w-full py-3.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50 mt-2"
          >
            {loading ? 'Setting Up Store...' : 'Launch Merchant Storefront'}
          </button>
        </form>
      </div>
    </div>
  );
}