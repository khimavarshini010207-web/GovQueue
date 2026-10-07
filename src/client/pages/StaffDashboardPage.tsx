import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  RotateCcw,
  Check,
  UserX,
  Play,
  Calendar,
  Building2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { Queue, QueueToken, ServiceCenter } from '../../shared/types.js';

export const StaffDashboardPage: React.FC = () => {
  const { success, error } = useToast();

  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string>('');
  const [selectedQueueData, setSelectedQueueData] = useState<(Queue & { tokens: QueueToken[] }) | null>(null);

  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [callingNext, setCallingNext] = useState<boolean>(false);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQueues = useCallback(async () => {
    try {
      const qList = await api.getQueues({ date: '2026-10-07' });
      setQueues(qList);

      if (qList.length > 0 && !selectedQueueId) {
        setSelectedQueueId(qList[0].id);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [selectedQueueId]);

  const fetchSelectedQueueDetails = useCallback(async (isSilent = false) => {
    if (!selectedQueueId) return;
    if (!isSilent) setRefreshing(true);
    try {
      const data = await api.getQueueById(selectedQueueId);
      setSelectedQueueData(data);
    } catch {
      // Ignore
    } finally {
      setRefreshing(false);
    }
  }, [selectedQueueId]);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  useEffect(() => {
    if (selectedQueueId) {
      fetchSelectedQueueDetails();
      const interval = setInterval(() => {
        fetchSelectedQueueDetails(true);
      }, 5000); // 5s auto refresh for staff
      return () => clearInterval(interval);
    }
  }, [selectedQueueId, fetchSelectedQueueDetails]);

  const handleCallNext = async () => {
    if (!selectedQueueId) return;
    setCallingNext(true);
    try {
      const res = await api.callNextQueueToken(selectedQueueId);
      success(`Called next token: ${res.calledToken.tokenCode}`);
      await fetchSelectedQueueDetails();
    } catch (err: any) {
      error(err.message || 'No citizens waiting in this queue.');
    } finally {
      setCallingNext(false);
    }
  };

  const handleRecall = async () => {
    if (!selectedQueueId) return;
    try {
      const res = await api.recallQueueToken(selectedQueueId);
      success(`Recalled token: ${res.recalledToken.tokenCode}`);
      await fetchSelectedQueueDetails();
    } catch (err: any) {
      error(err.message || 'No serving token to recall.');
    }
  };

  const handleComplete = async (tokenId: string) => {
    try {
      await api.completeQueueToken(tokenId);
      success('Citizen service session marked complete.');
      await fetchSelectedQueueDetails();
    } catch (err: any) {
      error(err.message || 'Operation failed');
    }
  };

  const handleNoShow = async (tokenId: string) => {
    try {
      await api.noShowQueueToken(tokenId);
      success('Token marked as No-Show.');
      await fetchSelectedQueueDetails();
    } catch (err: any) {
      error(err.message || 'Operation failed');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Initializing staff operational console..." />;
  }

  const allTokens = selectedQueueData?.tokens || [];
  const servingToken = allTokens.find(t => t.status === 'SERVING' || t.status === 'CALLED');
  const waitingTokens = allTokens.filter(t => t.status === 'WAITING').sort((a, b) => a.tokenNumber - b.tokenNumber);
  const nextWaiting = waitingTokens[0];
  const completedTokens = allTokens.filter(t => t.status === 'COMPLETED');
  const noShowTokens = allTokens.filter(t => t.status === 'NO_SHOW');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Staff Operational Control Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Staff Operations Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">Live Citizen Queue Desk</h1>
          <p className="text-xs text-slate-400">
            Authorized Public Facilitation Terminal • District Service Operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/80">
            <span className="text-slate-400 block text-[10px]">Today's Date</span>
            <span className="font-bold text-slate-100">Wednesday, 7 October 2026</span>
          </div>

          <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/80">
            <span className="text-slate-400 block text-[10px]">Terminal Time</span>
            <span className="font-bold font-mono text-amber-300 text-sm">{currentTime}</span>
          </div>

          <button
            type="button"
            onClick={() => fetchSelectedQueueDetails()}
            disabled={refreshing}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Queue Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Active Service Desk:</span>
          <select
            value={selectedQueueId}
            onChange={e => setSelectedQueueId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {queues.map(q => (
              <option key={q.id} value={q.id}>
                {q.service?.name} ({q.center?.name}) - Current: A{q.currentNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/staff/appointments"
            className="px-3.5 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl font-semibold transition-colors"
          >
            Check In Citizens
          </Link>
        </div>
      </div>

      {/* Operational Summary Cards (Section 18 & 45) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Tokens</span>
          <span className="text-2xl font-black text-slate-900">{allTokens.length}</span>
        </div>

        <div className="p-4 bg-white border border-amber-200 rounded-2xl shadow-xs text-center bg-amber-50/30">
          <span className="text-[10px] font-bold uppercase text-amber-700 block">Waiting Citizens</span>
          <span className="text-2xl font-black text-amber-900">{waitingTokens.length}</span>
        </div>

        <div className="p-4 bg-white border border-blue-200 rounded-2xl shadow-xs text-center bg-blue-50/30">
          <span className="text-[10px] font-bold uppercase text-blue-700 block">Currently Serving</span>
          <span className="text-2xl font-black text-blue-900">{servingToken ? servingToken.tokenCode : 'None'}</span>
        </div>

        <div className="p-4 bg-white border border-emerald-200 rounded-2xl shadow-xs text-center bg-emerald-50/30">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block">Completed</span>
          <span className="text-2xl font-black text-emerald-900">{completedTokens.length}</span>
        </div>

        <div className="p-4 bg-white border border-rose-200 rounded-2xl shadow-xs text-center bg-rose-50/30">
          <span className="text-[10px] font-bold uppercase text-rose-700 block">No-Shows</span>
          <span className="text-2xl font-black text-rose-900">{noShowTokens.length}</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Wait</span>
          <span className="text-2xl font-black text-slate-900">~14 min</span>
        </div>
      </div>

      {/* Main Operational Hub: Big CALL NEXT Button & Active Serving Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Next Panel */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Automated Queue Engine
            </span>
            <h2 className="text-xl font-extrabold">Next Eligible Citizen</h2>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 mt-3">
              {nextWaiting ? (
                <div>
                  <div className="text-[11px] text-blue-200">Upcoming Token in Line:</div>
                  <div className="text-4xl font-black text-amber-300 my-1">{nextWaiting.tokenCode}</div>
                  <div className="text-xs font-medium text-white">{nextWaiting.citizen?.fullName || 'Registered Citizen'}</div>
                  <div className="text-[11px] text-blue-200 mt-0.5">Appointment: {nextWaiting.appointment?.startTime}</div>
                </div>
              ) : (
                <div className="text-xs text-blue-200 py-3">No citizens currently waiting in line.</div>
              )}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleCallNext}
              disabled={callingNext || waitingTokens.length === 0}
              className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-blue-950 font-black rounded-2xl text-base shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-98"
            >
              <Volume2 className="w-5 h-5" />
              <span>CALL NEXT CITIZEN</span>
            </button>
            <span className="text-[10px] text-blue-200 block text-center mt-2">
              Determined deterministically by backend queue engine
            </span>
          </div>
        </div>

        {/* Currently Serving Desk Action Panel */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
                  Active Service Desk Session
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {servingToken ? `Serving Token ${servingToken.tokenCode}` : 'Counter is Currently Idle'}
                </h3>
              </div>
              {servingToken && <Badge status="SERVING" size="md" />}
            </div>

            {servingToken ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Citizen Profile</span>
                  <div className="font-bold text-slate-900 text-sm">{servingToken.citizen?.fullName || 'Citizen'}</div>
                  <div className="text-slate-600">Phone: {servingToken.citizen?.phone}</div>
                  <div className="text-slate-600">Ref: {servingToken.appointment?.bookingReference}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Service & Time</span>
                  <div className="font-bold text-slate-900 text-sm">{servingToken.service?.name}</div>
                  <div className="text-slate-600">Scheduled: {servingToken.appointment?.startTime}</div>
                  <div className="text-slate-600">Called at: {servingToken.calledAt ? new Date(servingToken.calledAt).toLocaleTimeString() : 'Just now'}</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Click "CALL NEXT CITIZEN" to call the first waiting token to your desk.
              </div>
            )}
          </div>

          {/* Action Buttons for Active Serving Token */}
          {servingToken && (
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleRecall}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>Recall Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => handleComplete(servingToken.id)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Complete Service</span>
              </button>

              <button
                type="button"
                onClick={() => handleNoShow(servingToken.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer ml-auto"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Mark No-Show</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Queue Table (Prompt Section 18) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Queue Roster</h3>
            <p className="text-xs text-slate-500">Live operational ledger of token statuses and waiting citizens.</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {allTokens.length} Total Tokens
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Citizen</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Appointment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Estimated Wait</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allTokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No tokens found for this queue.
                  </td>
                </tr>
              ) : (
                allTokens.map(tok => {
                  const isCurrent = tok.status === 'SERVING' || tok.status === 'CALLED';
                  return (
                    <tr
                      key={tok.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-indigo-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {tok.tokenCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {tok.citizen?.fullName || 'Citizen'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {tok.service?.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {tok.appointment?.startTime}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={tok.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {tok.status === 'WAITING' ? `~${tok.estimatedWaitMinutes || 18} min` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {tok.status === 'SERVING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleComplete(tok.id)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                            >
                              Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNoShow(tok.id)}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-[11px] cursor-pointer"
                            >
                              No-Show
                            </button>
                          </>
                        )}
                        {tok.status === 'WAITING' && (
                          <span className="text-[11px] text-slate-400">Waiting in line</span>
                        )}
                        {tok.status === 'COMPLETED' && (
                          <span className="text-[11px] text-emerald-700 font-medium">Completed</span>
                        )}
                        {tok.status === 'NO_SHOW' && (
                          <span className="text-[11px] text-rose-600 font-medium">No-Show</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
