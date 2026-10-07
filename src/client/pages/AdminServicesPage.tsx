import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  FileText,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { Service } from '../../shared/types.js';

export const AdminServicesPage: React.FC = () => {
  const { success, error } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Identity & Civil Records');
  const [formDepartment, setFormDepartment] = useState('');
  const [formEstimatedMinutes, setFormEstimatedMinutes] = useState(15);
  const [formDocuments, setFormDocuments] = useState('');

  const fetchServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormName('');
    setFormDescription('');
    setFormCategory('Identity & Civil Records');
    setFormDepartment('Administrative Authority');
    setFormEstimatedMinutes(15);
    setFormDocuments('Proof of Identity\nProof of Address');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setFormName(s.name);
    setFormDescription(s.description);
    setFormCategory(s.category);
    setFormDepartment(s.department);
    setFormEstimatedMinutes(s.estimatedMinutes);
    setFormDocuments(s.requiredDocuments.join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const docArray = formDocuments
      .split('\n')
      .map(d => d.trim())
      .filter(Boolean);

    try {
      if (editingService) {
        await api.updateService(editingService.id, {
          name: formName,
          description: formDescription,
          category: formCategory,
          department: formDepartment,
          estimatedMinutes: Number(formEstimatedMinutes),
          requiredDocuments: docArray,
        });
        success('Service updated successfully.');
      } else {
        await api.createService({
          name: formName,
          description: formDescription,
          category: formCategory,
          department: formDepartment,
          estimatedMinutes: Number(formEstimatedMinutes),
          requiredDocuments: docArray,
          isActive: true,
        });
        success('New service created successfully.');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      error(err.message || 'Operation failed');
    }
  };

  const handleDeactivate = async () => {
    if (!deletingId) return;
    try {
      await api.deleteService(deletingId);
      success('Service deactivated successfully.');
      setDeletingId(null);
      fetchServices();
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
          <h1 className="text-2xl font-black text-slate-900">Government Services Management</h1>
          <p className="text-xs text-slate-500">Configure civic service catalog, required documents, and durations.</p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading services..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{s.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{s.category}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.department}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {s.estimatedMinutes} min
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(s)}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Service"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(s.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Deactivate Service"
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

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingService ? 'Edit Government Service' : 'Add New Government Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Est. Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    required
                    value={formEstimatedMinutes}
                    onChange={e => setFormEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Civic Department</label>
                <input
                  type="text"
                  required
                  value={formDepartment}
                  onChange={e => setFormDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Documents (One per line)
                </label>
                <textarea
                  required
                  rows={4}
                  value={formDocuments}
                  onChange={e => setFormDocuments(e.target.value)}
                  placeholder="Proof of Address&#10;Original Identity Card&#10;Passport Photographs"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                />
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Deactivate Service"
        message="Are you sure you want to deactivate this service? It will no longer appear in public catalogs for citizen booking."
        confirmLabel="Yes, Deactivate"
        isDestructive
        onConfirm={handleDeactivate}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
