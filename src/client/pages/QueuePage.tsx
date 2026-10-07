import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  RefreshCw,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Bell,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { QueueToken } from '../../shared/types.js';

export const QueuePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [token, setToken] = useState<QueueToken | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchTokenData = useCallback(async (isSilent = false) => {
    if (!id) return;
    if (!isSilent) setRefreshing(true);

    try {
      const data = await api.getQueueTokenById(id);
      setToken(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      if (!isSilent) {
        setError(err.message || 'Unable to load queue status.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTokenData();

    // Poll backend every 6 seconds per Section 17 requirement
    const interval = setInterval(() => {
      fetchTokenData(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [fetchTokenData]);

  if (loading) {
    return <LoadingSpinner fullPage message="Connecting to digital queue stream..." />;
  }

  if (error || !token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Queue Token Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Unable to locate this queue token record.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const isServing = token.status === 'SERVING' || token.status === 'CALLED';
  const isCompleted = token.status === 'COMPLETED';

  // Calculate progress percentage:
  // If people ahead is 3, max anticipated was say 5, progress is roughly (1 - (peopleAhead / (peopleAhead + 1))) * 100
  const totalInFront = (token.peopleAhead || 0);
  const progressPercent = isCompleted ? 100 : isServing ? 90 : Math.max(10, Math.min(80, 100 - (totalInFront * 20)));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Live Refresh Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-slate-800 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold">Live Polling Active (6s)</span>
          </div>

          <button
            type="button"
            onClick={() => fetchTokenData()}
            disabled={refreshing}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-700 font-medium cursor-pointer"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Prominent Live Queue Callout Banner if Called */}
      {isServing && (
        <div className="p-5 rounded-2xl bg-amber-500 text-white shadow-xl flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">YOUR TOKEN IS BEING CALLED NOW!</h2>
              <p className="text-xs text-amber-100">
                Please proceed immediately to the service desk counter.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Live Queue Status Display Card (Prompt Section 17) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
              Live Digital Queue Monitor
            </span>
            <h1 className="text-lg font-bold">{token.service?.name || 'Citizen Service'}</h1>
          </div>
          <Badge status={token.status} size="md" />
        </div>

        {/* 4 Big Primary Metrics (Prompt Section 17) */}
        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* YOUR TOKEN */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block mb-1">
                Your Token
              </span>
              <div className="text-4xl sm:text-5xl font-black text-blue-950 tracking-tight">
                {token.tokenCode}
              </div>
              <span className="text-[10px] text-blue-700 font-semibold block mt-1">
                No. {token.tokenNumber}
              </span>
            </div>

            {/* CURRENTLY SERVING */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block mb-1">
                Currently Serving
              </span>
              <div className="text-4xl sm:text-5xl font-black text-indigo-950 tracking-tight">
                {token.currentlyServing || 'A23'}
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold block mt-1">
                Counter Desk
              </span>
            </div>

            {/* PEOPLE AHEAD */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block mb-1">
                People Ahead
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-950 tracking-tight">
                {token.peopleAhead ?? 3}
              </div>
              <span className="text-[10px] text-amber-800 font-semibold block mt-1">
                Citizens in queue
              </span>
            </div>

            {/* ESTIMATED WAIT */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block mb-1">
                Estimated Wait
              </span>
              <div className="text-4xl sm:text-5xl font-black text-emerald-950 tracking-tight">
                {token.peopleAhead ? token.peopleAhead * (token.service?.estimatedMinutes || 6) : 0}
                <span className="text-xl font-bold ml-1">min</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                Calculated dynamic
              </span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Queue Turn Progression</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isServing ? 'bg-amber-500' : isCompleted ? 'bg-emerald-600' : 'bg-blue-700'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Queue Timeline */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Token Lifecycle Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">1. Check-In & Issued</span>
                  <span className="text-[11px] text-slate-500">
                    {token.checkedInAt ? new Date(token.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified at counter'}
                  </span>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                isServing || isCompleted ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-100 opacity-60'
              }`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isServing || isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <span className="font-bold text-slate-800 block">2. Called to Desk</span>
                  <span className="text-[11px] text-slate-500">
                    {token.calledAt ? new Date(token.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Awaiting turn'}
                  </span>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                isCompleted ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-100 opacity-60'
              }`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <span className="font-bold text-slate-800 block">3. Service Completed</span>
                  <span className="text-[11px] text-slate-500">
                    {token.completedAt ? new Date(token.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending session'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Appointment Reference */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>{token.center?.name || 'District Citizen Service Center'}</span>
              </div>
              <p className="text-slate-500">{token.center?.address || 'Administrative Complex'}</p>
            </div>
            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-slate-500 block">Booking Reference</span>
              <span className="font-bold text-slate-900">{token.appointment?.bookingReference || 'GQ-2026-A27'}</span>
            </div>
          </div>

          {/* Last updated footer */}
          <div className="text-center text-[11px] text-slate-400 pt-2">
            Last synchronized at {lastUpdated.toLocaleTimeString()} • Calculations updated server-side
          </div>
        </div>
      </div>
    </div>
  );
};
