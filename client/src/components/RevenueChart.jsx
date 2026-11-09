import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from '../features/ui/uiSlice.js';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181b]/95 border border-white/[0.1] rounded-lg p-2.5 shadow-2xl backdrop-blur-md">
        <p className="text-[11px] text-zinc-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-white font-mono mt-0.5">
          ${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <span className="text-[10px] text-zinc-500 font-mono">Net Billed Revenue</span>
      </div>
    );
  }
  return null;
}

export default function RevenueChart({ data = [] }) {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.ui);

  // Filter based on active dateRange
  let filteredData = data;
  if (dateRange === '7D') {
    filteredData = data.slice(-7);
  } else if (dateRange === '30D') {
    filteredData = data.slice(-30);
  }

  const totalPeriodRevenue = filteredData.reduce((acc, curr) => acc + Number(curr.revenue), 0);
  const avgDaily = filteredData.length > 0 ? totalPeriodRevenue / filteredData.length : 0;

  return (
    <div className="linear-card rounded-xl p-5 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Revenue Performance
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Total for period:{' '}
            <span className="font-mono font-medium text-white tabular-nums">
              ${totalPeriodRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>{' '}
            <span className="text-zinc-500">· Avg ${avgDaily.toFixed(0)}/day</span>
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center space-x-1 p-0.5 bg-zinc-900/60 border border-white/[0.07] rounded-lg self-start sm:self-auto">
          {['7D', '30D', '90D', 'All'].map((tab) => (
            <button
              key={tab}
              onClick={() => dispatch(setDateRange(tab))}
              className={`px-2.5 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                dateRange === tab
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                const parts = val.split('-');
                return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
              }}
            />
            <YAxis
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
