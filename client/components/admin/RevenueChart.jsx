'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNaira, formatCompactNaira } from '@/lib/utils';

export function RevenueChart({
  data = [],
}) {
  const [timeframe, setTimeframe] = useState('30D');

  const formattedData = data.length > 0
    ? data
    : [
        { date: 'Mon', revenue: 120000, orders: 3 },
        { date: 'Tue', revenue: 240000, orders: 6 },
        { date: 'Wed', revenue: 190000, orders: 5 },
        { date: 'Thu', revenue: 380000, orders: 9 },
        { date: 'Fri', revenue: 490000, orders: 12 },
        { date: 'Sat', revenue: 620000, orders: 16 },
        { date: 'Sun', revenue: 510000, orders: 13 },
      ];

  return (
    <div className="clay-card p-5 sm:p-6 bg-[var(--surface)] space-y-6">
      
      {/* Chart Header & Timeframe Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
            Revenue Analytics
          </span>
          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-0.5">
            Store Sales Velocity & Volume
          </h3>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)] self-start sm:self-auto">
          {['7D', '30D', '90D', '1Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="var(--muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatCompactNaira(val)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value;
                  const orders = payload[0].payload?.orders;
                  return (
                    <div className="p-3 rounded-2xl glass-modal border border-[var(--border)] shadow-xl text-xs space-y-1">
                      <p className="font-bold text-[var(--foreground)]">{label}</p>
                      <p className="font-bold text-[var(--accent-dark)] tabular-nums text-sm">
                        {formatNaira(val)}
                      </p>
                      {orders !== undefined && (
                        <p className="text-[11px] text-[var(--muted)]">
                          {orders} completed {orders === 1 ? 'order' : 'orders'}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--accent-dark)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
