import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Building2,
  CalendarCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Phone,
} from 'lucide-react';
import { api } from '../services/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { Service, ServiceCenter } from '../../shared/types.js';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<(Service & { availableCenters: ServiceCenter[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getServiceById(id).then(data => {
        setService(data);
      }).catch(() => {
        setService(null);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading official service details..." />;
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Service Not Found</h2>
        <p className="text-sm text-slate-600">The requested government service could not be found.</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-slate-800">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/services" className="hover:text-slate-800">Services</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">{service.name}</span>
      </nav>

      {/* Main Service Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-800 rounded-full border border-blue-100">
                {service.category}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                {service.department}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {service.name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              {service.description}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Est. {service.estimatedMinutes} mins per session</span>
            </div>
            <Link
              to={`/book?serviceId=${service.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>

        {/* Informational Disclaimer */}
        <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Official Citizen Notice:</strong> Requirements listed below are based on administrative guidelines. Please carry original valid documents and self-attested photocopies for biometric or in-person verification.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Required Documents & Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <h2 className="text-base font-bold text-slate-900">Required Documents Checklist</h2>
            </div>
            <p className="text-xs text-slate-500">
              Ensure you have prepared all of the following documents prior to visiting the center:
            </p>

            <ul className="space-y-3 pt-2">
              {service.requiredDocuments.map((doc, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preparation Instructions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Appointment Preparation Guidelines</h3>
            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <p>• Arrive at the service center 10 minutes before your scheduled appointment slot.</p>
              <p>• Show your digital booking reference (GQ-2026-XXXX) or token number at the reception desk.</p>
              <p>• Use the GovQueue citizen dashboard to track live queue progression and people ahead in real time.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Available Centers */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              <h2 className="text-base font-bold text-slate-900">Available Service Centers</h2>
            </div>
            <p className="text-xs text-slate-500">
              Centers authorized to process this service:
            </p>

            <div className="space-y-3 pt-1">
              {service.availableCenters?.map(center => (
                <div
                  key={center.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{center.name}</h4>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                      {center.code}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{center.district}, {center.state}</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-500">Mon - Sat: 9 AM - 5 PM</span>
                    <Link
                      to={`/book?serviceId=${service.id}&centerId=${center.id}`}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900"
                    >
                      Select & Book →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/centers"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <span>View All Centers</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
