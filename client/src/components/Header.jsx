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
  PlusCircle,
  Volume2,
  VolumeX,
  Calendar,
  CheckCircle2
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
    <header className="sticky top-0 z-30 h-16 border-b border-dark-border bg-dark-card/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search customers, subscriptions, emails... (Press '/')"
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-dark-bg/90 border border-dark-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            /
          </kbd>
        </div>
      </div>

      {/* Right: Date Range Filter & Quick Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Date Range Selector */}
        <div className="hidden sm:flex items-center space-x-1 bg-dark-bg/80 border border-dark-border p-1 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
          {['7D', '30D', '90D', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => dispatch(setDateRange(range))}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                dateRange === range
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Audio Chime Toggle */}
        <button
          onClick={() => dispatch(toggleSound())}
          className="p-2 rounded-xl border border-dark-border bg-dark-bg/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={soundEnabled ? 'Sales sound alerts enabled' : 'Muted'}
          aria-label="Toggle notification sounds"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Simulate Sale Button */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
          title="Inject a realistic test payment into the live dashboard"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Simulate Sale</span>
          <span className="sm:hidden">+Sale</span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold border border-brand-400/30">
          AF
        </div>
      </div>
    </header>
  );
}
