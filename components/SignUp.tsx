
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Loader2, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';

interface SignUpProps {
  onSwitch: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      // If data.session is null, it means email confirmation is required.
      // App.tsx handles the view logic based on auth state, 
      // so if no session is returned, we stay here and show the success state.
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-orange-500 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-orange-50 text-sm mt-1">Start managing your flight business</p>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-6 animate-fadeIn">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Registration Successful!</h3>
                <p className="text-slate-500 leading-relaxed">
                  We've sent a verification link to <span className="font-bold text-slate-700">{email}</span>.
                </p>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm font-medium">
                  Check your email and confirm your account before logging in.
                </div>
              </div>
            </div>
            <button
              onClick={onSwitch}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 px-1">Minimum 6 characters required.</p>
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
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitch}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
