import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, XCircle } from 'lucide-react';

export default function LiveEventFeed({ transactions = [] }) {
  const getBadge = (eventType) => {
    if (eventType.includes('succeeded') || eventType.includes('paid')) {
      return {
        label: 'PAID',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: CheckCircle2
      };
    }
    if (eventType.includes('created')) {
      return {
        label: 'NEW SUB',
        bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        icon: Sparkles
      };
    }
    if (eventType.includes('failed')) {
      return {
        label: 'FAILED',
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        icon: AlertCircle
      };
    }
    return {
      label: 'CANCELED',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: XCircle
    };
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between pb-4 border-b border-dark-border">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Live Transaction Stream
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time webhook events and Stripe billing charges
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/50">
          {transactions.length} Events
        </span>
      </div>

      <div className="mt-4 divide-y divide-dark-border/60 max-h-[420px] overflow-y-auto pr-1">
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Waiting for incoming billing webhooks...
          </div>
        ) : (
          transactions.map((tx) => {
            const badge = getBadge(tx.eventType);
            const BadgeIcon = badge.icon;
            const timeStr = new Date(tx.occurredAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center space-x-1 ${badge.bg}`}
                  >
                    <BadgeIcon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {tx.customerEmail}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {tx.description || tx.eventType}
                    </p>
                  </div>
                </div>

                <div className="text-right pl-3 flex-shrink-0">
                  <span className="font-mono text-sm font-bold text-white block">
                    +${Number(tx.amount).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {timeStr}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
