'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNaira } from '@/lib/utils';

export function OrderTable({
  orders = [],
  page = 1,
  totalPages = 1,
  onPageChange,
  onUpdateStatus,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const statuses = ['All', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  const filtered = orders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    const matchStatus = statusFilter === 'All' || s === statusFilter.toLowerCase();
    const matchSearch =
      !search.trim() ||
      String(o.id).includes(search) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return <Badge variant="success" size="xs" dot>Paid</Badge>;
    if (s === 'shipped') return <Badge variant="info" size="xs" dot>Dispatched</Badge>;
    if (s === 'delivered') return <Badge variant="success" size="xs" dot>Delivered</Badge>;
    if (s === 'cancelled') return <Badge variant="danger" size="xs" dot>Cancelled</Badge>;
    return <Badge variant="warning" size="xs" dot>Pending</Badge>;
  };

  return (
    <div className="clay-card p-6 sm:p-8 bg-[var(--surface)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
            Fulfillment Center
          </span>
          <h3 className="font-editorial text-2xl font-bold text-[var(--foreground)] mt-0.5">
            Customer Orders & Logistics
          </h3>
        </div>

        <div className="text-xs font-semibold text-[var(--muted)]">
          Total: <strong className="text-[var(--foreground)]">{orders.length}</strong> orders logged
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders by customer name, email, or #ID..."
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl text-xs py-2.5 pl-9 pr-4 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
          <div className="absolute left-3 top-3 text-[var(--muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shrink-0 ${
                statusFilter.toLowerCase() === st.toLowerCase()
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : 'bg-[var(--card-clay)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <EmptyState
          type="orders"
          title="No Orders Match Criteria"
          description="Try selecting a different status filter or clearing your search keywords."
          actionLabel="Clear Filter"
          onAction={() => {
            setSearch('');
            setStatusFilter('All');
          }}
        />
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Update Status</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {filtered.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                let items = [];
                try {
                  items = Array.isArray(order.items)
                    ? order.items
                    : (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : []);
                } catch {}

                return (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-[var(--card-clay)] transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[var(--accent-dark)]">
                        #{String(order.id).padStart(5, '0')}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-[var(--foreground)]">
                          {order.customer_name || 'Guest Client'}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] font-mono">
                          {order.customer_email || 'No email provided'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-[var(--foreground)] tabular-nums">
                        {formatNaira(order.total_amount || order.total || 0)}
                      </td>

                      <td className="py-3.5 px-3">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                          className="bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs py-1.5 px-2.5 text-[var(--foreground)] outline-none cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="text-xs font-semibold text-[var(--accent-dark)] hover:underline"
                        >
                          {isExpanded ? 'Hide ▲' : 'View ▼'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Details Drawer inside Row */}
                    {isExpanded && (
                      <tr className="bg-[var(--card-clay)]/50">
                        <td colSpan={6} className="p-4 border-y border-[var(--border-light)]">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Delivery Address</span>
                                <p className="font-medium text-[var(--foreground)] mt-0.5">
                                  {order.shipping_address || 'Standard Store Pickup / Digital Delivery'}
                                </p>
                                {order.customer_phone && (
                                  <p className="text-[11px] text-[var(--muted)] mt-1 font-mono">
                                    📞 {order.customer_phone}
                                  </p>
                                )}
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Line Items ({items.length})</span>
                                <div className="space-y-1 mt-1">
                                  {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs py-0.5">
                                      <span>
                                        {item.quantity}x {item.title}{' '}
                                        {item.variant ? `(${item.variant.size || ''} ${item.variant.color || ''})` : ''}
                                      </span>
                                      <span className="font-bold tabular-nums">{formatNaira(item.price * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
