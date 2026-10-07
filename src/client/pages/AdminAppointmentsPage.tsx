import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  Filter,
  ArrowLeft,
  Building2,
  Clock,
  User as UserIcon,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { Appointment } from '../../shared/types.js';

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchAppointments = async () => {
    try {
      const data = await api.getAppointments();
      setAppointments(data);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filtered = appointments.filter(a => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.bookingReference.toLowerCase().includes(q) ||
      (a.citizen?.fullName && a.citizen.fullName.toLowerCase().includes(q)) ||
      (a.service?.name && a.service.name.toLowerCase().includes(q)) ||
      (a.token?.tokenCode && a.token.tokenCode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Console</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">System Appointments Ledger</h1>
          <p className="text-xs text-slate-500">Cross-center citizen bookings, references, and slot fulfillment records.</p>
        </div>

        <button
          type="button"
          onClick={fetchAppointments}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-500 transition-all flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reference, citizen name, token code..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CHECKED_IN">CHECKED_IN</option>
          <option value="IN_QUEUE">IN_QUEUE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="NO_SHOW">NO_SHOW</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving appointments registry..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Citizen</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Center</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {a.bookingReference}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {a.citizen?.fullName}
                      <div className="text-[11px] text-slate-400 font-normal">{a.citizen?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{a.service?.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{a.center?.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{a.appointmentDate}</span>
                      <div className="text-[11px] text-slate-500 font-mono">{a.startTime}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {a.token ? (
                        <span className="font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                          {a.token.tokenCode}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge status={a.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
