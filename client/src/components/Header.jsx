import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDateRange,
  setSearchQuery,
  toggleSound,
  setActiveTab
} from '../features/ui/uiSlice.js';
import { useSimulateTransactionMutation } from '../app/apiSlice.js';
import {
  Menu,
  Search,
  Plus,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function Header({ onMenuClick }) {
  const dispatch = useDispatch();
  const { dateRange, searchQuery, soundEnabled, activeTab } = useSelector(
    (state) => state.ui
  );
  const [simulateTransaction, { isLoading: isSimulating }] = useSimulateTransactionMutation();

  const handleSimulate = async () => {
    try {
      await simulateTransaction().unwrap();
    } catch (err) {
      console.error('Failed to simulate transaction', err);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    dispatch(setSearchQuery(val));
    if (val && activeTab !== 'customers') {
      dispatch(setActiveTab('customers'));
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-white/[0.06] bg-[#09090b]/90 backdrop-blur-md px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 max-w-xs sm:max-w-sm">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] focus:outline-none flex-shrink-0"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative w-full min-w-0">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search subscribers, emails..."
            className="w-full pl-8 pr-3 sm:pr-10 py-1.5 text-xs bg-zinc-900/60 border border-white/[0.07] rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/[0.2] transition-colors"
          />
          <div className="hidden sm:flex items-center space-x-0.5 absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 bg-zinc-800/80 px-1 py-0.5 rounded border border-white/[0.06]">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right: Date Range Filter & Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
        {/* Date Range Selector */}
        <div className="hidden md:flex items-center p-0.5 bg-zinc-900/60 border border-white/[0.07] rounded-lg">
          {['7D', '30D', '90D', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => dispatch(setDateRange(range))}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                dateRange === range
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Audio Chime Toggle */}
        <button
          onClick={() => dispatch(toggleSound())}
          className="p-1.5 rounded-lg border border-white/[0.07] bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-white/[0.14] transition-colors"
          title={soundEnabled ? 'Sales sound alerts enabled' : 'Muted'}
          aria-label="Toggle notification sounds"
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Simulate Sale Button */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
          title="Inject a realistic test payment into the live dashboard"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Simulate Event</span>
          <span className="sm:hidden text-[11px]">Event</span>
        </button>

        {/* Minimal User Avatar */}
        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/[0.1] flex items-center justify-center text-zinc-300 text-[11px] font-medium flex-shrink-0">
          AF
        </div>
      </div>
    </header>
  );
}
