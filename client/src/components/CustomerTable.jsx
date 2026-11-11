import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useCreateCustomerMutation,
  useUpdateCustomerStatusMutation
} from '../app/apiSlice.js';
import { Download, Plus, X, RefreshCw } from 'lucide-react';

export default function CustomerTable({ customers = [] }) {
  const { searchQuery: globalSearch, activeOrgId } = useSelector((state) => state.ui);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    plan: 'Pro Monthly ($49/mo)',
    mrrContribution: '49.00'
  });
  const [formError, setFormError] = useState('');

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomerStatus] = useUpdateCustomerStatusMutation();

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

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const mrrVal = Number(newCustomer.mrrContribution);
    if (!newCustomer.name.trim() || !newCustomer.email.trim() || isNaN(mrrVal) || mrrVal <= 0) {
      setFormError('Valid name, email, and positive MRR are required.');
      return;
    }

    const payload = {
      organizationId: activeOrgId,
      name: newCustomer.name.trim(),
      email: newCustomer.email.trim(),
      plan: newCustomer.plan,
      mrrContribution: mrrVal
    };

    // Reset & close form immediately while Redux optimistic update renders subscriber & MRR in 0ms
    setNewCustomer({
      name: '',
      email: '',
      plan: 'Pro Monthly ($49/mo)',
      mrrContribution: '49.00'
    });
    setShowAddForm(false);

    createCustomer(payload).unwrap().catch((err) => {
      console.error('Failed to persist subscriber:', err?.data?.error || err);
    });
  };

  const handleCycleStatus = async (customer) => {
    const nextStatus =
      customer.status === 'active'
        ? 'past_due'
        : customer.status === 'past_due'
        ? 'canceled'
        : 'active';
    try {
      await updateCustomerStatus({ id: customer.id, status: nextStatus }).unwrap();
    } catch (err) {
      console.error('Failed to update status', err);
    }
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

  const renderStatusButton = (c) => {
    let badgeStyle = 'text-neutral-500 bg-neutral-50 border-neutral-200 hover:bg-neutral-100';
    let dotStyle = 'bg-neutral-400';
    let label = 'Canceled';

    if (c.status === 'active') {
      badgeStyle = 'text-white bg-neutral-900 border-neutral-900 hover:bg-neutral-800';
      dotStyle = 'bg-white';
      label = 'Active';
    } else if (c.status === 'past_due') {
      badgeStyle = 'text-neutral-800 bg-neutral-200 border-neutral-300 hover:bg-neutral-300';
      dotStyle = 'bg-neutral-700';
      label = 'Past Due';
    }

    return (
      <button
        onClick={() => handleCycleStatus(c)}
        title="Click to cycle status (Active -> Past Due -> Canceled)"
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors ${badgeStyle}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
        <span>{label}</span>
        <RefreshCw className="w-2.5 h-2.5 opacity-60 ml-0.5" />
      </button>
    );
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
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shadow-xs whitespace-nowrap"
          >
            {showAddForm ? <X className="w-3.5 h-3.5 flex-shrink-0" /> : <Plus className="w-3.5 h-3.5 flex-shrink-0" />}
            <span>{showAddForm ? 'Cancel' : 'Add Subscriber'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 hover:text-black transition-colors shadow-xs whitespace-nowrap"
            title="Download customer list as CSV"
          >
            <Download className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Inline Add Subscriber Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="mt-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 animate-in fade-in duration-150"
        >
          <p className="text-xs font-bold text-black">New Subscriber Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Organization / Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
              required
            />
            <input
              type="email"
              placeholder="billing@company.com"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
              required
            />
            <select
              value={newCustomer.plan}
              onChange={(e) => {
                const p = e.target.value;
                const price = p.includes('299') ? '299.00' : p.includes('99') ? '99.00' : p.includes('49') ? '49.00' : '19.00';
                setNewCustomer({ ...newCustomer, plan: p, mrrContribution: price });
              }}
              className="px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-black focus:outline-none focus:border-zinc-400"
            >
              <option value="Starter ($19/mo)">Starter ($19/mo)</option>
              <option value="Pro Monthly ($49/mo)">Pro Monthly ($49/mo)</option>
              <option value="Team Tier ($99/mo)">Team Tier ($99/mo)</option>
              <option value="Enterprise ($299/mo)">Enterprise ($299/mo)</option>
            </select>
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="MRR ($)"
              value={newCustomer.mrrContribution}
              onChange={(e) => setNewCustomer({ ...newCustomer, mrrContribution: e.target.value })}
              className="px-3 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-lg text-black focus:outline-none focus:border-zinc-400"
              required
            />
          </div>
          {formError && <p className="text-xs text-rose-600 font-medium">{formError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isCreating ? 'Saving...' : 'Create Subscriber'}
            </button>
          </div>
        </form>
      )}

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
      <div className="overflow-x-auto">
        <table className={`w-full text-left text-xs ${filtered.length > 0 ? 'min-w-[460px] lg:min-w-full' : ''}`}>
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3">Subscriber</th>
              <th className="py-2.5 px-3">Plan</th>
              <th className="py-2.5 px-3">Status (Click to Toggle)</th>
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
                    {renderStatusButton(c)}
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
