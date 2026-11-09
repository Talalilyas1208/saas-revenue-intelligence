import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Download } from 'lucide-react';

export default function CustomerTable({ customers = [] }) {
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

  const renderStatus = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active</span>
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Past Due</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span>Canceled</span>
          </span>
        );
    }
  };

  return (
    <div className="linear-card tile-hover-shadow rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Customer Directory
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Showing {filtered.length} of {customers.length} total subscribers
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-900 border border-white/[0.08] hover:border-white/[0.16] text-zinc-300 hover:text-white transition-colors"
            title="Download customer list as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex items-center space-x-1 mt-3 pb-2 border-b border-white/[0.04] overflow-x-auto">
        {[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'active', label: 'Active', count: counts.active },
          { id: 'past_due', label: 'Past Due', count: counts.past_due },
          { id: 'canceled', label: 'Canceled', count: counts.canceled }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`flex items-center space-x-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
              statusFilter === tab.id
                ? 'bg-white/[0.08] text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] font-mono text-zinc-500">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Subscriber</th>
              <th className="py-2.5 px-3">Plan</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">MRR</th>
              <th className="py-2.5 px-3 text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-zinc-500 text-xs">
                  No subscribers match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-medium text-zinc-200 text-xs">{c.name}</p>
                    <p className="text-zinc-500 text-[11px]">{c.email}</p>
                  </td>
                  <td className="py-3 px-3 text-zinc-300 text-xs">
                    {c.plan}
                  </td>
                  <td className="py-3 px-3">
                    {renderStatus(c.status)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-white tabular-nums text-xs">
                    ${Number(c.mrrContribution).toFixed(2)}/mo
                  </td>
                  <td className="py-3 px-3 text-right text-zinc-500 font-mono text-xs">
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
