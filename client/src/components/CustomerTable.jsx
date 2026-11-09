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
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Active</span>
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>Past Due</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span>Canceled</span>
          </span>
        );
    }
  };

  return (
    <div className="linear-card tile-hover-shadow rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
        <div>
          <h2 className="text-sm font-bold text-black tracking-tight">
            Customer Directory
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Showing {filtered.length} of {customers.length} total subscribers
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 hover:text-black transition-colors shadow-xs"
            title="Download customer list as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex items-center space-x-1 mt-3 pb-2 border-b border-zinc-100 overflow-x-auto">
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
                ? 'bg-zinc-900 text-white font-semibold'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-mono ${statusFilter === tab.id ? 'text-zinc-300' : 'text-zinc-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
        <table className="w-full text-left text-xs min-w-[520px]">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3">Subscriber</th>
              <th className="py-2.5 px-3">Plan</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">MRR</th>
              <th className="py-2.5 px-3 text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-zinc-400 text-xs font-medium">
                  No subscribers match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-zinc-950 text-xs">{c.name}</p>
                    <p className="text-zinc-500 text-[11px]">{c.email}</p>
                  </td>
                  <td className="py-3 px-3 text-zinc-700 text-xs font-medium">
                    {c.plan}
                  </td>
                  <td className="py-3 px-3">
                    {renderStatus(c.status)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-black tabular-nums text-xs">
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
