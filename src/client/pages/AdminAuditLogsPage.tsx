import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  User as UserIcon,
  Code,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { AuditLog } from '../../shared/types.js';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      const data = await api.getAdminAuditLogs();
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.entityType.toLowerCase().includes(q) ||
      (l.userName && l.userName.toLowerCase().includes(q))
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
          <h1 className="text-2xl font-black text-slate-900">System Audit Trail</h1>
          <p className="text-xs text-slate-500">Immutable ledger recording all administrative, booking, queue, and AI actions.</p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-w-md">
        <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search action (e.g. CALL_NEXT, REGISTER, AI_GUIDANCE)..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving secure audit records..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Initiated By</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      No audit records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-sans">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          log.action.includes('CALL') || log.action.includes('COMPLETE')
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action.includes('CANCEL') || log.action.includes('NO_SHOW')
                            ? 'bg-rose-100 text-rose-800'
                            : log.action.includes('AI')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-sans">{log.entityType}</td>
                      <td className="py-3.5 px-4 text-slate-800 font-sans font-medium">
                        {log.userName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 truncate max-w-xs">
                        {log.entityId || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
                        >
                          Inspect JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Audit Record Payload • {selectedLog.action}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs overflow-x-auto max-h-80 font-mono">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
