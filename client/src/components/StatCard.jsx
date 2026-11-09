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
    <article className="linear-card linear-card-hover rounded-xl p-4 sm:p-5 relative overflow-visible">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            {title}
          </h3>
          {tooltip && (
            <div className="relative inline-block">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-zinc-500 hover:text-zinc-300 focus:outline-none"
                aria-label={`About ${title}`}
              >
                <HelpCircle className="w-3 h-3" />
              </button>

              {showTooltip && (
                <div className="absolute left-0 bottom-full mb-2 w-56 p-2 bg-[#18181b] border border-white/[0.1] text-[11px] text-zinc-300 rounded-lg shadow-xl z-50 pointer-events-none leading-relaxed">
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-400">
            <Icon className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <p className="text-2xl sm:text-[26px] font-semibold text-white tracking-tight tabular-nums">
          {value}
        </p>
      </div>

      <div className="mt-2.5 flex items-center space-x-2 text-xs">
        {delta !== undefined && (
          <span
            className={`inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded font-mono text-[11px] font-medium ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : isNegative
                ? 'bg-rose-500/10 text-rose-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3 h-3" aria-hidden="true" />}
            {isNegative && <ArrowDownRight className="w-3 h-3" aria-hidden="true" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3" aria-hidden="true" />}
            <span>{isPositive ? `+${delta}%` : `${delta}%`}</span>
          </span>
        )}
        <span className="text-[11px] text-zinc-500">{subtitle}</span>
      </div>
    </article>
  );
}
