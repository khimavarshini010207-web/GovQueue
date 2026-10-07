import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  Filter,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import { EmptyState } from '../components/EmptyState.js';
import type { SafeUser, UserRole } from '../../shared/types.js';

export const AdminUsersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      const updated = await api.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
      success(`Updated role for ${updated.fullName} to ${newRole}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalCitizens = users.filter(u => u.role === 'CITIZEN').length;
  const totalStaff = users.filter(u => u.role === 'STAFF').length;
  const totalAdmin = users.filter(u => u.role === 'ADMIN').length;

  if (loading) {
    return <LoadingSpinner message="Loading registered accounts..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            User Accounts & Roles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage citizen access privileges, staff allocations, and administrative authority.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Registered</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{users.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All portal accounts</div>
        </div>
        <div className="bg-white rounded-2xl border border-blue-200/90 p-4 shadow-2xs">
          <div className="text-xs text-blue-700 font-medium">Citizens</div>
          <div className="text-2xl font-extrabold text-blue-900 mt-1">{totalCitizens}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Public service users</div>
        </div>
        <div className="bg-white rounded-2xl border border-teal-200/90 p-4 shadow-2xs">
          <div className="text-xs text-teal-700 font-medium">Staff & Officers</div>
          <div className="text-2xl font-extrabold text-teal-900 mt-1">{totalStaff}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Desk & queue operators</div>
        </div>
        <div className="bg-white rounded-2xl border border-purple-200/90 p-4 shadow-2xs">
          <div className="text-xs text-purple-700 font-medium">Administrators</div>
          <div className="text-2xl font-extrabold text-purple-900 mt-1">{totalAdmin}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Executive directors</div>
        </div>
      </div>

      {/* Controls: Search and Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
          </span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="CITIZEN">Citizen ({totalCitizens})</option>
            <option value="STAFF">Staff ({totalStaff})</option>
            <option value="ADMIN">Admin ({totalAdmin})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try adjusting your search query or role filter criteria."
          icon={Users}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-right">Access Role Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{u.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : u.role === 'STAFF'
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {u.role === 'STAFF' && <UserCheck className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.role !== 'CITIZEN' && (
                          <button
                            type="button"
                            disabled={updatingId === u.id}
                            onClick={() => handleRoleChange(u.id, 'CITIZEN')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Set Citizen
                          </button>
                        )}
                        {u.role !== 'STAFF' && (
                          <button
                            type="button"
                            disabled={updatingId === u.id}
                            onClick={() => handleRoleChange(u.id, 'STAFF')}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Assign Staff
                          </button>
                        )}
                        {u.role !== 'ADMIN' && (
                          <button
                            type="button"
                            disabled={updatingId === u.id}
                            onClick={() => handleRoleChange(u.id, 'ADMIN')}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Promote Admin
                          </button>
                        )}
                      </div>
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
