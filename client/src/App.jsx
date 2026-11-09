import React from 'react';
import { useSelector } from 'react-redux';
import {
  useGetSummaryQuery,
  useGetTransactionsQuery,
  useGetCustomersQuery
} from './app/apiSlice.js';
import Navbar from './components/Navbar.jsx';
import StatCard from './components/StatCard.jsx';
import RevenueChart from './components/RevenueChart.jsx';
import LiveEventFeed from './components/LiveEventFeed.jsx';
import CustomerTable from './components/CustomerTable.jsx';
import LicenseModal from './components/LicenseModal.jsx';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';

export default function App() {
  const { activeTab } = useSelector((state) => state.ui);

  // Poll backend every 3 seconds for real-time live data
  const { data: summary, isLoading: isSummaryLoading } = useGetSummaryQuery(undefined, {
    pollingInterval: 3000
  });

  const { data: transactions = [] } = useGetTransactionsQuery(25, {
    pollingInterval: 3000
  });

  const { data: customers = [] } = useGetCustomersQuery('', {
    pollingInterval: 5000
  });

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Stat Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Monthly Recurring (MRR)"
            value={`$${(summary?.mrr || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            delta={summary?.mrrGrowthPct || 14.8}
            subtitle="growth"
            icon={DollarSign}
          />
          <StatCard
            title="Annual Run Rate (ARR)"
            value={`$${(summary?.arr || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            subtitle="projected"
            icon={TrendingUp}
          />
          <StatCard
            title="Active Subscribers"
            value={summary?.activeSubscribers || 0}
            subtitle="customers"
            icon={Users}
          />
          <StatCard
            title="Customer Churn Rate"
            value={`${summary?.churnRate || 0}%`}
            subtitle="last 30 days"
            icon={AlertCircle}
          />
        </section>

        {/* Tab Content Switching */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <RevenueChart data={summary?.dailyTrend || []} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <LiveEventFeed transactions={transactions} />
              <CustomerTable customers={customers} />
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="animate-in fade-in duration-300">
            <LiveEventFeed transactions={transactions} />
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="animate-in fade-in duration-300">
            <CustomerTable customers={customers} />
          </div>
        )}
      </main>

      <footer className="border-t border-dark-border/60 py-6 text-center text-xs text-slate-500">
        RevTerm SaaS Revenue Intelligence Platform &copy; 2026. Built with Express.js, Sequelize, Redux Toolkit, and Tailwind.
      </footer>

      <LicenseModal />
    </div>
  );
}
