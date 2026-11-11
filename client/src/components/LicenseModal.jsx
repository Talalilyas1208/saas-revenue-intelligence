import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleProModal } from '../features/ui/uiSlice.js';
import { useVerifyLicenseMutation } from '../app/apiSlice.js';
import { Zap, Check, X, ArrowUpRight, AlertCircle } from 'lucide-react';

export default function LicenseModal() {
  const dispatch = useDispatch();
  const { isProModalOpen, activeOrgId } = useSelector((state) => state.ui);
  const [keyInput, setKeyInput] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const [verifyLicense, { isLoading }] = useVerifyLicenseMutation();

  if (!isProModalOpen) return null;

  const handleActivate = async (e) => {
    if (e) e.preventDefault();
    const cleanKey = keyInput.trim();
    if (!cleanKey) {
      setFeedback({ type: 'error', text: 'Please enter your license key.' });
      return;
    }

    try {
      await verifyLicense({
        organizationId: activeOrgId,
        licenseKey: cleanKey
      }).unwrap();

      setFeedback({ type: 'success', text: '✓ Pro license verified and activated!' });
      setTimeout(() => {
        dispatch(toggleProModal(false));
        setKeyInput('');
        setFeedback({ type: '', text: '' });
      }, 1200);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.data?.error || 'Invalid or expired license key.'
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => dispatch(toggleProModal(false))}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(toggleProModal(false))}
          className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1 rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black tracking-tight">
              RevTerm Pro Tier
            </h3>
            <p className="text-xs text-zinc-500">
              Commercial multi-project license ($29 lifetime) –{' '}
              <a
                href="https://polar.sh/revterm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 font-semibold underline hover:text-indigo-800 inline-flex items-center space-x-0.5"
              >
                <span>Purchase</span>
                <ArrowUpRight className="w-3 h-3 text-indigo-600" />
              </a>
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs text-zinc-700 font-medium">
          {[
            'Unlimited Stripe Accounts & Multi-Workspace Sync',
            'Real-Time Webhook Chime Daemon & Desktop Alerts',
            'Customer Churn Radar & Card Expiration Alerts',
            'Export Historical CSVs & Tax Summary'
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleActivate} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              License Key
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                if (feedback.text) setFeedback({ type: '', text: '' });
              }}
              placeholder="Enter your license key..."
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400 transition-colors"
              autoFocus
            />
            {feedback.text && (
              <p
                className={`mt-1.5 text-xs font-semibold flex items-center space-x-1 ${
                  feedback.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {feedback.type === 'error' && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{feedback.text}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => dispatch(toggleProModal(false))}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 active:scale-95 transition-all shadow-xs disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Activate Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
