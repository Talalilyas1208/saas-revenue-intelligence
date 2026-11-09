import React, { useState, lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetSummaryQuery,
  useGetTransactionsQuery,
  useGetCustomersQuery
} from './app/apiSlice.js';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import StatCard from './components/StatCard.jsx';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';

// Lazy-loaded components for optimal initial bundle & fast LCP
const RevenueChart = lazy(() => import('./components/RevenueChart.jsx'));
const LiveEventFeed = lazy(() => import('./components/LiveEventFeed.jsx'));
const CustomerTable = lazy(() => import('./components/CustomerTable.jsx'));
const SettingsView = lazy(() => import('./components/SettingsView.jsx'));
const LicenseModal = lazy(() => import('./components/LicenseModal.jsx'));

// Sleek loading skeleton
function SectionSkeleton({ height = 'h-64' }) {
  return (
    <div className={`linear-card rounded-xl p-5 ${height} flex flex-col justify-between animate-pulse`}>
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
        <div className="h-4 w-36 bg-zinc-800 rounded" />
        <div className="h-4 w-20 bg-zinc-800 rounded" />
      </div>
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        <div className="h-3 w-full bg-zinc-800/60 rounded" />
        <div className="h-3 w-5/6 bg-zinc-800/40 rounded" />
        <div className="h-3 w-4/6 bg-zinc-800/30 rounded" />
      </div>
    </div>
  );
}

export default function App() {
  const { activeTab, isLivePaused } = useSelector((state) => state.ui);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Poll backend every 3 seconds for real-time live data (respects pause toggle)
  const { data: summary } = useGetSummaryQuery(undefined, {
    pollingInterval: isLivePaused ? 0 : 3000
  });

  const { data: transactions = [] } = useGetTransactionsQuery(25, {
    pollingInterval: isLivePaused ? 0 : 3000
  });

  const { data: customers = [] } = useGetCustomersQuery('', {
    pollingInterval: 5000
  });

  return (
    <div className="min-h-screen bg-[#09090b] bg-grid-pattern text-zinc-100 flex selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Global Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
          {/* Exactly ONE <h1> tag on the page */}
          <div className="pb-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Revenue Intelligence Dashboard
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Real-time Stripe telemetry, MRR trajectory, and customer retention metrics.
            </p>
          </div>

          {/* Section: High-Level Performance Indicators */}
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <StatCard
                title="Monthly Recurring (MRR)"
                value={`$${(summary?.mrr || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                delta={summary?.mrrGrowthPct || 14.8}
                subtitle="growth"
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
                value={summary?.activeSubscribers || 0}
                subtitle="customers"
                icon={Users}
                tooltip="Active Subscribers: Total number of organizations with healthy, active recurring billing."
              />
              <StatCard
                title="Customer Churn Rate"
                value={`${summary?.churnRate || 0}%`}
                subtitle="last 30 days"
                icon={AlertCircle}
                tooltip="Churn Rate: The percentage of customers who canceled their subscription within the last 30 days."
              />
            </div>
          </section>

          {/* Tab Content Switching with Lazy Loading Suspense */}
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
                <SettingsView />
              </Suspense>
            </div>
          )}
        </main>

        <footer className="border-t border-white/[0.06] py-5 text-center text-xs text-zinc-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-zinc-500">
              RevTerm SaaS Revenue Intelligence Platform &copy; 2026. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-zinc-400 text-[11px]">
              <a
                href="https://github.com/revterm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com/revterm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Twitter
              </a>
              <a
                href="https://polar.sh/revterm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Pricing
              </a>
              <a
                href="/sitemap.xml"
                className="hover:text-white transition-colors"
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
    </div>
  );
}
