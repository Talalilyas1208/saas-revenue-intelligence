import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  useUpdateProfileMutation,
  useUpdateOrganizationKeyMutation,
  useSyncStripeMutation
} from '../app/apiSlice.js';
import { Key, Copy, Check, ShieldCheck, Database, ArrowUpRight, AlertCircle, User, RefreshCw } from 'lucide-react';

export default function SettingsView({ user, currentOrg, database }) {
  const { activeOrgId } = useSelector((state) => state.ui);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [stripeKey, setStripeKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({ type: '', text: '' });
  const [keyFeedback, setKeyFeedback] = useState({ type: '', text: '' });

  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const [updateOrganizationKey, { isLoading: isSavingKey }] = useUpdateOrganizationKeyMutation();
  const [syncStripe, { isLoading: isSyncing }] = useSyncStripeMutation();

  const webhookUrl = `${window.location.origin}/api/v1/webhooks/stripe`;

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user?.name]);

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const clean = displayName.trim();
    if (!clean) {
      setProfileFeedback({ type: 'error', text: 'Display name cannot be empty.' });
      return;
    }
    try {
      await updateProfile({ name: clean }).unwrap();
      setProfileFeedback({ type: 'success', text: '✓ Profile updated!' });
      setTimeout(() => setProfileFeedback({ type: '', text: '' }), 3000);
    } catch {
      setProfileFeedback({ type: 'error', text: 'Failed to update profile.' });
    }
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    const clean = stripeKey.trim();
    if (!clean) {
      setKeyFeedback({ type: 'error', text: 'Please enter a valid Stripe API key.' });
      return;
    }
    if (!clean.startsWith('rk_') && !clean.startsWith('sk_')) {
      setKeyFeedback({ type: 'error', text: 'Stripe keys must start with rk_live_, rk_test_, sk_live_, or sk_test_.' });
      return;
    }

    try {
      const targetOrgId = currentOrg?.id || activeOrgId;
      const res = await updateOrganizationKey({ id: targetOrgId, stripeApiKey: clean }).unwrap();
      setStripeKey('');
      const stats = res.data || {};
      setKeyFeedback({
        type: 'success',
        text: `✓ Verified with Stripe & synced ${stats.customersSynced ?? 0} subscriptions and ${stats.transactionsSynced ?? 0} charges!`
      });
    } catch (err) {
      setKeyFeedback({
        type: 'error',
        text: err?.data?.error || 'Stripe rejected this key. Please verify permissions.'
      });
    }
  };

  const handleManualSync = async () => {
    const targetOrgId = currentOrg?.id || activeOrgId;
    try {
      const res = await syncStripe(targetOrgId).unwrap();
      const stats = res.data || {};
      setKeyFeedback({
        type: 'success',
        text: `✓ Synced ${stats.customersSynced ?? 0} subscriptions and ${stats.transactionsSynced ?? 0} new charges from Stripe.`
      });
    } catch (err) {
      setKeyFeedback({
        type: 'error',
        text: err?.data?.error || 'Stripe sync failed.'
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-base font-bold text-neutral-950 tracking-tight">
          Settings &amp; Integrations
        </h2>
        <p className="text-xs text-neutral-600 mt-0.5">
          Manage your profile, live Stripe API credentials, and webhook endpoints.
        </p>
      </div>

      {/* Card 0: User Profile */}
      <div className="linear-card tile-hover-shadow rounded-xl p-4 sm:p-5 border border-neutral-200">
        <div className="flex items-center space-x-3 pb-3.5 border-b border-neutral-200">
          <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-950">Founder Profile</h3>
            <p className="text-[11px] text-neutral-500">
              Personalize your dashboard greeting and account details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (profileFeedback.text) setProfileFeedback({ type: '', text: '' });
                }}
                placeholder="Your Name"
                className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-neutral-200 rounded-lg text-neutral-950 focus:bg-white focus:outline-none focus:border-neutral-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-all disabled:opacity-50"
            >
              {isSavingProfile ? 'Saving...' : 'Update Name'}
            </button>
          </div>
          {profileFeedback.text && (
            <p className={`text-xs font-semibold ${profileFeedback.type === 'success' ? 'text-neutral-900' : 'text-neutral-600'}`}>
              {profileFeedback.text}
            </p>
          )}
        </form>
      </div>

      {/* Card 1: Connect Live Stripe */}
      <div className="linear-card tile-hover-shadow rounded-xl p-4 sm:p-5 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center flex-shrink-0">
              <Key className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-950">
                Live Stripe API Connection ({currentOrg?.name || 'Workspace'})
              </h3>
              <p className="text-[11px] text-neutral-500">
                Verifies directly with Stripe API and imports live subscriptions and charges.
              </p>
            </div>
          </div>
          {currentOrg?.hasStripeKey && (
            <span className="text-[10px] font-mono font-semibold text-white bg-neutral-900 border border-neutral-900 px-2 py-0.5 rounded self-start sm:self-auto">
              Connected: {currentOrg.maskedStripeKey}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveKey} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Restricted / Secret API Key
            </label>
            <input
              type="password"
              value={stripeKey}
              onChange={(e) => {
                setStripeKey(e.target.value);
                if (keyFeedback.text) setKeyFeedback({ type: '', text: '' });
              }}
              placeholder={currentOrg?.hasStripeKey ? 'Enter new key to replace existing...' : 'rk_live_51P... or sk_live_51P...'}
              className="w-full px-3 py-2 text-xs font-mono bg-[#F5F5F5] border border-neutral-200 rounded-lg text-neutral-950 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400 transition-colors"
              autoComplete="off"
            />
            {keyFeedback.text && (
              <p className="mt-1.5 text-xs font-semibold text-neutral-900 flex items-center space-x-1">
                {keyFeedback.type === 'error' && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{keyFeedback.text}</span>
              </p>
            )}
            <p className="text-[11px] text-neutral-500 mt-1.5 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-800 flex-shrink-0" />
              <span>Recommended permissions: Read access to Balance, Charges, Customers, and Subscriptions.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-900 hover:text-neutral-600 font-semibold inline-flex items-center space-x-1 transition-colors underline"
            >
              <span>Create key on Stripe Dashboard</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {currentOrg?.hasStripeKey && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              )}
              <button
                type="submit"
                disabled={isSavingKey}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-95 rounded-lg shadow-xs transition-all disabled:opacity-50"
              >
                {isSavingKey ? 'Verifying & Syncing...' : 'Verify & Connect'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Card 2: Webhook Endpoint */}
      <div className="linear-card tile-hover-shadow rounded-xl p-4 sm:p-5 border border-neutral-200">
        <div className="flex items-center space-x-3 pb-3.5 border-b border-neutral-200">
          <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center flex-shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-950">Live Webhook Listener URL</h3>
            <p className="text-[11px] text-neutral-500">
              Add this endpoint in Stripe Developers → Webhooks with STRIPE_WEBHOOK_SECRET configured.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
            Webhook URL
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="w-full px-3 py-2 text-xs font-mono bg-[#F5F5F5] border border-neutral-200 rounded-lg text-neutral-950 focus:outline-none select-all truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 flex items-center justify-center space-x-1.5 transition-colors flex-shrink-0 shadow-xs"
              aria-label="Copy webhook URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-neutral-900" /> : <Copy className="w-3.5 h-3.5 text-neutral-600" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-[#F5F5F5] border border-neutral-200 text-xs text-neutral-600 space-y-1">
            <p className="font-bold text-neutral-950 text-[11px]">Stripe events handled automatically:</p>
            <p className="font-mono text-[10px] text-neutral-600 break-words">
              charge.succeeded · charge.failed · invoice.payment_succeeded · customer.subscription.created · customer.subscription.updated · customer.subscription.deleted
            </p>
          </div>
        </div>
      </div>

      {/* Card 3: Supabase / Database Backend Status */}
      <div className="linear-card tile-hover-shadow rounded-xl p-4 sm:p-5 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center flex-shrink-0">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-950">Supabase PostgreSQL Backend</h3>
              <p className="text-[11px] text-neutral-500">
                Database engine &amp; SSL status (credentials stay strictly in server environment variables).
              </p>
            </div>
          </div>

          {database?.dialect === 'postgres' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-neutral-900 border border-neutral-900 px-2.5 py-1 rounded self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>{database.isSupabase ? 'Supabase Postgres Connected' : 'PostgreSQL Connected'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-800 bg-neutral-100 border border-neutral-300 px-2.5 py-1 rounded self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <span>Local SQLite Fallback</span>
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2.5 text-xs text-neutral-600">
          {database?.dialect === 'postgres' ? (
            <p className="text-neutral-900 font-medium flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>
                Connected to {database.isSupabase ? 'Supabase Postgres' : 'PostgreSQL'} with SSL {database.sslEnabled ? 'enabled' : 'disabled'}. Run{' '}
                <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded text-black">supabase/schema.sql</code> in Supabase SQL Editor to lock down public Data API access.
              </span>
            </p>
          ) : (
            <div className="p-3 rounded-lg bg-[#F5F5F5] border border-neutral-200 space-y-1.5">
              <p className="font-semibold text-neutral-950 text-[11px]">To switch from local SQLite to Supabase Postgres:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-600">
                <li>Copy <code className="font-mono bg-neutral-200/70 px-1 rounded text-black">server/.env.example</code> to gitignored <code className="font-mono bg-neutral-200/70 px-1 rounded text-black">server/.env</code>.</li>
                <li>Set <code className="font-mono bg-neutral-200/70 px-1 rounded text-black">SUPABASE_DB_URL</code> to your Supabase Session/Transaction Pooler URI.</li>
                <li>Restart the server and execute <code className="font-mono bg-neutral-200/70 px-1 rounded text-black">supabase/schema.sql</code> in your Supabase SQL Editor.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
