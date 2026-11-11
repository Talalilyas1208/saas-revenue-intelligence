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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await recordTransaction({
        organizationId: activeOrgId,
        customerEmail,
        amount: Number(amount),
        eventType,
        description: description || 'Manual Payment'
      }).unwrap();

      if (soundEnabled && eventType === 'charge.succeeded') {
        playSaleChime();
      }
      setCustomerEmail('');
      setDescription('');
      dispatch(toggleRecordPaymentModal(false));
    } catch (err) {
      setErrorMsg(err?.data?.error || 'Failed to record transaction.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => dispatch(toggleRecordPaymentModal(false))}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(toggleRecordPaymentModal(false))}
          className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1 rounded-lg"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black">Record Real Transaction</h3>
            <p className="text-xs text-zinc-500">Log a payment, invoice, or charge directly to your ledger.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="billing@customer.com"
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg text-black focus:bg-white focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-black focus:bg-white focus:outline-none focus:border-zinc-400"
              >
                <option value="charge.succeeded">Payment Succeeded</option>
                <option value="invoice.paid">Invoice Paid</option>
                <option value="charge.failed">Payment Failed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Annual Enterprise Invoice #1042"
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-700 font-semibold flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => dispatch(toggleRecordPaymentModal(false))}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
