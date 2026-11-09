import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  delta,
  subtitle = 'vs last 30d',
  icon: Icon,
  accentColor = 'brand'
}) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;

  return (
    <div className="glass-card glass-card-hover gradient-border-top rounded-2xl p-5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300">
            <Icon className="w-4 h-4 text-brand-500" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </h3>
      </div>

      <div className="mt-3 flex items-center space-x-2 text-xs">
        {delta !== undefined && (
          <span
            className={`inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full font-semibold ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isNegative
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-slate-700/50 text-slate-400'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3 h-3" />}
            {isNegative && <ArrowDownRight className="w-3 h-3" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
            <span>{isPositive ? `+${delta}%` : `${delta}%`}</span>
          </span>
        )}
        <span className="text-slate-400">{subtitle}</span>
      </div>
    </div>
  );
}
