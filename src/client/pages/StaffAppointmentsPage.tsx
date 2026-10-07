import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { Appointment } from '../../shared/types.js';

export const StaffAppointmentsPage: React.FC = () => {
  const { success, error } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTodayAppointments = async () => {
    try {
      const data = await api.getAppointments({ date: '2026-10-07' });
      setAppointments(data);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const handleCheckIn = async (id: string) => {
    try {
      await api.checkInAppointment(id);
      success('Citizen checked in! Token is now WAITING in queue.');
      fetchTodayAppointments();
    } catch (err: any) {
      error(err.message || 'Check-in failed');
    }
  };

  const filtered = appointments.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.citizen?.fullName.toLowerCase().includes(q) ||
      a.bookingReference.toLowerCase().includes(q) ||
      a.service?.name.toLowerCase().includes(q) ||
      (a.token?.tokenCode && a.token.tokenCode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/staff" className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Queue Desk</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Today's Citizen Appointments</h1>
          <p className="text-xs text-slate-500">Reception Check-in Ledger for 7 October 2026</p>
        </div>

        <button
          type="button"
          onClick={fetchTodayAppointments}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-w-md">
        <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search citizen name, token, reference..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading appointment roster..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ref / Token</th>
                  <th className="py-3 px-4">Citizen</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Counter Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No appointments matching search.
                    </td>
                  </tr>
                ) : (
                  filtered.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{apt.bookingReference}</div>
                        {apt.token && (
                          <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            {apt.token.tokenCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {apt.citizen?.fullName}
                        <div className="text-[11px] text-slate-400 font-normal">{apt.citizen?.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{apt.service?.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">{apt.startTime}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={apt.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {apt.status === 'CONFIRMED' ? (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(apt.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Check-In</span>
                          </button>
                        ) : apt.status === 'CHECKED_IN' || apt.status === 'IN_QUEUE' ? (
                          <span className="text-[11px] text-amber-700 font-semibold">In Queue</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">{apt.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
