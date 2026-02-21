import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Plane, Mail, Lock, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface SignInProps {
  onSwitch: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSwitch }) => {
  const [view, setView] = useState<'signin' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  if (view === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fadeIn">
          <div className="bg-slate-800 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4">
              <Lock className="text-orange-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-slate-300 text-sm mt-1">We'll send you a recovery link</p>
          </div>

          <div className="p-8 space-y-6">
            {resetSent ? (
              <div className="text-center space-y-4 py-4 animate-fadeIn">
                <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-800">Check Your Email</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    A password reset link has been sent to <span className="font-bold text-slate-700">{email}</span>.
                  </p>
                </div>
                <button
                  onClick={() => { setView('signin'); setResetSent(false); }}
                  className="w-full py-3 text-blue-600 font-bold hover:underline text-sm"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm animate-shake">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => setView('signin')}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4">
            <Plane className="text-orange-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-blue-100 text-sm mt-1">Sign in to JS Lanka Travels</p>
        </div>

        <form onSubmit={handleSignIn} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="admin@jslankatravels.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="px-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end px-1 pt-1">
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
                >
                  Forgot?
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm animate-shake">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitch}
                className="text-orange-500 font-bold hover:underline"
              >
                Sign Up Now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;