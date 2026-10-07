import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Clock,
  ArrowRight,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../services/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import { EmptyState } from '../components/EmptyState.js';
import type { Service } from '../../shared/types.js';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSort = searchParams.get('sort') || 'name-asc';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    fetchServices();
  }, [searchParams]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await api.getServices({
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') !== 'All' ? searchParams.get('category') || undefined : undefined,
        sort: searchParams.get('sort') || undefined,
      });
      setServices(data);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (search.trim()) params.search = search.trim();
    if (category !== 'All') params.category = category;
    if (sort) params.sort = sort;
    setSearchParams(params);
  };

  const categories = [
    'All',
    'Identity & Civil Records',
    'Taxation & Finance',
    'Certificates & Revenue',
    'Transport & Vehicles',
    'Foreign Affairs & Travel',
    'Land & Housing',
    'Welfare & Social Security',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Government Services Directory
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore official citizen services, check required documentation, and reserve your priority appointment slot.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 w-full md:flex-1 border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by service name, keyword, or civic department..."
            className="w-full text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={e => {
              setCategory(e.target.value);
              const params: Record<string, string> = {};
              if (search.trim()) params.search = search.trim();
              if (e.target.value !== 'All') params.category = e.target.value;
              if (sort) params.sort = sort;
              setSearchParams(params);
            }}
            className="w-full md:w-56 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={e => {
              setSort(e.target.value);
              const params: Record<string, string> = {};
              if (search.trim()) params.search = search.trim();
              if (category !== 'All') params.category = category;
              params.sort = e.target.value;
              setSearchParams(params);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name-asc">Sort: A to Z</option>
            <option value="duration-asc">Duration: Shortest First</option>
            <option value="duration-desc">Duration: Longest First</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Services Grid */}
      {loading ? (
        <LoadingSpinner message="Loading government services catalog..." />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services found"
          description="We couldn't find any services matching your filter criteria. Try searching for a different term."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setCategory('All');
            setSort('name-asc');
            setSearchParams({});
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div
              key={service.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
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

                <h3 className="text-lg font-bold text-slate-900 mb-2">{service.name}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {service.description}
                </p>

                <div className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-700">Department:</span>{' '}
                    <span>{service.department}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Documents:</span>{' '}
                    <span>{service.requiredDocuments.length} required documents</span>
                  </div>
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
                  <span>Book Appointment</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
