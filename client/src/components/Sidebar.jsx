import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, toggleProModal, setActiveWorkspace } from '../features/ui/uiSlice.js';
import {
  LayoutDashboard,
  Activity,
  Users,
  Settings,
  Zap,
  ChevronDown,
  Check,
  ShieldCheck,
  Terminal,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { activeTab, isProUnlocked, activeWorkspace } = useSelector((state) => state.ui);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const workspaces = ['SaaSify Inc', 'Acme E-Commerce', 'DevTools Pro (Test)'];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'feed', label: 'Live Feed', icon: Activity, badge: 'Live' },
    { id: 'customers', label: 'Customers', icon: Users, badge: '7' },
    { id: 'settings', label: 'Settings & Keys', icon: Settings }
  ];

  const handleNavClick = (id) => {
    dispatch(setActiveTab(id));
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-dark-card border-r border-dark-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Workspace Switcher */}
        <div className="p-4 border-b border-dark-border">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src="/assets/logo.svg"
              alt="RevTerm Logo"
              width="32"
              height="32"
              className="w-8 h-8 rounded-lg shadow-md shadow-brand-500/30"
            />
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                RevTerm
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Revenue Intelligence
              </span>
            </div>
          </div>

          {/* Workspace dropdown button */}
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl bg-dark-bg border border-dark-border hover:border-slate-700 text-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="truncate">{activeWorkspace}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-dark-surface border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                {workspaces.map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      dispatch(setActiveWorkspace(ws));
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>{ws}</span>
                    {activeWorkspace === ws && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Analytics &amp; Data
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-500 font-semibold border border-brand-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      item.badge === 'Live'
                        ? 'bg-emerald-500/15 text-emerald-400 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Resources
          </div>
          <a
            href="https://polar.sh/revterm"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Documentation</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </nav>

        {/* Pro status card at bottom */}
        <div className="p-3 border-t border-dark-border">
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-dark-bg border border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-500 flex items-center justify-center">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {isProUnlocked ? 'Pro Edition' : 'Free Community'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isProUnlocked ? 'Multi-account active' : '1 Connected Account'}
                </p>
              </div>
            </div>

            {!isProUnlocked && (
              <button
                onClick={() => dispatch(toggleProModal(true))}
                className="w-full mt-3 px-3 py-1.5 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:brightness-110 transition-all shadow-md shadow-brand-500/20"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
