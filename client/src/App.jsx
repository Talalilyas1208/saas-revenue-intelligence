import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleProModal,
  setActiveOrgId,
  setActiveTab,
  toggleRecordPaymentModal
} from './features/ui/uiSlice.js';
import {
  apiSlice,
  useGetContextQuery,
  useGetSummaryQuery,
  useGetTransactionsQuery,
  useGetCustomersQuery
} from './app/apiSlice.js';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import StatCard from './components/StatCard.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import { DollarSign, TrendingUp, Users, AlertCircle, Key, Plus } from 'lucide-react';

// Lazy-loaded components for optimal initial bundle & fast LCP
const RevenueChart = lazy(() => import('./components/RevenueChart.jsx'));
const LiveEventFeed = lazy(() => import('./components/LiveEventFeed.jsx'));
const CustomerTable = lazy(() => import('./components/CustomerTable.jsx'));
const SettingsView = lazy(() => import('./components/SettingsView.jsx'));
const LicenseModal = lazy(() => import('./components/LicenseModal.jsx'));
const RecordPaymentModal = lazy(() => import('./components/RecordPaymentModal.jsx'));

const RANGE_TO_DAYS = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365
};

function SectionSkeleton({ height = 'h-64' }) {
  return (
    <div className={`linear-card rounded-xl p-5 ${height} flex flex-col justify-between animate-pulse`}>
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="h-4 w-36 bg-zinc-200 rounded" />
        <div className="h-4 w-20 bg-zinc-200 rounded" />
      </div>
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        <div className="h-3 w-full bg-zinc-100 rounded" />
        <div className="h-3 w-5/6 bg-zinc-100/80 rounded" />
        <div className="h-3 w-4/6 bg-zinc-100/60 rounded" />
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { token, activeTab, isLivePaused, activeOrgId, dateRange } = useSelector((state) => state.ui);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: context } = useGetContextQuery(undefined, { skip: !token });
  const organizations = context?.organizations || [];
  const user = context?.user || null;

  const validOrg =
    organizations.find((o) => o.id === activeOrgId) || organizations[0] || null;
  const effectiveOrgId = validOrg ? validOrg.id : '';

  useEffect(() => {
    if (validOrg && validOrg.id !== activeOrgId) {
      dispatch(setActiveOrgId(validOrg.id));
    }
  }, [validOrg, activeOrgId, dispatch]);

  // Warm Redux cache for 7D and 90D views so timeframe toggles feel instant
  useEffect(() => {
    if (token && effectiveOrgId) {
      dispatch(apiSlice.util.prefetch('getSummary', { organizationId: effectiveOrgId, days: 7 }, { ifOlderThan: 60 }));
      dispatch(apiSlice.util.prefetch('getSummary', { organizationId: effectiveOrgId, days: 90 }, { ifOlderThan: 60 }));
    }
  }, [token, effectiveOrgId, dispatch]);

  const days = RANGE_TO_DAYS[dateRange] || 30;

  const { data: summary } = useGetSummaryQuery(
    { organizationId: effectiveOrgId, days },
    {
      skip: !token || !effectiveOrgId,
      pollingInterval: isLivePaused ? 0 : 12000
    }
  );

  const { data: transactions = [] } = useGetTransactionsQuery(
    { organizationId: effectiveOrgId, limit: 25 },
    {
      skip: !token || !effectiveOrgId,
      pollingInterval: isLivePaused ? 0 : 12000
    }
  );

  const { data: customers = [] } = useGetCustomersQuery(
    { organizationId: effectiveOrgId },
    {
      skip: !token || !effectiveOrgId,
      pollingInterval: 15000
    }
  );

  if (!token) {
    return <AuthScreen />;
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'Founder';
  const showOnboarding =
    validOrg && !validOrg.hasStripeKey && customers.length === 0 && transactions.length === 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5] bg-grid-pattern text-neutral-900 flex selection:bg-neutral-900 selection:text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        organizations={organizations}
        subscriberCount={customers.length}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          user={user}
          currentOrg={validOrg}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
          {/* Exactly ONE <h1> tag on the page */}
          <div className="pb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight flex items-center gap-2">
                <span>Welcome back, {firstName}</span>
                <span className="animate-wave text-2xl select-none" role="img" aria-label="Waving hand">👋</span>
              </h1>
              <p className="text-xs text-zinc-600 mt-1">
                Live telemetry for <span className="font-semibold text-zinc-900">{validOrg?.name || 'your workspace'}</span> · {dateRange} performance window.
              </p>
            </div>
          </div>

          {/* Empty State Onboarding Banner (Only shown when brand new workspace has 0 records & no Stripe key) */}
          {showOnboarding && activeTab === 'overview' && (
            <div className="linear-card rounded-xl p-5 border border-neutral-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-950">Connect your live revenue source</h2>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Link your Stripe Restricted API Key to automatically import real subscriptions and charges, or record your first subscriber manually.
                </p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => dispatch(setActiveTab('settings'))}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Connect Stripe</span>
                </button>
                <button
                  onClick={() => dispatch(toggleRecordPaymentModal(true))}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F5F5F5] border border-neutral-200 text-neutral-800 hover:bg-neutral-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              </div>
            </div>
          )}

          {/* Section: High-Level Performance Indicators */}
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <StatCard
                title="Monthly Recurring (MRR)"
                value={`$${(summary?.mrr || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                delta={summary?.mrrGrowthPct ?? 0}
                subtitle={`vs prev ${Math.floor(days / 2)}d`}
                icon={DollarSign}
                tooltip="Monthly Recurring Revenue: The predictable subscription revenue expected every month from active customers."
              />
              <StatCard
                title="Annual Run Rate (ARR)"
                value={`$${(summary?.arr || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                subtitle="projected"
                icon={TrendingUp}
                tooltip="Annual Run Rate: Projected 12-month revenue based on current MRR (MRR × 12)."
              />
              <StatCard
                title="Active Subscribers"
                value={summary?.activeSubscribers ?? 0}
                subtitle={`of ${summary?.totalSubscribers ?? 0} total`}
                icon={Users}
                tooltip="Active Subscribers: Total number of organizations with healthy, active recurring billing."
              />
              <StatCard
                title="Customer Churn Rate"
                value={`${summary?.churnRate ?? 0}%`}
                subtitle="canceled share"
                icon={AlertCircle}
                tooltip="Churn Rate: The percentage of customers whose subscriptions are canceled."
              />
            </div>
          </section>

          {/* Tab Content Switching */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <section aria-label="Revenue Chart Section">
                <Suspense fallback={<SectionSkeleton height="h-72" />}>
                  <RevenueChart data={summary?.dailyTrend || []} />
                </Suspense>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section aria-label="Live Stream Section">
                  <Suspense fallback={<SectionSkeleton height="h-96" />}>
                    <LiveEventFeed transactions={transactions} />
                  </Suspense>
                </section>
                <section aria-label="Customer Directory Section">
                  <Suspense fallback={<SectionSkeleton height="h-96" />}>
                    <CustomerTable customers={customers} />
                  </Suspense>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="animate-in fade-in duration-200">
              <section aria-label="Live Stream Section">
                <Suspense fallback={<SectionSkeleton height="h-96" />}>
                  <LiveEventFeed transactions={transactions} />
                </Suspense>
              </section>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="animate-in fade-in duration-200">
              <section aria-label="Customer Directory Section">
                <Suspense fallback={<SectionSkeleton height="h-96" />}>
                  <CustomerTable customers={customers} />
                </Suspense>
              </section>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-200">
              <Suspense fallback={<SectionSkeleton height="h-80" />}>
                <SettingsView user={user} currentOrg={validOrg} database={context?.database} />
              </Suspense>
            </div>
          )}
        </main>

        <footer className="border-t border-zinc-200 bg-white/70 py-5 text-center text-xs text-zinc-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-zinc-500">
              RevTerm SaaS Revenue Intelligence Platform &copy; 2026. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-zinc-600 text-[11px]">
              <a
                href="https://github.com/Talalilyas1208/saas-revenue-intelligence"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com/revterm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                Twitter
              </a>
              <button
                onClick={() => dispatch(toggleProModal(true))}
                className="hover:text-black transition-colors font-medium"
              >
                Pricing &amp; License
              </button>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                Sitemap
              </a>
            </div>
          </div>
        </footer>
      </div>

      <Suspense fallback={null}>
        <LicenseModal />
      </Suspense>
      <Suspense fallback={null}>
        <RecordPaymentModal />
      </Suspense>
    </div>
  );
}
