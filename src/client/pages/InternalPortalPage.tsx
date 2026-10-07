import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Landmark,
  Shield,
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Building2,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export const InternalPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, internalLogin, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If user is already authenticated:
  if (user) {
    if (user.role === 'STAFF') {
      navigate('/staff', { replace: true });
      return null;
    }
    if (user.role === 'ADMIN') {
      navigate('/admin', { replace: true });
      return null;
    }

    // User is CITIZEN: Deny access!
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              403 Restricted Access
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Access Restricted
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are currently signed in as a <span className="font-bold text-slate-900">Citizen</span> ({user.fullName}).
              Citizen accounts are not authorized to access internal administrative operations or staff consoles.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-1.5 text-xs">
            <div className="font-semibold text-slate-800">Account Details:</div>
            <div className="text-slate-600 text-[11px] truncate">Email: {user.email}</div>
            <div className="text-slate-600 text-[11px]">Role: {user.role}</div>
            <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>All unauthorized access attempts are logged in the regulatory security audit.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              to="/dashboard"
              className="flex-1 py-2.5 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors text-center cursor-pointer"
            >
              Return to Citizen Dashboard
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                setErrorMsg(null);
              }}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const loggedUser = await internalLogin(email, password);
      success(`Welcome to Internal Portal, ${loggedUser.fullName}!`);
      if (loggedUser.role === 'STAFF') {
        navigate('/staff');
      } else if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        setErrorMsg('Unauthorized: Citizen accounts cannot enter the internal portal.');
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid administrative credentials.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, roleName: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const loggedUser = await internalLogin(demoEmail, 'Demo@123');
      success(`Authenticated as ${loggedUser.fullName} (${roleName})`);
      if (loggedUser.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      const msg = err.message || 'Internal authentication failed.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md border border-slate-700">
            <Landmark className="w-7 h-7 text-amber-300" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider">
            <Shield className="w-3 h-3 text-blue-700" />
            <span>GovQueue AI • Restricted Personnel Portal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Internal Operations Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Authorized access only for Service Officers, Desk Supervisors, and System Administrators.
          </p>
        </div>

        {/* Quick Demo Access for Officers & Admins */}
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-5 shadow-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Authorized Demo Access</span>
            </span>
            <span className="text-[10px] text-slate-400">Personnel Roster</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('staff@govqueue.demo', 'Staff Officer')}
              className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-left border border-slate-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">Priya Verma</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-teal-900/80 text-teal-300 rounded border border-teal-700/50">
                  Staff
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Service Desk Officer</div>
              <div className="text-[10px] text-teal-400 font-semibold mt-1 group-hover:underline">
                Sign In as Staff →
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('admin@govqueue.demo', 'Administrator')}
              className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-left border border-slate-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">Rajesh Kumar</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-900/80 text-purple-300 rounded border border-purple-700/50">
                  Admin
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">District Administrator</div>
              <div className="text-[10px] text-purple-400 font-semibold mt-1 group-hover:underline">
                Sign In as Admin →
              </div>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Official Government Email
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-blue-500 transition-all">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="officer@govqueue.demo"
                  className="w-full bg-transparent focus:outline-none text-slate-900 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Security Password
              </label>
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
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Notice: All transactions and access events are recorded and subject to regulatory oversight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
