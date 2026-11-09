import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetSummaryQuery,
  useGetTransactionsQuery,
  useGetCustomersQuery
} from './app/apiSlice.js';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import StatCard from './components/StatCard.jsx';
import RevenueChart from './components/RevenueChart.jsx';
import LiveEventFeed from './components/LiveEventFeed.jsx';
import CustomerTable from './components/CustomerTable.jsx';
import SettingsView from './components/SettingsView.jsx';
import LicenseModal from './components/LicenseModal.jsx';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex selection:bg-brand-500 selection:text-white">
      {/* Professional Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Global Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Exactly ONE <h1> tag on the page */}
          <div className="border-b border-dark-border/60 pb-5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              SaaS Revenue Intelligence &amp; Metrics Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time Stripe billing analytics, MRR trajectory, and customer retention metrics.
            </p>
          </div>

          {/* Section: High-Level Performance Indicators (H2 level semantic section) */}
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Tab Content Switching */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section aria-label="Revenue Chart Section">
                <RevenueChart data={summary?.dailyTrend || []} />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section aria-label="Live Transaction Stream Section">
                  <LiveEventFeed transactions={transactions} />
                </section>
                <section aria-label="Customer Directory Section">
                  <CustomerTable customers={customers} />
                </section>
              </div>
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="animate-in fade-in duration-300">
              <section aria-label="Live Transaction Stream Section">
                <LiveEventFeed transactions={transactions} />
              </section>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="animate-in fade-in duration-300">
              <section aria-label="Customer Directory Section">
                <CustomerTable customers={customers} />
              </section>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-300">
              <SettingsView />
            </div>
          )}
        </main>

        <footer className="border-t border-dark-border/60 py-6 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>
              RevTerm SaaS Revenue Intelligence Platform &copy; 2026. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-slate-400">
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

      <LicenseModal />
    </div>
  );
}
