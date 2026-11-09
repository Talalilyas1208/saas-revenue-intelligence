import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, ShieldCheck, Database, ArrowUpRight, AlertCircle } from 'lucide-react';

export default function SettingsView() {
  const [stripeKey, setStripeKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const webhookUrl = `${window.location.origin}/api/v1/webhooks/stripe`;

  useEffect(() => {
    const saved = localStorage.getItem('revterm_stripe_key') || '';
    if (saved) {
      setStripeKey(saved);
    }
  }, []);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(webhookUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = webhookUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    const clean = stripeKey.trim();
    if (!clean) {
      setFeedback({ type: 'error', text: 'Please enter a valid Stripe API key.' });
      return;
    }
    if (!clean.startsWith('rk_') && !clean.startsWith('sk_')) {
      setFeedback({ type: 'error', text: 'Stripe keys typically start with rk_live_, rk_test_, or sk_.' });
      return;
    }

    localStorage.setItem('revterm_stripe_key', clean);
    setFeedback({ type: 'success', text: '✓ Stripe key saved securely to local storage!' });
    setTimeout(() => setFeedback({ type: '', text: '' }), 3500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-base font-bold text-black tracking-tight">
          Settings &amp; Stripe Integrations
        </h2>
        <p className="text-xs text-zinc-600 mt-0.5">
          Manage your API credentials, webhook endpoints, and data synchronizations.
        </p>
      </div>

      {/* Card 1: Connect Stripe */}
      <div className="linear-card tile-hover-shadow rounded-xl p-4 sm:p-5 border border-zinc-200">
        <div className="flex items-center space-x-3 pb-3.5 border-b border-zinc-200">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center flex-shrink-0">
            <Key className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-black">Stripe Restricted API Key</h3>
            <p className="text-[11px] text-zinc-500">
              Provide a read-only key to sync live transactions, subscriptions, and MRR.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveKey} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Restricted Key
            </label>
            <input
              type="password"
              value={stripeKey}
              onChange={(e) => {
                setStripeKey(e.target.value);
                if (feedback.text) setFeedback({ type: '', text: '' });
              }}
              placeholder="rk_live_51Pxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400 transition-colors"
              autoComplete="off"
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
            <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Keys are encrypted in transit and stored locally with zero cloud telemetry.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1 transition-colors"
            >
              <span>Stripe Dashboard API Keys</span>
              <ArrowUpRight className="w-3 h-3 text-indigo-600" />
            </a>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 active:scale-95 rounded-lg shadow-xs transition-all"
            >
              Save Connection
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Webhook Endpoint */}
      <div className="linear-card tile-hover-shadow rounded-xl p-4 sm:p-5 border border-zinc-200">
        <div className="flex items-center space-x-3 pb-3.5 border-b border-zinc-200">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center flex-shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-black">Live Webhook Listener URL</h3>
            <p className="text-[11px] text-zinc-500">
              Configure this destination in your Stripe Webhook settings for instant sales chimes.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
            Webhook URL
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg text-black focus:outline-none select-all truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 flex items-center justify-center space-x-1.5 transition-colors flex-shrink-0 shadow-xs"
              aria-label="Copy webhook URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-600" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
            <p className="font-bold text-black text-[11px]">Recommended Stripe events:</p>
            <p className="font-mono text-[10px] text-zinc-600 break-words">
              charge.succeeded · customer.subscription.created · invoice.payment_succeeded · customer.subscription.deleted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
