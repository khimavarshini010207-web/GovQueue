import React from 'react';
import { Sparkles, HelpCircle, Phone, Mail, ShieldCheck, Clock } from 'lucide-react';
import { GovGuideChat } from '../components/GovGuideChat.js';

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Official Civic Navigation Support</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          GovGuide AI Citizen Support
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ask questions in natural language to find the required civic department, appointment prerequisites, and required documents.
        </p>
      </div>

      {/* Embedded GovGuide Assistant */}
      <GovGuideChat standalone />

      {/* Additional Helpline Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">National Citizen Helpline</h3>
          <p className="text-xs text-slate-500">1800-11-2026 (Toll-free)</p>
          <span className="text-[11px] text-slate-400 block">Mon - Sat: 09:00 AM - 05:00 PM</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Grievance Redressal</h3>
          <p className="text-xs text-slate-500">support@govqueue.demo</p>
          <span className="text-[11px] text-slate-400 block">Average resolution time: 24 business hours</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Physical Center Timing</h3>
          <p className="text-xs text-slate-500">09:00 AM to 05:00 PM</p>
          <span className="text-[11px] text-slate-400 block">Open Monday through Saturday</span>
        </div>
      </div>
    </div>
  );
};
