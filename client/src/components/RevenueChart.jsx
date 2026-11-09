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
import { TrendingUp, DollarSign } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-card/95 border border-slate-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-base font-bold text-white font-mono mt-1">
          ${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <span className="text-[10px] text-emerald-400 font-medium">Daily Net Revenue</span>
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
    <div className="glass-card rounded-2xl p-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-dark-border gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Revenue Trajectory &amp; Growth</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total for selected period:{' '}
            <span className="font-mono font-bold text-white">
              ${totalPeriodRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>{' '}
            (Avg ${avgDaily.toFixed(0)}/day)
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center space-x-1 bg-dark-bg/80 border border-dark-border p-1 rounded-xl self-start sm:self-auto">
          {['7D', '30D', '90D', 'All'].map((tab) => (
            <button
              key={tab}
              onClick={() => dispatch(setDateRange(tab))}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                dateRange === tab
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#635bff" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#635bff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                const parts = val.split('-');
                return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
              }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#635bff"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
