import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery } from '../features/ui/uiSlice.js';
import { Search, Download, Filter, UserCheck, AlertTriangle, UserX } from 'lucide-react';

export default function CustomerTable({ customers = [] }) {
  const dispatch = useDispatch();
  const globalSearch = useSelector((state) => state.ui.searchQuery);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.plan.toLowerCase().includes(globalSearch.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate status counts
  const counts = {
    all: customers.length,
    active: customers.filter((c) => c.status === 'active').length,
    past_due: customers.filter((c) => c.status === 'past_due').length,
    canceled: customers.filter((c) => c.status === 'canceled').length
  };

  const handleExportCSV = () => {
    const headers = ['Customer Name', 'Email', 'Plan Tier', 'MRR Contribution', 'Status', 'Joined Date'];
    const rows = filtered.map((c) => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.plan}"`,
      c.mrrContribution,
      c.status,
      c.joinedDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `revterm_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active</span>
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Past Due</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/40 text-slate-400 border border-slate-700/50">
            <span>Canceled</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-dark-border gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Customer Directory &amp; Retention
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {filtered.length} of {customers.length} total subscribers
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            title="Download customer list as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex items-center space-x-2 mt-4 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Accounts', count: counts.all },
          { id: 'active', label: 'Active', count: counts.active },
          { id: 'past_due', label: 'Past Due', count: counts.past_due },
          { id: 'canceled', label: 'Canceled', count: counts.canceled }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              statusFilter === tab.id
                ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 font-semibold'
                : 'text-slate-400 hover:text-white bg-slate-900/50 border border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-dark-border/80 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Plan Tier</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">MRR Contribution</th>
              <th className="py-3 px-3 text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500">
                  <p className="text-sm font-medium text-slate-400">No matching customers found</p>
                  <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-white text-sm">{c.name}</p>
                    <p className="text-slate-400 text-xs">{c.email}</p>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 font-medium">
                    {c.plan}
                  </td>
                  <td className="py-3.5 px-3">
                    {getStatusBadge(c.status)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                    ${Number(c.mrrContribution).toFixed(2)}/mo
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-400 font-mono">
                    {c.joinedDate}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
