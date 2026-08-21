'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatNaira } from '@/lib/utils';

export function LowStockAlert({
  products = [],
  onOpenProductModal,
}) {
  const lowStockProducts = products.filter((p) => Number(p.stock) <= 5);

  return (
    <div className="clay-card p-6 sm:p-8 bg-[var(--surface)] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
            Inventory Safeguards
          </span>
          <h3 className="font-editorial text-2xl font-bold text-[var(--foreground)] mt-0.5">
            Low Stock & Depleted Allocations
          </h3>
        </div>

        <Badge variant="warning" size="md">
          {lowStockProducts.length} Items Require Action
        </Badge>
      </div>

      {lowStockProducts.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-2xl text-xs text-[var(--muted)] space-y-1">
          <p className="text-sm font-bold text-emerald-600 inline-flex items-center gap-1.5 justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            All Stock Levels Healthy
          </p>
          <p>No products are currently under the 5-unit inventory safety threshold.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lowStockProducts.map((product) => {
            const isOut = Number(product.stock) <= 0;
            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)] gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[var(--background)] shrink-0 border border-[var(--border)]">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.title} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-500">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs text-[var(--foreground)] truncate max-w-xs">
                      {product.title}
                    </h4>
                    <p className="text-[11px] text-[var(--muted)]">
                      {formatNaira(product.price)} • {product.category || 'General'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold ${isOut ? 'text-red-500' : 'text-amber-600'}`}>
                    {isOut ? 'Depleted (0 left)' : `Only ${product.stock} units left`}
                  </span>

                  <Button
                    variant="clay"
                    size="sm"
                    onClick={() => onOpenProductModal(product)}
                  >
                    Restock
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
