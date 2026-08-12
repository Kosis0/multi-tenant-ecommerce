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
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 bg-[#09090b] text-[#fafafa] py-12 relative">
      <Link href="/" className="absolute top-6 left-6 text-xs font-mono text-[#a1a1aa] hover:text-[#db4444] transition-colors flex items-center gap-2">
        ← Back to Platform
      </Link>

      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#db4444] text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 border border-[#e53838]">
            M
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create your store</h1>
          <p className="text-[#a1a1aa] text-sm">Launch your storefront with dedicated brand isolation.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#141418] border border-[#272734] rounded-xl p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 bg-red-950/40 text-red-400 text-xs rounded-lg border border-red-900/60">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1.5" htmlFor="storeName">
              Store Name
            </label>
            <input
              id="storeName"
              name="storeName"
              type="text"
              required
              value={formData.storeName}
              onChange={handleNameChange}
              className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#272734] rounded-lg text-white text-sm outline-none focus:border-[#db4444] focus:ring-1 focus:ring-[#db4444] transition-colors"
              placeholder="e.g. Vintage Apparel"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1.5" htmlFor="slug">
              Store URL Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#272734] rounded-lg text-white text-sm outline-none focus:border-[#db4444] focus:ring-1 focus:ring-[#db4444] transition-colors"
              placeholder="vintage-apparel"
            />
            <div className="text-xs font-mono text-[#a1a1aa] mt-2">
              yourplatform.com/<span className="text-[#db4444]">{formData.slug || 'slug'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1.5" htmlFor="email">
              Owner Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#272734] rounded-lg text-white text-sm outline-none focus:border-[#db4444] focus:ring-1 focus:ring-[#db4444] transition-colors"
              placeholder="owner@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#272734] rounded-lg text-white text-sm outline-none focus:border-[#db4444] focus:ring-1 focus:ring-[#db4444] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="press w-full bg-[#db4444] hover:bg-[#e53838] text-white py-3 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Launch Store'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}