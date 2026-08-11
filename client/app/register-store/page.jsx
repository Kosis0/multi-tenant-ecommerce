'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
    <div className="flex-1 flex items-center justify-center min-h-screen px-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Create your store</h1>
          <p className="text-muted text-sm">Join the platform and launch your brand.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-lg p-8">
          {error && (
            <div className="p-3 mb-6 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5" htmlFor="storeName">
                Store Name
              </label>
              <input
                id="storeName"
                name="storeName"
                type="text"
                required
                value={formData.storeName}
                onChange={handleNameChange}
                className="w-full px-3 py-2.5 bg-transparent border border-border dark:border-zinc-700 rounded-md text-foreground text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="My Awesome Store"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5" htmlFor="slug">
                Store URL Slug
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-transparent border border-border dark:border-zinc-700 rounded-md text-foreground text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="my-awesome-store"
              />
              <div className="text-xs font-mono text-muted mt-2">
                yourplatform.com/{formData.slug || 'slug'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5" htmlFor="email">
                Owner Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-transparent border border-border dark:border-zinc-700 rounded-md text-foreground text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="owner@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-transparent border border-border dark:border-zinc-700 rounded-md text-foreground text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-background py-2.5 rounded-md text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}