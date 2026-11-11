import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLivePaused } from '../features/ui/uiSlice.js';
import { Pause, Play } from 'lucide-react';

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

  const renderStatus = (eventType) => {
    if (eventType.includes('succeeded') || eventType.includes('paid')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
          <span>Paid</span>
        </span>
      );
    }
    if (eventType.includes('created')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
          <span>New Sub</span>
        </span>
      );
    }
    if (eventType.includes('failed')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0" />
          <span>Failed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 flex-shrink-0" />
        <span>Canceled</span>
      </span>
    );
  };

  return (
    <div className="linear-card tile-hover-shadow rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-zinc-200 gap-2.5">
        <div>
          <h2 className="text-sm font-bold text-black tracking-tight flex items-center space-x-2">
            <span>Live Stream</span>
            {!isLivePaused && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time webhook events and Stripe billing charges
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => dispatch(toggleLivePaused())}
            className={`flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors ${
              isLivePaused
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-white text-zinc-700 border-zinc-200 hover:text-black hover:border-zinc-300 shadow-xs'
            }`}
          >
            {isLivePaused ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5" />}
            <span>{isLivePaused ? 'Paused' : 'Pause'}</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center space-x-1 mt-3 pb-2 border-b border-zinc-100 overflow-x-auto">
        {[
          { id: 'all', label: 'All' },
          { id: 'success', label: 'Payments' },
          { id: 'created', label: 'Subscriptions' },
          { id: 'failed', label: 'Failed' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-2.5 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
              filterType === f.id
                ? 'bg-zinc-900 text-white font-semibold'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="divide-y divide-zinc-100 max-h-[380px] overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs font-medium">
            Waiting for incoming billing webhooks...
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const timeStr = new Date(tx.occurredAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            const isRevenue =
              tx.eventType.includes('succeeded') ||
              tx.eventType.includes('paid') ||
              tx.eventType.includes('created');
            const formattedAmt = Number(tx.amount).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });

            return (
              <div
                key={tx.id}
                className="py-2.5 flex items-center justify-between hover:bg-zinc-50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-20 flex-shrink-0">
                    {renderStatus(tx.eventType)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 truncate">
                      {tx.customerEmail}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {tx.description || tx.eventType}
                    </p>
                  </div>
                </div>

                <div className="text-right pl-3 flex-shrink-0">
                  <span
                    className={`font-mono text-xs font-bold tabular-nums block ${
                      isRevenue ? 'text-black' : 'text-rose-600 line-through'
                    }`}
                  >
                    {isRevenue ? `+$${formattedAmt}` : `$${formattedAmt}`}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 block">
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
