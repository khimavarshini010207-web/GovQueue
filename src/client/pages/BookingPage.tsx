import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CalendarCheck,
  Building2,
  Clock,
  FileText,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { Service, ServiceCenter, Appointment } from '../../shared/types.js';

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, demoLogin } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Catalogs
  const [services, setServices] = useState<Service[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);

  // Selection states
  const [selectedServiceId, setSelectedServiceId] = useState<string>(searchParams.get('serviceId') || '');
  const [selectedCenterId, setSelectedCenterId] = useState<string>(searchParams.get('centerId') || '');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-07');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Availability from backend
  const [availabilitySlots, setAvailabilitySlots] = useState<{ time: string; available: boolean; reason?: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Confirmed appointment result
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);

  useEffect(() => {
    Promise.all([api.getServices(), api.getCenters()])
      .then(([sList, cList]) => {
        setServices(sList);
        setCenters(cList);

        if (!selectedServiceId && sList.length > 0) {
          setSelectedServiceId(sList[0].id);
        }
        if (!selectedCenterId && cList.length > 0) {
          setSelectedCenterId(cList[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch slots whenever center, service, or date changes
  useEffect(() => {
    if (selectedCenterId && selectedServiceId && selectedDate) {
      setLoadingSlots(true);
      setAvailabilityError(null);
      api.getAvailability(selectedCenterId, selectedServiceId, selectedDate)
        .then(res => {
          if (res.isClosed) {
            setAvailabilityError(res.reason || 'Center is closed on this date.');
            setAvailabilitySlots([]);
          } else {
            setAvailabilitySlots(res.slots);
          }
        })
        .catch(err => {
          setAvailabilityError(err.message || 'Failed to load slot availability.');
          setAvailabilitySlots([]);
        })
        .finally(() => {
          setLoadingSlots(false);
        });
    }
  }, [selectedCenterId, selectedServiceId, selectedDate]);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedCenter = centers.find(c => c.id === selectedCenterId);

  const handleNext = () => {
    if (step === 1 && !selectedServiceId) {
      toastError('Please select a government service');
      return;
    }
    if (step === 2 && !selectedCenterId) {
      toastError('Please select a service center');
      return;
    }
    if (step === 3 && !selectedDate) {
      toastError('Please choose an appointment date');
      return;
    }
    if (step === 4 && !selectedTime) {
      toastError('Please select a valid time slot');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleConfirmBooking = async () => {
    // If not signed in, auto-fill citizen demo account so flow is smooth
    if (!user) {
      try {
        await demoLogin('CITIZEN');
      } catch (err: any) {
        toastError('Please sign in as citizen to complete booking.');
        navigate('/login?redirect=/book');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await api.createAppointment({
        serviceId: selectedServiceId,
        centerId: selectedCenterId,
        appointmentDate: selectedDate,
        startTime: selectedTime,
      });

      setConfirmedApt(res);
      setStep(6); // Step 6: Confirmation
      toastSuccess('Appointment successfully confirmed!');
    } catch (err: any) {
      toastError(err.message || 'Booking failed. Slot may already be full.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Initializing booking portal..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Stepper Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Schedule Citizen Appointment
          </h1>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Step {step} of 6
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-700 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Select Service */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Step 1: Select Government Service</h2>
            <p className="text-xs text-slate-500">Choose the official civic service you need assistance with.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
            {services.map(s => {
              const isSelected = s.id === selectedServiceId;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {s.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">~{s.estimatedMinutes} min</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{s.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{s.description}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedServiceId}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Continue to Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Center */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Step 2: Select Service Center</h2>
            <p className="text-xs text-slate-500">Choose the nearest citizen facilitation center.</p>
          </div>

          <div className="space-y-3">
            {centers.map(c => {
              const isSelected = c.id === selectedCenterId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCenterId(c.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{c.address}, {c.district}</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-4">
                    <span>Helpline: {c.phone}</span>
                    <span>Working Hours: 09:00 AM - 05:00 PM</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedCenterId}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Continue to Date</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Date */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Step 3: Select Appointment Date</h2>
            <p className="text-xs text-slate-500">Pick your preferred working day (Mon - Sat).</p>
          </div>

          <div className="max-w-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700">Choose Date</label>
            <input
              type="date"
              value={selectedDate}
              min="2026-10-07"
              max="2026-11-07"
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500">
              Note: Sunday is a designated public administrative holiday.
            </p>
          </div>

          {/* Quick Date Pills */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">Quick Dates:</span>
            <div className="flex flex-wrap gap-2">
              {['2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-12'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    selectedDate === d
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {d === '2026-10-07' ? 'Today (07 Oct 2026)' : d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedDate}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Continue to Time Slots</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Select Available Time */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Step 4: Select Available Time Slot</h2>
            <p className="text-xs text-slate-500">
              Real-time slot availability for {selectedDate} at {selectedCenter?.name}.
            </p>
          </div>

          {loadingSlots ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Checking counter capacity and existing bookings...</p>
            </div>
          ) : availabilityError ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{availabilityError}</span>
            </div>
          ) : availabilitySlots.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No slots available for this date.</div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {availabilitySlots.map(slot => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-semibold text-xs ${
                        !slot.available
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-blue-700 text-white border-blue-700 shadow-xs scale-102'
                          : 'bg-white hover:bg-blue-50 text-slate-800 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div>{slot.time}</div>
                      <div className="text-[10px] font-normal mt-0.5">
                        {slot.available ? 'Available' : 'Booked'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedTime}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Review Booking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review Booking */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Step 5: Review and Confirm Booking</h2>
            <p className="text-xs text-slate-500">Verify your appointment details before issuing your queue token.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-500 block mb-1">Selected Service</span>
                <span className="text-sm font-bold text-slate-900">{selectedService?.name}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{selectedService?.department}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block mb-1">Service Center</span>
                <span className="text-sm font-bold text-slate-900">{selectedCenter?.name}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{selectedCenter?.address}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block mb-1">Appointment Date</span>
                <span className="text-sm font-bold text-blue-800">{selectedDate}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block mb-1">Scheduled Time</span>
                <span className="text-sm font-bold text-blue-800">{selectedTime}</span>
              </div>
            </div>
          </div>

          {/* Required Documents Notice */}
          {selectedService && selectedService.requiredDocuments.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Prerequisites Reminder:</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc">
                {selectedService.requiredDocuments.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Queue Token...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Generate Token</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Confirmation */}
      {step === 6 && confirmedApt && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Official Booking Confirmed
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Appointment Reserved</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your appointment and digital queue token have been successfully recorded in the system.
            </p>
          </div>

          {/* Token & Reference Highlight Card */}
          <div className="bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 max-w-md mx-auto space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Your Queue Token
              </span>
              <div className="text-5xl font-black text-blue-950 tracking-tight my-1">
                {confirmedApt.token?.tokenCode || 'A27'}
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                Status: Waiting
              </span>
            </div>

            <div className="pt-4 border-t border-blue-200/80 grid grid-cols-2 gap-3 text-left text-xs">
              <div>
                <span className="text-slate-500 block">Booking Reference</span>
                <span className="font-bold text-slate-900">{confirmedApt.bookingReference}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date & Time</span>
                <span className="font-bold text-slate-900">
                  {confirmedApt.appointmentDate} at {confirmedApt.startTime}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {confirmedApt.token && (
              <Link
                to={`/queue/${confirmedApt.token.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Track Live Queue Turn</span>
              </Link>
            )}
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Go to Citizen Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
