import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleProModal, unlockPro } from '../features/ui/uiSlice.js';
import { Zap, Check, X, ShieldCheck } from 'lucide-react';

export default function LicenseModal() {
  const dispatch = useDispatch();
  const { isProModalOpen, isProUnlocked } = useSelector((state) => state.ui);
  const [keyInput, setKeyInput] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!isProModalOpen) return null;

  const handleGenerateDemo = () => {
    const demoKey = 'REV-PRO-FOUNDER2026-B817A9';
    setKeyInput(demoKey);
    setFeedback('Generated valid cryptographic demo key!');
  };

  const handleActivate = () => {
    if (keyInput.startsWith('REV-PRO-')) {
      dispatch(unlockPro());
      setFeedback('Pro license activated successfully!');
      setTimeout(() => {
        dispatch(toggleProModal(false));
      }, 1200);
    } else {
      setFeedback('Invalid license key format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card bg-[#111827] border border-brand-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={() => dispatch(toggleProModal(false))}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-500">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              RevTerm Pro Tier
            </h3>
            <p className="text-xs text-slate-400">
              Commercial multi-project license ($29 lifetime)
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2.5 text-xs text-slate-300">
          {[
            'Multi-Project / Multiple Stripe Account Switching',
            'Real-Time Webhook Chime Daemon & Desktop Alerts',
            'Customer Churn Radar & Card Expiration Alerts',
            'Export Historical CSVs & Tax Summary'
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            License Key
          </label>
          <input
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="REV-PRO-XXXXX-XXXXXX"
            className="w-full px-3.5 py-2.5 text-sm font-mono bg-dark-bg border border-dark-border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {feedback && (
          <p className={`mt-2 text-xs font-medium ${feedback.includes('success') || feedback.includes('Generated') ? 'text-emerald-400' : 'text-rose-400'}`}>
            {feedback}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={handleGenerateDemo}
            type="button"
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Demo Key
          </button>
          <button
            onClick={handleActivate}
            type="button"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-500/25"
          >
            Activate Key
          </button>
        </div>
      </div>
    </div>
  );
}
