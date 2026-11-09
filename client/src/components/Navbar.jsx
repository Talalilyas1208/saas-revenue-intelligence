import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleProModal, setActiveTab } from '../features/ui/uiSlice.js';
import { useSimulateTransactionMutation } from '../app/apiSlice.js';
import { Zap, Activity, PlusCircle, Bell, Search } from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const { activeTab, isProUnlocked } = useSelector((state) => state.ui);
  const [simulateTransaction, { isLoading: isSimulating }] = useSimulateTransactionMutation();

  const handleSimulate = async () => {
    try {
      await simulateTransaction().unwrap();
    } catch (err) {
      console.error('Failed to simulate transaction', err);
    }
  };

  return (
    <header className="border-b border-dark-border bg-dark-card/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Live status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                RevTerm
              </span>
              <span className="ml-2 text-xs font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20 font-semibold">
                SaaS Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'feed', label: 'Live Feed' },
              { id: 'customers', label: 'Customers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => dispatch(setActiveTab(tab.id))}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-dark-surface text-white border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>POLLING 3s</span>
          </div>

          {/* Simulate New Sale Button */}
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate Sale</span>
          </button>

          {/* Pro License Button */}
          <button
            onClick={() => dispatch(toggleProModal(true))}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isProUnlocked
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-500 shadow-sm'
                : 'bg-gradient-to-r from-brand-600 to-indigo-600 border-brand-500 text-white hover:brightness-110 shadow-lg shadow-brand-500/20'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{isProUnlocked ? 'PRO UNLOCKED' : 'UPGRADE PRO'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
