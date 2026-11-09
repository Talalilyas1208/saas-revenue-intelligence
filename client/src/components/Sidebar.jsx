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
  ArrowUpRight,
  X,
  CreditCard
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { activeTab, isProUnlocked, activeWorkspace } = useSelector((state) => state.ui);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const workspaces = ['SaaSify Inc', 'Acme E-Commerce', 'DevTools Pro (Test)'];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'feed', label: 'Live Stream', icon: Activity, badge: 'Live' },
    { id: 'customers', label: 'Subscribers', icon: Users, badge: '7' },
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
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-150"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 max-w-[80vw] bg-[#0c0c0e] border-r border-white/[0.06] flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Brand & Workspace Switcher Header */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/[0.1] flex items-center justify-center p-1 shadow-sm">
                <img
                  src="/assets/logo.svg"
                  alt="RevTerm Logo"
                  width="20"
                  height="20"
                  className="w-5 h-5 rounded"
                />
              </div>
              <div>
                <span className="font-semibold text-sm tracking-tight text-white block">
                  RevTerm
                </span>
                <span className="text-[10px] text-zinc-500 font-mono block">
                  Revenue Intelligence
                </span>
              </div>
            </div>

            {/* Explicit Mobile Close (X) button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Workspace dropdown button */}
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900/60 border border-white/[0.07] hover:border-white/[0.14] text-zinc-300 hover:text-white transition-colors"
              aria-expanded={isWorkspaceMenuOpen}
              aria-haspopup="listbox"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="truncate text-[11px] font-medium">{activeWorkspace}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 ml-1" />
            </button>

            {isWorkspaceMenuOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-[#151518] border border-white/[0.1] rounded-lg shadow-2xl py-1 z-50 animate-in fade-in duration-100"
                role="listbox"
              >
                {workspaces.map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      dispatch(setActiveWorkspace(ws));
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-white/[0.05] text-zinc-300 hover:text-white transition-colors"
                    role="option"
                    aria-selected={activeWorkspace === ws}
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
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto" aria-label="Main Navigation">
          <div className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                      item.badge === 'Live'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-5 px-2.5 pb-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Links &amp; Docs
          </div>
          <a
            href="https://github.com/revterm"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
              <span>Documentation</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </a>
          <button
            onClick={() => dispatch(toggleProModal(true))}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors text-left"
          >
            <div className="flex items-center space-x-2.5">
              <CreditCard className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
              <span>License Portal</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </nav>

        {/* Pro status card at bottom */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isProUnlocked ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                <span className="text-xs font-medium text-white">
                  {isProUnlocked ? 'Pro License' : 'Community Tier'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">v1.0</span>
            </div>

            {!isProUnlocked && (
              <button
                onClick={() => dispatch(toggleProModal(true))}
                className="w-full mt-2.5 px-2.5 py-1.5 text-xs font-medium text-white rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] transition-colors"
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
