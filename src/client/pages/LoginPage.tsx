import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Landmark, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, demoLogin } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.fullName}!`);
      if (user.role === 'STAFF') navigate('/staff');
      else if (user.role === 'ADMIN') navigate('/admin');
      else navigate(redirectUrl);
    } catch (err: any) {
      toastError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoCitizen = async () => {
    setLoading(true);
    try {
      const user = await demoLogin('CITIZEN');
      success(`Logged in as ${user.fullName} (Citizen)!`);
      navigate('/dashboard');
    } catch (err: any) {
      toastError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Landmark className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Citizen Sign In</h1>
          <p className="text-xs text-slate-500">
            Sign in to access your appointments, track live digital queue turns, and manage civic records.
          </p>
        </div>

        {/* Citizen Demo Auto-Fill Card */}
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Demo Citizen Account</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Rahul Sharma • Aadhaar Update • Active Token A27
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={handleQuickDemoCitizen}
            className="px-3.5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            1-Click Sign In
          </button>
        </div>

        {/* Traditional Credentials Form */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-blue-500 transition-all">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="citizen@govqueue.demo"
                  className="w-full bg-transparent focus:outline-none text-slate-900 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-blue-500 transition-all">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent focus:outline-none text-slate-900 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-700 hover:text-blue-900">
              Create citizen account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
