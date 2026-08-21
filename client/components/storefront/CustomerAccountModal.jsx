'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Stepper } from '@/components/ui/Stepper';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/lib/utils';

export function CustomerAccountModal({
  customer,
  isOpen,
  onClose,
  orders = [],
  ordersLoading = false,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile'
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Portal"
      subtitle={`Signed in as ${customer.name || customer.email}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : 'bg-[var(--card-clay)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Order History ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'profile'
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : 'bg-[var(--card-clay)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Account Details
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={onLogout} className="text-red-500 hover:bg-red-500/10">
            Sign Out
          </Button>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="py-12 text-center text-xs text-[var(--muted)]">
                Loading order history...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--border)] rounded-3xl">
                No orders placed yet with this account.
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  let items = [];
                  try {
                    items = Array.isArray(order.items) 
                      ? order.items 
                      : (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : []);
                  } catch {}

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-3xl border border-[var(--card-border)] bg-[var(--surface)] shadow-xs space-y-4"
                    >
                      {/* Order Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-[var(--muted)] block">
                            ORDER #{String(order.id).padStart(5, '0')}
                          </span>
                          <span className="text-xs text-[var(--muted)]">
                            Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[var(--foreground)] tabular-nums">
                            {formatNaira(order.total_amount || order.total || 0)}
                          </span>
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="text-xs text-[var(--accent-dark)] font-semibold hover:underline"
                          >
                            {isExpanded ? 'Hide Details ▲' : 'View Items ▼'}
                          </button>
                        </div>
                      </div>

                      {/* Visual Order Progress Stepper */}
                      <Stepper currentStep={order.status || 'pending'} />

                      {/* Expandable Order Details */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-[var(--border-light)] space-y-3">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            Order Items ({items.length})
                          </h5>
                          <div className="space-y-2">
                            {items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-[var(--card-clay)]">
                                <div>
                                  <span className="font-semibold text-[var(--foreground)]">{item.title}</span>
                                  {item.variant && (
                                    <span className="text-[10px] text-[var(--muted)] ml-2">
                                      ({item.variant.size || ''} {item.variant.color || ''})
                                    </span>
                                  )}
                                  <span className="text-[11px] text-[var(--muted)] block">
                                    Qty: {item.quantity} × {formatNaira(item.price)}
                                  </span>
                                </div>
                                <span className="font-bold text-[var(--foreground)] tabular-nums">
                                  {formatNaira(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {order.shipping_address && (
                            <p className="text-[11px] text-[var(--muted)] pt-1">
                              <strong>Destination:</strong> {order.shipping_address}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile Details */}
        {activeTab === 'profile' && (
          <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--card-clay)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">Customer Name</span>
                <span className="text-sm font-semibold text-[var(--foreground)] mt-1 block">{customer.name || 'Not specified'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--card-clay)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">Email Address</span>
                <span className="text-sm font-semibold text-[var(--foreground)] mt-1 block font-mono">{customer.email}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--card-clay)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">Phone Contact</span>
                <span className="text-sm font-semibold text-[var(--foreground)] mt-1 block">{customer.phone || 'Not specified'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--card-clay)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">Default Address</span>
                <span className="text-sm font-semibold text-[var(--foreground)] mt-1 block">{customer.address || 'Not specified'}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
