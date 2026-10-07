import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Landmark,
  LayoutDashboard,
  Search,
  Calendar,
  Clock,
  Bell,
  User,
  Sparkles,
  LogOut,
  Layers,
  CalendarCheck,
  FileText,
  Building2,
  Users,
  UserCheck,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  LogIn,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import type { SafeUser } from '../../shared/types.js';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenAiGuide?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  onClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  unreadCount = 0,
  onOpenNotifications,
  onOpenAiGuide,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname, setIsMobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine navigation items based on User Role (Prompt Section 2)
  const getNavItems = (): NavItem[] => {
    if (!user) {
      return [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Find a Service', href: '/services', icon: Search },
        { label: 'Service Centers', href: '/centers', icon: Building2 },
        { label: 'Book Appointment', href: '/book', icon: CalendarCheck },
        {
          label: 'Help / GovGuide AI',
          href: '/help',
          icon: Sparkles,
          onClick: onOpenAiGuide,
        },
        { label: 'Sign In', href: '/login', icon: LogIn },
      ];
    }

    if (user.role === 'CITIZEN') {
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Find a Service', href: '/services', icon: Search },
        { label: 'My Appointments', href: '/appointments', icon: Calendar },
        { label: 'Queue Status', href: '/dashboard', icon: Clock },
        {
          label: 'Notifications',
          href: '#notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
          onClick: onOpenNotifications,
        },
        { label: 'Profile', href: '/profile', icon: User },
        {
          label: 'Help / GovGuide AI',
          href: '/help',
          icon: Sparkles,
          onClick: onOpenAiGuide,
        },
      ];
    }

    if (user.role === 'STAFF') {
      return [
        { label: 'Dashboard', href: '/staff', icon: LayoutDashboard },
        { label: 'Queue Management', href: '/staff/queue', icon: Layers },
        { label: 'Appointments', href: '/staff/appointments', icon: CalendarCheck },
        { label: 'Services', href: '/services', icon: FileText },
        {
          label: 'Notifications',
          href: '#notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
          onClick: onOpenNotifications,
        },
        { label: 'Profile', href: '/profile', icon: User },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Services', href: '/admin/services', icon: FileText },
        { label: 'Service Centers', href: '/admin/centers', icon: Building2 },
        { label: 'Staff Management', href: '/admin/staff', icon: UserCheck },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
        { label: 'Profile', href: '/profile', icon: User },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const isItemActive = (item: NavItem) => {
    if (item.href === '#notifications') return false;
    if (item.href === '/' && location.pathname === '/') return true;
    if (item.href !== '/' && location.pathname === item.href) return true;
    if (item.href !== '/' && location.pathname.startsWith(`${item.href}/`)) return true;
    return false;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none border-r border-slate-800">
      {/* Top Branding Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/90 shrink-0">
        <Link to="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-blue-600 transition-colors">
            <Landmark className="w-5 h-5 text-amber-300" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base tracking-tight text-white">GovQueue</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/30 text-blue-300 rounded border border-blue-400/30">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5 truncate">
                Citizen Services
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Pill Header (When expanded) */}
      {(!isCollapsed || isMobileOpen) && user && (
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 shrink-0 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-blue-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="truncate">
              <div className="font-semibold text-slate-200 truncate">{user.fullName}</div>
              <div className="text-[10px] text-slate-400 truncate">{user.role}</div>
            </div>
          </div>
          <span
            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0 ${
              user.role === 'ADMIN'
                ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                : user.role === 'STAFF'
                ? 'bg-teal-900/60 text-teal-300 border border-teal-700/50'
                : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
            }`}
          >
            {user.role}
          </span>
        </div>
      )}

      {/* Navigation Links Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isItemActive(item);

          const itemContent = (
            <>
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {(!isCollapsed || isMobileOpen) && (
                <span className="truncate text-xs font-medium flex-1">{item.label}</span>
              )}
              {(!isCollapsed || isMobileOpen) && item.badge !== undefined && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-600 text-white shrink-0">
                  {item.badge}
                </span>
              )}
            </>
          );

          if (item.onClick) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group text-left ${
                  active
                    ? 'bg-blue-700 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                {itemContent}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${
                active
                  ? 'bg-blue-700 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
              title={isCollapsed && !isMobileOpen ? item.label : undefined}
            >
              {itemContent}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions: Collapse toggle & Logout */}
      <div className="p-3 border-t border-slate-800/90 space-y-1 shrink-0 bg-slate-950/40">
        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors cursor-pointer text-xs font-medium group ${
              isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
            }`}
            title={isCollapsed && !isMobileOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400 group-hover:text-rose-300" />
            {(!isCollapsed || isMobileOpen) && <span className="truncate">Logout</span>}
          </button>
        )}

        {/* Desktop Collapse / Expand Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer text-xs"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 w-full px-1">
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="text-[11px] text-slate-400 font-medium">Collapse menu</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Left Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Responsive Slide-Out Drawer (Prompt Section 3) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
