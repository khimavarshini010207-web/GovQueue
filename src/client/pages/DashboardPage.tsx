import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import { GovGuideChat } from '../components/GovGuideChat.js';
import type { Appointment, Notification } from '../../shared/types.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([api.getAppointments(), api.getNotifications()])
      .then(([aptList, notifRes]) => {
        setAppointments(aptList);
        setNotifications(notifRes.notifications.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading citizen dashboard..." />;
  }

  // Find upcoming active appointment (e.g. Rahul Sharma's Aadhaar update or newest confirmed)
  const activeAppointment = appointments.find(
    a => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN' || a.status === 'IN_QUEUE'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              National Citizen Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Citizen'}
          </h1>
          <p className="text-xs text-blue-100">
            Monitor your civic appointments, track digital queue tokens, and access administrative services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>GovGuide AI</span>
          </button>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-xs transition-colors backdrop-blur-xs"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book Service</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions (Section 28) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/book"
          className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-900">Book Appointment</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Select time slot</span>
        </Link>

        <Link
          to="/services"
          className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Search className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-900">Find a Service</span>
          <span className="text-[11px] text-slate-500 mt-0.5">10+ civic categories</span>
        </Link>

        <Link
          to="/appointments"
          className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Clock className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-900">My Appointments</span>
          <span className="text-[11px] text-slate-500 mt-0.5">History & slips</span>
        </Link>

        {activeAppointment?.token ? (
          <Link
            to={`/queue/${activeAppointment.token.id}`}
            className="p-5 bg-white border border-blue-200 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-900">Track Queue</span>
            <span className="text-[11px] text-blue-700 font-semibold mt-0.5">
              Token {activeAppointment.token.tokenCode}
            </span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-900">GovGuide AI</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Advisory assistant</span>
          </button>
        )}
      </div>

      {/* Primary Upcoming Appointment & Active Queue Widget */}
      {activeAppointment && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Active Civic Appointment
              </span>
              <h2 className="text-xl font-bold text-slate-900">{activeAppointment.service?.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge status={activeAppointment.status} />
              {activeAppointment.token && (
                <span className="px-2.5 py-1 text-xs font-black bg-blue-900 text-white rounded-lg">
                  Token: {activeAppointment.token.tokenCode}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 text-xs">
              <span className="text-slate-500 block font-medium">Service Center & Desk</span>
              <div className="flex items-start gap-2 text-slate-800 font-semibold">
                <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>{activeAppointment.center?.name}</span>
              </div>
              <p className="text-slate-500 pl-6">{activeAppointment.center?.address}</p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-500 block font-medium">Scheduled Date & Time</span>
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  {activeAppointment.appointmentDate} at {activeAppointment.startTime}
                </span>
              </div>
              <p className="text-slate-500 pl-6">Ref: {activeAppointment.bookingReference}</p>
            </div>

            {/* Live Queue Action Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 mb-1">
                  Live Queue Position
                </div>
                <div className="text-lg font-black text-blue-950">
                  {activeAppointment.token?.tokenCode || 'Pending Token'}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Watch live progression to avoid in-person queue waiting.
                </p>
              </div>

              {activeAppointment.token ? (
                <Link
                  to={`/queue/${activeAppointment.token.id}`}
                  className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open Live Queue Tracker</span>
                </Link>
              ) : (
                <Link
                  to={`/appointments/${activeAppointment.id}`}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-medium"
                >
                  <span>View Details</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid: Recent Appointments & In-App Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Appointments</h3>
            <Link to="/appointments" className="text-xs font-semibold text-blue-700 hover:text-blue-900">
              View all
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              You do not have any recorded appointments.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.slice(0, 5).map(apt => (
                <div
                  key={apt.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{apt.service?.name}</span>
                      <Badge status={apt.status} size="sm" />
                    </div>
                    <div className="text-slate-500 flex items-center gap-3">
                      <span>{apt.center?.name}</span>
                      <span>•</span>
                      <span>{apt.appointmentDate} at {apt.startTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.token && (
                      <Link
                        to={`/queue/${apt.token.id}`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Queue {apt.token.tokenCode}
                      </Link>
                    )}
                    <Link
                      to={`/appointments/${apt.id}`}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-700" />
              <span>In-App Notifications</span>
            </h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No recent notifications.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{n.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GovGuide AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <GovGuideChat onClose={() => setShowAiModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
