import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { ServiceCenter } from '../../shared/types.js';

export const AdminCentersPage: React.FC = () => {
  const { success, error } = useToast();
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ServiceCenter | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');

  const fetchCenters = async () => {
    try {
      const data = await api.getCenters();
      setCenters(data);
    } catch {
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const openCreateModal = () => {
    setEditingCenter(null);
    setName('');
    setCode('');
    setAddress('');
    setDistrict('Central District');
    setState('National Capital Region');
    setPincode('110001');
    setPhone('+91 11 2345 6789');
    setIsModalOpen(true);
  };

  const openEditModal = (c: ServiceCenter) => {
    setEditingCenter(c);
    setName(c.name);
    setCode(c.code);
    setAddress(c.address);
    setDistrict(c.district);
    setState(c.state);
    setPincode(c.pincode);
    setPhone(c.phone);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        await api.updateCenter(editingCenter.id, {
          name,
          code: code.toUpperCase(),
          address,
          district,
          state,
          pincode,
          phone,
        });
        success('Service center updated successfully.');
      } else {
        await api.createCenter({
          name,
          code: code.toUpperCase(),
          address,
          district,
          state,
          pincode,
          phone,
          isActive: true,
        });
        success('New citizen service center created.');
      }
      setIsModalOpen(false);
      fetchCenters();
    } catch (err: any) {
      error(err.message || 'Operation failed');
    }
  };

  const handleDeactivate = async () => {
    if (!deletingId) return;
    try {
      await api.deleteCenter(deletingId);
      success('Center deactivated.');
      setDeletingId(null);
      fetchCenters();
    } catch (err: any) {
      error(err.message || 'Deactivation failed');
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
          <h1 className="text-2xl font-black text-slate-900">Service Centers Administration</h1>
          <p className="text-xs text-slate-500">Configure physical facilitation centers, district jurisdictions, and contacts.</p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service Center</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading center records..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Center Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">District / State</th>
                  <th className="py-3 px-4">Helpline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {centers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.address}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {c.district}, {c.state} ({c.pincode})
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800">{c.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(c.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Deactivate Center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingCenter ? 'Edit Service Center' : 'Add New Service Center'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Center Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sub-Divisional Citizen Service Center"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g. SDSC"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Helpline Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street / Complex address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  Save Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Deactivate Center"
        message="Are you sure you want to deactivate this citizen service center? It will no longer be available for appointment slot bookings."
        confirmLabel="Yes, Deactivate"
        isDestructive
        onConfirm={handleDeactivate}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
