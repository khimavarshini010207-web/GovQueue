import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sparkles,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  CalendarCheck,
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import type { Notification } from '../../shared/types.js';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenAiGuide: () => void;
  unreadCount: number;
  notifications: Notification[];
  onMarkAllRead: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenAiGuide,
  unreadCount,
  notifications,
  onMarkAllRead,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  // Compute dynamic page title / breadcrumb
  const getPageTitle = (): { title: string; category?: string } => {
    const path = location.pathname;
    if (path === '/') return { title: 'National Citizen Service Portal', category: 'Home' };
    if (path === '/services') return { title: 'Government Services Directory', category: 'Catalog' };
    if (path.startsWith('/services/')) return { title: 'Service Details & Prerequisites', category: 'Services' };
    if (path === '/centers') return { title: 'Authorized Service Centers', category: 'Locations' };
    if (path === '/book') return { title: 'Schedule Citizen Appointment', category: 'Booking' };
    if (path === '/dashboard') return { title: 'Citizen Dashboard', category: 'Overview' };
    if (path === '/appointments') return { title: 'My Appointments & Tokens', category: 'Appointments' };
    if (path.startsWith('/appointments/')) return { title: 'Appointment Booking Slip', category: 'Appointments' };
    if (path.startsWith('/queue/')) return { title: 'Live Queue Tracking', category: 'Digital Queue' };
    if (path === '/profile') return { title: 'Citizen Profile & Privileges', category: 'Account' };
    if (path === '/staff' || path === '/staff/queue') return { title: 'Live Queue Desk Operations', category: 'Staff Operations' };
    if (path === '/staff/appointments') return { title: "Today's Citizen Appointments", category: 'Staff Desk' };
    if (path === '/admin') return { title: 'Executive Operations Console', category: 'Administration' };
    if (path === '/admin/analytics') return { title: 'Analytics & Performance Metrics', category: 'Administration' };
    if (path === '/admin/services') return { title: 'Services Catalog Management', category: 'Administration' };
    if (path === '/admin/centers') return { title: 'Service Centers Configuration', category: 'Administration' };
    if (path === '/admin/staff') return { title: 'Staff & Officers Roster', category: 'Administration' };
    if (path === '/admin/users') return { title: 'Citizen & Staff User Management', category: 'Administration' };
    if (path === '/admin/appointments') return { title: 'Appointments Registry', category: 'Administration' };
    if (path === '/admin/audit-logs') return { title: 'Regulatory Audit Trail', category: 'Administration' };
    if (path === '/help') return { title: 'GovGuide AI Advisory Support', category: 'Help' };
    if (path === '/login') return { title: 'Citizen Sign In', category: 'Access' };
    if (path === '/register') return { title: 'Create Citizen Account', category: 'Access' };
    if (path === '/internal' || path === '/internal/login') return { title: 'Internal Operations & Admin Portal', category: 'Internal Portal' };
    return { title: 'GovQueue AI', category: 'Portal' };
  };

  const { title, category } = getPageTitle();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 shrink-0 transition-all">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Context Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Dynamic Breadcrumb / Page Title */}
          <div className="min-w-0 flex flex-col justify-center">
            {category && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-none">
                {category}
              </span>
            )}
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate leading-tight mt-0.5">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Actions: Compact & Functional */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick AI Trigger Button */}
          <button
            type="button"
            onClick={onOpenAiGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-indigo-50 hover:from-amber-100 hover:to-indigo-100 text-blue-900 border border-amber-200/90 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">Ask GovGuide AI</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-700 rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications at this time.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div
                          key={n.id}
                          className={`p-3.5 text-xs transition-colors ${
                            n.isRead ? 'bg-white' : 'bg-blue-50/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth State */}
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 max-w-[120px] truncate leading-tight">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-blue-700 font-medium leading-none">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 p-1.5 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-semibold text-slate-900">{user.fullName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-xl shadow-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
