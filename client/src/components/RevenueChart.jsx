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
      <div className="bg-white border border-neutral-200 rounded-lg p-2.5 shadow-xl">
        <p className="text-[11px] text-neutral-500 font-medium">{label}</p>
        <p className="text-sm font-bold text-neutral-950 font-mono mt-0.5">
          ${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <span className="text-[10px] text-neutral-500 font-mono">Net Billed Revenue</span>
      </div>
    );
  }
  return null;
}

export default function RevenueChart({ data = [] }) {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.ui);

  const totalPeriodRevenue = data.reduce((acc, curr) => acc + Number(curr.revenue), 0);
  const avgDaily = data.length > 0 ? totalPeriodRevenue / data.length : 0;

  return (
    <div className="linear-card tile-hover-shadow rounded-xl p-5 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-950 tracking-tight">
            Revenue Performance
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Total for {dateRange}:{' '}
            <span className="font-mono font-bold text-neutral-950 tabular-nums">
              ${totalPeriodRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>{' '}
            <span className="text-neutral-500">· Avg ${avgDaily.toFixed(0)}/day</span>
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center space-x-1 p-0.5 bg-neutral-100 border border-neutral-200 rounded-lg self-start sm:self-auto">
          {['7D', '30D', '90D', '1Y'].map((tab) => (
            <button
              key={tab}
              onClick={() => dispatch(setDateRange(tab))}
              className={`px-2.5 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                dateRange === tab
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-52 sm:h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#171717" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#171717" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#737373"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
              tickFormatter={(val) => {
                const parts = val.split('-');
                return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
              }}
            />
            <YAxis
              stroke="#737373"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#171717"
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
