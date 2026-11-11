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
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-900">
          <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
          <span>Paid</span>
        </span>
      );
    }
    if (eventType.includes('created')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded border border-neutral-300">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 flex-shrink-0" />
          <span>New Sub</span>
        </span>
      );
    }
    if (eventType.includes('failed')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 flex-shrink-0" />
          <span>Failed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 flex-shrink-0" />
        <span>Canceled</span>
      </span>
    );
  };

  return (
    <div className="linear-card tile-hover-shadow rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-neutral-200 gap-2.5">
        <div>
          <h2 className="text-sm font-bold text-neutral-950 tracking-tight flex items-center space-x-2">
            <span>Live Stream</span>
            {!isLivePaused && (
              <span className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse" />
            )}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time webhook events and Stripe billing charges
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => dispatch(toggleLivePaused())}
            className={`flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors ${
              isLivePaused
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 border-neutral-200 hover:text-black hover:border-neutral-300 shadow-xs'
            }`}
          >
            {isLivePaused ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5" />}
            <span>{isLivePaused ? 'Paused' : 'Pause'}</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center space-x-1 mt-3 pb-2 border-b border-neutral-100 overflow-x-auto">
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
                ? 'bg-neutral-900 text-white font-semibold'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="divide-y divide-neutral-100 max-h-[380px] overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs font-medium">
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
                className="py-2.5 flex items-center justify-between hover:bg-neutral-50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-20 flex-shrink-0">
                    {renderStatus(tx.eventType)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 truncate">
                      {tx.customerEmail}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {tx.description || tx.eventType}
                    </p>
                  </div>
                </div>

                <div className="text-right pl-3 flex-shrink-0">
                  <span
                    className={`font-mono text-xs font-bold tabular-nums block ${
                      isRevenue ? 'text-neutral-950' : 'text-neutral-400 line-through'
                    }`}
                  >
                    {isRevenue ? `+$${formattedAmt}` : `$${formattedAmt}`}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 block">
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
