import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Clock, CalendarCheck, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import type { ServiceCenter, OperatingHour } from '../../shared/types.js';

export const CentersPage: React.FC = () => {
  const [centers, setCenters] = useState<(ServiceCenter & { operatingHours: OperatingHour[]; countersCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCenters().then(data => {
      setCenters(data);
    }).catch(() => {
      setCenters([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Citizen Service Centers Directory
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Authorized public facilitation centers equipped with digital queue counters and biometric terminals.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading authorized citizen service centers..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map(center => (
            <div
              key={center.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    Code: {center.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {center.countersCount || 4} Counters Active
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{center.name}</h3>
                  <div className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {center.address}, {center.district}, {center.state} - {center.pincode}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Helpline: <strong className="text-slate-800">{center.phone}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Working Hours: <strong className="text-slate-800">Mon - Sat (09:00 AM - 05:00 PM)</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to={`/book?centerId=${center.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Book Appointment at Center</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
