import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ShieldCheck, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm">
      {/* Official Government Disclaimer Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>GovQueue AI Citizen Services Platform • Secure Digital Infrastructure</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>National Citizen Service Portal</span>
            <span className="hidden sm:inline">•</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                <Landmark className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">GovQueue AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transforming public administrative services through transparent appointment booking, live digital queue tracking, and intelligent citizen advisory guidance.
            </p>
            <div className="text-xs text-slate-400 space-y-1 pt-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Operating Hours: Mon - Sat: 09:00 AM - 05:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Aadhaar Address Update
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Income & Domicile Certificates
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  PAN & Taxation Services
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Birth Certificate Registration
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Driving Licence Renewals
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Digital Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/book" className="hover:text-white transition-colors">
                  Book an Appointment
                </Link>
              </li>
              <li>
                <Link to="/centers" className="hover:text-white transition-colors">
                  Find Nearest Service Center
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Track Live Queue
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  GovGuide AI Advisory
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Citizen Services Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Helpline */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Helpline & Support
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Toll-Free National Helpline</div>
                  <div className="text-slate-400">1800-11-2026 (Toll Free)</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Public Grievances</div>
                  <div className="text-slate-400">support@govqueue.demo</div>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-slate-400 leading-normal border-t border-slate-800">
                Official demonstration portal for Google AI Studio. Requirements and checklists are informational.
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 GovQueue AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">Accessibility Statement</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
