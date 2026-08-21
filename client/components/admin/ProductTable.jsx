'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNaira } from '@/lib/utils';

export function ProductTable({
  products = [],
  categories = [],
  page = 1,
  totalPages = 1,
  onPageChange,
  onOpenProductModal,
  onDeleteProduct,
}) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const filtered = products.filter((p) => {
    const matchSearch = !search.trim() || p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category?.toLowerCase() === catFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div className="clay-card p-6 sm:p-8 bg-[var(--surface)] space-y-6">
      
      {/* Header Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
            Inventory Registry
          </span>
          <h3 className="font-editorial text-2xl font-bold text-[var(--foreground)] mt-0.5">
            Products & Variants Catalog
          </h3>
        </div>

        <Button
          variant="clay"
          size="md"
          onClick={() => onOpenProductModal(null)}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          }
        >
          Add New Product
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory by title or SKU..."
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl text-xs py-2.5 pl-9 pr-4 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
          <div className="absolute left-3 top-3 text-[var(--muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="w-full sm:w-48 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-xs py-2.5 px-3 text-[var(--foreground)] outline-none cursor-pointer"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.id || c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table Container */}
      {filtered.length === 0 ? (
        <EmptyState
          type="products"
          title="No Products in Registry"
          description="Get started by listing your first luxury garment or accessory in this storefront."
          actionLabel="+ Add First Product"
          onAction={() => onOpenProductModal(null)}
        />
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Unit Price</th>
                <th className="py-3 px-3">Stock Units</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {filtered.map((product) => {
                const isLow = product.stock > 0 && product.stock <= 5;
                const isOut = product.stock <= 0;

                return (
                  <tr key={product.id} className="hover:bg-[var(--card-clay)] transition-colors group">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-[var(--background)] shrink-0 border border-[var(--border)]">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.title} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                <line x1="12" y1="22.08" x2="12" y2="12"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-[var(--foreground)] block truncate max-w-[200px] sm:max-w-xs">
                            {product.title}
                          </span>
                          <span className="text-[10px] text-[var(--muted)] font-mono">
                            ID: #{product.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-[var(--muted)] font-medium">
                      {product.category || 'General'}
                    </td>

                    <td className="py-3.5 px-3 font-bold text-[var(--foreground)] tabular-nums">
                      {formatNaira(product.price)}
                    </td>

                    <td className="py-3.5 px-3 font-bold tabular-nums">
                      <span className={isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-[var(--foreground)]'}>
                        {product.stock} units
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {isOut ? (
                        <Badge variant="danger" size="xs">Out of Stock</Badge>
                      ) : isLow ? (
                        <Badge variant="warning" size="xs">Low Stock</Badge>
                      ) : (
                        <Badge variant="success" size="xs">In Stock</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenProductModal(product)}
                          className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card-clay)] text-[var(--foreground)] transition-colors"
                          title="Edit product"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id, product.title)}
                          className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                          title="Delete product"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] text-xs">
          <span className="text-[var(--muted)]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
