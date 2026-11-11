import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, toggleProModal, setActiveOrgId, setToken } from '../features/ui/uiSlice.js';
import { useCreateOrganizationMutation } from '../app/apiSlice.js';
import {
  LayoutDashboard,
  Activity,
  Users,
  Settings,
  ChevronDown,
  Check,
  ShieldCheck,
  ArrowUpRight,
  X,
  CreditCard,
  Plus,
  LogOut
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, organizations = [], subscriberCount = 0 }) {
  const dispatch = useDispatch();
  const { activeTab, activeOrgId } = useSelector((state) => state.ui);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [createOrganization, { isLoading: isCreatingOrg }] = useCreateOrganizationMutation();

  const currentOrg =
    organizations.find((o) => o.id === activeOrgId) ||
    organizations[0] || { id: '', name: 'Workspace', planTier: 'free' };

  const isProUnlocked = currentOrg.planTier === 'pro' || currentOrg.planTier === 'enterprise';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'feed', label: 'Live Stream', icon: Activity, badge: 'Live' },
    { id: 'customers', label: 'Subscribers', icon: Users, badge: String(subscriberCount) },
    { id: 'settings', label: 'Settings & Keys', icon: Settings }
  ];

  const handleNavClick = (id) => {
    dispatch(setActiveTab(id));
    if (onClose) onClose();
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    const clean = newOrgName.trim();
    if (!clean) return;
    try {
      const created = await createOrganization({ name: clean }).unwrap();
      dispatch(setActiveOrgId(created.id));
      setNewOrgName('');
      setIsWorkspaceMenuOpen(false);
    } catch (err) {
      console.error('Failed to create workspace', err);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-150"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 max-w-[80vw] bg-[#FFFFFF] border-r border-neutral-200 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Brand & Workspace Switcher Header */}
        <div className="p-4 border-b border-neutral-200 bg-[#F5F5F5]/60">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center p-1 shadow-xs">
                <img
                  src="/assets/logo.svg"
                  alt="RevTerm Logo"
                  width="20"
                  height="20"
                  className="w-5 h-5 rounded"
                />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-neutral-950 block">
                  RevTerm
                </span>
                <span className="text-[10px] text-neutral-500 font-mono block">
                  Revenue Intelligence
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Workspace Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-900 transition-colors shadow-xs"
              aria-expanded={isWorkspaceMenuOpen}
              aria-haspopup="listbox"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${currentOrg.hasStripeKey ? 'bg-neutral-900' : 'bg-neutral-400'}`} />
                <span className="truncate text-[11px] font-semibold text-neutral-900">{currentOrg.name}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 ml-1" />
            </button>

            {isWorkspaceMenuOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 z-50 animate-in fade-in duration-100"
                role="listbox"
              >
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      dispatch(setActiveOrgId(org.id));
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-neutral-50 text-neutral-800 hover:text-black transition-colors font-medium"
                    role="option"
                    aria-selected={currentOrg.id === org.id}
                  >
                    <span className="truncate">{org.name}</span>
                    {currentOrg.id === org.id && <Check className="w-3.5 h-3.5 text-neutral-900 flex-shrink-0" />}
                  </button>
                ))}

                <form onSubmit={handleCreateOrg} className="border-t border-neutral-100 mt-1 pt-1.5 px-2 pb-1">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="New workspace..."
                      className="w-full px-2 py-1 text-[11px] bg-neutral-50 border border-neutral-200 rounded text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                    />
                    <button
                      type="submit"
                      disabled={isCreatingOrg || !newOrgName.trim()}
                      className="p-1 rounded bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40"
                      title="Create workspace"
                      aria-label="Create workspace"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto" aria-label="Main Navigation">
          <div className="px-2.5 pt-1 pb-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
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
                    ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-5 px-2.5 pb-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Platform
          </div>
          <a
            href="https://github.com/Talalilyas1208/saas-revenue-intelligence"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-500" strokeWidth={1.75} />
              <span>Documentation</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
          </a>
          <button
            onClick={() => dispatch(toggleProModal(true))}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors text-left"
          >
            <div className="flex items-center space-x-2.5">
              <CreditCard className="w-4 h-4 text-neutral-500" strokeWidth={1.75} />
              <span>License Portal</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </nav>

        {/* Pro status & Sign Out */}
        <div className="p-3 border-t border-neutral-200 bg-[#F5F5F5]/60 space-y-2">
          <div className="p-3 rounded-xl bg-white border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isProUnlocked ? 'bg-neutral-950' : 'bg-neutral-400'}`} />
                <span className="text-xs font-bold text-neutral-950">
                  {isProUnlocked ? 'Pro License' : 'Community Tier'}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">v1.0</span>
            </div>

            {!isProUnlocked && (
              <button
                onClick={() => dispatch(toggleProModal(true))}
                className="w-full mt-2.5 px-2.5 py-1.5 text-xs font-semibold text-neutral-900 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>

          <button
            onClick={() => dispatch(setToken(''))}
            className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
