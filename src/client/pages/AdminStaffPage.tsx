import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { StaffProfile, ServiceCenter } from '../../shared/types.js';

export const AdminStaffPage: React.FC = () => {
  const { success, error } = useToast();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Public Services Officer');
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [userId, setUserId] = useState('');

  const fetchData = async () => {
    try {
      const [sList, cList] = await Promise.all([api.getAdminStaff(), api.getCenters()]);
      setStaff(sList);
      setCenters(cList);
      if (cList.length > 0) setSelectedCenterId(cList[0].id);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.assignStaff({
        userId,
        centerId: selectedCenterId,
        employeeId,
        designation,
      });
      success('Staff officer profile assigned successfully.');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.message || 'Staff assignment failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Console</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Staff & Officers Management</h1>
          <p className="text-xs text-slate-500">Assign officers to center queue desks and manage operator credentials.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEmployeeId(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
            setUserId('user-staff-priya');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Staff Officer</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading staff profiles..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Officer Name</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Assigned Center</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {s.user?.fullName || 'Staff Officer'}
                      <div className="text-[11px] text-slate-400 font-normal">{s.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-800">
                      {s.employeeId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {s.designation}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {s.center?.name || 'Center'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {s.user?.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                        Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Assign Officer to Center</h3>

            <form onSubmit={handleAssign} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">User Account UID</label>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  placeholder="user-staff-..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Center</label>
                <select
                  value={selectedCenterId}
                  onChange={e => setSelectedCenterId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
