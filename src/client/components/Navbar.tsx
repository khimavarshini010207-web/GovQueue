import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Landmark,
  Bell,
  Sparkles,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Clock,
  Shield,
  Layers,
  CalendarCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { GovGuideChat } from './GovGuideChat.js';
import type { Notification } from '../../shared/types.js';

export const Navbar: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll for notifications
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setDemoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const handleDemoSelect = async (role: 'CITIZEN' | 'STAFF' | 'ADMIN') => {
    setDemoMenuOpen(false);
    await demoLogin(role);
    if (role === 'STAFF') navigate('/staff');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/dashboard');
  };

  return (
    <>
      {/* Top Government Tricolor Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600" />

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-800 transition-colors">
                  <Landmark className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight text-blue-950">GovQueue</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">AI</span>
                  </div>
                  <p className="text-[10px] text-slate-600 tracking-wider uppercase font-semibold">
                    Citizen Service & Queue Portal
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
              <Link
                to="/services"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname.startsWith('/services')
                    ? 'text-blue-800 bg-blue-50 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Services
              </Link>
              <Link
                to="/centers"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/centers'
                    ? 'text-blue-800 bg-blue-50 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Service Centers
              </Link>

              {user?.role === 'CITIZEN' && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      location.pathname === '/dashboard'
                        ? 'text-blue-800 bg-blue-50 font-semibold'
                        : 'hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/appointments"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      location.pathname === '/appointments'
                        ? 'text-blue-800 bg-blue-50 font-semibold'
                        : 'hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    My Appointments
                  </Link>
                </>
              )}

              {user?.role === 'STAFF' && (
                <>
                  <Link
                    to="/staff"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      location.pathname === '/staff'
                        ? 'text-blue-800 bg-blue-50 font-semibold'
                        : 'hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Operations Queue
                  </Link>
                  <Link
                    to="/staff/appointments"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      location.pathname === '/staff/appointments'
                        ? 'text-blue-800 bg-blue-50 font-semibold'
                        : 'hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Today's Bookings
                  </Link>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      location.pathname === '/admin'
                        ? 'text-blue-800 bg-blue-50 font-semibold'
                        : 'hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Admin Console
                  </Link>
                  <Link
                    to="/admin/services"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      location.pathname === '/admin/services'
                        ? 'text-blue-800 bg-blue-50 font-semibold'
                        : 'hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Manage Services
                  </Link>
                </>
              )}
            </nav>

            {/* Right Action Icons & Controls */}
            <div className="flex items-center gap-2.5">
              {/* GovGuide AI Trigger Button */}
              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-indigo-50 hover:from-amber-100 hover:to-indigo-100 text-blue-900 border border-amber-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ask GovGuide AI</span>
              </button>

              {/* Book Appointment CTA */}
              <Link
                to="/book"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </Link>

              {/* Notifications Dropdown */}
              {user && (
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
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
                            onClick={handleMarkAllRead}
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

              {/* Demo Logins Switcher */}
              <div className="relative" ref={demoRef}>
                <button
                  type="button"
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Demo Logins</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {demoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 p-1 text-xs">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Switch Role (Auto-Fill)
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDemoSelect('CITIZEN')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-50 text-slate-700 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">Rahul Sharma</div>
                        <div className="text-[11px] text-slate-500">Citizen (Token A27)</div>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-sky-100 text-sky-800 rounded">
                        Citizen
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoSelect('STAFF')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-teal-50 text-slate-700 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">Priya Verma</div>
                        <div className="text-[11px] text-slate-500">Service Officer</div>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-teal-100 text-teal-800 rounded">
                        Staff
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoSelect('ADMIN')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-purple-50 text-slate-700 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">Rajesh Kumar</div>
                        <div className="text-[11px] text-slate-500">District Administrator</div>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-800 rounded">
                        Admin
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Menu / Sign In */}
              {user ? (
                <div className="relative" ref={userRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {user.fullName.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold text-slate-900 line-clamp-1">{user.fullName}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span className="font-medium text-blue-700">{user.role}</span>
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 p-1 text-xs">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="font-semibold text-slate-900">{user.fullName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Profile</span>
                      </Link>
                      {user.role === 'CITIZEN' && (
                        <Link
                          to="/appointments"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Appointments</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer text-left"
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
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 text-sm font-medium">
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Services Directory
            </Link>
            <Link
              to="/centers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Service Centers
            </Link>
            <Link
              to="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-blue-700 font-semibold bg-blue-50"
            >
              Book Appointment
            </Link>

            {user?.role === 'CITIZEN' && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Citizen Dashboard
                </Link>
                <Link
                  to="/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  My Appointments
                </Link>
              </>
            )}

            {user?.role === 'STAFF' && (
              <>
                <Link
                  to="/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Staff Operations Queue
                </Link>
                <Link
                  to="/staff/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Today's Appointments
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Admin Console
                </Link>
                <Link
                  to="/admin/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Manage Services
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setAiModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200 text-blue-900 rounded-lg text-sm font-semibold mt-3"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ask GovGuide AI</span>
            </button>
          </div>
        )}
      </header>

      {/* Floating GovGuide AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <GovGuideChat onClose={() => setAiModalOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};
