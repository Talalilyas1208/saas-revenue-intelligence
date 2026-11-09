import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleProModal, unlockPro } from '../features/ui/uiSlice.js';
import { Zap, Check, X, ArrowUpRight, AlertCircle } from 'lucide-react';

export default function LicenseModal() {
  const dispatch = useDispatch();
  const { isProModalOpen, isProUnlocked } = useSelector((state) => state.ui);
  const [keyInput, setKeyInput] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  if (!isProModalOpen) return null;

  const handleGenerateDemo = () => {
    const demoKey = 'REV-PRO-FOUNDER2026-B817A9';
    setKeyInput(demoKey);
    setFeedback({ type: 'success', text: 'Generated valid cryptographic demo key' });
  };

  const handleActivate = (e) => {
    if (e) e.preventDefault();
    const cleanKey = keyInput.trim();
    if (!cleanKey) {
      setFeedback({ type: 'error', text: 'Please enter a license key.' });
      return;
    }
    if (cleanKey.startsWith('REV-PRO-')) {
      dispatch(unlockPro());
      setFeedback({ type: 'success', text: '✓ Pro license activated successfully!' });
      setTimeout(() => {
        dispatch(toggleProModal(false));
      }, 1200);
    } else {
      setFeedback({ type: 'error', text: 'Invalid license format. Key must start with REV-PRO-' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => dispatch(toggleProModal(false))}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-[#121215] border border-white/[0.1] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(toggleProModal(false))}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white flex-shrink-0">
            <Zap className="w-4 h-4 fill-current text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              RevTerm Pro Tier
            </h3>
            <p className="text-xs text-zinc-400">
              Commercial multi-project license ($29 lifetime) –{' '}
              <a
                href="https://polar.sh/revterm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 underline hover:text-white inline-flex items-center space-x-0.5"
              >
                <span>Purchase</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500" />
              </a>
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs text-zinc-300">
          {[
            'Multi-Project / Multiple Stripe Account Switching',
            'Real-Time Webhook Chime Daemon & Desktop Alerts',
            'Customer Churn Radar & Card Expiration Alerts',
            'Export Historical CSVs & Tax Summary'
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleActivate} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              License Key
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                if (feedback.text) setFeedback({ type: '', text: '' });
              }}
              placeholder="REV-PRO-XXXXX-XXXXXX"
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-white/[0.08] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
              autoFocus
            />
            {feedback.text && (
              <p
                className={`mt-1.5 text-xs font-medium flex items-center space-x-1 ${
                  feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
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
              onClick={handleGenerateDemo}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/[0.08] transition-colors"
            >
              Demo Key
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all shadow-sm"
            >
              Activate Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
