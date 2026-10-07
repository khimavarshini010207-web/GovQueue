import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  CalendarCheck,
  Clock,
  Sparkles,
  ShieldCheck,
  Users,
  ChevronRight,
  ArrowRight,
  Building2,
  FileCheck2,
  QrCode,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import type { Service, ServiceCenter } from '../../shared/types.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);

  useEffect(() => {
    api.getServices().then(data => {
      setPopularServices(data.slice(0, 6));
    }).catch(() => {});

    api.getCenters().then(data => {
      setCenters(data.slice(0, 3));
    }).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const steps = [
    {
      step: '01',
      title: 'Find Your Service',
      desc: 'Browse official government services or ask GovGuide AI to recommend the exact service for your civic task.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Choose a Center',
      desc: 'Select your preferred District, Mandal, or Regional Citizen Service Center nearest to your home.',
      icon: Building2,
    },
    {
      step: '03',
      title: 'Book Your Slot',
      desc: 'Pick your convenient date and verified time slot. Real-time availability prevents overbooking.',
      icon: CalendarCheck,
    },
    {
      step: '04',
      title: 'Get Your Token',
      desc: 'Receive your official digital queue token (e.g. A27) with clear document checklists.',
      icon: QrCode,
    },
    {
      step: '05',
      title: 'Track Your Turn',
      desc: 'Watch real-time live queue progression from your phone. Walk in only when your token is approaching.',
      icon: Clock,
    },
  ];

  const faqs = [
    {
      q: 'How does live digital queue tracking work?',
      a: 'When your appointment is confirmed, the system allocates your queue token. Our real-time queue algorithm dynamically computes how many citizens are ahead of you and your estimated waiting time in minutes, so you avoid waiting in crowded physical lines.',
    },
    {
      q: 'What is GovGuide AI and how does it help?',
      a: 'GovGuide AI is powered by server-side Google Gemini. It acts as an official advisory assistant that matches your specific inquiry (such as moving houses or applying for college aid) to the correct government service, outlining required documents and prerequisites.',
    },
    {
      q: 'Can I cancel or reschedule my appointment?',
      a: 'Yes. Citizens can securely view, track, and cancel upcoming appointments anytime before check-in through the citizen dashboard.',
    },
    {
      q: 'What should I bring to the service center?',
      a: 'Each service page and booking confirmation provides a complete required documents checklist. Please bring original physical documents along with self-attested photocopies.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 text-white pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Subtle geometric pattern backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-semibold text-blue-200 mb-6 backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official National Citizen Appointment & Queue System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight mb-6">
            Government services, <br className="hidden sm:inline" />
            <span className="text-amber-300">without the waiting.</span>
          </h1>

          <p className="text-base sm:text-xl text-blue-100/90 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Find the right service, book an appointment, and track your queue in real time from anywhere.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-blue-200"
          >
            <div className="flex items-center gap-3 px-3 w-full text-slate-700">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search services: Aadhaar, PAN, birth certificate, licence..."
                className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold rounded-xl shadow-lg transition-all text-sm cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book an Appointment</span>
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all text-sm cursor-pointer backdrop-blur-xs"
            >
              <span>Find a Service</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 pt-8 border-t border-blue-800/80 text-left">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">10+</div>
              <div className="text-xs text-blue-200 mt-1">Official Services</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">100%</div>
              <div className="text-xs text-blue-200 mt-1">Live Queue Transparency</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">&lt; 18 min</div>
              <div className="text-xs text-blue-200 mt-1">Average Wait Time</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">Gemini 3.8</div>
              <div className="text-xs text-blue-200 mt-1">GovGuide AI Advisory</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Popular Government Services
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            <span>View all services</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map(service => (
            <div
              key={service.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{service.estimatedMinutes} min</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {service.description}
                </p>

                <div className="text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-1">Department:</span>
                  <span className="line-clamp-1">{service.department}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Link
                  to={`/services/${service.id}`}
                  className="text-xs font-semibold text-slate-600 hover:text-blue-700"
                >
                  View Details
                </Link>
                <Link
                  to={`/book?serviceId=${service.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Book Slot</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-2">
              Citizen Journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
              How GovQueue Works
            </h2>
            <p className="text-sm text-slate-600">
              A streamlined, transparent 5-step process designed to eliminate lines and uncertainty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map(s => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-extrabold text-blue-800 bg-blue-50 px-2 py-1 rounded-md">
                        {s.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-700">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GovGuide AI Feature Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-blue-950 font-extrabold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GovGuide AI Advisory</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Unsure which government service you need?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Ask our official AI assistant in natural language. Powered server-side by Google Gemini, GovGuide maps your life situation directly to required civic procedures and required documents.
            </p>
            <div className="pt-2">
              <Link
                to="/help"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-950 font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Launch GovGuide Assistant</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Centers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              Locations
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Authorized Service Centers
            </h2>
          </div>
          <Link
            to="/centers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            <span>View all centers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {centers.map(center => (
            <div
              key={center.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Code: {center.code}
                  </span>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active Center
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{center.name}</h3>
                <p className="text-xs text-slate-600 mb-3">{center.address}</p>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>District: <span className="font-semibold text-slate-700">{center.district}</span></div>
                  <div>Phone: <span className="font-semibold text-slate-700">{center.phone}</span></div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  to={`/book?centerId=${center.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-blue-800 hover:text-white text-slate-800 rounded-lg text-xs font-semibold transition-all"
                >
                  <span>Book at this Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-1">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{f.q}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
