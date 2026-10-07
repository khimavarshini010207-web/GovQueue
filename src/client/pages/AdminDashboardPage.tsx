import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  FileText,
  TrendingUp,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { api } from '../services/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { AnalyticsSummary } from '../../shared/types.js';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminAnalytics()
      .then(data => setAnalytics(data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Compiling executive administrative analytics..." />;
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Unable to load administrative analytics.
      </div>
    );
  }

  const COLORS = ['#1d4ed8', '#059669', '#d97706', '#7c3aed', '#db2777'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Executive Analytics & Operations
          </h1>
          <p className="text-xs text-slate-500">
            Real-time public service metrics aggregated directly from PostgreSQL database records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            Users & Roles
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            Audit Trail
          </Link>
          <Link
            to="/admin/services"
            className="px-4 py-2 bg-blue-800 hover:bg-blue-900 rounded-xl text-xs font-semibold text-white shadow-2xs transition-colors"
          >
            Manage Services
          </Link>
        </div>
      </div>

      {/* Primary KPI Stat Cards (Prompt Section 19) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Appointments Today
          </span>
          <span className="text-2xl font-black text-slate-900">{analytics.appointmentsToday}</span>
        </div>

        <div className="p-4 bg-white border border-emerald-200 rounded-2xl shadow-xs bg-emerald-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
            Completed Today
          </span>
          <span className="text-2xl font-black text-emerald-800">{analytics.completedToday}</span>
        </div>

        <div className="p-4 bg-white border border-amber-200 rounded-2xl shadow-xs bg-amber-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
            In Queue / Waiting
          </span>
          <span className="text-2xl font-black text-amber-800">{analytics.waitingToday}</span>
        </div>

        <div className="p-4 bg-white border border-rose-200 rounded-2xl shadow-xs bg-rose-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
            Cancelled
          </span>
          <span className="text-2xl font-black text-rose-800">{analytics.cancelledToday}</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            No-Shows
          </span>
          <span className="text-2xl font-black text-slate-700">{analytics.noShowToday}</span>
        </div>

        <div className="p-4 bg-white border border-blue-200 rounded-2xl shadow-xs bg-blue-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
            Active Centers
          </span>
          <span className="text-2xl font-black text-blue-800">{analytics.activeCenters}</span>
        </div>

        <div className="p-4 bg-white border border-purple-200 rounded-2xl shadow-xs bg-purple-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
            Active Services
          </span>
          <span className="text-2xl font-black text-purple-800">{analytics.activeServices}</span>
        </div>
      </div>

      {/* Secondary Efficiency Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Average Queue Wait Time</span>
            <div className="text-3xl font-black mt-1">{analytics.averageWaitMinutes} Minutes</div>
            <p className="text-[11px] text-blue-200 mt-1">Calculated deterministically from queue token lifetimes.</p>
          </div>
          <Clock className="w-10 h-10 text-amber-400 opacity-80" />
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Service Completion Rate</span>
            <div className="text-3xl font-black mt-1">{analytics.completionRatePercentage}%</div>
            <p className="text-[11px] text-emerald-200 mt-1">Percentage of non-cancelled citizen appointments fulfilled.</p>
          </div>
          <CheckCircle2 className="w-10 h-10 text-emerald-300 opacity-80" />
        </div>
      </div>

      {/* Recharts Charts Grid (Prompt Section 19) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Appointments by Day */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Appointments by Day (Past 7 Days)</h3>
            <p className="text-[11px] text-slate-500">Total bookings vs completed sessions.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.appointmentsByDay}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Total Booked" stroke="#1d4ed8" fillOpacity={1} fill="url(#colorCount)" />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#059669" fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Appointments by Service */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Appointments by Service</h3>
            <p className="text-[11px] text-slate-500">Distribution across top government services.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.appointmentsByService} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" width={110} stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" name="Appointments" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Appointments by Center */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Appointments by Service Center</h3>
            <p className="text-[11px] text-slate-500">Facility volume across District, Mandal, and Regional hubs.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.appointmentsByCenter}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Appointments" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Hourly Queue Length Trend */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hourly Queue Load Trend</h3>
            <p className="text-[11px] text-slate-500">Peak waiting volume progression through operational hours.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.queueLengthTrend}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="waiting" name="Citizens Waiting" stroke="#d97706" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
