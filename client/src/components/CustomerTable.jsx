import React, { useState } from 'react';
import { Search, UserCheck, AlertTriangle, UserX } from 'lucide-react';

export default function CustomerTable({ customers = [] }) {
  const [query, setQuery] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      c.plan.toLowerCase().includes(query.toLowerCase())
  );

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
            Customer Directory & Retention
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Overview of subscribing accounts and MRR contribution
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-dark-bg/80 border border-dark-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
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
                <td colSpan="5" className="py-8 text-center text-slate-500">
                  No customers matched your filter.
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
