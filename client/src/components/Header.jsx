import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDateRange,
  setSearchQuery,
  toggleSound,
  setActiveTab,
  toggleRecordPaymentModal
} from '../features/ui/uiSlice.js';
import { useSyncStripeMutation } from '../app/apiSlice.js';
import {
  Menu,
  Search,
  Plus,
  Volume2,
  VolumeX,
  RefreshCw
} from 'lucide-react';

export default function Header({ onMenuClick, user, currentOrg }) {
  const dispatch = useDispatch();
  const searchInputRef = useRef(null);
  const { dateRange, searchQuery, soundEnabled, activeTab, activeOrgId } = useSelector(
    (state) => state.ui
  );
  const [syncStripe, { isLoading: isSyncing }] = useSyncStripeMutation();
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSync = async () => {
    const targetOrgId = currentOrg?.id || activeOrgId;
    if (!currentOrg?.hasStripeKey) {
      dispatch(setActiveTab('settings'));
      return;
    }
    try {
      const res = await syncStripe(targetOrgId).unwrap();
      setSyncStatus(`+${res.transactionsSynced} tx`);
      setTimeout(() => setSyncStatus(''), 2500);
    } catch {
      setSyncStatus('Error');
      setTimeout(() => setSyncStatus(''), 2500);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    dispatch(setSearchQuery(val));
    if (val && activeTab !== 'customers') {
      dispatch(setActiveTab('customers'));
    }
  };

  const displayName = user?.name || 'Founder';
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-zinc-200 bg-white/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 max-w-xs sm:max-w-sm">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 focus:outline-none flex-shrink-0"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative w-full min-w-0">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search subscribers, emails..."
            className="w-full pl-8 pr-3 sm:pr-10 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400 transition-colors"
          />
          <div className="hidden sm:flex items-center space-x-0.5 absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right: Date Range Filter & Live Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
        {/* Date Range Selector */}
        <div className="hidden md:flex items-center p-0.5 bg-zinc-100 border border-zinc-200 rounded-lg">
          {['7D', '30D', '90D', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => dispatch(setDateRange(range))}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                dateRange === range
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Audio Chime Toggle */}
        <button
          onClick={() => dispatch(toggleSound())}
          className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-950 hover:border-zinc-300 transition-colors shadow-xs"
          title={soundEnabled ? 'Sales sound alerts enabled' : 'Muted'}
          aria-label="Toggle notification sounds"
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Sync Stripe Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:text-black hover:border-zinc-300 transition-colors shadow-xs disabled:opacity-50"
          title={currentOrg?.hasStripeKey ? 'Sync live data from Stripe' : 'Connect Stripe key in Settings'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{syncStatus || (currentOrg?.hasStripeKey ? 'Sync Stripe' : 'Connect Stripe')}</span>
        </button>

        {/* Record Payment Button */}
        <button
          onClick={() => dispatch(toggleRecordPaymentModal(true))}
          className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xs"
          title="Record a real payment or invoice"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Record Payment</span>
          <span className="sm:hidden text-[11px]">Record</span>
        </button>

        {/* Dynamic User Avatar */}
        <button
          onClick={() => dispatch(setActiveTab('settings'))}
          title={`${displayName} (Open Settings)`}
          className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-300 hover:border-zinc-400 flex items-center justify-center text-zinc-800 text-[11px] font-semibold flex-shrink-0 transition-colors"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
