import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateProfile({ fullName, phone });
      await refreshUser();
      success('Profile details updated successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Citizen Profile</h1>
        <p className="text-xs text-slate-500">Manage your contact details and view authentication privileges.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-800 font-black text-2xl flex items-center justify-center">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user.fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={user.role} size="sm" />
              <span className="text-xs text-slate-400">UID: {user.id.slice(0, 16)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-blue-500 transition-all">
              <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Registered Email Address</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Email is primary identity key and cannot be altered.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-blue-500 transition-all">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Update Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
