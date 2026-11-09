import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';

export default function StatCard({
  title,
  value,
  delta,
  subtitle = 'vs last 30d',
  icon: Icon,
  tooltip = ''
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isPositive = delta > 0;
  const isNegative = delta < 0;

  return (
    <article className="glass-card glass-card-hover gradient-border-top rounded-2xl p-5 relative overflow-visible">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </h3>
          {tooltip && (
            <div className="relative inline-block">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-500 hover:text-slate-300 focus:outline-none"
                aria-label={`About ${title}`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-slate-900 border border-slate-700 text-[11px] text-slate-200 rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed">
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300">
            <Icon className="w-4 h-4 text-brand-500" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </p>
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
            {isPositive && <ArrowUpRight className="w-3 h-3" aria-hidden="true" />}
            {isNegative && <ArrowDownRight className="w-3 h-3" aria-hidden="true" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3" aria-hidden="true" />}
            <span>{isPositive ? `+${delta}%` : `${delta}%`}</span>
          </span>
        )}
        <span className="text-slate-400">{subtitle}</span>
      </div>
    </article>
  );
}
