import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToken, setActiveOrgId } from '../features/ui/uiSlice.js';
import {
  useGetAuthStatusQuery,
  useLoginMutation,
  useRegisterMutation
} from '../app/apiSlice.js';
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthScreen() {
  const dispatch = useDispatch();
  const { data: authStatus } = useGetAuthStatusQuery();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  useEffect(() => {
    if (authStatus && authStatus.hasUsers === false) {
      setIsRegisterMode(true);
    }
  }, [authStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (isRegisterMode) {
        const res = await register({ name, workspaceName, email, password }).unwrap();
        if (res.data?.organization?.id) {
          dispatch(setActiveOrgId(res.data.organization.id));
        }
        dispatch(setToken(res.data.token));
      } else {
        const res = await login({ email, password }).unwrap();
        dispatch(setToken(res.data.token));
      }
    } catch (err) {
      setErrorMsg(err?.data?.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const isLoading = isLoggingIn || isRegistering;

  return (
    <div className="min-h-screen bg-[#f4f4f6] bg-grid-pattern flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center p-1.5 shadow-xs">
            <img
              src="/assets/logo.svg"
              alt="RevTerm Logo"
              width="24"
              height="24"
              className="w-6 h-6"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-black tracking-tight">
              {isRegisterMode ? 'Create Your RevTerm Workspace' : 'Sign in to RevTerm'}
            </h1>
            <p className="text-xs text-zinc-500">
              {isRegisterMode
                ? 'Set up your founder account to connect live Stripe billing.'
                : 'Access your live SaaS revenue telemetry and subscriber directory.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Founder"
                  required
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Company / Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Acme SaaS Inc"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@company.com"
              required
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-bold rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50"
          >
            <span>{isLoading ? 'Processing...' : isRegisterMode ? 'Launch Workspace' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
          <span className="text-zinc-500">
            {isRegisterMode ? 'Already have an account?' : 'Need a new workspace?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg('');
            }}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            {isRegisterMode ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <p className="mt-4 text-[11px] text-zinc-400 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secured with bcrypt &amp; JWT authentication</span>
        </p>
      </div>
    </div>
  );
}
