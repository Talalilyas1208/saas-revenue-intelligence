import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLivePaused } from '../features/ui/uiSlice.js';
import { CheckCircle2, AlertCircle, Sparkles, XCircle, Pause, Play, Filter } from 'lucide-react';

export default function LiveEventFeed({ transactions = [] }) {
  const dispatch = useDispatch();
  const isLivePaused = useSelector((state) => state.ui.isLivePaused);
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    if (filterType === 'success') return tx.eventType.includes('succeeded') || tx.eventType.includes('paid');
    if (filterType === 'created') return tx.eventType.includes('created');
    if (filterType === 'failed') return tx.eventType.includes('failed');
    return true;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-dark-border gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Live Transaction Stream</span>
            {!isLivePaused && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time webhook events and Stripe billing charges
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center space-x-2">
          {/* Pause / Play button */}
          <button
            onClick={() => dispatch(toggleLivePaused())}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              isLivePaused
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700/60 hover:text-white'
            }`}
          >
            {isLivePaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
            <span>{isLivePaused ? 'Paused' : 'Pause'}</span>
          </button>
        </div>
      </div>

      {/* Event type filter pills */}
      <div className="flex items-center space-x-1.5 mt-3 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'success', label: 'Payments' },
          { id: 'created', label: 'New Subs' },
          { id: 'failed', label: 'Failed' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
              filterType === f.id
                ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 font-semibold'
                : 'text-slate-400 hover:text-white bg-slate-900/40 border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="mt-2 divide-y divide-dark-border/60 max-h-[420px] overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Waiting for incoming billing webhooks...
          </div>
        ) : (
          filteredTransactions.map((tx) => {
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
                className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center space-x-1 ${badge.bg}`}
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
