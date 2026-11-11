import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleRecordPaymentModal } from '../features/ui/uiSlice.js';
import { useRecordTransactionMutation } from '../app/apiSlice.js';
import { playSaleChime } from '../utils/sound.js';
import { X, DollarSign, AlertCircle } from 'lucide-react';

export default function RecordPaymentModal() {
  const dispatch = useDispatch();
  const { isRecordPaymentOpen, activeOrgId, soundEnabled } = useSelector((state) => state.ui);
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('49.00');
  const [eventType, setEventType] = useState('charge.succeeded');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [recordTransaction, { isLoading }] = useRecordTransactionMutation();

  if (!isRecordPaymentOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const numAmount = Number(amount);
    if (!customerEmail.trim() || isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid email and positive amount.');
      return;
    }

    const payload = {
      organizationId: activeOrgId,
      customerEmail: customerEmail.trim(),
      amount: numAmount,
      eventType,
      description: description.trim() || 'Manual Payment'
    };

    if (soundEnabled && (eventType === 'charge.succeeded' || eventType === 'invoice.paid')) {
      playSaleChime();
    }

    setCustomerEmail('');
    setDescription('');
    dispatch(toggleRecordPaymentModal(false));

    recordTransaction(payload).unwrap().catch((err) => {
      console.error('Failed to persist transaction:', err?.data?.error || err);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => dispatch(toggleRecordPaymentModal(false))}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(toggleRecordPaymentModal(false))}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black p-1 rounded-lg"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-900 flex items-center justify-center text-white">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-950">Record Real Transaction</h3>
            <p className="text-xs text-neutral-500">Log a payment, invoice, or charge directly to your ledger.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="billing@customer.com"
              className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-neutral-200 rounded-lg text-neutral-950 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F5F5F5] border border-neutral-200 rounded-lg text-neutral-950 focus:bg-white focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-neutral-200 rounded-lg text-neutral-950 focus:bg-white focus:outline-none focus:border-neutral-400"
              >
                <option value="charge.succeeded">Payment Succeeded</option>
                <option value="invoice.paid">Invoice Paid</option>
                <option value="charge.failed">Payment Failed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Annual Enterprise Invoice #1042"
              className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-neutral-200 rounded-lg text-neutral-950 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-neutral-900 font-semibold flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => dispatch(toggleRecordPaymentModal(false))}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
