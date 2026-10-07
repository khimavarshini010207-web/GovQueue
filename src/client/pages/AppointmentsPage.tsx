import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  Building2,
  QrCode,
  ArrowRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import { EmptyState } from '../components/EmptyState.js';
import type { Appointment } from '../../shared/types.js';

export const AppointmentsPage: React.FC = () => {
  const { success, error } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');

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

  const handleCheckIn = async (aptId: string) => {
    try {
      await api.checkInAppointment(aptId);
      success('Checked in successfully! Your token is active in the queue.');
      fetchAppointments();
    } catch (err: any) {
      error(err.message || 'Check-in failed');
    }
  };

  const filtered = appointments.filter(a => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'UPCOMING') {
      return a.status === 'CONFIRMED' || a.status === 'CHECKED_IN' || a.status === 'IN_QUEUE';
    }
    if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return a.status === 'CANCELLED' || a.status === 'NO_SHOW';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review your booked civic appointments, access digital queue tokens, and perform check-ins.
          </p>
        </div>

        <Link
          to="/book"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        {(['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-blue-800 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading appointment records..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="You don't have any appointments matching this category."
          actionLabel="Book an Appointment"
          onAction={() => window.location.assign('/book')}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(apt => (
            <div
              key={apt.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-slate-900">{apt.service?.name}</span>
                  <Badge status={apt.status} size="sm" />
                </div>

                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.center?.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{apt.appointmentDate} at {apt.startTime}</span>
                  </div>
                  <div className="text-slate-400">Ref: {apt.bookingReference}</div>
                </div>
              </div>

              {/* Right Side: Token & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {apt.token && (
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">Token</span>
                    <span className="text-base font-black text-blue-950">{apt.token.tokenCode}</span>
                  </div>
                )}

                {apt.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => handleCheckIn(apt.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Check In</span>
                  </button>
                )}

                {apt.token && (apt.status === 'CHECKED_IN' || apt.status === 'IN_QUEUE') && (
                  <Link
                    to={`/queue/${apt.token.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Track Queue</span>
                  </Link>
                )}

                <Link
                  to={`/appointments/${apt.id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
