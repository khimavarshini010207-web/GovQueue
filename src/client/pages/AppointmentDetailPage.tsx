import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Building2,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  XCircle,
  Phone,
  MapPin,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { Badge } from '../components/Badge.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { Appointment } from '../../shared/types.js';

export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchAppointment = async () => {
    if (!id) return;
    try {
      const data = await api.getAppointmentById(id);
      setAppointment(data);
    } catch {
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handleCancel = async () => {
    if (!appointment) return;
    try {
      await api.cancelAppointment(appointment.id);
      success('Appointment cancelled successfully.');
      setShowCancelModal(false);
      fetchAppointment();
    } catch (err: any) {
      error(err.message || 'Cancellation failed.');
    }
  };

  const handleCheckIn = async () => {
    if (!appointment) return;
    try {
      await api.checkInAppointment(appointment.id);
      success('Check-in confirmed! Your queue token is now waiting.');
      fetchAppointment();
    } catch (err: any) {
      error(err.message || 'Check-in failed');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading appointment details..." />;
  }

  if (!appointment) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Appointment Not Found</h2>
        <Link
          to="/appointments"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Appointments</span>
        </Link>
      </div>
    );
  }

  const canCancel = appointment.status === 'CONFIRMED' || appointment.status === 'PENDING';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/appointments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Appointments</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              Official Booking Slip
            </span>
            <h1 className="text-2xl font-black text-slate-900">{appointment.service?.name}</h1>
            <p className="text-xs text-slate-500">
              Booking Reference: <strong className="text-slate-800">{appointment.bookingReference}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge status={appointment.status} size="md" />
            {appointment.token && (
              <div className="px-3 py-1.5 bg-blue-900 text-white rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase block text-blue-200">Token</span>
                <span className="text-lg font-black">{appointment.token.tokenCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Appointment Schedule</h3>
            <div className="space-y-2 text-slate-600">
              <div>
                <span className="font-semibold text-slate-700 block">Date:</span>
                <span>{appointment.appointmentDate}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Time Slot:</span>
                <span>{appointment.startTime} - {appointment.endTime}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Booked On:</span>
                <span>{new Date(appointment.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Service Center Details</h3>
            <div className="space-y-2 text-slate-600">
              <div>
                <span className="font-semibold text-slate-700 block">Center Name:</span>
                <span>{appointment.center?.name} (Code: {appointment.center?.code})</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Location:</span>
                <span>{appointment.center?.address}, {appointment.center?.district}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Helpline Phone:</span>
                <span>{appointment.center?.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Required Documents */}
        {appointment.service?.requiredDocuments && (
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
            <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Mandatory Documents to Carry:</span>
            </h3>
            <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc">
              {appointment.service.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="leading-relaxed">{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {appointment.status === 'CONFIRMED' && (
              <button
                type="button"
                onClick={handleCheckIn}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Check In Now</span>
              </button>
            )}

            {appointment.token && (appointment.status === 'CHECKED_IN' || appointment.status === 'IN_QUEUE') && (
              <Link
                to={`/queue/${appointment.token.id}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Track Live Queue Turn</span>
              </Link>
            )}
          </div>

          {canCancel && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Appointment</span>
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action will release your reserved slot and invalidate your queue token."
        confirmLabel="Yes, Cancel Booking"
        isDestructive
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};
