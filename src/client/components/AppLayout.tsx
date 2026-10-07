import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { GovGuideChat } from './GovGuideChat.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import type { Notification } from '../../shared/types.js';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  // Desktop sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('govqueue_sidebar_collapsed') === 'true';
  });

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Floating GovGuide AI modal
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);

  // Dedicated notifications modal
  const [notificationsModalOpen, setNotificationsModalOpen] = useState<boolean>(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const handleSetCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem('govqueue_sidebar_collapsed', String(collapsed));
  };

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
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
    const interval = setInterval(fetchNotifications, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top National Tricolor Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 shrink-0 z-40 fixed top-0 left-0 right-0" />

      <div className="flex-1 flex pt-1">
        {/* Left Sidebar Navigation (Fixed on Desktop, Drawer on Mobile) */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={handleSetCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          unreadCount={unreadCount}
          onOpenNotifications={() => setNotificationsModalOpen(true)}
          onOpenAiGuide={() => setAiModalOpen(true)}
        />

        {/* Main Content Area (To the right of the sidebar, no overlap) */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Compact Top Header */}
          <Header
            onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
            onOpenAiGuide={() => setAiModalOpen(true)}
            unreadCount={unreadCount}
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
          />

          {/* Page Main Content with Increased Whitespace & Breathing Room */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>

          {/* Clean Government Portal Footer */}
          <Footer />
        </div>
      </div>

      {/* Floating GovGuide AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <GovGuideChat onClose={() => setAiModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Dedicated Notifications Modal */}
      {notificationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold">In-App Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-600 text-white rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-300 hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setNotificationsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
                  aria-label="Close notifications"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  You have no notifications at this time.
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl text-xs transition-colors ${
                      n.isRead ? 'bg-slate-50/70 border border-slate-100' : 'bg-blue-50/70 border border-blue-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setNotificationsModalOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
