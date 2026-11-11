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
    <article className="linear-card tile-hover-shadow rounded-xl p-4 sm:p-5 relative overflow-visible cursor-default">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            {title}
          </h3>
          {tooltip && (
            <div className="relative inline-block">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-neutral-400 hover:text-neutral-700 focus:outline-none"
                aria-label={`About ${title}`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-0 bottom-full mb-2 w-56 p-2.5 bg-neutral-900 text-white text-[11px] rounded-lg shadow-xl z-50 pointer-events-none leading-relaxed">
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className="w-7 h-7 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
            <Icon className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <p className="text-2xl sm:text-[26px] font-bold text-neutral-950 tracking-tight tabular-nums">
          {value}
        </p>
      </div>

      <div className="mt-2.5 flex items-center space-x-2 text-xs">
        {delta !== undefined && (
          <span
            className={`inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded font-mono text-[11px] font-semibold border ${
              isPositive
                ? 'bg-neutral-900 text-white border-neutral-900'
                : isNegative
                ? 'bg-neutral-100 text-neutral-600 border-neutral-300'
                : 'bg-neutral-100 text-neutral-600 border-neutral-200'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3 h-3" aria-hidden="true" />}
            {isNegative && <ArrowDownRight className="w-3 h-3" aria-hidden="true" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3" aria-hidden="true" />}
            <span>{isPositive ? `+${delta}%` : `${delta}%`}</span>
          </span>
        )}
        <span className="text-[11px] text-neutral-500 font-medium">{subtitle}</span>
      </div>
    </article>
  );
}
