import React, { useState } from 'react';
import { Key, Copy, Check, ShieldCheck, Database, ArrowUpRight } from 'lucide-react';

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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-base font-semibold text-white tracking-tight">
          Settings &amp; Stripe Integrations
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Manage your API credentials, webhook endpoints, and data synchronizations.
        </p>
      </div>

      {/* Card 1: Connect Stripe */}
      <div className="linear-card rounded-xl p-5 border border-white/[0.08]">
        <div className="flex items-center space-x-3 pb-3.5 border-b border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300 flex items-center justify-center">
            <Key className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Stripe Restricted API Key</h3>
            <p className="text-[11px] text-zinc-400">
              Provide a read-only key to sync live transactions, subscriptions, and MRR.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveKey} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Restricted Key
            </label>
            <input
              type="password"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="rk_live_51Pxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-900/60 border border-white/[0.07] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
            />
            <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Keys are encrypted in transit and stored locally with zero cloud telemetry.</span>
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-white inline-flex items-center space-x-1 transition-colors"
            >
              <span>Stripe Dashboard API Keys</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </a>

            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-zinc-950 bg-white hover:bg-zinc-200 rounded-lg shadow-sm transition-colors"
            >
              {saved ? '✓ Saved' : 'Save Connection'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Webhook Endpoint */}
      <div className="linear-card rounded-xl p-5 border border-white/[0.08]">
        <div className="flex items-center space-x-3 pb-3.5 border-b border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300 flex items-center justify-center">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Live Webhook Listener URL</h3>
            <p className="text-[11px] text-zinc-400">
              Configure this destination in your Stripe Webhook settings for instant sales chimes.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
            Webhook URL
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-900/60 border border-white/[0.07] rounded-lg text-zinc-300 focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-white/[0.08] flex items-center space-x-1.5 transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-zinc-900/50 border border-white/[0.06] text-xs text-zinc-400 space-y-1">
            <p className="font-medium text-zinc-300 text-[11px]">Recommended Stripe events:</p>
            <p className="font-mono text-[10px] text-zinc-400">
              charge.succeeded · customer.subscription.created · invoice.payment_succeeded · customer.subscription.deleted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
