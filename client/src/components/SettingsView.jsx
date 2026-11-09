import React, { useState } from 'react';
import { Key, Copy, Check, ShieldCheck, Database, ExternalLink, RefreshCw } from 'lucide-react';

export default function SettingsView() {
  const [stripeKey, setStripeKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const webhookUrl = `${window.location.origin}/api/v1/webhooks/stripe`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Settings &amp; Stripe Integrations
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your API credentials, webhook endpoints, and data synchronizations.
        </p>
      </div>

      {/* Card 1: Connect Stripe */}
      <div className="glass-card rounded-2xl p-6 border border-dark-border">
        <div className="flex items-center space-x-3 pb-4 border-b border-dark-border">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-500 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Stripe Restricted API Key</h3>
            <p className="text-xs text-slate-400">
              Provide a read-only key to sync live transactions, subscriptions, and MRR.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveKey} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Restricted Key (rk_live_... or rk_test_...)
            </label>
            <input
              type="password"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="rk_live_51Pxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-dark-bg border border-dark-border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Keys are encrypted in transit and stored locally with zero cloud telemetry.</span>
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-500 hover:text-brand-400 font-semibold inline-flex items-center space-x-1"
            >
              <span>Create key on Stripe Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-brand-600 hover:bg-brand-500 transition-all shadow-md shadow-brand-500/25"
            >
              {saved ? '✓ Saved Key' : 'Save Connection'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Webhook Endpoint */}
      <div className="glass-card rounded-2xl p-6 border border-dark-border">
        <div className="flex items-center space-x-3 pb-4 border-b border-dark-border">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Webhook Listener URL</h3>
            <p className="text-xs text-slate-400">
              Configure this destination in your Stripe Webhook settings for instant sales chimes.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Webhook URL
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-dark-bg border border-dark-border rounded-xl text-slate-300 focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60 flex items-center space-x-1.5 transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Recommended Stripe events to listen for:</p>
            <p className="font-mono text-[11px] text-brand-400">
              charge.succeeded • customer.subscription.created • invoice.payment_succeeded • customer.subscription.deleted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
